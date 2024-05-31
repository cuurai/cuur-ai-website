// app/layout.tsx
import "../styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow p-4">{children}</main>
          <footer className="bg-blue-500 text-white p-4 text-center">
            © 2024 cuur.ai
          </footer>
        </div>
      </body>
    </html>
  );
}
