'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function StoreLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRegistroComercios = pathname?.startsWith('/registro-comercios');
  const isRegistroDelivery = pathname?.startsWith('/registro-delivery');
  const isAdmin = pathname?.startsWith('/admin') || pathname?.startsWith('/store/admin');

  // Si es la página de registro de comercios o delivery, no mostramos los componentes de la tienda
  if (isRegistroComercios || isRegistroDelivery) {
    return <>{children}</>;
  }

  // Si es el panel de administración ERP, no mostramos el header/footer de la tienda
  if (isAdmin) {
    return (
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">{children}</div>
        </CartProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <main className="flex-1 w-full pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
      </CartProvider>
    </AuthProvider>
  );
}
