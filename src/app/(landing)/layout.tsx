import { Header } from '@/components/header';
import { Footer, type FooterContent } from '@/components/footer';
import { ForceFullNavigation } from '@/components/force-full-navigation';
import { fetchPageContent, pick } from '@/lib/page-content';

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const raw = await fetchPageContent('footer');
  const footerContent: FooterContent = {
    brandTagline: pick(
      raw,
      'page_footer_brand_tagline',
      'Premium SMS activation and number rental platform. Fast, reliable, and secure.',
    ),
    copyrightText: pick(
      raw,
      'page_footer_copyright_text',
      'All rights reserved.',
    ),
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/*
        Full-page (MPA) navigation guard temporarily disabled while we
        test a Next.js / React upgrade against the Contabo origin. If
        the underlying React 19 commit-phase race is gone in the new
        version, this stays off and we get SPA navigation back on
        landing routes. If the race comes back, uncomment the import +
        the <ForceFullNavigation /> mount below and the workaround
        resumes.

        NavCrashRecovery (mounted globally in the root layout) stays in
        place either way as the last-resort self-heal.
      */}
      <ForceFullNavigation />
      <Header />
      <main className="w-full flex-1">{children}</main>
      <Footer content={footerContent} />
    </div>
  );
}
