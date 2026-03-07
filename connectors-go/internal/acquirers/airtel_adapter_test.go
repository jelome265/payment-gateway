package acquirers

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestAirtelAdapter_InitiateCollection(t *testing.T) {
	// Create a mock server that returns success
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{
			"status": {
				"code": "200",
				"success": true,
				"result_code": "0",
				"message": "Success"
			},
			"data": {
				"transaction": {
					"id": "AIRTEL123",
					"status": "In Progress"
				}
			}
		}`))
	}))
	defer server.Close()

	// Replace the baseUrl with our mock server
	adapter := NewAirtelAdapter(
		"test-client-id",
		"test-client-secret",
		"test-pin",
		server.URL,
	)

	req := CollectionRequest{
		Amount:        1500.50,
		Currency:      "MWK",
		CustomerPhone: "+265123456789",
		Reference:     "test-ref-123",
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	resp, err := adapter.InitiateCollection(ctx, req)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if resp.ProviderTxId != "AIRTEL123" {
		t.Errorf("Expected ProviderTxId 'AIRTEL123', got '%s'", resp.ProviderTxId)
	}

	if resp.Status != "PENDING" {
		t.Errorf("Expected Status 'PENDING', got '%s'", resp.Status)
	}
}

func TestAirtelAdapter_InitiateCollection_NetworkError(t *testing.T) {
	// Create a mock server that times out or returns 500
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{
			"status": {
				"code": "500",
				"success": false,
				"result_code": "1",
				"message": "Internal Server Error"
			}
		}`))
	}))
	defer server.Close()

	adapter := NewAirtelAdapter(
		"test-client-id",
		"test-client-secret",
		"test-pin",
		server.URL,
	)

	req := CollectionRequest{
		Amount:        1500.50,
		Currency:      "MWK",
		CustomerPhone: "+265123456789",
		Reference:     "test-ref-123",
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := adapter.InitiateCollection(ctx, req)

	if err == nil {
		t.Fatal("Expected an error due to 500 response, but got nil")
	}
}
