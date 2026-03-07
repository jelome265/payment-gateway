package workers

import (
	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"fmt"
	"log"
	"math"
	"time"
	"github.com/jelome265/connectors-go/internal/observability"
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
func WithRetry(provider, operation string, cfg RetryConfig, fn RetryableFunc) error {
	var lastErr error
	for attempt := 0; attempt <= cfg.MaxRetries; attempt++ {
		lastErr = fn()
		if lastErr == nil {
			return nil
		}

		if attempt < cfg.MaxRetries {
			observability.RetryCountTotal.WithLabelValues(provider, operation).Inc()
			backoff := time.Duration(math.Pow(2, float64(attempt))) * cfg.InitialBackoff
			log.Printf("[RETRY] %s/%s: attempt %d/%d failed: %v. Retrying in %v",
				provider, operation, attempt+1, cfg.MaxRetries, lastErr, backoff)
			time.Sleep(backoff)
		}
	}

	log.Printf("[POISON] %s/%s: all %d retries exhausted. Last error: %v", provider, operation, cfg.MaxRetries, lastErr)
	return fmt.Errorf("all retries exhausted for %s/%s: %w", provider, operation, lastErr)
}

// PoisonQueue represents a dead-letter queue for failed messages.
type PoisonQueue struct {
	Topic   string
	Brokers string
	producer *kafka.Producer
}

// Send routes a failed message to the poison queue for manual investigation.
func (pq *PoisonQueue) Send(connectorName string, payload []byte, err error) {
	if pq.Brokers == "" || pq.Topic == "" {
		log.Printf("[POISON QUEUE] connector=%s (log only) error=%v payload_size=%d topic=%s brokers=%s",
			connectorName, err, len(payload), pq.Topic, pq.Brokers)
		return
	}

	if pq.producer == nil {
		p, perr := kafka.NewProducer(&kafka.ConfigMap{
			"bootstrap.servers": pq.Brokers,
			"enable.idempotence": true,
			"acks": "all",
		})
		if perr != nil {
			log.Printf("[POISON QUEUE] failed to init producer, falling back to log: %v", perr)
			return
		}
		pq.producer = p
	}

	key := fmt.Sprintf("poison-%s-%d", connectorName, time.Now().UnixNano())
	errStr := ""
	if err != nil {
		errStr = err.Error()
	}

	msg := &kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &pq.Topic, Partition: kafka.PartitionAny},
		Key:            []byte(key),
		Value:          payload,
		Headers: []kafka.Header{
			{Key: "connector", Value: []byte(connectorName)},
			{Key: "error", Value: []byte(errStr)},
		},
	}

	if e := pq.producer.Produce(msg, nil); e != nil {
		log.Printf("[POISON QUEUE] produce failed, fallback log: %v", e)
		return
	}
	log.Printf("[POISON QUEUE] published failed payload to topic=%s key=%s", pq.Topic, key)
}
