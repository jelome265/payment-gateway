package workers

import (
	"fmt"
	"log"
	"math"
	"time"
)

// RetryConfig holds retry parameters for connector operations.
type RetryConfig struct {
	MaxRetries     int
	InitialBackoff time.Duration
}

// DefaultRetryConfig returns the default retry configuration.
func DefaultRetryConfig() RetryConfig {
	return RetryConfig{
		MaxRetries:     5,
		InitialBackoff: 1 * time.Second,
	}
}

// RetryableFunc is a function that can be retried.
type RetryableFunc func() error

// WithRetry executes fn with exponential backoff. If all retries fail,
// returns the last error so the caller can route to the poison queue.
func WithRetry(name string, cfg RetryConfig, fn RetryableFunc) error {
	var lastErr error
	for attempt := 0; attempt <= cfg.MaxRetries; attempt++ {
		lastErr = fn()
		if lastErr == nil {
			return nil
		}

		if attempt < cfg.MaxRetries {
			backoff := time.Duration(math.Pow(2, float64(attempt))) * cfg.InitialBackoff
			log.Printf("[RETRY] %s: attempt %d/%d failed: %v. Retrying in %v",
				name, attempt+1, cfg.MaxRetries, lastErr, backoff)
			time.Sleep(backoff)
		}
	}

	log.Printf("[POISON] %s: all %d retries exhausted. Last error: %v", name, cfg.MaxRetries, lastErr)
	return fmt.Errorf("all retries exhausted for %s: %w", name, lastErr)
}

// PoisonQueue represents a dead-letter queue for failed messages.
type PoisonQueue struct {
	Topic string
}

// Send routes a failed message to the poison queue for manual investigation.
func (pq *PoisonQueue) Send(connectorName string, payload []byte, err error) {
	// In production: publish to Kafka poison-queue topic
	log.Printf("[POISON QUEUE] connector=%s error=%v payload_size=%d topic=%s",
		connectorName, err, len(payload), pq.Topic)
}
