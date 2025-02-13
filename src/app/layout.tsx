import type { Metadata } from "next";
import Link from 'next/link';
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "WaveSight",
  description: "Keep an eye on emerging tech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <nav className="bg-[rgba(255,255,255,0.05)] backdrop-blur-lg border-b border-[rgba(255,255,255,0.1)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link 
                  href="/"
                  className="text-white font-bold text-xl hover:text-gray-300 transition-colors"
                >
                  WaveSight
                </Link>
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    href="/"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    My Feed
                  </Link>
                  <Link
                    href="/events"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Tech Events
                  </Link>
                  <Link
                    href="/ai-pipeline"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    AI Pipeline
                  </Link>
                  <Link
                    href="/creator"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Creator
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
