import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';

export default function Status() {
  const services = [
    { name: 'API Services', status: 'operational', uptime: '99.99%' },
    { name: 'SMS Gateway', status: 'operational', uptime: '99.95%' },
    { name: 'Payment Processing', status: 'operational', uptime: '99.97%' },
    { name: 'Web Dashboard', status: 'operational', uptime: '99.98%' },
  ];

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center space-x-3">
            <CheckCircle2 className="text-success h-12 w-12" />
            <h1 className="text-4xl font-bold md:text-5xl">
              All Systems Operational
            </h1>
          </div>
          <p className="text-muted-foreground text-xl">
            Last updated: Feb 13, 2026 14:35 UTC
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="border-border flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="text-success h-5 w-5" />
                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-muted-foreground text-sm">
                        Uptime: {service.uptime}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-success text-success-foreground">
                    Operational
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="text-muted-foreground mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-semibold">All systems operational</p>
                  <p className="text-muted-foreground text-sm">
                    Feb 13, 2026 at 14:35 UTC
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
