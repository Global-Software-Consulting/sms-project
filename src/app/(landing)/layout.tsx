import { Header } from '@/components/header';
import { Footer, type FooterContent } from '@/components/footer';
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
      <Header />
      <main className="w-full flex-1">{children}</main>
      <Footer content={footerContent} />
    </div>
  );
}
