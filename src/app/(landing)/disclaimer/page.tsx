import { LegalPage, buildLegalMetadata } from '@/components/landing/legal-page';

const defaults = {
  slug: 'disclaimer',
  title: 'Legal Disclaimer',
  path: '/disclaimer',
  lastUpdated: 'February 25, 2026',
  metaTitle: 'Legal Disclaimer',
  metaDescription:
    'Legal disclaimer for BestSMSHQ — usage limitations, liability terms and important notices for users of our SMS verification platform.',
  body: `# Service Usage Disclaimer

BestSMSHQ provides SMS verification services intended for legitimate business and personal use. By accessing our platform, you agree to use our services responsibly and in accordance with applicable laws and regulations.

# Prohibited Activities

Our services may not be used for any unlawful, fraudulent, or abusive activity. We reserve the right to terminate accounts at any time for any reason.

# Limitation of Liability

We are not liable for any damages resulting from misuse of our services or for issues caused by third-party platforms beyond our control.

# Third-Party Services

Some integrations rely on third-party providers. Their availability and behaviour is governed by their own terms; we are not responsible for outages or content provided by third parties.

# Compliance & Legal Use

You are solely responsible for ensuring your use complies with the laws of your jurisdiction.

# Contact

For legal inquiries or questions about this disclaimer, please reach out via the Contact page.`,
};

export async function generateMetadata() {
  return buildLegalMetadata(defaults);
}

export default async function Disclaimer() {
  return <LegalPage defaults={defaults} />;
}
