package observability

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	OutboundRequestsTotal = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "connector_outbound_requests_total",
		Help: "Total number of outbound requests to payment providers",
	}, []string{"provider", "operation", "status"})

	RetryCountTotal = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "connector_retry_count_total",
		Help: "Total number of retries for connector operations",
	}, []string{"provider", "operation"})

	RequestDurationSeconds = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "connector_request_duration_seconds",
		Help:    "Duration of outbound requests in seconds",
		Buckets: prometheus.DefBuckets,
	}, []string{"provider", "operation"})

	PoisonQueueTotal = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "connector_poison_queue_total",
		Help: "Total number of messages routed to poison queue",
	}, []string{"provider", "operation"})
)
