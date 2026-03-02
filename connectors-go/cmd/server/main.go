package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jelome265/connectors-go/internal/acquirers"
	"github.com/jelome265/connectors-go/internal/config"
	"github.com/jelome265/connectors-go/internal/observability"
	"github.com/jelome265/connectors-go/internal/settlement"
)

func main() {
	cfg := config.Load()
	log.Println("[CONNECTORS-GO] Starting connector service...")

	// Initialize Airtel adapter
	airtel, err := acquirers.NewAirtelAdapter(
		cfg.AirtelBaseURL, cfg.AirtelAPIKey, cfg.AirtelAPISecret,
		cfg.TLSCertPath, cfg.TLSKeyPath, cfg.TLSCACertPath,
	)
	if err != nil {
		log.Printf("[WARN] Airtel adapter init failed (will use mock): %v", err)
	}

	// Initialize TNM adapter
	tnm, err := acquirers.NewTnmAdapter(
		cfg.TnmBaseURL, cfg.TnmAPIKey, cfg.TnmAPISecret,
		cfg.TLSCertPath, cfg.TLSKeyPath, cfg.TLSCACertPath,
	)
	if err != nil {
		log.Printf("[WARN] TNM adapter init failed (will use mock): %v", err)
	}

	// Initialize settlement worker
	settlementWorker := settlement.NewSettlementWorker(airtel, tnm)

	// Schedule daily settlement run
	go func() {
		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()
		for {
			<-ticker.C
			log.Println("[SCHEDULER] Triggering daily settlement run")
			settlementWorker.RunDaily()
		}
	}()

	// HTTP server for health/webhook/admin endpoints
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		observability.Global.LastHealthCheck = time.Now()
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "connectors-go"})
	})

	mux.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
		observability.Global.Snapshot()
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(map[string]int64{
			"deposit_attempts":  observability.Global.DepositAttempts.Load(),
			"deposit_successes": observability.Global.DepositSuccesses.Load(),
			"deposit_failures":  observability.Global.DepositFailures.Load(),
			"retry_count":       observability.Global.RetryCount.Load(),
			"poison_queue":      observability.Global.PoisonQueueCount.Load(),
		})
	})

	// Trigger manual settlement run (admin)
	mux.HandleFunc("/admin/settlement/run", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			w.WriteHeader(405)
			return
		}
		go settlementWorker.RunDaily()
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(map[string]string{"status": "settlement_triggered"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("[CONNECTORS-GO] Listening on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
