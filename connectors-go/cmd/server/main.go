package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
	"context"

	"github.com/jelome265/connectors-go/internal/acquirers"
	"github.com/jelome265/connectors-go/internal/config"
	"github.com/jelome265/connectors-go/internal/observability"
	"github.com/jelome265/connectors-go/internal/settlement"
	"github.com/redis/go-redis/v9"
)

func main() {
	cfg := config.Load()
	log.Println("[CONNECTORS-GO] Starting connector service...")
	if cfg.AirtelAPIKey == "" || cfg.AirtelAPISecret == "" {
		log.Println("[WARN] Airtel credentials missing; adapter will run in mock/failure mode")
	}
	if cfg.TnmAPIKey == "" || cfg.TnmAPISecret == "" {
		log.Println("[WARN] TNM credentials missing; adapter will run in mock/failure mode")
	}
	if cfg.TLSCertPath == "" || cfg.TLSKeyPath == "" || cfg.TLSCACertPath == "" {
		log.Println("[WARN] TLS cert/key/ca paths not set; mTLS initialization will fail")
	}

	// Initialize Airtel adapter
	airtel, err := acquirers.NewAirtelAdapter(
		cfg.AirtelBaseURL, cfg.AirtelAPIKey, cfg.AirtelAPISecret,
		cfg.TLSCertPath, cfg.TLSKeyPath, cfg.TLSCACertPath, cfg.KafkaBrokers,
	)
	if err != nil {
		log.Printf("[WARN] Airtel adapter init failed (will use mock): %v", err)
	}

	// Initialize TNM adapter
	tnm, err := acquirers.NewTnmAdapter(
		cfg.TnmBaseURL, cfg.TnmAPIKey, cfg.TnmAPISecret,
		cfg.TLSCertPath, cfg.TLSKeyPath, cfg.TLSCACertPath, cfg.KafkaBrokers,
	)
	if err != nil {
		log.Printf("[WARN] TNM adapter init failed (will use mock): %v", err)
	}

	// Initialize settlement worker
	settlementWorker := settlement.NewSettlementWorker(airtel, tnm)

	// Optional Redis client for health checks
	var redisClient *redis.Client
	if cfg.RedisAddr != "" {
		redisClient = redis.NewClient(&redis.Options{
			Addr: cfg.RedisAddr,
			MaxRetries: 3,
		})
	}

	// Schedule daily settlement run
	go func() {
		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()
		for {
			<-ticker.C
			log.Println("[SCHEDULER] Triggering daily settlement run")
			settlementWorker.RunDaily()
		}
	}()

	// HTTP server for health/webhook/admin endpoints
	mux := http.NewServeMux()
	eventStore := acquirers.NewEventStore(cfg.RedisAddr, cfg.IdempotencyTTL)
	webhookHandler := acquirers.NewWebhookHandler(airtel, tnm, eventStore)

	mux.HandleFunc("/webhooks/airtel", webhookHandler.HandleAirtelWebhook)
	mux.HandleFunc("/webhooks/tnm", webhookHandler.HandleTnmWebhook)

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		observability.Global.LastHealthCheck = time.Now()
		redisStatus := "disabled"
		if redisClient != nil {
			if err := redisClient.Ping(context.Background()).Err(); err != nil {
				redisStatus = "error"
			} else {
				redisStatus = "ok"
			}
		}
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "connectors-go", "redis": redisStatus})
	})

	mux.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
		observability.Global.Snapshot()
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(map[string]int64{
			"deposit_attempts":  observability.Global.DepositAttempts.Load(),
			"deposit_successes": observability.Global.DepositSuccesses.Load(),
			"deposit_failures":  observability.Global.DepositFailures.Load(),
			"retry_count":       observability.Global.RetryCount.Load(),
			"poison_queue":      observability.Global.PoisonQueueCount.Load(),
		})
	})

	// Trigger manual settlement run (admin)
	mux.HandleFunc("/admin/settlement/run", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			w.WriteHeader(405)
			return
		}
		go settlementWorker.RunDaily()
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(map[string]string{"status": "settlement_triggered"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("[CONNECTORS-GO] Listening on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
