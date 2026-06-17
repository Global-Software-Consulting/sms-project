'use client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Search,
  Loader2,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Smartphone,
  Home,
  Crown,
  DollarSign,
  MessageSquare,
  Code,
  AlertCircle,
  Star,
  Shield,
  Zap,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

/**
 * The public /faq endpoint historically shipped two different shapes for
 * `category`: a full `{id, name, slug, description}` object on the admin
 * side, and just the category slug string on the public side. Accept both
 * so this component reads correctly no matter which the backend evolves
 * to first.
 */
type FaqCategoryRef =
  | string
  | {
      id: string;
      name: string;
      slug?: string;
      description?: string;
    };

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: FaqCategoryRef | null;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryGroup {
  id: string;
  name: string;
  description: string;
  slug?: string;
  /** Lucide icon key admin picked in /admin/faq. Empty = keyword fallback. */
  icon?: string | null;
  /** Tone key picked by admin. Empty = keyword fallback tone. */
  iconColor?: string | null;
  faqs: FaqItem[];
  latestUpdatedAt: number;
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

type CategoryFilter = 'all' | 'popular' | 'recent';

// Map a category by name / slug to an icon + colour token. Falls back to
// a neutral HelpCircle when none of the keyword rules match — keeps the
// page from rendering an obvious "?" placeholder for admin-defined
// categories the design didn't anticipate.
const ICON_BY_KEYWORD: Array<{
  match: RegExp;
  icon: LucideIcon;
  tone: 'amber' | 'green' | 'orange' | 'red';
}> = [
  { match: /getting started|general|intro/i, icon: BookOpen, tone: 'amber' },
  {
    match: /sms activation|activation|how to buy/i,
    icon: Smartphone,
    tone: 'green',
  },
  { match: /rent|rental/i, icon: Home, tone: 'orange' },
  { match: /member|discount|tier|plan/i, icon: Crown, tone: 'amber' },
  { match: /wallet|payment|deposit|billing/i, icon: DollarSign, tone: 'green' },
  { match: /review|limit|quota/i, icon: MessageSquare, tone: 'orange' },
  { match: /api|code|integration|developer/i, icon: Code, tone: 'amber' },
  { match: /trouble|issue|error|support/i, icon: AlertCircle, tone: 'red' },
];

// Lucide icon key (the string admin picks in /admin/faq) -> component.
// Keys here MUST match the CATEGORY_ICON_CHOICES list in admin/faq/page.tsx
// so a picked icon round-trips correctly.
const ICON_BY_KEY: Record<string, LucideIcon> = {
  BookOpen,
  Smartphone,
  Home,
  Crown,
  DollarSign,
  MessageSquare,
  Code,
  AlertCircle,
  Star,
  Shield,
  Zap,
  Globe,
  HelpCircle,
};

function categoryVisual(category: CategoryGroup) {
  // Admin override wins. Empty / unknown values silently degrade to the
  // keyword auto-pick so categories created before the picker existed
  // (or with an icon key the frontend doesn't know yet) still render
  // something sensible.
  const adminIcon: LucideIcon | undefined = category.icon
    ? ICON_BY_KEY[category.icon]
    : undefined;
  const adminTone = (
    category.iconColor === 'amber' ||
    category.iconColor === 'green' ||
    category.iconColor === 'orange' ||
    category.iconColor === 'red'
      ? category.iconColor
      : null
  ) as 'amber' | 'green' | 'orange' | 'red' | null;

  if (adminIcon && adminTone) {
    return { Icon: adminIcon, tone: adminTone };
  }

  const key = `${category.name} ${category.slug ?? ''}`;
  const hit = ICON_BY_KEYWORD.find((rule) => rule.match.test(key));
  const fallback = hit
    ? { Icon: hit.icon, tone: hit.tone }
    : { Icon: HelpCircle, tone: 'amber' as const };
  // Allow partial override — admin picked icon only, OR colour only.
  return {
    Icon: adminIcon ?? fallback.Icon,
    tone: adminTone ?? fallback.tone,
  };
}

const TONE_CLASSES: Record<
  'amber' | 'green' | 'orange' | 'red',
  { bg: string; text: string }
> = {
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  green: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  orange: { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  red: { bg: 'bg-rose-500/15', text: 'text-rose-400' },
};

export default function KnowledgeBaseClient({
  content = FALLBACK_KB_CONTENT,
}: {
  content?: KnowledgeBaseContent;
} = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [faqRes, catRes] = await Promise.allSettled([
        apiClient.get(API_ENDPOINTS.FAQ.ROOT, { params: { limit: 500 } }),
        apiClient.get(API_ENDPOINTS.FAQ.CATEGORIES),
      ]);

      let catList: any[] = [];
      if (catRes.status === 'fulfilled') {
        const catData = catRes.value.data;
        catList = Array.isArray(catData)
          ? catData
          : catData.data || catData.categories || [];
      }

      let faqList: FaqItem[] = [];
      if (faqRes.status === 'fulfilled') {
        const faqData = faqRes.value.data;
        faqList = Array.isArray(faqData)
          ? faqData
          : faqData.data || faqData.faqs || [];
      }

      const grouped = new Map<string, CategoryGroup>();
      catList.forEach((cat: any) => {
        const id = cat.id;
        grouped.set(id, {
          id,
          name: cat.name || cat.title,
          description: cat.description || '',
          slug: cat.slug,
          icon: cat.icon ?? null,
          iconColor: cat.iconColor ?? null,
          faqs: [],
          latestUpdatedAt: 0,
        });
      });

      // Index the categories we already loaded by slug AND id so we can
      // join FAQs back regardless of whether the public endpoint hands us
      // a full category object or just a slug string.
      const byIdOrSlug = new Map<string, CategoryGroup>();
      for (const cat of grouped.values()) {
        byIdOrSlug.set(cat.id, cat);
        if (cat.slug) byIdOrSlug.set(cat.slug, cat);
      }

      // Helper to lazily create the "General" bucket on demand — used for
      // FAQs whose category was deleted (their `category` field still
      // carries the old slug) and for FAQs with no category at all. We
      // intentionally DO NOT mint a phantom card per orphan slug; that
      // would resurrect deleted category names on the public page.
      const ensureGeneralBucket = (): CategoryGroup => {
        const existing = byIdOrSlug.get('uncategorized');
        if (existing) return existing;
        const fresh: CategoryGroup = {
          id: 'uncategorized',
          name: 'General',
          description: '',
          faqs: [],
          latestUpdatedAt: 0,
        };
        grouped.set('uncategorized', fresh);
        byIdOrSlug.set('uncategorized', fresh);
        return fresh;
      };

      faqList.forEach((faq) => {
        let cat: CategoryGroup | undefined;
        const ref = faq.category;
        if (typeof ref === 'string') {
          // Public payload returns the category as a slug string. If the
          // slug matches a live category, attach the FAQ to it. Otherwise
          // the category has been deleted — bucket into General so the
          // article is still readable but no phantom card is created.
          cat = byIdOrSlug.get(ref) ?? ensureGeneralBucket();
        } else if (ref && typeof ref === 'object') {
          // Admin / detailed payload returns a full category object.
          cat = byIdOrSlug.get(ref.id) ?? byIdOrSlug.get(ref.slug ?? '');
          if (!cat) {
            cat = {
              id: ref.id,
              name: ref.name,
              description: ref.description || '',
              slug: ref.slug,
              faqs: [],
              latestUpdatedAt: 0,
            };
            grouped.set(ref.id, cat);
            byIdOrSlug.set(ref.id, cat);
            if (ref.slug) byIdOrSlug.set(ref.slug, cat);
          }
        } else {
          // FAQ with no category attached — bucket as General.
          cat = ensureGeneralBucket();
        }

        cat.faqs.push(faq);
        const updatedAt = Date.parse(faq.updatedAt || faq.createdAt || '');
        if (Number.isFinite(updatedAt) && updatedAt > cat.latestUpdatedAt) {
          cat.latestUpdatedAt = updatedAt;
        }
      });

      const result = Array.from(grouped.values()).filter(
        (c) => c.faqs.length > 0,
      );
      setCategories(result);
    } catch {
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleFaq = (id: string) => {
    setExpandedFaqs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Apply search + filter chip.
  let visibleCategories = categories;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    visibleCategories = categories
      .map((cat) => ({
        ...cat,
        faqs: cat.faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(q) ||
            faq.answer.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.faqs.length > 0);
  }
  if (filter === 'popular') {
    visibleCategories = [...visibleCategories].sort(
      (a, b) => b.faqs.length - a.faqs.length,
    );
  } else if (filter === 'recent') {
    visibleCategories = [...visibleCategories].sort(
      (a, b) => b.latestUpdatedAt - a.latestUpdatedAt,
    );
  }

  const activeCategory =
    activeCategoryId &&
    visibleCategories.find((c) => c.id === activeCategoryId);

  const filterChips: Array<{ id: CategoryFilter; label: string }> = [
    { id: 'all', label: 'All Categories' },
    { id: 'popular', label: 'Popular' },
    { id: 'recent', label: 'Recently Updated' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl space-y-10">
        {/* Header */}
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            {content.heroHeading}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-xl">
            {content.heroDescription}
          </p>

          <div className="relative mx-auto max-w-2xl">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 z-10 h-5 w-5 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 border-white/10 bg-white/[0.03] pl-12 text-base"
            />
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {filterChips.map((chip) => {
              const isActive = filter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setFilter(chip.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground border border-white/10 hover:bg-white/5'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : visibleCategories.length === 0 ? (
          <Card className="p-12 text-center">
            <HelpCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-20" />
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No articles match your search'
                : 'No articles available yet'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleCategories.map((category) => {
              const { Icon, tone } = categoryVisual(category);
              const toneClass = TONE_CLASSES[tone];
              const isActive = activeCategoryId === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() =>
                    setActiveCategoryId(isActive ? null : category.id)
                  }
                  className={`group hover:border-primary/30 flex min-h-[200px] cursor-pointer flex-col rounded-2xl border p-6 text-left transition-colors ${
                    isActive
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${toneClass.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${toneClass.text}`} />
                  </div>
                  <h2 className="mt-5 line-clamp-1 text-base font-semibold">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                      {category.description}
                    </p>
                  )}
                  <p className="text-muted-foreground mt-auto pt-6 text-xs">
                    {category.faqs.length}{' '}
                    {category.faqs.length === 1 ? 'article' : 'articles'}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected category's articles */}
        {activeCategory && (
          <Card className="overflow-hidden">
            <div className="border-b border-white/10 p-6">
              <h3 className="text-lg font-semibold">{activeCategory.name}</h3>
              {activeCategory.description && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {activeCategory.description}
                </p>
              )}
            </div>
            {/* Cap the expanded article list so a long category (50+ FAQs)
                doesn't push the entire page out of view — internal scroll
                inside the card keeps the layout stable as content grows. */}
            <div className="max-h-[480px] overflow-y-auto">
              {activeCategory.faqs.map((faq) => {
                const isFaqExpanded = expandedFaqs.has(faq.id);
                return (
                  <div
                    key={faq.id}
                    className="border-b border-white/10 last:border-0"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.03]"
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
                      <div className="bg-white/[0.02] px-6 pb-4">
                        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Bottom CTA */}
        <Card className="mt-12 text-center">
          <div className="py-12">
            <h3 className="mb-2 text-2xl font-bold">{content.ctaHeading}</h3>
            <p className="text-muted-foreground mb-6">{content.ctaBody}</p>
            <Link
              prefetch={false}
              href="/help"
              className="bg-primary text-primary-foreground inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium transition-all duration-180 hover:[box-shadow:var(--glow-accent-active)]"
            >
              Contact Support
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
