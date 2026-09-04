'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ShoppingCart,
  ShieldCheck,
  Truck,
  Check,
  AlertCircle,
  Package,
  ArrowRight,
} from 'lucide-react';
import { Product, ProductImage } from '@/types/store';
import { storeApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import LoadingSpinner from '@/components/LoadingSpinner';

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const idParam = searchParams.get('id');
  const slugParam = searchParams.get('slug');

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  useEffect(() => {
    if (!idParam && !slugParam) {
      setError('No se especificó un producto');
      setLoading(false);
      return;
    }

    setLoading(true);
    storeApi
      .getProductDetail({
        id: idParam ? parseInt(idParam, 10) : undefined,
        slug: slugParam || undefined,
      })
      .then((res) => {
        if (res.success && res.data) {
          setProduct(res.data.producto);
          const imgs = res.data.imagenes || [];
          setImages(imgs);
          const primary = imgs.find((img) => img.is_primary) || imgs[0];
          setSelectedImage(primary?.image_url || null);
        } else {
          setError(res.message || 'Producto no encontrado');
        }
      })
      .catch((err) => {
        setError(err?.message || 'Error al cargar el producto');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [idParam, slugParam]);

  const handleAddToCart = async (goToCheckout: boolean = false) => {
    if (!product || Number(product.stock_quantity) <= 0 || isAdding) return;

    setIsAdding(true);
    const res = await addToCart(product, quantity);
    setIsAdding(false);

    if (res.success) {
      setAddSuccess(true);
      if (goToCheckout) {
        router.push('/checkout');
      } else {
        setTimeout(() => setAddSuccess(false), 2000);
      }
    } else {
      alert(res.message || 'Error al agregar al carrito');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando detalles del repuesto..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Producto no disponible</h2>
        <p className="text-sm text-slate-600 mb-6">{error || 'No se pudo localizar el producto solicitado.'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = Number(product.stock_quantity) <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Breadcrumb / Back button */}
      <div className="mb-4 sm:mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
        {/* Left: Images (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3 sm:gap-4">
          {/* Main big image */}
          <div className="relative w-full pt-[90%] bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-xs">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-contain p-4 sm:p-6"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-300 bg-slate-50">
                <Package className="w-16 h-16 opacity-40 mb-2" />
                <span className="text-xs font-medium text-slate-400">Sin foto</span>
              </div>
            )}

            {isOutOfStock && (
              <span className="absolute top-4 right-4 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 rounded-md">
                Agotado
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-white border rounded-2xl overflow-hidden p-1 transition-all ${
                    selectedImage === img.image_url
                      ? 'border-purple-600 ring-2 ring-purple-600/30'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt={`${product.name} foto ${idx + 1}`}
                    fill
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details (6 cols) */}
        <div className="lg:col-span-6 flex flex-col">
          {/* Category & SKU */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-md">
              {product.categoria_nombre || 'Repuesto'}
            </span>
            <span className="text-xs font-mono text-slate-400">
              SKU: <strong className="text-slate-700">{product.sku}</strong>
            </span>
          </div>

          {/* Product Name */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mb-3 leading-snug">
            {product.name}
          </h1>

          {/* Price Box */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-3.5 sm:p-4 bg-purple-50/60 rounded-2xl border border-purple-100 mb-5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-purple-950">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-purple-700 font-bold">USD</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Aceptamos Pago Móvil, Binance, Banesco y Zinli
            </span>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-6 text-xs font-bold">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isOutOfStock ? 'bg-red-500' : 'bg-purple-600 animate-pulse'
              }`}
            />
            <span className={isOutOfStock ? 'text-red-700' : 'text-purple-900'}>
              {isOutOfStock
                ? 'Agotado temporalmente'
                : `Disponible en almacén: ${product.stock_quantity} unidades`}
            </span>
          </div>

          {/* Quantity selector & Actions */}
          <div className="space-y-4 mb-6">
            {!isOutOfStock && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Cantidad:</span>
                <div className="inline-flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 text-slate-600 hover:bg-purple-50 hover:text-purple-700 font-bold disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-black text-slate-900 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                    disabled={quantity >= product.stock_quantity}
                    className="px-3 py-1.5 text-slate-600 hover:bg-purple-50 hover:text-purple-700 font-bold disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                disabled={isOutOfStock || isAdding}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${
                  addSuccess
                    ? 'bg-purple-700 text-white'
                    : isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95 shadow-purple-600/30'
                }`}
              >
                {addSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Agregado al Carrito!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Agregar al Carrito</span>
                  </>
                )}
              </button>

              {!isOutOfStock && (
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  disabled={isAdding}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-950 hover:bg-slate-800 text-white transition-all active:scale-95 shadow-sm"
                >
                  <span>Comprar Ahora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-purple-50/40 border border-purple-100 rounded-2xl mb-6 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="text-[11px] font-medium">Garantía certificada Vixy</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="text-[11px] font-medium">Envíos a todo el país</span>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              Descripción del Repuesto
            </h3>
            <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description || 'Sin descripción adicional para este producto.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24">
          <LoadingSpinner size="lg" text="Cargando repuesto..." />
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}
