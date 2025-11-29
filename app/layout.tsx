import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import AppProviders from "@/components/layout/AppProviders";
import { getUser } from "@/lib/supabase/getUser";

export const metadata: Metadata = {
  title: "keystore",
  description: "An e-commerce store built with Next.js",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background text-foreground min-h-screen flex flex-col antialiased">
        <AppProviders initialUser={user}>
          <NavBar />
          <main className="flex-grow container mx-auto px-4 py-6">
            {children}
          </main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
