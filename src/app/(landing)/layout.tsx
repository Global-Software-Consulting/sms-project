import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ForceFullNavigation } from '@/components/force-full-navigation';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/*
        Full-page (MPA) navigation is scoped to the public landing area
        only — these marketing pages are where the React 19 client-nav
        crash surfaces and where SEO/Lighthouse matter most. The
        authenticated app (dashboard/admin) keeps fast SPA navigation,
        with NavCrashRecovery (mounted globally in the root layout) as
        its safety net.
      */}
      <ForceFullNavigation />
      <Header />
      <main className="w-full flex-1">{children}</main>
      <Footer />
    </div>
  );
}
