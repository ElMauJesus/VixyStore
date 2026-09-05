import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import StoreLayoutWrapper from '@/components/StoreLayoutWrapper';

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
        <StoreLayoutWrapper>
          {children}
        </StoreLayoutWrapper>
      </body>
    </html>
  );
}
