package acquirers

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/jelome265/connectors-go/internal/observability"
	"github.com/jelome265/connectors-go/internal/workers"
)

// TnmAdapter handles collection/disbursement via TNM Mpamba APIs.
// Supports mTLS transport and HMAC request signing.
type TnmAdapter struct {
	baseURL    string
	apiKey     string
	apiSecret  string
	httpClient *http.Client
	retryConf  workers.RetryConfig
	poisonQ    *workers.PoisonQueue
}

// NewTnmAdapter creates a new TNM connector.
func NewTnmAdapter(baseURL, apiKey, apiSecret, certPath, keyPath, caPath, kafkaBrokers string) (*TnmAdapter, error) {
	tlsConfig, err := buildMTLSConfig(certPath, keyPath, caPath)
	if err != nil {
		return nil, fmt.Errorf("failed to build mTLS config for TNM: %w", err)
	}

	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: tlsConfig,
		},
	}

	return &TnmAdapter{
		baseURL:    baseURL,
		apiKey:     apiKey,
		apiSecret:  apiSecret,
		httpClient: client,
		retryConf:  workers.DefaultRetryConfig(),
		poisonQ:    &workers.PoisonQueue{Topic: "tnm-poison-queue", Brokers: kafkaBrokers},
	}, nil
}

// TnmDepositRequest represents a deposit/collection request to TNM Mpamba.
type TnmDepositRequest struct {
	Reference string `json:"reference"`
	MSISDN    string `json:"msisdn"`
	Amount    int64  `json:"amount"` // Minor units
	Currency  string `json:"currency"`
	Narration string `json:"narration"`
}

// TnmDepositResponse represents the TNM API response.
type TnmDepositResponse struct {
	TransactionID string `json:"transaction_id"`
	Status        string `json:"status"`
	Message       string `json:"message"`
}

// InitiateDeposit sends a collection request to TNM Mpamba.
// Uses at-least-once delivery with deduplication by reference/event_id.
func (t *TnmAdapter) InitiateDeposit(ctx context.Context, req TnmDepositRequest) (*TnmDepositResponse, error) {
	payload, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal TNM request: %w", err)
	}

	var resp TnmDepositResponse
	err = workers.WithRetry("tnm", "deposit", t.retryConf, func() error {
		start := time.Now()
		defer func() {
			observability.RequestDurationSeconds.WithLabelValues("tnm", "deposit").Observe(time.Since(start).Seconds())
		}()

		httpReq, err := http.NewRequest("POST", t.baseURL+"/api/v1/collections", bytes.NewReader(payload))
		if err != nil {
			return err
		}

		signature := t.signPayload(payload)
		httpReq.Header.Set("Content-Type", "application/json")
		httpReq.Header.Set("Authorization", "Bearer "+t.apiKey)
		httpReq.Header.Set("X-Signature", signature)
		httpReq.Header.Set("X-Idempotency-Key", req.Reference)
		
		if cid := observability.CorrelationIDFromContext(ctx); cid != "" {
			httpReq.Header.Set("X-Correlation-ID", cid)
		}

		httpResp, err := t.httpClient.Do(httpReq)
		if err != nil {
			observability.OutboundRequestsTotal.WithLabelValues("tnm", "deposit", "network_error").Inc()
			return fmt.Errorf("TNM HTTP request failed: %w", err)
		}
		defer httpResp.Body.Close()

		body, err := io.ReadAll(httpResp.Body)
		if err != nil {
			return fmt.Errorf("failed to read TNM response: %w", err)
		}

		if httpResp.StatusCode >= 500 {
			observability.OutboundRequestsTotal.WithLabelValues("tnm", "deposit", "server_error").Inc()
			return fmt.Errorf("TNM server error %d: %s", httpResp.StatusCode, string(body))
		}

		if httpResp.StatusCode >= 400 {
			observability.OutboundRequestsTotal.WithLabelValues("tnm", "deposit", "client_error").Inc()
		}

		if err := json.Unmarshal(body, &resp); err != nil {
			return fmt.Errorf("failed to parse TNM response: %w", err)
		}

		observability.OutboundRequestsTotal.WithLabelValues("tnm", "deposit", "success").Inc()
		return nil
	})

	if err != nil {
		observability.PoisonQueueTotal.WithLabelValues("tnm", "deposit").Inc()
		t.poisonQ.Send("tnm-deposit", payload, err)
		return nil, err
	}

	slog.InfoContext(ctx, "[TNM] Deposit initiated", 
		slog.String("ref", req.Reference), 
		slog.String("tx_id", resp.TransactionID))
	return &resp, nil
}

// DownloadStatement retrieves settlement statements for reconciliation.
func (t *TnmAdapter) DownloadStatement(ctx context.Context, date string) ([]byte, error) {
	var result []byte
	err := workers.WithRetry("tnm", "statement", t.retryConf, func() error {
		url := fmt.Sprintf("%s/api/v1/statements?date=%s", t.baseURL, date)
		httpReq, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return err
		}

		httpReq.Header.Set("Authorization", "Bearer "+t.apiKey)
		httpReq.Header.Set("X-Signature", t.signPayload([]byte(date)))
		
		if cid := observability.CorrelationIDFromContext(ctx); cid != "" {
			httpReq.Header.Set("X-Correlation-ID", cid)
		}

		httpResp, err := t.httpClient.Do(httpReq)
		if err != nil {
			return fmt.Errorf("TNM statement download failed: %w", err)
		}
		defer httpResp.Body.Close()

		body, err := io.ReadAll(httpResp.Body)
		if err != nil {
			return err
		}

		if httpResp.StatusCode != 200 {
			return fmt.Errorf("TNM statement API error %d: %s", httpResp.StatusCode, string(body))
		}

		result = body
		return nil
	})

	return result, err
}

// signPayload creates HMAC-SHA256 signature.
func (t *TnmAdapter) signPayload(payload []byte) string {
	mac := hmac.New(sha256.New, []byte(t.apiSecret))
	mac.Write(payload)
	return hex.EncodeToString(mac.Sum(nil))
}
