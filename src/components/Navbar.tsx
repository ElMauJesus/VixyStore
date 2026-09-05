'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User as UserIcon, Search, Menu, X, ShieldAlert, LogOut, PackageCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isStore = typeof window !== 'undefined' && window.location.pathname.startsWith('/store');
  const storeLink = (path: string) => (isStore ? `/store${path}` : path);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const base = isStore ? '/store' : '';
    if (searchQuery.trim()) {
      router.push(`${base}/?busqueda=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    } else {
      router.push(base || '/');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Logo */}
          <Link href={isStore ? '/store' : '/'} className="flex items-center gap-2 flex-shrink-0">
            <div className="relative h-9 w-28 sm:h-10 sm:w-32">
              <Image
                src="/logo/vixylogo.png"
                alt="Vixy Store"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="sr-only">Vixy Store</span>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg mx-4 relative items-center"
          >
            <input
              type="text"
              placeholder="Buscar repuestos por nombre, SKU, marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-100/90 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white focus:border-transparent transition-all"
            />
            <Search className="w-4 h-4 text-purple-500 absolute left-3.5 pointer-events-none" />
          </form>

          {/* Right Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile Search Icon Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-purple-600 rounded-lg"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Badge/Link if admin */}
            {isAdmin && (
              <Link
                href={storeLink('/admin')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-purple-900 bg-purple-100 border border-purple-200 rounded-lg hover:bg-purple-200 transition-colors"
                title="Panel de Administración ERP"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
                <span className="hidden sm:inline">Panel ERP</span>
                <span className="sm:hidden">ERP</span>
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-purple-600 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user?.first_name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {user?.first_name}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      href={storeLink('/cuenta')}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    >
                      <PackageCheck className="w-4 h-4 text-purple-600" />
                      <span>Mis Pedidos y Perfil</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href={storeLink('/admin')}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-purple-600" />
                        <span>Administración ERP</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={storeLink('/auth/login')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 rounded-xl transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Ingresar</span>
              </Link>
            )}

            {/* Cart Icon */}
            <Link
              href={storeLink('/carrito')}
              className="relative p-2 text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
              aria-label="Ver carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-black text-white bg-purple-600 rounded-full shadow-xs">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Expandable Mobile Search Bar */}
        {isMobileSearchOpen && (
          <div className="md:hidden pb-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Buscar repuestos, partes, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
              />
              <Search className="w-4 h-4 text-purple-500 absolute left-3 top-2.5" />
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
