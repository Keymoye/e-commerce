import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "keystore",
  description: "An e-commerce store built with Next.js",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={
          "${inter.className}bg-background text-foreground min-h-screen flex flex-col antialiased"
        }
      >
        {/* ✅ Wrap the entire app inside ToastProvider */}
        <ToastProvider>
          <AuthProvider>
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
