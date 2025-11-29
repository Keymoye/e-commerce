import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { getUser } from "@/lib/supabase/getUser";

export const metadata: Metadata = {
  title: "keystore",
  description: "An e-commerce store built with Next.js",
};

const inter = Inter({ subsets: ["latin"] });
const data = await getUser();

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getUser();

  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background text-foreground min-h-screen flex flex-col antialiased">
        <ToastProvider>
          <AuthProvider initialUser={data}>
            <NavBar />
            <main className="flex-grow container mx-auto px-4 py-6">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
