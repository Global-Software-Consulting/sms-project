import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="container max-w-4xl space-y-8 py-12">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Legal Disclaimer</h1>
        <p className="text-muted-foreground text-center text-lg">
          Last updated: February 25, 2026
        </p>
      </div>

      <div className="bg-warning/10 border-warning/30 flex items-start space-x-3 rounded-lg border p-4">
        <AlertCircle className="text-warning mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <h3 className="text-warning mb-2 font-semibold">Important Notice</h3>
          <p className="text-muted-foreground text-sm">
            Please read this disclaimer carefully before using our SMS
            activation service. By using our service, you acknowledge that you
            have read, understood, and agree to this disclaimer.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Service Nature and Limitations</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            Our SMS activation service provides temporary phone numbers for
            receiving verification codes. We act as an intermediary between
            users and telecommunications providers.
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>We do not guarantee 100% SMS delivery success rate</li>
            <li>Number availability may vary based on provider and demand</li>
            <li>SMS delivery times may vary (typically 1-15 minutes)</li>
            <li>Some services may block or reject our numbers</li>
            <li>We cannot control third-party platform policies</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. User Responsibility</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            <strong>You are solely responsible for:</strong>
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>
              Ensuring your use of our service complies with all applicable laws
            </li>
            <li>
              Obtaining proper authorization before using our service for
              business purposes
            </li>
            <li>
              Verifying that your use complies with third-party platform terms
              of service
            </li>
            <li>Any consequences resulting from your use of our service</li>
            <li>
              Maintaining the security and confidentiality of received SMS codes
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Prohibited Uses</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            <strong>Our service must NOT be used for:</strong>
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Creating accounts to commit fraud or illegal activities</li>
            <li>Bypassing security measures or restrictions</li>
            <li>Spamming, harassment, or unsolicited communications</li>
            <li>Violating any third-party terms of service or policies</li>
            <li>Money laundering or financial fraud</li>
            <li>Creating fake or impersonation accounts</li>
            <li>Any activity that may harm others or violate their rights</li>
          </ul>
          <p className="mt-4">
            We reserve the right to terminate accounts engaged in prohibited
            activities and may report illegal activities to law enforcement.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. No Warranty</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            Our service is provided "AS IS" and "AS AVAILABLE" without
            warranties of any kind, either express or implied, including but not
            limited to:
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Merchantability or fitness for a particular purpose</li>
            <li>Uninterrupted or error-free operation</li>
            <li>Accuracy, reliability, or availability of results</li>
            <li>Compatibility with third-party services</li>
            <li>Freedom from viruses or harmful components</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            To the maximum extent permitted by law, we shall not be liable for:
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Any indirect, incidental, special, or consequential damages</li>
            <li>Loss of profits, data, or business opportunities</li>
            <li>Damages resulting from service interruptions or errors</li>
            <li>Failed SMS deliveries or delayed messages</li>
            <li>Third-party actions, including account suspensions or bans</li>
            <li>Unauthorized access to your account or data</li>
            <li>Actions taken by you based on our service</li>
          </ul>
          <p className="mt-4">
            Our total liability shall not exceed the amount you paid us in the
            past 12 months.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Third-Party Services</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            We work with third-party telecommunications providers to deliver our
            service. We are not responsible for:
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Actions, policies, or terms of third-party providers</li>
            <li>Changes in third-party service availability</li>
            <li>Third-party security breaches or data leaks</li>
            <li>Quality or reliability of third-party services</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. No Professional Advice</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            Our service does not provide legal, financial, tax, or professional
            advice. Any information provided through our service or support
            channels is for general informational purposes only. You should
            consult with appropriate professionals before making decisions based
            on our service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Privacy and Data Security</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>While we implement security measures to protect your data:</p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>No internet transmission is 100% secure</li>
            <li>We cannot guarantee absolute security of your data</li>
            <li>SMS codes may be visible to telecommunications providers</li>
            <li>
              You should not use our service for highly sensitive accounts
            </li>
            <li>
              We recommend enabling additional security measures on your
              accounts
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Service Availability</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            We strive to maintain high service availability, but we do not
            guarantee:
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>24/7 uninterrupted service access</li>
            <li>Availability of specific countries or services</li>
            <li>Consistent pricing or success rates</li>
            <li>Maintenance-free operation</li>
          </ul>
          <p className="mt-4">
            We reserve the right to modify, suspend, or discontinue any part of
            our service at any time with or without notice.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10. Indemnification</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            You agree to indemnify and hold us harmless from any claims,
            damages, losses, liabilities, and expenses (including legal fees)
            arising from:
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Your use or misuse of our service</li>
            <li>Violation of these terms or applicable laws</li>
            <li>Infringement of third-party rights</li>
            <li>Your account activities</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>11. Geographic Restrictions</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            Our service may not be available in all countries or jurisdictions.
            It is your responsibility to ensure that your use of our service
            complies with local laws and regulations. We may restrict or deny
            access from certain locations at our discretion.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>12. Changes to Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            We reserve the right to modify this disclaimer at any time. Changes
            will be posted on this page with an updated "Last updated" date.
            Your continued use of our service after changes constitutes
            acceptance of the modified disclaimer.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>13. Severability</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            If any provision of this disclaimer is found to be unenforceable or
            invalid, that provision shall be limited or eliminated to the
            minimum extent necessary, and the remaining provisions shall remain
            in full force and effect.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>14. Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>For questions about this disclaimer:</p>
          <ul className="list-none space-y-2">
            <li>Email: legal@smsactivation.com</li>
            <li>Support: support@smsactivation.com</li>
          </ul>
        </CardContent>
      </Card>

      <div className="bg-muted/50 border-border rounded-lg border p-4">
        <p className="text-muted-foreground text-center text-sm">
          <strong>
            By using our service, you acknowledge that you have read and
            understood this disclaimer and agree to its terms.
          </strong>
        </p>
      </div>
    </div>
  );
}
