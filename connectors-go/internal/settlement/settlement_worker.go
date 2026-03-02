package settlement

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/jelome265/connectors-go/internal/acquirers"
	"github.com/jelome265/connectors-go/internal/workers"
)

// StatementLine represents a single line item from a provider statement.
type StatementLine struct {
	ProviderTxID string  `json:"provider_tx_id"`
	Amount       float64 `json:"amount"`
	Currency     string  `json:"currency"`
	Timestamp    string  `json:"timestamp"`
	Reference    string  `json:"reference"`
}

// SettlementWorker polls statements from connectors and forwards to platform-java for reconciliation.
type SettlementWorker struct {
	airtel   *acquirers.AirtelAdapter
	tnm     *acquirers.TnmAdapter
	retryConf workers.RetryConfig
}

// NewSettlementWorker creates the worker with both adapters.
func NewSettlementWorker(airtel *acquirers.AirtelAdapter, tnm *acquirers.TnmAdapter) *SettlementWorker {
	return &SettlementWorker{
		airtel:    airtel,
		tnm:      tnm,
		retryConf: workers.DefaultRetryConfig(),
	}
}

// RunDaily executes the daily settlement reconciliation cycle.
// Downloads statements from all providers and forwards to platform-java.
func (sw *SettlementWorker) RunDaily() {
	date := time.Now().AddDate(0, 0, -1).Format("2006-01-02")
	log.Printf("[SETTLEMENT] Starting daily reconciliation for date: %s", date)

	// Fetch Airtel statements
	airtelData, err := sw.airtel.DownloadStatement(date)
	if err != nil {
		log.Printf("[SETTLEMENT] Failed to download Airtel statement: %v", err)
	} else {
		sw.processStatement("airtel", airtelData)
	}

	// Fetch TNM statements
	tnmData, err := sw.tnm.DownloadStatement(date)
	if err != nil {
		log.Printf("[SETTLEMENT] Failed to download TNM statement: %v", err)
	} else {
		sw.processStatement("tnm", tnmData)
	}

	log.Printf("[SETTLEMENT] Daily reconciliation completed for date: %s", date)
}

// processStatement parses provider statement and forwards each line to the reconciliation service.
func (sw *SettlementWorker) processStatement(provider string, data []byte) {
	var lines []StatementLine
	if err := json.Unmarshal(data, &lines); err != nil {
		log.Printf("[SETTLEMENT] Failed to parse %s statement: %v", provider, err)
		return
	}

	for _, line := range lines {
		// In production: publish each line to Kafka topic "reconciliation-statements"
		// for platform-java ReconciliationService to consume.
		log.Printf("[SETTLEMENT] %s line: tx=%s amount=%.2f %s ref=%s",
			provider, line.ProviderTxID, line.Amount, line.Currency, line.Reference)
		sw.forwardToReconciliation(provider, line)
	}

	log.Printf("[SETTLEMENT] Processed %d lines from %s", len(lines), provider)
}

// forwardToReconciliation sends a statement line to platform-java reconciliation.
func (sw *SettlementWorker) forwardToReconciliation(provider string, line StatementLine) {
	// In production: publish to Kafka "reconciliation-statements" topic
	payload, _ := json.Marshal(map[string]interface{}{
		"provider":       provider,
		"provider_tx_id": line.ProviderTxID,
		"amount":         line.Amount,
		"currency":       line.Currency,
		"timestamp":      line.Timestamp,
		"reference":      line.Reference,
	})
	_ = payload // Publish to Kafka
	fmt.Printf("[RECON FORWARD] %s: %s\n", provider, string(payload))
}
