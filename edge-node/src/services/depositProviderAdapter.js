/**
 * Adapter for external deposit providers (Airtel, TNM).
 * Standardizes outgoing calls to provider APIs.
 */
class DepositProviderAdapter {
  constructor(providerName, apiKey) {
    this.name = providerName;
    this.apiKey = apiKey;
  }

  async initiateDeposit(payload) {
    // In production, this would call actual external endpoints
    console.log(`[Adapter] Initiating ${this.name} deposit`, payload);
    return {
      status: 'pending',
      externalId: `ext_${Date.now()}`,
      provider: this.name
    };
  }

  async checkStatus(externalId) {
    return { status: 'completed', externalId };
  }
}

module.exports = DepositProviderAdapter;
