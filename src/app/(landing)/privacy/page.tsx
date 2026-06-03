import { LegalPage, buildLegalMetadata } from '@/components/landing/legal-page';

const defaults = {
  slug: 'privacy',
  title: 'Privacy Policy',
  path: '/privacy',
  lastUpdated: 'February 25, 2026',
  metaTitle: 'Privacy Policy',
  metaDescription:
    'How BestSMSHQ collects, uses and protects your personal data. Read our privacy policy and data handling practices.',
  body: `# 1. Information We Collect

We collect the minimum personal data needed to operate our service — account credentials, transaction history, and basic technical metadata (IP, browser, locale) for security and abuse prevention.

# 2. How We Use Your Data

- Provide and improve the service
- Process payments and prevent fraud
- Send transactional and (with consent) marketing communications
- Comply with legal obligations

# 3. Data Sharing

We do not sell your personal data. We share only with payment processors, SMS providers, and other strictly-necessary subprocessors under contract.

# 4. Retention

We retain account data while your account is active and for a reasonable period afterwards for legal and accounting purposes.

# 5. Your Rights

You can request access, correction, deletion, or export of your data at any time. Contact our support team.

# 6. Contact

Questions about this policy? Reach our support team via the Contact page.`,
};

export async function generateMetadata() {
  return buildLegalMetadata(defaults);
}

export default async function Privacy() {
  return <LegalPage defaults={defaults} />;
}
