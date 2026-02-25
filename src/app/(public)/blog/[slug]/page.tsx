"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Tag,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

// Mock blog post data - In production, this would come from a CMS or API
const blogPosts: Record<string, {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
}> = {
  "complete-guide-sms-verification": {
    title: "The Complete Guide to SMS Verification in 2026",
    excerpt: "Learn everything you need to know about SMS verification, from how it works to best practices for implementation.",
    content: `
## What is SMS Verification?

SMS verification is a security measure used by websites and applications to confirm a user's identity by sending a one-time code to their phone number. This process helps prevent fraud, spam, and unauthorized access to accounts.

## How Does SMS Verification Work?

The process is straightforward:

1. **User enters phone number** - When signing up or logging in, the user provides their phone number.
2. **System sends code** - The platform sends a unique, time-limited code via SMS.
3. **User enters code** - The user receives the SMS and enters the code on the platform.
4. **Verification complete** - If the code matches, the user is verified.

## Why Do Platforms Use SMS Verification?

### Security Benefits

- **Prevents automated attacks** - Bots can't easily bypass phone verification
- **Reduces fake accounts** - Each phone number can only verify a limited number of accounts
- **Adds authentication layer** - Provides two-factor authentication (2FA)

### Business Benefits

- **Higher quality users** - Verified users are more likely to be genuine
- **Reduced fraud** - Harder for bad actors to create multiple accounts
- **Compliance** - Meets regulatory requirements in some industries

## Common Use Cases

SMS verification is used across many industries:

- **Social Media** - WhatsApp, Telegram, Instagram, Twitter
- **E-commerce** - Amazon, eBay, AliExpress
- **Finance** - Banks, crypto exchanges, payment apps
- **Tech** - Google, Microsoft, Apple services
- **Gaming** - Discord, Steam, gaming platforms

## Best Practices for SMS Verification

### For Users

1. **Use a reliable service** - Choose a trusted SMS verification provider
2. **Act quickly** - Codes typically expire in 5-15 minutes
3. **Keep your number private** - Don't share verification codes with anyone
4. **Use virtual numbers for privacy** - Services like BestSMSHQ provide anonymous verification

### For Developers

1. **Implement rate limiting** - Prevent abuse of the verification system
2. **Use secure code generation** - Codes should be random and unpredictable
3. **Set appropriate expiry times** - Balance security with user convenience
4. **Provide fallback options** - Offer alternative verification methods

## Virtual Numbers vs Personal Numbers

| Aspect | Virtual Numbers | Personal Numbers |
|--------|-----------------|------------------|
| Privacy | High - No personal data exposed | Low - Linked to your identity |
| Cost | Pay per use | Monthly phone bill |
| Availability | Instant, 190+ countries | Limited to your location |
| Multiple accounts | Easy to manage | Difficult, limited |

## Conclusion

SMS verification is an essential security measure in today's digital world. Whether you're a user looking to protect your privacy or a developer implementing verification, understanding how it works is crucial.

For users who value privacy, virtual phone numbers from services like BestSMSHQ offer a convenient and anonymous way to verify accounts without exposing personal information.
    `,
    category: "guides",
    author: "BestSMSHQ Team",
    date: "2026-02-20",
    readTime: "8 min read",
    tags: ["SMS Verification", "Security", "Privacy", "Guide"],
  },
  "api-integration-tutorial": {
    title: "How to Integrate BestSMSHQ API in Your Application",
    excerpt: "A step-by-step tutorial on integrating our SMS verification API into your web or mobile application.",
    content: `
## Introduction

This tutorial will guide you through integrating the BestSMSHQ API into your application. Whether you're building a web app, mobile app, or backend service, our API makes SMS verification simple.

## Prerequisites

Before you begin, make sure you have:

- A BestSMSHQ account with API access
- Your API key (found in Settings > API Keys)
- Basic knowledge of REST APIs
- A development environment set up

## Getting Your API Key

1. Log in to your BestSMSHQ dashboard
2. Navigate to **Settings > API Keys**
3. Click **Create New Key**
4. Copy your key (format: \`bshq_live_xxx\`)

> **Important:** Keep your API key secure. Never expose it in client-side code.

## Basic API Usage

### Authentication

All API requests require authentication via the \`Authorization\` header:

\`\`\`bash
Authorization: Bearer bshq_live_your_api_key
\`\`\`

### Get Available Countries

\`\`\`javascript
const response = await fetch('https://api.bestsmshq.com/v1/countries', {
  headers: {
    'Authorization': 'Bearer bshq_live_xxx'
  }
});

const countries = await response.json();
console.log(countries);
\`\`\`

### Get Available Services

\`\`\`javascript
const response = await fetch('https://api.bestsmshq.com/v1/services?country=US', {
  headers: {
    'Authorization': 'Bearer bshq_live_xxx'
  }
});

const services = await response.json();
\`\`\`

### Purchase a Number

\`\`\`javascript
const response = await fetch('https://api.bestsmshq.com/v1/numbers', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer bshq_live_xxx',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    service: 'whatsapp',
    country: 'US'
  })
});

const { id, number, expiresAt } = await response.json();
console.log(\`Number: \${number}\`);
\`\`\`

### Check for SMS

\`\`\`javascript
const checkSMS = async (numberId) => {
  const response = await fetch(\`https://api.bestsmshq.com/v1/numbers/\${numberId}/sms\`, {
    headers: {
      'Authorization': 'Bearer bshq_live_xxx'
    }
  });
  
  const { sms } = await response.json();
  return sms;
};

// Poll for SMS
const pollForSMS = async (numberId, maxAttempts = 30) => {
  for (let i = 0; i < maxAttempts; i++) {
    const sms = await checkSMS(numberId);
    if (sms && sms.length > 0) {
      return sms[0];
    }
    await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds
  }
  throw new Error('SMS not received');
};
\`\`\`

## Using Webhooks

Instead of polling, you can use webhooks for real-time notifications:

### Configure Webhook

1. Go to **Settings > Webhooks**
2. Add your webhook URL
3. Select events to receive

### Webhook Payload

\`\`\`json
{
  "event": "sms.received",
  "data": {
    "numberId": "num_xxx",
    "number": "+1234567890",
    "sms": {
      "from": "WhatsApp",
      "text": "Your code is 123456",
      "code": "123456",
      "receivedAt": "2026-02-20T10:30:00Z"
    }
  }
}
\`\`\`

## Error Handling

Always handle errors gracefully:

\`\`\`javascript
try {
  const response = await fetch('https://api.bestsmshq.com/v1/numbers', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer bshq_live_xxx',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ service: 'whatsapp', country: 'US' })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error appropriately
}
\`\`\`

## Rate Limits

API rate limits depend on your plan:

| Plan | Rate Limit |
|------|------------|
| Free | 30 req/min |
| Basic | 60 req/min |
| Standard | 120 req/min |
| Pro | 240 req/min |
| VIP | 600 req/min |

## Conclusion

You now have everything you need to integrate BestSMSHQ into your application. For more details, check our full API documentation at [/api-docs](/api-docs).
    `,
    category: "tutorials",
    author: "Dev Team",
    date: "2026-02-15",
    readTime: "12 min read",
    tags: ["API", "Integration", "Tutorial", "Development"],
  },
};

// Related posts (mock)
const relatedPosts = [
  {
    slug: "top-10-services-sms-activation",
    title: "Top 10 Services That Require SMS Activation",
    category: "guides",
    readTime: "5 min read",
  },
  {
    slug: "privacy-tips-online-verification",
    title: "5 Privacy Tips for Online Verification",
    category: "tips",
    readTime: "6 min read",
  },
  {
    slug: "whatsapp-verification-guide",
    title: "How to Verify WhatsApp Without Your Personal Number",
    category: "tutorials",
    readTime: "7 min read",
  },
];

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = blogPosts[slug];

  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="default" padding="large" className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Article Not Found
          </h1>
          <p className="text-text-secondary mb-6">
            The article you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link href="/blog">
            <Button variant="primary">Back to Blog</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-gold/10 rounded-full blur-[128px]" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-gold transition-colors duration-200 mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>

            {/* Category & Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-3 py-1 text-sm font-medium bg-accent-gold/10 text-accent-gold rounded-full capitalize">
                {post.category}
              </span>
              <span className="text-text-muted flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
              <span className="text-text-muted flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.date)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-5xl font-bold text-text-primary mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-text-secondary mb-8">
              {post.excerpt}
            </p>

            {/* Author & Share */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-border-default">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent-gold/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-accent-gold" />
                </div>
                <div>
                  <div className="font-medium text-text-primary">{post.author}</div>
                  <div className="text-sm text-text-muted">Author</div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted mr-2">Share:</span>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-bg-card border border-border-default flex items-center justify-center hover:border-accent-gold transition-colors duration-200"
                >
                  <Twitter className="w-4 h-4 text-text-muted" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-bg-card border border-border-default flex items-center justify-center hover:border-accent-gold transition-colors duration-200"
                >
                  <Facebook className="w-4 h-4 text-text-muted" />
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-bg-card border border-border-default flex items-center justify-center hover:border-accent-gold transition-colors duration-200"
                >
                  <Linkedin className="w-4 h-4 text-text-muted" />
                </a>
                <button
                  onClick={handleCopyLink}
                  className="w-10 h-10 rounded-lg bg-bg-card border border-border-default flex items-center justify-center hover:border-accent-gold transition-colors duration-200"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 text-text-muted" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <Card variant="default" padding="large">
                  <article className="prose prose-invert prose-lg max-w-none">
                    <div 
                      className="text-text-secondary leading-relaxed space-y-6"
                      dangerouslySetInnerHTML={{ 
                        __html: post.content
                          .replace(/## (.*)/g, '<h2 class="text-2xl font-bold text-text-primary mt-8 mb-4">$1</h2>')
                          .replace(/### (.*)/g, '<h3 class="text-xl font-semibold text-text-primary mt-6 mb-3">$1</h3>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary">$1</strong>')
                          .replace(/`([^`]+)`/g, '<code class="px-2 py-1 bg-bg-secondary rounded text-accent-gold text-sm">$1</code>')
                          .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="p-4 bg-bg-secondary rounded-xl overflow-x-auto my-4"><code class="text-sm text-text-secondary">$2</code></pre>')
                          .replace(/> (.*)/g, '<blockquote class="border-l-4 border-accent-gold pl-4 italic text-text-muted my-4">$1</blockquote>')
                          .replace(/- (.*)/g, '<li class="ml-4">$1</li>')
                          .replace(/\n\n/g, '</p><p class="mb-4">')
                      }}
                    />
                  </article>
                </Card>

                {/* Tags */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Tag className="w-4 h-4 text-text-muted" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-bg-card border border-border-default rounded-full text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Table of Contents placeholder */}
                  <Card variant="default" padding="default">
                    <h3 className="font-semibold text-text-primary mb-4">Quick Links</h3>
                    <div className="space-y-2">
                      <Link href="/register" className="block text-sm text-text-secondary hover:text-accent-gold transition-colors duration-200">
                        → Create Free Account
                      </Link>
                      <Link href="/api-docs" className="block text-sm text-text-secondary hover:text-accent-gold transition-colors duration-200">
                        → API Documentation
                      </Link>
                      <Link href="/pricing-public" className="block text-sm text-text-secondary hover:text-accent-gold transition-colors duration-200">
                        → View Pricing
                      </Link>
                    </div>
                  </Card>

                  {/* CTA */}
                  <Card variant="premium" padding="default" className="text-center">
                    <h3 className="font-semibold text-text-primary mb-2">Ready to Start?</h3>
                    <p className="text-sm text-text-secondary mb-4">
                      Get instant virtual numbers for SMS verification.
                    </p>
                    <Link href="/register">
                      <Button variant="primary" size="sm" fullWidth>
                        Start Free
                      </Button>
                    </Link>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-12 bg-bg-secondary">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-text-primary mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                  <Card variant="default" padding="default" hover className="h-full">
                    <span className="px-2 py-1 text-xs font-medium bg-bg-secondary text-text-secondary rounded-full capitalize">
                      {relatedPost.category}
                    </span>
                    <h3 className="font-semibold text-text-primary mt-3 mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <span className="text-xs text-text-muted">{relatedPost.readTime}</span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-12">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <Card variant="premium" padding="large" className="text-center">
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                Enjoyed This Article?
              </h2>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                Subscribe to get more guides, tutorials, and updates delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 h-12 px-4 bg-bg-card border border-border-default rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold transition-colors duration-200"
                />
                <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Subscribe
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

