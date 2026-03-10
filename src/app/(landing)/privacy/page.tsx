import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Privacy() {
  return (
    <div className="container max-w-4xl space-y-8 py-12">
      <div className="space-y-4">
        <h1 className="text-center text-4xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground text-center text-lg">
          Last updated: February 25, 2026
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            We collect information that you provide directly to us when you
            create an account, make a purchase, or use our SMS activation
            services. This may include:
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Account information (email address, username, password)</li>
            <li>
              Payment information (processed securely through third-party
              providers)
            </li>
            <li>Transaction history and usage data</li>
            <li>Communications you send to our support team</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>We use the information we collect to:</p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Provide, maintain, and improve our SMS activation services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>
              Detect, prevent, and address technical issues and fraudulent
              activity
            </li>
            <li>Comply with legal obligations</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Information Sharing and Disclosure</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            We do not sell, trade, or rent your personal information to third
            parties. We may share your information only in the following
            circumstances:
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>With your consent or at your direction</li>
            <li>With service providers who perform services on our behalf</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights, privacy, safety, or property</li>
            <li>In connection with a merger, sale, or acquisition</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Data Security</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal information against unauthorized or unlawful
            processing, accidental loss, destruction, or damage. However, no
            internet transmission is completely secure, and we cannot guarantee
            absolute security.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            We retain your personal information for as long as necessary to
            fulfill the purposes outlined in this Privacy Policy, unless a
            longer retention period is required or permitted by law.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Your Rights</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>Depending on your location, you may have the following rights:</p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Access and receive a copy of your personal information</li>
            <li>Correct or update your personal information</li>
            <li>Delete your personal information</li>
            <li>
              Object to or restrict processing of your personal information
            </li>
            <li>Withdraw consent at any time</li>
            <li>Data portability</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Cookies and Tracking</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            We use cookies and similar tracking technologies to track activity
            on our service and hold certain information. You can instruct your
            browser to refuse all cookies or to indicate when a cookie is being
            sent.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Third-Party Services</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            Our service may contain links to third-party websites or services.
            We are not responsible for the privacy practices of these third
            parties. We encourage you to read their privacy policies.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Children's Privacy</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            Our service is not intended for users under the age of 18. We do not
            knowingly collect personal information from children under 18. If
            you become aware that a child has provided us with personal
            information, please contact us.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10. Changes to This Policy</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>11. Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            If you have any questions about this Privacy Policy, please contact
            us:
          </p>
          <ul className="list-none space-y-2">
            <li>Email: privacy@smsactivation.com</li>
            <li>Support: support@smsactivation.com</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
