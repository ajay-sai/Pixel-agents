'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PixelNav() {
  const path = usePathname();
  return (
    <nav className="border-b-2 border-pixel-border bg-pixel-card px-6 py-4 flex items-center gap-6">
      <Link href="/" className="text-pixel-green glow-green text-sm font-pixel">
        ⬛ PIXEL AGENTS
      </Link>
      <div className="flex gap-4 ml-auto">
        <Link
          href="/marketplace"
          className={`text-xs font-pixel px-3 py-2 border-2 transition-colors ${
            path === '/marketplace'
              ? 'border-pixel-green text-pixel-green bg-pixel-bg'
              : 'border-pixel-border text-gray-400 hover:border-pixel-cyan hover:text-pixel-cyan'
          }`}
        >
          MARKET
        </Link>
        <Link
          href="/dashboard"
          className={`text-xs font-pixel px-3 py-2 border-2 transition-colors ${
            path === '/dashboard'
              ? 'border-pixel-pink text-pixel-pink bg-pixel-bg'
              : 'border-pixel-border text-gray-400 hover:border-pixel-pink hover:text-pixel-pink'
          }`}
        >
          DASHBOARD
        </Link>
      </div>
    </nav>
  );
}
