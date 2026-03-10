import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function Reviews() {
  const reviews = [
    { name: 'Sarah J.', rating: 5, text: "Best SMS service I've used!" },
    { name: 'Mike C.', rating: 5, text: 'Fast and reliable' },
    { name: 'Emma D.', rating: 5, text: 'Great value for money' },
  ];

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-4xl font-bold md:text-5xl">Customer Reviews</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {reviews.map((review, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="mb-2 flex space-x-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="fill-warning text-warning h-4 w-4"
                    />
                  ))}
                </div>
                <CardTitle className="text-base">{review.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{review.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
