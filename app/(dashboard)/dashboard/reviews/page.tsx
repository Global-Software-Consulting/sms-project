'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { useState } from 'react';

export default function ReviewsDashboard() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const availableSlots = 12; // Every $10 = 1 slot, user spent $120
  const usedSlots = 3;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground mt-1">
          Share your experience with our services
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Slots</CardTitle>
          <CardDescription>
            Earn review slots by spending on our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted flex items-center justify-between rounded-lg p-4">
            <div>
              <p className="text-2xl font-bold">
                {availableSlots - usedSlots} Available
              </p>
              <p className="text-muted-foreground text-sm">
                {usedSlots} used • {availableSlots} total earned
              </p>
            </div>
            <Badge variant="secondary">Earn 1 slot per $10 spent</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
          <CardDescription>
            Share your feedback about our service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? 'fill-warning text-warning'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Review</label>
            <Textarea
              placeholder="Share your experience..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={6}
            />
          </div>

          <Button size="lg" disabled={availableSlots - usedSlots === 0}>
            Submit Review ({availableSlots - usedSlots} slots available)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Reviews</CardTitle>
          <CardDescription>Reviews you've submitted</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              service: 'WhatsApp - US',
              rating: 5,
              text: 'Fast and reliable service!',
              date: 'Feb 10, 2026',
            },
            {
              service: 'Telegram - UK',
              rating: 5,
              text: 'Perfect for my needs',
              date: 'Feb 8, 2026',
            },
            {
              service: 'Instagram - CA',
              rating: 4,
              text: 'Good service overall',
              date: 'Feb 5, 2026',
            },
          ].map((item, i) => (
            <div key={i} className="border-border rounded-lg border p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{item.service}</h4>
                  <div className="mt-1 flex space-x-1">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="fill-warning text-warning h-4 w-4"
                      />
                    ))}
                  </div>
                </div>
                <span className="text-muted-foreground text-sm">
                  {item.date}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">{item.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
