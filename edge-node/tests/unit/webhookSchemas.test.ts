import { describe, it, expect } from 'vitest';
import { DepositWebhookSchema } from '../../src/validation/webhookSchemas';

describe('DepositWebhookSchema Validation', () => {
    it('should validate a correct payload', () => {
        const validPayload = {
            provider_id: "AIRTEL-12345",
            wallet_id: "550e8400-e29b-41d4-a716-446655440000",
            amount: 150.50,
            currency: "MWK",
            timestamp: new Date().toISOString()        
        };

        const result = DepositWebhookSchema.safeParse(validPayload);
        expect(result.success).toBe(true);
    });

    it('should reject payload with missing required fields', () => {
        const invalidPayload = {
            provider_id: "AIRTEL-12345",
            // missing wallet_id
            amount: 150.50,
            currency: "MWK"
        };

        const result = DepositWebhookSchema.safeParse(invalidPayload);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].path[0]).toBe('wallet_id');
        }
    });

    it('should reject payload with invalid UUID format', () => {
        const invalidPayload = {
            provider_id: "TNM-987",
            wallet_id: "invalid-uuid-string",
            amount: 100,
            currency: "MWK"
        };

        const result = DepositWebhookSchema.safeParse(invalidPayload);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Wallet ID must be a valid UUID');
        }
    });

    it('should reject payload with negative amount', () => {
        const invalidPayload = {
            provider_id: "AIRTEL-12345",
            wallet_id: "550e8400-e29b-41d4-a716-446655440000",
            amount: -50,
            currency: "MWK"
        };

        const result = DepositWebhookSchema.safeParse(invalidPayload);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Amount must be positive');
        }
    });

    it('should reject payload with invalid currency', () => {
        const invalidPayload = {
            provider_id: "AIRTEL-12345",
            wallet_id: "550e8400-e29b-41d4-a716-446655440000",
            amount: 50,
            currency: "EUR" // Not allowed
        };

        const result = DepositWebhookSchema.safeParse(invalidPayload);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Currency must be MWK or USD');
        }
    });

    it('should strip unknown fields when using strictest parsing', () => {
        const maliciousPayload = {
            provider_id: "AIRTEL-12345",
            wallet_id: "550e8400-e29b-41d4-a716-446655440000",
            amount: 150.50,
            currency: "MWK",
            malicious_field: "drop_database()"
        };

        const result = DepositWebhookSchema.safeParse(maliciousPayload);
        // Because we used .strict() in the schema definition, it fails instead of stripping.
        // This is the desired behavior for strict input validation.
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain("Unrecognized key(s)");
        }
    });
});
