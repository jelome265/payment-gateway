import asyncio
import json
import logging
from fastapi import FastAPI
from aiokafka import AIOKafkaConsumer
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fraud-engine")

app = FastAPI(title="Fraud & Analytics Engine")

KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "localhost:9092")
TOPIC = "ledger-events"

async def consume_events():
    consumer = AIOKafkaConsumer(
        TOPIC,
        bootstrap_servers=KAFKA_BROKERS,
        group_id="fraud-engine-group"
    )
    await consumer.start()
    try:
        async for msg in consumer:
            event = json.loads(msg.value.decode('utf-8'))
            logger.info(f"Processing event for fraud scoring: {event.get('id')}")
            # Mock scoring logic
            score = 0.1
            if event.get('amount', 0) > 1000000:
                score = 0.8
                logger.warning(f"High risk transaction detected! ID: {event.get('id')} Score: {score}")
    finally:
        await consumer.stop()

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(consume_events())

@app.get("/health")
async def health():
    return {"status": "ok", "engine": "python-fraud-scoring"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
