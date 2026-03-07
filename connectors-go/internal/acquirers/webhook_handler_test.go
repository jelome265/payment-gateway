package acquirers

import "testing"

// Uses in-memory fallback (redisAddr empty) to validate idempotency detection.
func TestEventStoreInMemoryDedup(t *testing.T) {
	store := NewEventStore("", 60)

	if store.IsDuplicate("evt-1") {
		t.Fatalf("first time should not be duplicate")
	}
	if !store.IsDuplicate("evt-1") {
		t.Fatalf("second time should be duplicate")
	}

	// Different ID should be treated as new
	if store.IsDuplicate("evt-2") {
		t.Fatalf("different event should not be duplicate")
	}
}
