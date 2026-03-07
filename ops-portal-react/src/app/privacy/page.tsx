export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 prose prose-blue text-black">
      <h1 className="text-4xl font-extrabold mb-8 text-black">Privacy Policy</h1>
      <p className="text-gray-600 mb-6 italic">Last Updated: March 07, 2026</p>
      
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">1. Data Collection</h2>
        <p>We collect PII (Personally Identifiable Information) including email, phone number, and government-issued ID data solely for the purpose of financial regulation compliance and transaction security.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">2. Data Sovereignty</h2>
        <p>All sensitive financial data and PII are stored in encrypted environments. Transactional data is maintained in an immutable ledger for audit purposes by the Reserve Bank of Malawi.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">3. Third-Party Sharing</h2>
        <p>We share data with KYC verification vendors and BIN sponsors only as required to provide our services. We never sell your data to third-party advertisers.</p>
      </section>
    </div>
  );
}
