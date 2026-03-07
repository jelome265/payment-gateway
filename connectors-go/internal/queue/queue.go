package queue

import "fmt"

/**
 * Shared queue interface for Go connectors.
 * Wraps BullMQ or internal Go channels for task distribution.
 */
type TaskQueue interface {
	Push(topic string, payload []byte) error
	Pop(topic string) ([]byte, error)
}

type RedisQueue struct {
	Addr string
}

func (r *RedisQueue) Push(topic string, payload []byte) error {
	fmt.Printf("[Queue] Pushing to %s\n", topic)
	return nil
}

func (r *RedisQueue) Pop(topic string) ([]byte, error) {
	return nil, nil
}
