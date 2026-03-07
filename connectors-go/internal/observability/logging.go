package observability

import (
	"context"
	"log/slog"
	"os"
)

type contextKey string

const CorrelationIDKey contextKey = "correlation_id"

// ContextWithCorrelationID returns a new context with the correlation ID set.
func ContextWithCorrelationID(ctx context.Context, correlationID string) context.Context {
	return context.WithValue(ctx, CorrelationIDKey, correlationID)
}

// CorrelationIDFromContext retrieves the correlation ID from the context.
func CorrelationIDFromContext(ctx context.Context) string {
	if correlationID, ok := ctx.Value(CorrelationIDKey).(string); ok {
		return correlationID
	}
	return ""
}

// InitStructuredLogging sets up slog with a JSON handler that includes correlation IDs.
func InitStructuredLogging() {
	handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	})
	
	// Create a wrapper handler to automatically pull correlation ID from context
	logger := slog.New(&correlationHandler{handler})
	slog.SetDefault(logger)
}

type correlationHandler struct {
	slog.Handler
}

func (h *correlationHandler) Handle(ctx context.Context, r slog.Record) error {
	if id := CorrelationIDFromContext(ctx); id != "" {
		r.AddAttrs(slog.String("correlation_id", id))
	}
	return h.Handler.Handle(ctx, r)
}
