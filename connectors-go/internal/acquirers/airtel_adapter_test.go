package acquirers

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestAirtelAdapter_InitiateDeposit(t *testing.T) {
	// Create mock TLS files
	certFile, _ := os.CreateTemp("", "cert")
	keyFile, _ := os.CreateTemp("", "key")
	caFile, _ := os.CreateTemp("", "ca")
	defer os.Remove(certFile.Name())
	defer os.Remove(keyFile.Name())
	defer os.Remove(caFile.Name())

	// Mock server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req AirtelDepositRequest
		json.NewDecoder(r.Body).Decode(&req)

		// Verify amount is received as int64
		if req.Amount != 150050 {
			t.Errorf("Expected amount 150050, got %d", req.Amount)
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{
			"status": { "code": "200", "message": "Success", "success": true },
			"data": { "transaction": { "id": "AIR123", "status": "In Progress" } }
		}`))
	}))
	defer server.Close()

	// Use internal helper buildMTLSConfig would fail without real certs, 
	// so we'll mock the adapter struct directly for the test or use a mockable client.
	// Since buildMTLSConfig is used in NewAirtelAdapter, we'll manually construct for test.
	adapter := &AirtelAdapter{
		baseURL:    server.URL,
		apiKey:     "key",
		apiSecret:  "secret",
		httpClient: server.Client(),
	}

	req := AirtelDepositRequest{
		Reference: "REF123",
		MSISDN:    "265123456",
		Amount:    150050, // 1500.50 in minor units
		Currency:  "MWK",
	}

	resp, err := adapter.InitiateDeposit(context.Background(), req)
	if err != nil {
		t.Fatalf("InitiateDeposit failed: %v", err)
	}

	if resp.Data.Transaction.ID != "AIR123" {
		t.Errorf("Expected tx id AIR123, got %s", resp.Data.Transaction.ID)
	}
}
