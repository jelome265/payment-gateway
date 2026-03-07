package acquirers

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestTnmAdapter_InitiateDeposit(t *testing.T) {
	// Mock server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req TnmDepositRequest
		json.NewDecoder(r.Body).Decode(&req)

		// Verify amount is received as int64
		if req.Amount != 200000 {
			t.Errorf("Expected amount 200000, got %d", req.Amount)
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{
			"transaction_id": "TNM987",
			"status": "0",
			"message": "Success"
		}`))
	}))
	defer server.Close()

	adapter := &TnmAdapter{
		baseURL:    server.URL,
		apiKey:     "key",
		apiSecret:  "secret",
		httpClient: server.Client(),
	}

	req := TnmDepositRequest{
		Reference: "REF456",
		MSISDN:    "0881234567",
		Amount:    200000, // 2000.00
		Currency:  "MWK",
	}

	resp, err := adapter.InitiateDeposit(context.Background(), req)
	if err != nil {
		t.Fatalf("InitiateDeposit failed: %v", err)
	}

	if resp.TransactionID != "TNM987" {
		t.Errorf("Expected tx id TNM987, got %s", resp.TransactionID)
	}
}
