import type { Metadata } from "next";
import "./globals.css";
import NavBar from "../components/navbar";

export const metadata: Metadata = {
  title: "keystore",
  description: "An e commerce store built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
