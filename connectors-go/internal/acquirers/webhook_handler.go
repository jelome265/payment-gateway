package acquirers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

// EventStore handles idempotency by tracking processed provider event IDs.
type EventStore struct {
	processed sync.Map
	redis     *redis.Client
	ttl       time.Duration
}

func NewEventStore(redisAddr string, ttlSeconds int) *EventStore {
	if redisAddr == "" {
		return &EventStore{ttl: time.Duration(ttlSeconds) * time.Second}
	}
	client := redis.NewClient(&redis.Options{
		Addr:       redisAddr,
		MaxRetries: 3,
	})
	if err := client.Ping(context.Background()).Err(); err != nil {
		log.Printf("[WEBHOOK] Redis unavailable, falling back to in-memory dedupe: %v", err)
		return &EventStore{ttl: time.Duration(ttlSeconds) * time.Second}
	}
	return &EventStore{redis: client, ttl: time.Duration(ttlSeconds) * time.Second}
}

func (s *EventStore) IsDuplicate(eventID string) bool {
	if eventID == "" {
		return false
	}
	if s.redis != nil {
		res, err := s.redis.SetNX(context.Background(), "webhook:idempotency:"+eventID, "1", s.ttl).Result()
		if err != nil {
			log.Printf("[WEBHOOK] Redis idempotency error, falling back: %v", err)
		} else {
			return !res
		}
	}
	_, loaded := s.processed.LoadOrStore(eventID, true)
	return loaded
}

// WebhookHandler handles inbound provider notifications.
type WebhookHandler struct {
	airtel *AirtelAdapter
	tnm    *TnmAdapter
	store  *EventStore
}

func NewWebhookHandler(airtel *AirtelAdapter, tnm *TnmAdapter, store *EventStore) *WebhookHandler {
	return &WebhookHandler{airtel: airtel, tnm: tnm, store: store}
}

func (h *WebhookHandler) HandleAirtelWebhook(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// 1. Verify Signature
	signature := r.Header.Get("X-Signature")
	expected := h.airtel.signPayload(body)
	if signature != expected {
		log.Printf("[WEBHOOK-ERROR] Invalid Airtel signature")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	// 2. Parse and Deduplicate
	var event struct {
		EventID string `json:"event_id"`
		Data    any    `json:"data"`
	}
	if err := json.Unmarshal(body, &event); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if h.store.IsDuplicate(event.EventID) {
		log.Printf("[WEBHOOK] Duplicate Airtel event: %s", event.EventID)
		w.WriteHeader(http.StatusOK) // Always ack 200 to provider
		return
	}

	// 3. Process Async
	go h.processInbound("airtel", event.Data)

	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, `{"status":"accepted"}`)
}

func (h *WebhookHandler) HandleTnmWebhook(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// 1. Verify Signature
	signature := r.Header.Get("X-Signature")
	expected := h.tnm.signPayload(body)
	if signature != expected {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	// 2. Parse and Deduplicate
	var event struct {
		TransactionID string `json:"transaction_id"`
		Status        string `json:"status"`
	}
	if err := json.Unmarshal(body, &event); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if h.store.IsDuplicate(event.TransactionID) {
		w.WriteHeader(http.StatusOK)
		return
	}

	go h.processInbound("tnm", event)

	w.WriteHeader(http.StatusOK)
}

func (h *WebhookHandler) processInbound(provider string, data any) {
	// In production: forward to Kafka "inbound-events" for platform-java to consume
	log.Printf("[INBOUND-PROCESSOR] Processing %s event: %v", provider, data)
}
