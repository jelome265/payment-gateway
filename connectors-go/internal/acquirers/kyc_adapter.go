package acquirers

import (
	"bytes"
	"encoding/json"
	"fmt"
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
	data, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", a.BaseURL+endpoint, bytes.NewBuffer(data))
	req.Header.Set("Authorization", "Bearer "+a.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("provider returned status: %d", resp.StatusCode)
	}

	return nil, nil // Placeholder
}
