import { buildMetadata } from '@/lib/seo/metadata';
import TermsClient from './terms.client';

export const metadata = buildMetadata({
  title: 'Terms of Use',
  description:
    'Terms of use for the BestSMSHQ SMS verification platform. Acceptable use, account terms, refunds, and your rights as a user.',
  path: '/terms',
});

export default function Terms() {
  return <TermsClient />;
}
