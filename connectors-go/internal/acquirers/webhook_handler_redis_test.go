package acquirers

import (
	"context"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
)

func TestEventStoreRedisDedup(t *testing.T) {
	mini, err := miniredis.Run()
	if err != nil {
		t.Fatalf("failed to start miniredis: %v", err)
	}
	defer mini.Close()

	store := NewEventStore(mini.Addr(), 60)

	// Seed a key to simulate a duplicate
	rdb := redis.NewClient(&redis.Options{Addr: mini.Addr()})
	if err := rdb.Set(context.Background(), "webhook:idempotency:dup", "1", 0).Err(); err != nil {
		t.Fatalf("failed to seed redis: %v", err)
	}

	if !store.IsDuplicate("dup") {
		t.Fatalf("expected duplicate to be detected")
	}

	if store.IsDuplicate("new-one") {
		t.Fatalf("unexpected duplicate for new id")
	}
}
