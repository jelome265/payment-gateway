import express from 'express';
import dotenv from 'dotenv';
import webhookRoutes from './routes/webhook';
import kycRoutes from './routes/kyc';
import './workers/kafkaProducer'; // Initialize the BullMQ background worker

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Raw body parser needed for HMAC verification of webhooks
app.use(express.json({
    verify: (req, res, buf) => {
        (req as any).rawBody = buf;
    }
}));

app.use('/webhooks', webhookRoutes);
app.use('/api/v1/kyc', kycRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`[edge-node] Webhook receiver listening on port ${port}`);
});
