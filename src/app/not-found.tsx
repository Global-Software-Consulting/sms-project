import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="from-background via-background to-muted/20 flex min-h-screen w-full items-center justify-center bg-gradient-to-br p-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[128px]" />
        <div className="bg-accent/5 absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full blur-[128px]" />
      </div>

      <div className="relative w-full max-w-md space-y-8 text-center">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-primary/10 text-[100px] leading-none font-bold sm:text-[150px]">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-muted/50 border-border flex h-24 w-24 items-center justify-center rounded-2xl border backdrop-blur-sm">
              <Search className="text-muted-foreground h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Page Not Found</h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-8">
          <p className="text-muted-foreground mb-3 text-sm">Quick Links</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/features"
              className="text-primary text-sm hover:underline"
            >
              Features
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/api" className="text-primary text-sm hover:underline">
              API Docs
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/help" className="text-primary text-sm hover:underline">
              Help Center
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/contact"
              className="text-primary text-sm hover:underline"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
