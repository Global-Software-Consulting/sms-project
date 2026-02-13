import { AuthLayout } from "@/components/auth/AuthLayout";
import { SessionProvider } from "@/components/providers/SessionProvider";

export default function AuthRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthLayout>{children}</AuthLayout>
    </SessionProvider>
  );
}
