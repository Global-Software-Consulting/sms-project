'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Search,
  Loader2,
  HelpCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: {
    id: string;
    name: string;
    slug?: string;
    description?: string;
  };
  sortOrder?: number;
}

interface CategoryGroup {
  id: string;
  name: string;
  description: string;
  slug?: string;
  faqs: FaqItem[];
}

export interface KnowledgeBaseContent {
  heroHeading: string;
  heroDescription: string;
  ctaHeading: string;
  ctaBody: string;
}

const FALLBACK_KB_CONTENT: KnowledgeBaseContent = {
  heroHeading: 'Knowledge Base',
  heroDescription:
    'Everything you need to understand how the platform works, from activation flow to advanced usage.',
  ctaHeading: "Can't find what you're looking for?",
  ctaBody: 'Our support team is here to help you with any questions.',
};

export default function KnowledgeBaseClient({
  content = FALLBACK_KB_CONTENT,
}: {
  content?: KnowledgeBaseContent;
} = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch all FAQs and categories in parallel
      const [faqRes, catRes] = await Promise.allSettled([
        apiClient.get(API_ENDPOINTS.FAQ.ROOT, { params: { limit: 500 } }),
        apiClient.get(API_ENDPOINTS.FAQ.CATEGORIES),
      ]);

      // Parse categories
      let catList: any[] = [];
      if (catRes.status === 'fulfilled') {
        const catData = catRes.value.data;
        catList = Array.isArray(catData)
          ? catData
          : catData.data || catData.categories || [];
      }

      // Parse FAQs
      let faqList: FaqItem[] = [];
      if (faqRes.status === 'fulfilled') {
        const faqData = faqRes.value.data;
        faqList = Array.isArray(faqData)
          ? faqData
          : faqData.data || faqData.faqs || [];
      }

      // Group FAQs by category
      const grouped = new Map<string, CategoryGroup>();

      // Initialize from categories
      catList.forEach((cat: any) => {
        const id = cat.id;
        grouped.set(id, {
          id,
          name: cat.name || cat.title,
          description: cat.description || '',
          slug: cat.slug,
          faqs: [],
        });
      });

      // Add FAQs to their categories
      faqList.forEach((faq) => {
        const catId = faq.category?.id || 'uncategorized';
        if (!grouped.has(catId)) {
          grouped.set(catId, {
            id: catId,
            name: faq.category?.name || 'General',
            description: faq.category?.description || '',
            slug: faq.category?.slug,
            faqs: [],
          });
        }
        grouped.get(catId)!.faqs.push(faq);
      });

      // Filter out empty categories and sort
      const result = Array.from(grouped.values()).filter(
        (c) => c.faqs.length > 0,
      );
      setCategories(result);

      // Auto-expand first category
      if (result.length > 0) {
        setExpandedCategories(new Set([result[0].id]));
      }
    } catch {
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleFaq = (id: string) => {
    setExpandedFaqs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter based on search
  const filteredCategories = searchQuery
    ? categories
        .map((cat) => ({
          ...cat,
          faqs: cat.faqs.filter(
            (faq) =>
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((cat) => cat.faqs.length > 0)
    : categories;

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            {content.heroHeading}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-xl">
            {content.heroDescription}
          </p>

          <div className="relative mx-auto max-w-2xl">
            <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 [border-color:var(--glass-border)] pl-12 text-base backdrop-blur-[var(--glass-blur)] [background:var(--glass-primary)]"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <HelpCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-20" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No articles match your search'
                  : 'No articles available yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => {
              const isExpanded =
                expandedCategories.has(category.id) || !!searchQuery;
              return (
                <Card key={category.id} className="overflow-hidden">
                  {/* Category header - clickable to expand/collapse */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="hover:bg-muted/30 flex w-full items-center justify-between p-6 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                        <HelpCircle className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">
                          {category.name}
                        </h2>
                        {category.description && (
                          <p className="text-muted-foreground text-sm">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-sm">
                        {category.faqs.length}{' '}
                        {category.faqs.length === 1 ? 'article' : 'articles'}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="text-muted-foreground h-5 w-5" />
                      ) : (
                        <ChevronRight className="text-muted-foreground h-5 w-5" />
                      )}
                    </div>
                  </button>

                  {/* FAQ items */}
                  {isExpanded && (
                    <div className="border-border border-t">
                      {category.faqs.map((faq) => {
                        const isFaqExpanded = expandedFaqs.has(faq.id);
                        return (
                          <div
                            key={faq.id}
                            className="border-border border-b last:border-0"
                          >
                            <button
                              onClick={() => toggleFaq(faq.id)}
                              className="hover:bg-muted/20 flex w-full items-center justify-between px-6 py-4 text-left transition-colors"
                            >
                              <span className="pr-4 text-sm font-medium">
                                {faq.question}
                              </span>
                              {isFaqExpanded ? (
                                <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
                              ) : (
                                <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                              )}
                            </button>
                            {isFaqExpanded && (
                              <div className="bg-muted/10 px-6 pb-4">
                                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                                  {faq.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <Card className="mt-12 text-center">
          <CardContent className="py-12">
            <h3 className="mb-2 text-2xl font-bold">{content.ctaHeading}</h3>
            <p className="text-muted-foreground mb-6">{content.ctaBody}</p>
            <Link
              prefetch={false}
              href="/help"
              className="bg-primary text-primary-foreground inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium transition-all duration-180 hover:[box-shadow:var(--glow-accent-active)]"
            >
              Contact Support
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
