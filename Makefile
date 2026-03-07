.PHONY: build test clean up down

build:
	bazel build //...

test:
	bazel test //...

clean:
	bazel clean

up:
	docker-compose up -d

down:
	docker-compose down

# Service-specific shorthands
edge-dev:
	cd edge-node && npm run dev

java-run:
	cd platform-java && ./mvnw spring-boot:run
