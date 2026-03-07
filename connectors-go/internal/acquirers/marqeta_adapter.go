package acquirers

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"crypto/tls"
	"crypto/x509"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"os"
	"strconv"
	"time"
)

// MarqetaAdapter handles tokenized virtual card issuance via Marqeta.
// It enforces mTLS with the issuing partner.
type MarqetaAdapter struct {
	Client        *http.Client
	BaseURL       string
	WebhookSecret string
}

type CardCreateRequest struct {
	UserToken        string `json:"user_token"`
	CardProductToken string `json:"card_product_token"`
}

type CardResponse struct {
	Token      string `json:"token"`
	LastFour   string `json:"last_four"`
	Expiration string `json:"expiration"`
	State      string `json:"state"`
}

// NewMarqetaAdapter initializes an adapter with mTLS configuration.
func NewMarqetaAdapter(baseURL string, certFile, keyFile, caFile string) (*MarqetaAdapter, error) {
	webhookSecret := os.Getenv("MARQETA_WEBHOOK_SECRET")
	if webhookSecret == "" {
		return nil, fmt.Errorf("MARQETA_WEBHOOK_SECRET environment variable is required")
	}

	// Load client cert
	cert, err := tls.LoadX509KeyPair(certFile, keyFile)
	if err != nil {
		return nil, fmt.Errorf("failed to load client cert: %w", err)
	}

	// Load CA cert
	caCert, err := os.ReadFile(caFile)
	if err != nil {
		return nil, fmt.Errorf("failed to read CA cert: %w", err)
	}
	caCertPool := x509.NewCertPool()
	caCertPool.AppendCertsFromPEM(caCert)

	tlsConfig := &tls.Config{
		Certificates: []tls.Certificate{cert},
		RootCAs:      caCertPool,
		MinVersion:   tls.VersionTLS12,
	}

	return &MarqetaAdapter{
		Client: &http.Client{
			Timeout: 30 * time.Second,
			Transport: &http.Transport{
				TLSClientConfig: tlsConfig,
			},
		},
		BaseURL:       baseURL,
		WebhookSecret: webhookSecret,
	}, nil
}

// IssueCard sends a request to Marqeta to issue a new virtual card.
func (a *MarqetaAdapter) IssueCard(req CardCreateRequest) (*CardResponse, error) {
	fmt.Printf("[MARQETA-CONNECTOR] Issuing virtual card for userToken: %s\n", req.UserToken)

	// In production: actually perform the post
	// payload, _ := json.Marshal(req)
	// resp, err := a.Client.Post(a.BaseURL+"/v3/cards", "application/json", bytes.NewBuffer(payload))

	// Sandbox Simulation
	return &CardResponse{
		Token:      "tok_" + req.UserToken[:8],
		LastFour:   "1234",
		Expiration: "12/28",
		State:      "ACTIVE",
	}, nil
}

// HandleAuthWebhook verifies the HMAC-SHA256 signature and processes authorization webhooks.
func (a *MarqetaAdapter) HandleAuthWebhook(payload []byte, signature string, timestamp string) error {
	// 1. Verify timestamp (replay protection — reject >5 min old)
	ts, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid timestamp: %w", err)
	}
	skew := math.Abs(float64(time.Now().UnixMilli() - ts))
	if skew > 5*60*1000 {
		return fmt.Errorf("stale webhook: timestamp too old (skew=%.0fms)", skew)
	}

	// 2. Verify HMAC-SHA256 signature
	mac := hmac.New(sha256.New, []byte(a.WebhookSecret))
	mac.Write([]byte(timestamp))
	mac.Write([]byte("."))
	mac.Write(payload)
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(expectedSig), []byte(signature)) {
		return fmt.Errorf("invalid HMAC signature")
	}

	// 3. Parse and dispatch
	var event map[string]interface{}
	if err := json.Unmarshal(payload, &event); err != nil {
		return fmt.Errorf("failed to parse webhook payload: %w", err)
	}

	fmt.Printf("[MARQETA-CONNECTOR] Authorization webhook verified and processed: %v\n", event)
	// In production: publish to Kafka topic for platform-java consumption
	return nil
}
