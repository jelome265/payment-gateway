package acquirers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// KycAdapter handles integration with global ID providers (Trulioo, Onfido, or Jumio).
type KycAdapter struct {
	Client  *http.Client
	BaseURL string
	APIKey  string
}

type KycRequest struct {
	UserID       string `json:"user_id"`
	DocumentType string `json:"document_type"`
	DocumentRef  string `json:"document_ref"`
}

type KycResponse struct {
	Status      string `json:"status"`
	Level       string `json:"level"`
	ProviderID  string `json:"provider_id"`
	Description string `json:"description"`
}

func NewKycAdapter(baseURL, apiKey string) *KycAdapter {
	return &KycAdapter{
		Client:  &http.Client{Timeout: 10 * time.Second},
		BaseURL: baseURL,
		APIKey:  apiKey,
	}
}

// VerifyIdentity mocks a call to a global ID provider.
func (a *KycAdapter) VerifyIdentity(req KycRequest) (*KycResponse, error) {
	// In production, this would be a POST to the ID provider's REST API or gRPC endpoint.
	fmt.Printf("[KYC-CONNECTOR] Verifying identity for user: %s via %s\n", req.UserID, a.BaseURL)

	// Simulation logic for sandbox
	if req.DocumentRef == "" {
		return &KycResponse{
			Status:      "REJECTED",
			Level:       "NONE",
			Description: "Empty document reference provided",
		}, nil
	}

	if req.DocumentType == "enhanced" {
		return &KycResponse{
			Status:      "ESCALATED",
			Level:       "BASIC",
			Description: "Manual human proof review required for enhanced verification",
		}, nil
	}

	return &KycResponse{
		Status:      "APPROVED",
		Level:       "BASIC",
		ProviderID:  "TRU-" + req.UserID[:8],
		Description: "Automated identity check passed (sandbox)",
	}, nil
}

// Internal HTTP helper for actual API calls
func (a *KycAdapter) post(endpoint string, payload interface{}) ([]byte, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal kyc payload: %w", err)
	}

	req, err := http.NewRequest("POST", a.BaseURL+endpoint, bytes.NewBuffer(data))
	if err != nil {
		return nil, fmt.Errorf("failed to create kyc request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+a.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("kyc provider request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("kyc provider returned status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read kyc response body: %w", err)
	}

	return body, nil
}
