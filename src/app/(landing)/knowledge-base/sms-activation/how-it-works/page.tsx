import { buildMetadata } from '@/lib/seo/metadata';
import HowActivationWorksClient from './how-it-works.client';

export const metadata = buildMetadata({
  title: 'How SMS Activation Works — Knowledge Base',
  description:
    'Step-by-step explanation of how SMS activation works on BestSMSHQ — request a number, receive the verification code, and complete signup in seconds.',
  path: '/knowledge-base/sms-activation/how-it-works',
});

export default function HowActivationWorks() {
  return <HowActivationWorksClient />;
}
