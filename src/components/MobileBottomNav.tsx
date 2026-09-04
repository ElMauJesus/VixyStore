'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User as UserIcon, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin } = useAuth();
  const { totalItems } = useCart();

  // If in admin routes, don't show store bottom nav
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navs = [
    { label: 'Inicio', href: '/', icon: Home, exact: true },
    { label: 'Carrito', href: '/carrito', icon: ShoppingBag, badge: totalItems > 0 ? totalItems : null },
    { label: 'Cuenta', href: isAuthenticated ? '/cuenta' : '/auth/login', icon: UserIcon },
  ];

  if (isAdmin) {
    navs.push({ label: 'ERP', href: '/admin', icon: ShieldAlert, badge: null });
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1 safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navs.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-purple-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-extrabold text-white bg-purple-600 rounded-full ring-2 ring-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
