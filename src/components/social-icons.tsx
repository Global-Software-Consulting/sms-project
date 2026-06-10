'use client';
import { useEffect, useState } from 'react';
import {
  Twitter,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Music,
  Send,
} from 'lucide-react';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

type SocialKey =
  | 'twitter'
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'youtube'
  | 'tiktok'
  | 'telegram'
  | 'github';

const SOCIAL_ICONS: Record<
  SocialKey,
  React.ComponentType<{ className?: string }>
> = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Music,
  telegram: Send,
  github: Github,
};

const SOCIAL_LABELS: Record<SocialKey, string> = {
  twitter: 'Twitter',
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  telegram: 'Telegram',
  github: 'GitHub',
};

export type SocialLink = { key: SocialKey; url: string };

export function useSocialLinks(): SocialLink[] {
  const [links, setLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    apiClient
      .get<Record<string, unknown>>(API_ENDPOINTS.PUBLIC.SOCIAL_LINKS)
      .then((res) => {
        const d = (res.data || {}) as Record<string, unknown>;
        const out: SocialLink[] = [];
        (Object.keys(SOCIAL_ICONS) as SocialKey[]).forEach((key) => {
          // Backend strips the `social_` prefix, but legacy shapes can leak
          // through admin imports. Handle every variant we've seen.
          const nested = d[key] as
            | { url?: string; visible?: boolean | string }
            | string
            | undefined;
          let url = '';
          let visible = true;
          if (typeof nested === 'string') {
            url = nested;
          } else if (nested && typeof nested === 'object') {
            url = nested.url || '';
            visible = nested.visible !== false && nested.visible !== 'false';
          } else {
            url =
              (d[`${key}_url`] as string) ||
              (d[`social_${key}_url`] as string) ||
              '';
            const vis = d[`${key}_visible`] ?? d[`social_${key}_visible`];
            visible = vis !== false && vis !== 'false';
          }
          if (url && visible) out.push({ key, url });
        });
        setLinks(out);
      })
      .catch(() => setLinks([]));
  }, []);

  return links;
}

export function SocialIcons({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  const links = useSocialLinks();
  if (links.length === 0) return null;
  return (
    <div className={className ?? 'flex flex-wrap gap-3'}>
      {links.map(({ key, url }) => {
        const Icon = SOCIAL_ICONS[key];
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={SOCIAL_LABELS[key]}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <Icon className={iconClassName ?? 'h-5 w-5'} />
          </a>
        );
      })}
    </div>
  );
}
