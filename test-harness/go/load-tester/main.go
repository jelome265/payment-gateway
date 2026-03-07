package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"
)

const (
	TargetURL      = "http://localhost:8080/api/v1" // Core platform URL
	WorkerCount    = 10
	RequestsPerWorker = 50
)

type SignupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Phone    string `json:"phone_number"`
}

func main() {
	var wg sync.WaitGroup
	start := time.Now()

	for i := 0; i < WorkerCount; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			worker(workerID)
		}(i)
	}

	wg.Wait()
	duration := time.Since(start)
	log.Printf("Load test completed in %v. Total requests: %d", duration, WorkerCount*RequestsPerWorker)
}

func worker(id int) {
	client := &http.Client{Timeout: 5 * time.Second}

	for j := 0; j < RequestsPerWorker; j++ {
		// 1. Simulate Signup
		email := fmt.Sprintf("user-%d-%d@example.com", id, j)
		reqBody, _ := json.Marshal(SignupRequest{
			Email:    email,
			Password: "Password123!",
			Phone:    fmt.Sprintf("+265%d", rand.Intn(1000000000)),
		})

		resp, err := client.Post(TargetURL+"/auth/signup", "application/json", bytes.NewBuffer(reqBody))
		if err != nil {
			log.Printf("Worker %d: Signup failed: %v", id, err)
			continue
		}
		resp.Body.Close()

		if resp.StatusCode == http.StatusOK {
			// 2. Simulate random delay
			time.Sleep(time.Duration(rand.Intn(100)) * time.Millisecond)
			log.Printf("Worker %d: Successful signup for %s", id, email)
		} else {
			log.Printf("Worker %d: Signup failed with status %d", id, resp.StatusCode)
		}
	}
}
