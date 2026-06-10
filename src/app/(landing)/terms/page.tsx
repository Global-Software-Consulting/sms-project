import { LegalPage, buildLegalMetadata } from '@/components/landing/legal-page';

const defaults = {
  slug: 'terms',
  title: 'Terms of Use',
  path: '/terms',
  lastUpdated: 'February 25, 2026',
  metaTitle: 'Terms of Use',
  metaDescription:
    'Terms of use for the BestSMSHQ SMS verification platform. Acceptable use, account terms, refunds, and your rights as a user.',
  body: `# 1. Acceptance of Terms

By using BestSMSHQ you agree to these Terms of Use. If you do not agree, you may not use the service.

# 2. Account & Eligibility

You must be at least 18 years old, provide accurate information when registering, and keep your credentials confidential. You are responsible for activity under your account.

# 3. Acceptable Use

Do not use our service to send spam, commit fraud, impersonate others, or violate any law. Abuse will result in immediate suspension without refund.

# 4. Payments & Refunds

All purchases are processed through the wallet system. Refunds are governed by the Refund Policy.

# 5. Service Availability

We aim for high availability but do not guarantee uninterrupted service. SMS provider outages, maintenance windows, and force-majeure events may affect delivery.

# 6. Termination

We may suspend or terminate accounts that violate these terms. You may close your account at any time from the dashboard.

# 7. Changes

We may update these terms — material changes will be announced via email or on this page.`,
};

export async function generateMetadata() {
  return buildLegalMetadata(defaults);
}

export default async function Terms() {
  return <LegalPage defaults={defaults} />;
}
