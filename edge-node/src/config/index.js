require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: 'edge-node',
  },
  db: {
    connectionString: process.env.DATABASE_URL,
  },
  auth: {
    webhookSecret: process.env.WEBHOOK_SECRET,
    jwtSecret: process.env.JWT_SECRET,
  },
  metrics: {
    enabled: process.env.METRICS_ENABLED === 'true',
  }
};

module.exports = config;
