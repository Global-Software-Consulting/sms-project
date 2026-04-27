/**
 * Central SEO configuration. Override SITE_URL via NEXT_PUBLIC_SITE_URL in env.
 * All canonical/OG URLs are built from these values.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://app.bestsmshq.com'
).replace(/\/$/, '');

export const SITE_NAME = 'BestSMSHQ';

export const SITE_TAGLINE = 'Premium SMS Activation & Number Rentals';

export const SITE_DESCRIPTION =
  'Receive SMS verification codes instantly from 180+ countries. Premium SMS activation, virtual numbers and rentals — fast, reliable, secure.';

export const DEFAULT_KEYWORDS = [
  'SMS verification',
  'SMS activation',
  'virtual phone numbers',
  'number rental',
  'OTP service',
  'temporary phone number',
  'SMS receive online',
  'phone verification service',
];

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

export const TWITTER_HANDLE = '@bestsmshq';

export const ORGANIZATION = {
  name: SITE_NAME,
  legalName: 'BestSMSHQ',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [] as string[],
} as const;
