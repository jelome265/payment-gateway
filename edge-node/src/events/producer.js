const { Kafka } = require('kafkajs');
const config = require('../config');

const kafka = new Kafka(config.kafka);
const producer = kafka.producer();

const connectProducer = async () => {
  await producer.connect();
};

const sendEvent = async (topic, message) => {
  await producer.send({
    topic,
    messages: [
      { 
        value: typeof message === 'string' ? message : JSON.stringify(message),
        timestamp: Date.now().toString(),
      },
    ],
  });
};

module.exports = {
  connectProducer,
  sendEvent,
  producer,
};
