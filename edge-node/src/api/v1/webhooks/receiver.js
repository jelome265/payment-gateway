const express = require('express');
const router = express.Router();
const verifier = require('./verifier');
const { sendEvent } = require('../../../../events/producer');
const { checkIdempotency } = require('../../../../utils/idempotency');

/**
 * POST /api/v1/webhooks/receiver
 * Generic receiver for incoming payment provider notifications.
 */
router.post('/', async (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

  // 1. Verify Signature
  if (!verifier.verify(rawBody, signature)) {
    return res.status(401).json({ error: 'invalid_signature' });
  }

  // 2. Extract Idempotency Key
  const eventId = req.body.id || req.body.txId;
  
  // 3. Check Idempotency
  const isNew = await checkIdempotency(eventId);
  if (!isNew) {
    return res.status(200).json({ status: 'duplicate_ignored' });
  }

  try {
    // 4. Forward to Kafka (Ingestion Path)
    await sendEvent('webhook-ingest', {
      source: req.body.provider || 'unknown',
      payload: req.body,
      receivedAt: new Date().toISOString()
    });

    res.status(200).json({ status: 'accepted', id: eventId });
  } catch (err) {
    console.error('[WebhookReceiver] Kafka error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
