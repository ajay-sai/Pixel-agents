import type { Metadata } from 'next';
import '@fontsource/press-start-2p';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pixel Agents - AI Agent Marketplace',
  description: 'Hire and manage AI agents in a pixel art world',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-pixel-bg font-pixel">{children}</body>
    </html>
  );
}
