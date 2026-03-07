const { query } = require('../repositories/pgRepository');

/**
 * Background worker for edge-node reconciliation tasks.
 * e.g., identifying stale pending transactions or missing webhooks.
 */
const reconcile = async () => {
  console.log('[ReconciliationWorker] Starting scan...');
  try {
    const staleCharges = await query(
      "SELECT id FROM charges WHERE status = 'pending' AND created_at < NOW() - INTERVAL '30 minutes' LIMIT 100"
    );
    
    for (const charge of staleCharges.rows) {
      console.log(`[ReconciliationWorker] Flagging stale charge: ${charge.id}`);
      // Actual implementation would re-poll provider or update status
    }
  } catch (err) {
    console.error('[ReconciliationWorker] Error', err);
  }
};

// Simple interval for demonstration (in production, use Cron or BullMQ)
setInterval(reconcile, 300000); // Every 5 minutes

module.exports = { reconcile };
