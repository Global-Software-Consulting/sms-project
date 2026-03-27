'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Terms() {
  return (
    <div className="container max-w-4xl space-y-8 px-4 py-12">
      <div className="space-y-4">
        <h1 className="text-center text-2xl font-bold sm:text-3xl md:text-4xl">Terms of Use</h1>
        <p className="text-muted-foreground text-center text-sm sm:text-lg">
          Last updated: February 25, 2026
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            By accessing and using our SMS activation service, you accept and
            agree to be bound by these Terms of Use. If you do not agree to
            these terms, please do not use our service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Service Description</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            We provide SMS verification and phone number rental services for
            legitimate business and personal use. Our service offers three
            tiers:
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>V1 Standard - Cost-effective SMS verification</li>
            <li>V2 Premium - Fast delivery with high success rates</li>
            <li>
              V3 Elite - Guaranteed instant delivery with dedicated support
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Account Registration</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>To use our service, you must:</p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Be at least 18 years old</li>
            <li>Provide accurate and complete registration information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Promptly update your account information</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Acceptable Use Policy</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>You agree NOT to use our service for:</p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Illegal activities or fraud</li>
            <li>Harassment, spam, or unsolicited communications</li>
            <li>Violating third-party rights</li>
            <li>Bypassing security measures</li>
            <li>Creating multiple accounts to abuse promotions</li>
            <li>Reselling our services without authorization</li>
            <li>Any activity that violates applicable laws</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Payment Terms</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>All prices are in USD and subject to change</li>
            <li>Payments are processed through secure third-party providers</li>
            <li>Wallet funds are non-refundable unless required by law</li>
            <li>You are responsible for any applicable taxes</li>
            <li>We reserve the right to suspend service for non-payment</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Service Availability</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            While we strive for high availability, we do not guarantee
            uninterrupted service. Number availability, SMS delivery times, and
            success rates may vary. We are not liable for service interruptions
            or failed SMS deliveries beyond our refund policy.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Refund Policy</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>
              Automatic refund if SMS is not received within the specified
              timeframe
            </li>
            <li>No refunds for successfully received SMS codes</li>
            <li>Wallet deposits are non-refundable</li>
            <li>Membership fees are non-refundable</li>
            <li>Exceptions may be made at our sole discretion</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Intellectual Property</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            All content, features, and functionality of our service are owned by
            us and protected by international copyright, trademark, and other
            intellectual property laws. You may not copy, modify, distribute, or
            reverse engineer any part of our service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            To the maximum extent permitted by law, we shall not be liable for
            any indirect, incidental, special, consequential, or punitive
            damages resulting from your use of our service. Our total liability
            shall not exceed the amount you paid us in the past 12 months.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10. Account Termination</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            We reserve the right to suspend or terminate your account if you:
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Violate these Terms of Use</li>
            <li>Engage in fraudulent activity</li>
            <li>Abuse our service or support team</li>
            <li>Fail to pay outstanding balances</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>11. API Usage</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>If you use our API:</p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>You must comply with rate limits</li>
            <li>Keep your API keys secure</li>
            <li>Not share API access with third parties</li>
            <li>Accept responsibility for all API usage</li>
            <li>Follow our API documentation and best practices</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>12. Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            We reserve the right to modify these terms at any time. We will
            notify users of material changes via email or service notification.
            Continued use of the service after changes constitutes acceptance of
            the new terms.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>13. Governing Law</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            These terms shall be governed by and construed in accordance with
            applicable laws. Any disputes shall be resolved through binding
            arbitration.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>14. Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>For questions about these Terms of Use:</p>
          <ul className="list-none space-y-2">
            <li>Email: legal@smsactivation.com</li>
            <li>Support: support@smsactivation.com</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
