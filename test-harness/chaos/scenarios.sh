#!/bin/bash

# Chaos Engineering Scenarios for Payment Gateway
# Run this script to simulate infrastructure failures.

case "$1" in
  "network-stall")
    echo "Simulating network stall for 30 seconds..."
    # In production/K8s: sudo tc qdisc add dev eth0 root netem delay 5000ms
    sleep 30
    echo "Network stall simulation ended."
    ;;
  "db-restart")
    echo "Simulating sudden database restart..."
    # docker-compose restart postgres
    sleep 5
    echo "Database restart simulation ended."
    ;;
  "kafka-jitter")
    echo "Simulating Kafka message lag/jitter..."
    # In production: adjust broker throughput limits
    sleep 20
    echo "Kafka jitter simulation ended."
    ;;
  "connector-failure")
    echo "Simulating connector failure (Airtel)..."
    # Kill the airtel connector process or block its port
    sleep 10
    echo "Connector failure simulation ended."
    ;;
  *)
    echo "Usage: $0 {network-stall|db-restart|kafka-jitter|connector-failure}"
    exit 1
    ;;
esac
