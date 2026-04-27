'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentPolicyClient() {
  return (
    <div className="container max-w-4xl space-y-8 px-4 py-12">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">Payment & Refund Policy</h1>
        <p className="text-muted-foreground text-sm sm:text-lg">
          Last updated: February 25, 2026
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>We accept the following payment methods:</p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Credit Cards (Visa, Mastercard, American Express)</li>
            <li>Debit Cards</li>
            <li>Cryptocurrency (Bitcoin, Ethereum, USDT)</li>
            <li>Digital Wallets (PayPal, Stripe)</li>
          </ul>
          <p>
            All payments are processed through secure, PCI-compliant third-party
            payment processors. We do not store your complete credit card
            information on our servers.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Wallet System</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            <strong>Wallet Deposits:</strong>
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Minimum deposit: $5.00</li>
            <li>Maximum deposit: $10,000.00 per transaction</li>
            <li>Deposits are credited instantly after payment confirmation</li>
            <li>No transaction fees for deposits over $50</li>
            <li>Wallet funds do not expire</li>
          </ul>
          <p className="mt-4">
            <strong>Important:</strong> Wallet deposits are non-refundable.
            Ensure you deposit the correct amount before confirming your
            payment.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Service Pricing</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>Our services are charged per use:</p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>
              <strong>V1 Standard:</strong> $0.45 - $0.95 per SMS (varies by
              service and country)
            </li>
            <li>
              <strong>V2 Premium:</strong> $1.35 - $2.95 per SMS (varies by
              service and country)
            </li>
            <li>
              <strong>V3 Basic:</strong> $2.25 - $4.95 per SMS (varies by
              service and country)
            </li>
            <li>
              <strong>Number Rental:</strong> $2.00 - $15.00 per day (varies by
              country)
            </li>
          </ul>
          <p className="mt-4">
            Prices are subject to change based on market conditions and provider
            availability. Current prices are always displayed before purchase.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Membership Plans</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>
              <strong>Free Tier:</strong> No monthly fee, standard pricing
            </li>
            <li>
              <strong>Pro Tier:</strong> $19.99/month - 10% discount on all
              services
            </li>
            <li>
              <strong>Business Tier:</strong> $49.99/month - 20% discount +
              priority support
            </li>
            <li>
              <strong>Enterprise Tier:</strong> $199.99/month - 30% discount +
              dedicated manager
            </li>
          </ul>
          <p className="mt-4">
            Membership fees are billed monthly and are non-refundable. You may
            cancel your membership at any time, and it will remain active until
            the end of your billing period.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Automatic Refund Policy</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            <strong>SMS Activation Services:</strong>
          </p>
          <p>You will receive an automatic refund to your wallet balance if:</p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>
              SMS is not received within the specified timeframe (typically 15
              minutes)
            </li>
            <li>The phone number is already used for the requested service</li>
            <li>The phone number is invalid or deactivated</li>
            <li>Technical error prevents service delivery</li>
          </ul>
          <p className="mt-4">
            <strong>Note:</strong> Refunds are issued to your wallet balance,
            not to your original payment method. Once an SMS code is
            successfully received, no refund is possible.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Number Rental Refunds</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>For number rental services:</p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Partial refunds for unused days if canceled within 24 hours</li>
            <li>No refund after 24 hours of rental period</li>
            <li>
              Full refund if number becomes unavailable due to provider issues
            </li>
            <li>
              No refund for user-initiated early cancellation after 24 hours
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Non-Refundable Items</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>The following are non-refundable:</p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Wallet deposits</li>
            <li>Membership subscription fees</li>
            <li>Successfully received SMS codes</li>
            <li>Completed rental periods</li>
            <li>API access fees</li>
            <li>Services used in violation of our Terms of Use</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Dispute Resolution</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>If you believe you were charged incorrectly:</p>
          <ol className="ml-4 list-inside list-decimal space-y-2">
            <li>Contact our support team within 30 days of the transaction</li>
            <li>Provide transaction details and reason for dispute</li>
            <li>We will investigate and respond within 5 business days</li>
            <li>
              If approved, refund will be issued to your wallet within 3-5
              business days
            </li>
          </ol>
          <p className="mt-4">
            For payment disputes, please contact: billing@smsactivation.com
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Chargebacks</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            <strong>Important:</strong> Initiating a chargeback without first
            contacting our support team may result in immediate account
            suspension. We encourage you to work with us to resolve any billing
            issues before filing a chargeback with your bank.
          </p>
          <p className="mt-4">If a chargeback is filed:</p>
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Your account will be suspended pending investigation</li>
            <li>All pending services will be canceled</li>
            <li>Wallet balance will be frozen</li>
            <li>
              Account may be permanently terminated if chargeback is deemed
              fraudulent
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10. Promotional Credits</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <ul className="ml-4 list-inside list-disc space-y-2">
            <li>Promotional credits are non-transferable</li>
            <li>Credits expire after 90 days if not used</li>
            <li>Cannot be redeemed for cash</li>
            <li>Must be used before wallet balance</li>
            <li>
              We reserve the right to revoke promotional credits obtained
              fraudulently
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>11. Currency and Taxes</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            All prices are displayed in USD. If paying in another currency,
            conversion rates are determined by your payment processor. You are
            responsible for any applicable taxes, including VAT, GST, or sales
            tax based on your jurisdiction.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>12. Price Changes</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            We reserve the right to change our pricing at any time. Price
            changes will not affect services already purchased. For membership
            plans, we will notify you at least 30 days before any price increase
            takes effect.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>13. Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>For payment and refund inquiries:</p>
          <ul className="list-none space-y-2">
            <li>Billing Support: billing@smsactivation.com</li>
            <li>General Support: support@smsactivation.com</li>
            <li>Phone: +1 (555) 123-4567 (Mon-Fri, 9 AM - 6 PM EST)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
