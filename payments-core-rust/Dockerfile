# Stage 1: Build
FROM rust:1.75-alpine AS builder

RUN apk add --no-cache musl-dev

WORKDIR /usr/src/payments-core-rust

COPY Cargo.toml Cargo.lock ./
COPY src ./src

# Build for release using musl for a fully statically linked binary
RUN cargo build --release --target x86_64-unknown-linux-musl

# Stage 2: Minimal Distroless Run
FROM scratch

# Setup non-root user (e.g. 10001)
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

WORKDIR /app

# Copy the static binary
COPY --from=builder /usr/src/payments-core-rust/target/x86_64-unknown-linux-musl/release/matching-engine .

USER 10001:10001

EXPOSE 8080

CMD ["./matching-engine"]
