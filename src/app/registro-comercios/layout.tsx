import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Registro de Comercios | Vixy Rider',
  description: 'Registra tu comercio como aliado de Vixy Rider y llega a más clientes. Sin comisiones por ventas, más visibilidad y crecimiento garantizado.',
  keywords: 'registro comercios vixy, comercios aliados, vixy rider comercios, unirse vixy, delivery venezuela',
  icons: {
    icon: '/logo/logovixycomercios.png',
  },
};

export default function RegistroComerciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900">
      {children}
    </div>
  );
}
