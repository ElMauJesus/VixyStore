'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search, ChevronRight, User, Lock, Eye, EyeOff, Truck, ShieldCheck, CreditCard, ArrowUpRight
} from 'lucide-react';
import { Product, Category, Pagination } from '@/types/store';
import { storeApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentCategory = searchParams.get('categoria') || '';
  const currentSearch = searchParams.get('busqueda') || '';
  const currentSort = searchParams.get('orden') || 'recientes';
  const currentPage = parseInt(searchParams.get('pagina') || '1', 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className="w-full min-h-screen bg-[#f5f5f7]">

      {/* ================= HERO + LOGIN ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 items-start">

          {/* Banner Hero */}
          <div className="relative w-full h-64 md:h-96 lg:h-[420px] rounded-3xl overflow-hidden shadow-lg">
            <Image
              src="/banners/vixybanner1.png"
              alt="Todo lo que tu moto y carro necesitan"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent p-8 md:p-12 flex flex-col justify-center">
              <div className="relative w-32 h-24 md:w-56 md:h-40 mb-6">
                <Image
                  src="/logo/logostore2.png" // Logo con la mascota
                  alt="Vixy Store"
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="text-white text-2xl md:text-4xl font-black uppercase leading-tight mb-4">
                Todo lo que tu <br /> Moto y Carro necesitan
              </h1>
              <div className="flex flex-wrap gap-3">
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#5A20CB]" /> Calidad garantizada
                </span>
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#5A20CB]" /> Mejores precios
                </span>
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#5A20CB]" /> Compra segura
                </span>
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#5A20CB]" /> Envíos rápidos
                </span>
              </div>
            </div>
          </div>

          {/* Panel de Login (Solo desktop) */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Iniciar Sesión</h2>
              <p className="text-xs text-gray-500">Bienvenido de nuevo</p>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Número de cédula</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ingresa tu número de cédula"
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
                type="button"
                className="w-full py-2.5 bg-[#5A20CB] hover:bg-[#4715c0] text-white text-sm font-bold rounded-lg transition-colors"
              >
                Iniciar Sesión
              </button>
              <div className="text-center space-y-1">
                <a href="#" className="block text-xs text-gray-500 hover:text-[#5A20CB]">¿Olvidaste tu contraseña?</a>
                <p className="text-xs text-gray-500">
                  ¿No tienes cuenta? <a href="#" className="text-[#5A20CB] font-semibold hover:underline">Regístrate</a>
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

        {/* Si hay categorías de la API, las mostramos */}
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
          /* Placeholders visuales para que se vea como la imagen aunque no haya datos */
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

                {/* Botón circular con flecha */}
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