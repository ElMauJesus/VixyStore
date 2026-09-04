'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Truck,
  ClipboardList,
  ShieldAlert,
  Users,
  Store,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/auth/login?redirect=/admin');
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <LoadingSpinner size="lg" text="Verificando permisos ERP..." />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Acceso Restringido</h1>
        <p className="text-xs text-slate-600 max-w-sm mb-6">
          Esta área es de uso exclusivo para administradores y secretaría de Vixy Store.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md"
        >
          Volver a la Tienda
        </Link>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Productos', href: '/admin/productos', icon: Package },
    { label: 'Inventario', href: '/admin/inventario', icon: Boxes },
    { label: 'Proveedores', href: '/admin/proveedores', icon: Truck },
    { label: 'Pedidos', href: '/admin/pedidos', icon: ClipboardList },
    { label: 'Garantías', href: '/admin/garantias', icon: ShieldCheck },
    { label: 'Usuarios', href: '/admin/usuarios', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Admin Header */}
      <div className="md:hidden bg-[#0a0614] text-white px-4 py-3 flex items-center justify-between border-b border-purple-950">
        <div className="flex items-center gap-2">
          <div className="relative h-7 w-20">
            <Image
              src="/logo/vixylogo.png"
              alt="Vixy"
              fill
              className="object-contain brightness-0 invert"
            />
          </div>
          <span className="text-[10px] font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
            ERP
          </span>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg"
        >
          {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile drawer */}
      <aside
        className={`${
          mobileNavOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[#0a0614] text-slate-300 flex-shrink-0 flex flex-col justify-between border-r border-purple-950 z-30`}
      >
        <div>
          {/* Logo */}
          <div className="p-5 border-b border-purple-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-24">
                <Image
                  src="/logo/vixylogo.png"
                  alt="Vixy Store"
                  fill
                  className="object-contain brightness-0 invert"
                />
              </div>
              <span className="text-[10px] font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800 uppercase tracking-wide">
                ERP
              </span>
            </div>
          </div>

          {/* User badge */}
          <div className="p-4 mx-3 my-3 bg-purple-950/40 rounded-2xl border border-purple-900/40 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <p className="font-bold text-white truncate">{user?.first_name} {user?.last_name}</p>
            </div>
            <p className="text-[11px] text-purple-300 capitalize">Rol: {user?.role}</p>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:bg-purple-950/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-purple-950 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-xl transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>Volver a la Tienda</span>
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
