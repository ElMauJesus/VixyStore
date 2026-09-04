'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowUpDown, Search, Sparkles, SlidersHorizontal, ChevronRight } from 'lucide-react';
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
      .catch(() => {});
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
    <div className="w-full">
      {/* HERO SECTION: Responsive Mobile-First & Desktop Different Layouts */}
      <section className="relative w-full bg-[#0a0614] overflow-hidden text-white border-b border-purple-950/60">
        {/* Glow effect */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* MOBILE HERO (visible on screens < md) */}
        <div className="md:hidden px-4 pt-6 pb-8 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950/90 border border-purple-800/80 rounded-full">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Vixy Store Venezuela</span>
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight leading-tight">
            Repuestos & Autopartes <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-200">
              Motos y Autos
            </span>
          </h1>

          {/* Mobile phone banner graphic */}
          <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-purple-900/60 shadow-lg">
            <Image
              src="/banners/vixybanner2tlf.png"
              alt="Vixy Store Repuestos"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Mobile direct search input */}
          <form onSubmit={handleSearch} className="relative pt-1">
            <input
              type="text"
              placeholder="Buscar pieza, marca o SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-20 py-2.5 text-xs bg-slate-900/90 border border-purple-800/80 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-3.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-2 px-3 py-1.5 bg-purple-600 text-white font-bold text-[11px] rounded-lg shadow-xs active:scale-95"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* DESKTOP HERO (visible on md+) */}
        <div className="hidden md:block max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="space-y-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-950/90 border border-purple-800/80 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Calidad Certificada para Venezuela</span>
              </span>

              <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                La mayor variedad de repuestos automotrices con <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-white">
                  Garantía Directa
                </span>
              </h1>

              <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
                Frenos, motor, suspensión, electricidad y accesorios para carros y motocicletas. Envíos a todo el país y pagos en bolívares o divisas.
              </p>

              <div className="pt-2 flex items-center gap-4">
                <a
                  href="#catalogo"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:shadow-purple-600/50"
                >
                  Explorar Catálogo
                </a>
                <span className="text-xs text-purple-300/80 font-medium">
                  Envíos por MRW, Tealca y Zoom
                </span>
              </div>
            </div>

            {/* Desktop Wide Banner */}
            <div className="relative h-72 lg:h-80 w-full rounded-3xl overflow-hidden shadow-2xl border border-purple-900/60">
              <Image
                src="/banners/vixybanner1.png"
                alt="Repuestos Vixy Store"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CATALOG SECTION */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Category Horizontal Filter Chips (Mobile Scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          <button
            onClick={() => updateFilters({ categoria: null })}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              !currentCategory
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-purple-100 hover:bg-purple-50 hover:text-purple-700'
            }`}
          >
            Todos los repuestos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilters({ categoria: String(cat.id) })}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                currentCategory === String(cat.id)
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-purple-100 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              {cat.name} {cat.total_productos ? `(${cat.total_productos})` : ''}
            </button>
          ))}
        </div>

        {/* Sort and Count Row */}
        <div className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-200">
          <p className="text-xs text-slate-500">
            Mostrando <strong className="text-slate-800 font-bold">{products.length}</strong> productos
          </p>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-600" />
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ orden: e.target.value })}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            >
              <option value="recientes">Más recientes</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
              <option value="nombre">Nombre (A-Z)</option>
              <option value="stock">Mayor stock</option>
            </select>
          </div>
        </div>

        {/* Active search chip */}
        {currentSearch && (
          <div className="flex items-center gap-2 mb-4 bg-purple-50 border border-purple-200 px-3.5 py-2 rounded-xl text-xs text-purple-900">
            <span>
              Resultados para: <strong className="font-bold">"{currentSearch}"</strong>
            </span>
            <button
              onClick={() => updateFilters({ busqueda: null })}
              className="ml-auto underline hover:text-purple-700 font-bold text-[11px]"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* Products Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" text="Cargando repuestos Vixy..." />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
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
