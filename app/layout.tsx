import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "keystore",
  description: "An e-commerce store built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background text-foreground min-h-screen flex flex-col font-sans antialiased">
        {/* ✅ Wrap the entire app inside ToastProvider */}
        <ToastProvider>
          <NavBar />
          <main className="flex-grow container mx-auto px-4 py-6">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
