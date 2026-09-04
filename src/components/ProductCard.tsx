'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Check, Package } from 'lucide-react';
import { Product } from '@/types/store';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isOutOfStock = Number(product.stock_quantity) <= 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    const res = await addToCart(product, 1);
    setIsAdding(false);

    if (res.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 1800);
    }
  };

  const imageUrl = !imageError && product.imagen_principal ? product.imagen_principal : null;

  return (
    <div className="group flex flex-col bg-white border border-purple-100/90 rounded-2xl overflow-hidden hover:shadow-md hover:border-purple-300 transition-all duration-200">
      {/* Image container */}
      <Link
        href={`/producto/?id=${product.id}`}
        className="relative block w-full pt-[85%] sm:pt-[80%] bg-slate-50 overflow-hidden"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 sm:p-4 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-slate-300 bg-slate-50">
            <Package className="w-10 h-10 stroke-current mb-1 opacity-50 text-purple-300" />
            <span className="text-[10px] font-semibold text-purple-400">Vixy Parts</span>
          </div>
        )}

        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700 rounded-md shadow-2xs">
            Agotado
          </span>
        ) : (
          <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wide bg-purple-100 text-purple-800 rounded-md shadow-2xs">
            Stock {product.stock_quantity}
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-col flex-1 p-3 sm:p-4">
        {/* Category & SKU */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1 gap-1">
          <span className="font-semibold text-purple-600 truncate">
            {product.categoria_nombre || 'Repuesto'}
          </span>
          <span className="font-mono text-slate-400 flex-shrink-0 text-[10px]">
            {product.sku}
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/producto/?id=${product.id}`}
          className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-purple-600 transition-colors mb-2.5 flex-1"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Price & Add to Cart button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block -mb-0.5">Precio</span>
            <span className="text-sm sm:text-base font-black text-slate-900">
              {formatPrice(product.price)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock || isAdding}
            className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${
              addedSuccess
                ? 'bg-purple-600 text-white shadow-xs'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white active:scale-95 border border-purple-200/70'
            }`}
            title={isOutOfStock ? 'Producto agotado' : 'Agregar al carrito'}
          >
            {addedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Listo</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
