import { buildMetadata } from '@/lib/seo/metadata';
import PaymentPolicyClient from './payment-policy.client';

export const metadata = buildMetadata({
  title: 'Payment Policy',
  description:
    'BestSMSHQ payment policy — accepted methods, billing, refund policy, chargebacks and currency information for SMS verification services.',
  path: '/payment-policy',
});

export default function PaymentPolicy() {
  return <PaymentPolicyClient />;
}
