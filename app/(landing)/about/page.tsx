import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-4xl font-bold md:text-5xl">About SMSPro</h1>
        <Card>
          <CardContent className="space-y-4 py-8">
            <p className="text-muted-foreground text-lg">
              SMSPro is a premium SMS activation and number rental platform
              serving customers worldwide.
            </p>
            <p className="text-muted-foreground">
              Founded in 2020, we've grown to serve thousands of customers
              across 180+ countries, providing reliable and instant SMS
              verification services for all major platforms.
            </p>
            <p className="text-muted-foreground">
              Our mission is to make SMS verification simple, fast, and
              affordable for everyone.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
