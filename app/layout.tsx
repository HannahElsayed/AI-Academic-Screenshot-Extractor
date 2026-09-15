import type { Metadata } from 'next';
import { Source_Serif_4, Inter } from 'next/font/google';
import './globals.css';

const serif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['500', '600', '700'],
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Transcript Reader — AI Academic Screenshot Extractor',
  description:
    'Upload a screenshot of your university grades page and get structured, editable academic data in seconds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="bg-paper text-ink-700 font-sans antialiased">{children}</body>
    </html>
  );
}
