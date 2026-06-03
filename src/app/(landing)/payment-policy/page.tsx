import { LegalPage, buildLegalMetadata } from '@/components/landing/legal-page';

const defaults = {
  slug: 'refund',
  title: 'Payment & Refund Policy',
  path: '/payment-policy',
  lastUpdated: 'February 25, 2026',
  metaTitle: 'Payment Policy',
  metaDescription:
    'BestSMSHQ payment policy — accepted methods, billing, refund policy, chargebacks and currency information for SMS verification services.',
  body: `# Accepted Payment Methods

We accept major credit cards, crypto payments, and wallet top-ups via supported gateways. The full list of currently-enabled options is shown on the Wallet page.

# Billing

Wallet top-ups are processed in real time once payment confirmation is received. Plan subscriptions are billed monthly.

# Refund Policy

- Unused number activations that never received an SMS are auto-refunded to your wallet by our system within minutes of expiry.
- Manual refunds for cancelled subscriptions are available on a pro-rata basis when requested via a support ticket.
- Refunds are returned to the original payment method or as wallet credit at our discretion.

# Chargebacks

Filing a chargeback without first contacting support may result in account suspension. Please open a ticket so we can resolve issues directly.

# Currency

All prices are quoted in USD. Crypto payments are converted at the spot rate at checkout.

# Contact

For payment questions or refund requests, please contact support via the Contact page.`,
};

export async function generateMetadata() {
  return buildLegalMetadata(defaults);
}

export default async function PaymentPolicy() {
  return <LegalPage defaults={defaults} />;
}
