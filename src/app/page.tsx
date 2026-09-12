'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search, ChevronRight, User, Lock, Eye, EyeOff, Truck, ShieldCheck, CreditCard, ArrowUpRight
} from 'lucide-react';
import { Product, Category, Pagination } from '@/types/store';
import { storeApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import BannerCarousel from '@/components/BannerCarousel';

interface Banner {
  id: number;
  imagen_url: string;
  titulo?: string;
  subtitulo?: string;
  texto_boton?: string;
  enlace_boton?: string;
  orden: number;
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentCategory = searchParams.get('categoria') || '';
  const currentSearch = searchParams.get('busqueda') || '';
  const currentSort = searchParams.get('orden') || 'recientes';
  const currentPage = parseInt(searchParams.get('pagina') || '1', 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [showPassword, setShowPassword] = useState(false);

  // Estados del login
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    storeApi.getCategories()
      .then((res) => {
        if (res.success && res.data) {
          setCategories(res.data);
        }
      })
      .catch(() => { });
  }, []);

  // Cargar banners
  useEffect(() => {
    storeApi.getBanners()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setBanners(res.data);
        } else {
          // Fallback: banner por defecto si no hay banners en la BD
          setBanners([{
            id: 0,
            imagen_url: '/banners/vixybanner1.png',
            titulo: 'Todo lo que tu Moto y Carro necesitan',
            orden: 0,
          }]);
        }
      })
      .catch(() => {
        setBanners([{
          id: 0,
          imagen_url: '/banners/vixybanner1.png',
          titulo: 'Todo lo que tu Moto y Carro necesitan',
          orden: 0,
        }]);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    storeApi.getProducts({
      categoria: currentCategory ? parseInt(currentCategory, 10) : undefined,
      busqueda: currentSearch || undefined,
      orden: currentSort,
      pagina: currentPage,
    })
      .then((res) => {
        if (res.success && res.data) {
          setProducts(res.data);
          if (res.paginacion) {
            setPagination(res.paginacion);
          }
        } else {
          setProducts([]);
        }
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentCategory, currentSearch, currentSort, currentPage]);

  const updateFilters = (params: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, val]) => {
      if (val === null || val === '') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    if (!('pagina' in params)) {
      next.delete('pagina');
    }
    router.push(`/?${next.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ busqueda: searchInput.trim() || null });
  };

  // Login del conductor
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!cedula.trim() || !password.trim()) {
      setLoginError('Ingresa tu cédula y contraseña.');
      return;
    }

    setLoginLoading(true);

    try {
      const res = await storeApi.login({ email: cedula.trim(), password });

      if (res.success && res.token) {
        localStorage.setItem('vixy_auth_token', res.token);
        if (res.user) {
          localStorage.setItem('vixy_user', JSON.stringify(res.user));
        }
        if (res.user?.role === 'administrator' || res.user?.role === 'secretary') {
          router.push('/admin');
        } else {
          router.push('/shop/');
        }
      } else {
        setLoginError(res.message || 'Credenciales inválidas.');
      }
    } catch {
      setLoginError('Error de conexión con el servidor.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f5f7]">

      {/* ================= HERO + LOGIN ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 items-start">

          {/* Banner Hero - CARRUSEL */}
          {banners.length > 0 && (
            <BannerCarousel banners={banners} intervalo={5000} />
          )}

          {/* Panel de Login */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Iniciar Sesión</h2>
              <p className="text-xs text-gray-500">Acceso exclusivo para conductores Vixy</p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Número de cédula</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ingresa tu número de cédula"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A20CB]/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A20CB]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 bg-[#5A20CB] hover:bg-[#4715c0] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
              <div className="text-center space-y-1">
                <a href="#" className="block text-xs text-gray-500 hover:text-[#5A20CB]">¿Olvidaste tu contraseña?</a>
                <p className="text-xs text-gray-500">
                  ¿No tienes cuenta?{' '}
                  <Link href="/registro-rider/" className="text-[#5A20CB] font-semibold hover:underline">
                    Regístrate
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ================= CATEGORÍAS PRINCIPALES ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Categorías Principales</h2>
          <button
            onClick={() => updateFilters({ categoria: null })}
            className="flex items-center gap-1 text-sm font-semibold text-[#5A20CB] hover:underline"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateFilters({ categoria: String(cat.id) })}
                className="group bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all text-left"
              >
                <div className="relative w-full h-24 mb-3 rounded-lg bg-gray-50 overflow-hidden">
                  <Image src="/placeholder.png" alt={cat.name} fill className="object-cover" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 group-hover:text-[#5A20CB]">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-1">Explora los productos</p>
                <div className="absolute bottom-4 right-4 bg-[#5A20CB] text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'Repuestos para Motos', desc: 'Todo para el mantenimiento y reparación de tu moto' },
              { name: 'Repuestos para Carros', desc: 'Repuestos originales y alternativos para todas las marcas' },
              { name: 'Chaquetas & Equipamiento', desc: 'Protección y estilo para cada aventura' },
              { name: 'Aceites & Lubricantes', desc: 'Máximo rendimiento y protección para tu motor' },
              { name: 'Cauchos para Motos', desc: 'Los mejores precios y medidas para tu seguridad' },
            ].map((cat, idx) => (
              <div key={idx} className="group relative bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="relative w-full h-24 mb-3 rounded-lg bg-gray-100 overflow-hidden">
                  <Image src="/banners/vixybanner1.png" alt={cat.name} fill className="object-cover opacity-20" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 group-hover:text-[#5A20CB]">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.desc}</p>
                <div className="absolute bottom-4 right-4 bg-[#5A20CB] text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= PRODUCTOS DESTACADOS ================= */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Productos Destacados</h2>
          <button className="flex items-center gap-1 text-sm font-semibold text-[#5A20CB] hover:underline">
            Ver todos <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-20"><LoadingSpinner size="lg" text="Cargando productos..." /></div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {pagination && pagination.total_paginas > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  disabled={pagination.pagina_actual <= 1}
                  onClick={() => updateFilters({ pagina: String(pagination.pagina_actual - 1) })}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  Anterior
                </button>
                <span className="text-xs text-slate-600 px-3 font-medium">
                  {pagination.pagina_actual} / {pagination.total_paginas}
                </span>
                <button
                  disabled={pagination.pagina_actual >= pagination.total_paginas}
                  onClick={() => updateFilters({ pagina: String(pagination.pagina_actual + 1) })}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center bg-white border border-purple-100 rounded-2xl p-6 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              No se encontraron repuestos
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Prueba con otra palabra clave o selecciona otra categoría.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors"
            >
              Ver todos los productos
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24">
          <LoadingSpinner size="lg" text="Iniciando catálogo..." />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}