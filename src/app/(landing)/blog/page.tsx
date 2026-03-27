import { Card, CardContent } from '@/components/ui/card';

export default function Blog() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold sm:text-4xl md:text-5xl">Blog</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Blog posts coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
