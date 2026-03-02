import { Router, Request, Response } from 'express';

const router = Router();

/**
 * KYC document upload endpoint.
 * Accepts base64-encoded document and forwards to platform-java KYC service.
 */
router.post('/upload', async (req: Request, res: Response) => {
    try {
        const { user_id, document_type, document_data } = req.body;

        if (!user_id || !document_type || !document_data) {
            res.status(400).json({ error: 'Missing required fields: user_id, document_type, document_data' });
            return;
        }

        // In production: upload document to secure storage (S3 with encryption at rest),
        // get a reference ID, and forward to platform-java KYC service via internal API.
        const documentRef = `doc_${Date.now()}_${user_id}`;

        // Forward to platform-java's KYC submit endpoint
        const response = await fetch(`${process.env.PLATFORM_JAVA_URL || 'http://localhost:8080'}/api/v1/kyc/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id,
                document_type,
                document_ref: documentRef
            })
        });

        const result = await response.json();
        res.status(response.status).json(result);
    } catch (error) {
        console.error('[edge-node] KYC upload failed:', error);
        res.status(500).json({ error: 'KYC upload failed' });
    }
});

/**
 * KYC status check endpoint.
 */
router.get('/status/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Forward to platform-java (in production, use internal service mesh / gRPC)
        const response = await fetch(`${process.env.PLATFORM_JAVA_URL || 'http://localhost:8080'}/api/v1/kyc/status/${userId}`);
        const result = await response.json();

        res.status(response.status).json(result);
    } catch (error) {
        console.error('[edge-node] KYC status check failed:', error);
        res.status(500).json({ error: 'KYC status check failed' });
    }
});

export default router;
