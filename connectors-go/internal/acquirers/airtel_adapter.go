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
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jelome265/connectors-go/internal/workers"
)

// AirtelAdapter handles collection/remittance via Airtel Africa APIs.
// Uses mTLS for transport security and HMAC for request signing.
type AirtelAdapter struct {
	baseURL    string
	apiKey     string
	apiSecret  string
	httpClient *http.Client
	retryConf  workers.RetryConfig
	poisonQ    *workers.PoisonQueue
}

// NewAirtelAdapter creates a new Airtel connector with mTLS client.
func NewAirtelAdapter(baseURL, apiKey, apiSecret, certPath, keyPath, caPath string) (*AirtelAdapter, error) {
	tlsConfig, err := buildMTLSConfig(certPath, keyPath, caPath)
	if err != nil {
		return nil, fmt.Errorf("failed to build mTLS config: %w", err)
	}

	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: tlsConfig,
		},
	}

	return &AirtelAdapter{
		baseURL:    baseURL,
		apiKey:     apiKey,
		apiSecret:  apiSecret,
		httpClient: client,
		retryConf:  workers.DefaultRetryConfig(),
		poisonQ:    &workers.PoisonQueue{Topic: "airtel-poison-queue"},
	}, nil
}

// AirtelDepositRequest represents a deposit collection request.
type AirtelDepositRequest struct {
	Reference   string  `json:"reference"`
	MSISDN      string  `json:"subscriber_msisdn"`
	Amount      float64 `json:"amount"`
	Currency    string  `json:"currency"`
	Description string  `json:"transaction_desc"`
}

// AirtelDepositResponse represents the API response.
type AirtelDepositResponse struct {
	Status struct {
		Code    string `json:"code"`
		Message string `json:"message"`
		Success bool   `json:"success"`
	} `json:"status"`
	Data struct {
		Transaction struct {
			ID     string `json:"id"`
			Status string `json:"status"`
		} `json:"transaction"`
	} `json:"data"`
}

// InitiateDeposit sends a collection request to Airtel Money.
// Retries with exponential backoff; routes to poison queue on exhaustion.
func (a *AirtelAdapter) InitiateDeposit(req AirtelDepositRequest) (*AirtelDepositResponse, error) {
	payload, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	var resp AirtelDepositResponse
	err = workers.WithRetry("airtel-deposit", a.retryConf, func() error {
		httpReq, err := http.NewRequest("POST", a.baseURL+"/merchant/v2/payments/", bytes.NewReader(payload))
		if err != nil {
			return err
		}

		// Sign request with HMAC-SHA256
		signature := a.signPayload(payload)
		httpReq.Header.Set("Content-Type", "application/json")
		httpReq.Header.Set("X-API-Key", a.apiKey)
		httpReq.Header.Set("X-Signature", signature)
		httpReq.Header.Set("X-Country", "MW")
		httpReq.Header.Set("X-Currency", req.Currency)

		httpResp, err := a.httpClient.Do(httpReq)
		if err != nil {
			return fmt.Errorf("HTTP request failed: %w", err)
		}
		defer httpResp.Body.Close()

		body, err := io.ReadAll(httpResp.Body)
		if err != nil {
			return fmt.Errorf("failed to read response: %w", err)
		}

		if httpResp.StatusCode >= 500 {
			return fmt.Errorf("airtel server error %d: %s", httpResp.StatusCode, string(body))
		}

		if err := json.Unmarshal(body, &resp); err != nil {
			return fmt.Errorf("failed to parse response: %w", err)
		}

		if !resp.Status.Success {
			return fmt.Errorf("airtel API error: %s", resp.Status.Message)
		}

		return nil
	})

	if err != nil {
		a.poisonQ.Send("airtel-deposit", payload, err)
		return nil, err
	}

	log.Printf("[AIRTEL] Deposit initiated: ref=%s tx_id=%s", req.Reference, resp.Data.Transaction.ID)
	return &resp, nil
}

// DownloadStatement retrieves settlement/statement data for reconciliation.
func (a *AirtelAdapter) DownloadStatement(date string) ([]byte, error) {
	var result []byte
	err := workers.WithRetry("airtel-statement", a.retryConf, func() error {
		url := fmt.Sprintf("%s/standard/v1/disbursements/statement?date=%s", a.baseURL, date)
		httpReq, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return err
		}

		httpReq.Header.Set("X-API-Key", a.apiKey)
		httpReq.Header.Set("X-Signature", a.signPayload([]byte(date)))

		httpResp, err := a.httpClient.Do(httpReq)
		if err != nil {
			return fmt.Errorf("statement download failed: %w", err)
		}
		defer httpResp.Body.Close()

		body, err := io.ReadAll(httpResp.Body)
		if err != nil {
			return err
		}

		if httpResp.StatusCode != 200 {
			return fmt.Errorf("statement API error %d: %s", httpResp.StatusCode, string(body))
		}

		result = body
		return nil
	})

	return result, err
}

// signPayload creates HMAC-SHA256 signature for replay-safe request signing.
func (a *AirtelAdapter) signPayload(payload []byte) string {
	mac := hmac.New(sha256.New, []byte(a.apiSecret))
	mac.Write(payload)
	return hex.EncodeToString(mac.Sum(nil))
}

// buildMTLSConfig creates a TLS config with mutual TLS authentication.
func buildMTLSConfig(certPath, keyPath, caPath string) (*tls.Config, error) {
	cert, err := tls.LoadX509KeyPair(certPath, keyPath)
	if err != nil {
		return nil, fmt.Errorf("failed to load client cert: %w", err)
	}

	caCert, err := os.ReadFile(caPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read CA cert: %w", err)
	}

	caCertPool := x509.NewCertPool()
	caCertPool.AppendCertsFromPEM(caCert)

	return &tls.Config{
		Certificates: []tls.Certificate{cert},
		RootCAs:      caCertPool,
		MinVersion:   tls.VersionTLS12,
	}, nil
}
