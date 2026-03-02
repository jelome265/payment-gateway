package observability

import (
	"log"
	"sync/atomic"
	"time"
)

// Metrics tracks connector-level operational metrics.
// In production: export to Prometheus via /metrics endpoint.
type Metrics struct {
	DepositAttempts    atomic.Int64
	DepositSuccesses   atomic.Int64
	DepositFailures    atomic.Int64
	RetryCount         atomic.Int64
	PoisonQueueCount   atomic.Int64
	StatementDownloads atomic.Int64
	LastHealthCheck    time.Time
}

var Global = &Metrics{}

func init() {
	Global.LastHealthCheck = time.Now()
}

// RecordDeposit tracks a deposit attempt.
func (m *Metrics) RecordDeposit(success bool) {
	m.DepositAttempts.Add(1)
	if success {
		m.DepositSuccesses.Add(1)
	} else {
		m.DepositFailures.Add(1)
	}
}

// RecordRetry tracks a retry event.
func (m *Metrics) RecordRetry() {
	m.RetryCount.Add(1)
}

// RecordPoisonQueue tracks a poison queue event.
func (m *Metrics) RecordPoisonQueue() {
	m.PoisonQueueCount.Add(1)
}

// Snapshot logs the current metrics snapshot.
func (m *Metrics) Snapshot() {
	log.Printf("[METRICS] deposits=%d success=%d fail=%d retries=%d poison=%d statements=%d",
		m.DepositAttempts.Load(), m.DepositSuccesses.Load(), m.DepositFailures.Load(),
		m.RetryCount.Load(), m.PoisonQueueCount.Load(), m.StatementDownloads.Load())
}
