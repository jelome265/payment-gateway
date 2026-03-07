package acquirers

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestTnmAdapter_InitiateCollection(t *testing.T) {
	// Create a mock server that returns success
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{
			"resultCode": "0",
			"resultDesc": "Operation successful",
			"transactionId": "TNM987654"
		}`))
	}))
	defer server.Close()

	adapter := NewTnmAdapter(
		"test-api-key",
		"test-api-secret",
		server.URL,
	)

	req := CollectionRequest{
		Amount:        2000.00,
		Currency:      "MWK",
		CustomerPhone: "0881234567",
		Reference:     "test-ref-456",
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	resp, err := adapter.InitiateCollection(ctx, req)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if resp.ProviderTxId != "TNM987654" {
		t.Errorf("Expected ProviderTxId 'TNM987654', got '%s'", resp.ProviderTxId)
	}

	if resp.Status != "PENDING" {
		t.Errorf("Expected Status 'PENDING', got '%s'", resp.Status)
	}
}

func TestTnmAdapter_InitiateCollection_NetworkError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer server.Close()

	adapter := NewTnmAdapter(
		"test-api-key",
		"test-api-secret",
		server.URL,
	)

	req := CollectionRequest{
		Amount:        2000.00,
		Currency:      "MWK",
		CustomerPhone: "0881234567",
		Reference:     "test-ref-456",
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := adapter.InitiateCollection(ctx, req)

	if err == nil {
		t.Fatal("Expected an error due to 503 response, but got nil")
	}
}
