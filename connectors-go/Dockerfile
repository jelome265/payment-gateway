# Stage 1: Build Stage
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

# In a pure Bazel environment, Bazel handles Go dependencies. 
# If running `docker build`, we copy everything.
COPY . .

# Build the statically linked binary (no CGO, pure Go)
# This is crucial for running in a minimal scratch container
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o connectors_svc ./cmd/server

# Stage 2: Production Minimal Runtime
# Use 'scratch' (completely empty image) for maximum security and smallest footprint
FROM scratch

# Import the user and group files from the builder
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

# Import SSL certificates 
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Import timezone data
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

WORKDIR /app

# Copy the statically compiled Go binary
COPY --from=builder /app/connectors_svc /app/connectors_svc

# Use the non-root user defined in builder (e.g. nobody:nobody)
USER 65534:65534

# Expose connector port
EXPOSE 8080

ENTRYPOINT ["/app/connectors_svc"]
