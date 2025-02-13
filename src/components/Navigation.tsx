'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-[rgba(255,255,255,0.08)] backdrop-blur-lg border-b border-[rgba(255,255,255,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/"
              className="text-xl font-bold text-white hover:text-[#8B4513] transition-colors"
            >
              WaveSight
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/')
                      ? 'text-white bg-[rgba(255,255,255,0.1)]'
                      : 'text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  My Feed
                </Link>
                <Link
                  href="/events"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/events')
                      ? 'text-white bg-[rgba(255,255,255,0.1)]'
                      : 'text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  Tech Events
                </Link>
                <Link
                  href="/ai-pipeline"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/ai-pipeline')
                      ? 'text-white bg-[rgba(255,255,255,0.1)]'
                      : 'text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  AI Pipeline
                </Link>
                <Link
                  href="/creator"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/creator')
                      ? 'text-white bg-[rgba(255,255,255,0.1)]'
                      : 'text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  Creator
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <button className="px-4 py-2 text-sm bg-[#8B4513] text-white rounded-lg hover:bg-[#A0522D] transition-colors">
              Add Feed
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="md:hidden border-t border-[rgba(255,255,255,0.1)]">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/')
                ? 'text-white bg-[rgba(255,255,255,0.1)]'
                : 'text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            My Feed
          </Link>
          <Link
            href="/events"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/events')
                ? 'text-white bg-[rgba(255,255,255,0.1)]'
                : 'text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            Tech Events
          </Link>
          <Link
            href="/ai-pipeline"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/ai-pipeline')
                ? 'text-white bg-[rgba(255,255,255,0.1)]'
                : 'text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            AI Pipeline
          </Link>
          <Link
            href="/creator"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/creator')
                ? 'text-white bg-[rgba(255,255,255,0.1)]'
                : 'text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            Creator
          </Link>
        </div>
      </div>
    </nav>
  );
}
