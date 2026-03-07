package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"
)

type AirtelDepositRequest struct {
	Reference string `json:"reference"`
	MSISDN    string `json:"subscriber_msisdn"`
	Amount    int64  `json:"amount"`
}

type AirtelResponse struct {
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

func main() {
	mux := http.NewServeMux()

	// Airtel Mock
	mux.HandleFunc("/merchant/v2/payments/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		var req AirtelDepositRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}

		log.Printf("[MOCK-AIRTEL] Received deposit request: %+v", req)

		// Simulate 5% failure rate
		if rand.Float32() < 0.05 {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		resp := AirtelResponse{}
		resp.Status.Code = "200"
		resp.Status.Message = "Accepted"
		resp.Status.Success = true
		resp.Data.Transaction.ID = fmt.Sprintf("AIR-%d", rand.Intn(1000000))
		resp.Data.Transaction.Status = "PENDING"

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	})

	// TNM Mock
	mux.HandleFunc("/api/v1/collections", func(w http.ResponseWriter, r *http.Request) {
		log.Printf("[MOCK-TNM] Received collection request")
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"transaction_id": "TNM-%d", "status": "pending"}`, rand.Intn(1000000))
	})

	log.Println("Mock Acquirer Listening on :9090")
	if err := http.ListenAndServe(":9090", mux); err != nil {
		log.Fatal(err)
	}
}
