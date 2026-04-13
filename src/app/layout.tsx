import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Plead Your Case',
  description: 'A ridiculous multiplayer courtroom game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="antialiased min-h-screen flex flex-col selection:bg-yellow-400 selection:text-slate-900">
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
