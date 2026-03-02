package acquirers

import (
	"bytes"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

// MarqetaAdapter handles tokenized virtual card issuance via Marqeta.
// It enforces mTLS with the issuing partner.
type MarqetaAdapter struct {
	Client  *http.Client
	BaseURL string
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
	// Load client cert
	cert, err := tls.LoadX509KeyPair(certFile, keyFile)
	if err != nil {
		return nil, fmt.Errorf("failed to load client cert: %w", err)
	}

	// Load CA cert
	caCert, err := ioutil.ReadFile(caFile)
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
		BaseURL: baseURL,
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

// HandleAuthWebhook translates Marqeta auth webhooks into internal reservation events.
func (a *MarqetaAdapter) HandleAuthWebhook(payload []byte) error {
	// 1. Verify Marqeta signature (HMAC)
	// 2. Parse payload
	// 3. Dispatch to platform-java via gRPC or internal event bus (Kafka)
	fmt.Println("[MARQETA-CONNECTOR] Processing authorization webhook...")
	return nil
}
