// app/layout.tsx
import "../styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <header className="bg-blue-500 text-white p-4 shadow-md">
            <h1 className="text-2xl font-bold">cuur.ai</h1>
          </header>
          <main className="flex-grow p-4">{children}</main>
          <footer className="bg-blue-500 text-white p-4 text-center">
            © 2024 cuur.ai
          </footer>
        </div>
      </body>
    </html>
  );
}
