export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 prose prose-blue">
      <h1 className="text-4xl font-extrabold mb-8">Terms of Service</h1>
      <p className="text-gray-600 mb-6 italic">Last Updated: March 07, 2026</p>
      
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
        <p>By accessing or using WarmHeart Payments, you agree to be bound by these Terms of Service and all applicable laws and regulations in the Republic of Malawi, including the Payment Systems Act and Reserve Bank of Malawi guidelines.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">2. Financial Services</h2>
        <p>WarmHeart is a payment technology platform. All ledger-based transactions, card issuances, and FX matching services are facilitated through our regulated partner financial institutions and BIN sponsors.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">3. KYC and AML Compliance</h2>
        <p>Users must undergo Know Your Customer (KYC) verification. We reserve the right to suspend accounts that fail Anti-Money Laundering (AML) screenings or show suspicious activity as flagged by our deterministic fraud engine.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">4. Fees and Settlements</h2>
        <p>Transaction fees are disclosed at the point of interaction. Deposits and withdrawals via mobile money (Airtel/TNM) are subject to third-party network availability and settlement windows.</p>
      </section>
      
      <div className="mt-20 pt-10 border-t border-gray-200">
        <p className="text-sm text-gray-500">For questions regarding these terms, contact legal@warmheart.mw</p>
      </div>
    </div>
  );
}
