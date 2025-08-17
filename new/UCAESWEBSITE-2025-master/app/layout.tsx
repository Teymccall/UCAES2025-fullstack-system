import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { LoadingScreen } from '@/components/loading-screen';
import { ChatWidget } from '@/components/chat-widget';
import { AdmissionPopup } from '@/components/admission-popup';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'University College of Agriculture and Environmental Studies',
  description: 'UCAES is a leading institution in agricultural and environmental education in Ghana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingScreen />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <AdmissionPopup />
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}