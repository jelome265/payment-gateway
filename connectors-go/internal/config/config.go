package config

import (
	"os"
)

type Config struct {
	AirtelBaseURL    string
	AirtelAPIKey     string
	AirtelAPISecret  string
	TnmBaseURL       string
	TnmAPIKey        string
	TnmAPISecret     string
	KafkaBrokers     string
	TLSCertPath      string
	TLSKeyPath       string
	TLSCACertPath    string
	MaxRetries       int
	PoisonQueueTopic string
	RedisAddr        string
	IdempotencyTTL   int
}

func Load() *Config {
	return &Config{
		AirtelBaseURL:    getEnv("AIRTEL_BASE_URL", "https://openapiuat.airtel.africa"),
		AirtelAPIKey:     getEnv("AIRTEL_API_KEY", ""),
		AirtelAPISecret:  getEnv("AIRTEL_API_SECRET", ""),
		TnmBaseURL:       getEnv("TNM_BASE_URL", "https://api.tnm.co.mw"),
		TnmAPIKey:        getEnv("TNM_API_KEY", ""),
		TnmAPISecret:     getEnv("TNM_API_SECRET", ""),
		KafkaBrokers:     getEnv("KAFKA_BROKERS", "localhost:9092"),
		TLSCertPath:      getEnv("TLS_CERT_PATH", "/etc/certs/client.pem"),
		TLSKeyPath:       getEnv("TLS_KEY_PATH", "/etc/certs/client-key.pem"),
		TLSCACertPath:    getEnv("TLS_CA_CERT_PATH", "/etc/certs/ca.pem"),
		MaxRetries:       5,
		PoisonQueueTopic: "connector-poison-queue",
		RedisAddr:        getEnv("REDIS_ADDR", "localhost:6379"),
		IdempotencyTTL:   86400,
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
