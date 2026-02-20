"use client";

import React, { useState } from "react";

interface SocialButtonsProps {
  onGoogleClick: () => void;
  onGithubClick: () => void;
  onTelegramClick?: () => void;
  onTwitterClick?: () => void;
  isLoading?: boolean;
  /** Show all 4 providers in 2x2 grid, or just Google/GitHub in 1x2 */
  showAllProviders?: boolean;
}

/**
 * Social Login Buttons - Following Design Guidelines
 * 
 * Supported OAuth Providers (per CLIENT_DECISIONS.md):
 * - Google ✅ (implemented)
 * - GitHub ✅ (implemented)
 * - Telegram ⏳ (pending backend implementation)
 * - Twitter/X ⏳ (pending backend implementation)
 * - Facebook ❌ (removed per client request)
 * 
 * Specs from design-guidelines.md:
 * - Button height: 48px
 * - Border radius: 12px
 * - Icon size: 20px
 * - Icon to text gap: 12px
 * - Grid gap between buttons: 12px
 * - Section margin-bottom: 24px (handled by parent)
 */
export const SocialButtons: React.FC<SocialButtonsProps> = ({
  onGoogleClick,
  onGithubClick,
  isLoading = false,
  showAllProviders = true,
}) => {
  const [showComingSoon, setShowComingSoon] = useState<string | null>(null);

  const buttonBaseClass = `
    h-12 flex items-center justify-center gap-3
    bg-bg-secondary border border-border-default rounded-xl
    text-sm font-medium text-text-primary
    hover:bg-bg-hover hover:border-border-hover
    focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-bg-primary
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-200
  `;

  const comingSoonButtonClass = `
    h-12 flex items-center justify-center gap-3
    bg-bg-secondary border border-border-default rounded-xl
    text-sm font-medium text-text-muted
    hover:bg-bg-hover hover:border-border-hover
    focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-bg-primary
    transition-all duration-200
    cursor-not-allowed opacity-60
    relative
  `;

  const handleComingSoonClick = (provider: string) => {
    setShowComingSoon(provider);
    setTimeout(() => setShowComingSoon(null), 2000);
  };

  return (
    <div className={showAllProviders ? "grid grid-cols-2 gap-3" : "grid grid-cols-2 gap-3"}>
      {/* Google Button */}
      <button
        type="button"
        onClick={onGoogleClick}
        disabled={isLoading}
        className={buttonBaseClass}
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Google</span>
      </button>

      {/* GitHub Button */}
      <button
        type="button"
        onClick={onGithubClick}
        disabled={isLoading}
        className={buttonBaseClass}
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
        <span>GitHub</span>
      </button>

      {/* Telegram Button - Coming Soon (backend not implemented yet) */}
      {showAllProviders && (
        <button
          type="button"
          onClick={() => handleComingSoonClick('telegram')}
          disabled={true}
          className={comingSoonButtonClass}
          title="Coming Soon"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"
              fill="#6b7280"
            />
          </svg>
          <span>{showComingSoon === 'telegram' ? 'Coming Soon' : 'Telegram'}</span>
        </button>
      )}

      {/* Twitter/X Button - Coming Soon (backend not implemented yet) */}
      {showAllProviders && (
        <button
          type="button"
          onClick={() => handleComingSoonClick('twitter')}
          disabled={true}
          className={comingSoonButtonClass}
          title="Coming Soon"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#6b7280">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>{showComingSoon === 'twitter' ? 'Coming Soon' : 'Twitter'}</span>
        </button>
      )}
    </div>
  );
};
