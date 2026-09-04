import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Vixy Store | Repuestos y Autopartes en Venezuela',
  description: 'Catálogo de repuestos automotrices y partes de motos con garantía certificada, envíos a todo el país y pagos en Pago Móvil, Binance, Banesco y Zinli.',
  keywords: 'repuestos venezuela, autopartes caracas, repuestos para motos, repuestos carros, vixy store',
  icons: {
    icon: '/logo/vixylogo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-purple-600 selection:text-white`}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1 w-full pb-16 md:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
