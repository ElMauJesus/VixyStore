import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Registro de Repartidor Delivery | Vixy Delivery',
  description: 'Únete a la flota de repartidores de Vixy Delivery. Gana dinero entregando pedidos con tarifas competitivas y despacho inteligente.',
  keywords: 'registro repartidor vixy, delivery conductor, motorizado vixy, trabajar en delivery venezuela, flota vixy',
  icons: {
    icon: '/logo/vixylogo.png',
  },
};

export default function RegistroDeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF9FF] text-slate-900 selection:bg-purple-500 selection:text-white">
      {children}
    </div>
  );
}