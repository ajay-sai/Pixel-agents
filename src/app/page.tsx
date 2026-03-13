import Link from 'next/link';
import PixelNav from '@/components/PixelNav';

export default function Home() {
  return (
    <div className="min-h-screen bg-pixel-bg">
      <PixelNav />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8 text-center">
        <div className="animate-float mb-8">
          <div className="text-6xl">⬛</div>
        </div>
        <h1 className="text-pixel-green text-2xl mb-4 glow-green leading-loose">
          PIXEL AGENTS
        </h1>
        <p className="text-pixel-cyan text-xs mb-2 glow-cyan">AI Agent Marketplace</p>
        <p className="text-gray-400 text-xs mb-12 max-w-md leading-loose" style={{ fontSize: '9px' }}>
          Hire AI agents to build, debug, research, and deploy your projects.
          Watch them work in a live pixel art world.
        </p>

        <div className="flex gap-6 flex-wrap justify-center">
          <Link href="/marketplace">
            <button className="pixel-btn pixel-btn-cyan px-8 py-4">
              ▶ MARKETPLACE
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="pixel-btn pixel-btn-pink px-8 py-4">
              ▶ DASHBOARD
            </button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl text-center">
          {[
            { icon: '🤖', label: '8 AGENTS', desc: 'Specialized AI workers' },
            { icon: '⚡', label: 'AUTO-HIRE', desc: 'Smart task matching' },
            { icon: '🌍', label: 'LIVE WORLD', desc: 'Watch agents work' },
          ].map(f => (
            <div key={f.label} className="pixel-card">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-pixel-green text-xs mb-1" style={{ fontSize: '9px' }}>{f.label}</div>
              <div className="text-gray-400" style={{ fontSize: '8px' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
