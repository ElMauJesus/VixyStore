'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowRight, ShoppingBag, ChevronLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { items, totalItems, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4 border border-purple-100">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Tu carrito está vacío</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6">
          Aún no has seleccionado repuestos para tu orden de compra.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-purple-600/20 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Explorar Catálogo</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Title & Clear action */}
      <div className="flex items-center justify-between pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900">Carrito de Compras</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            <strong className="text-purple-700 font-bold">{totalItems}</strong> repuestos seleccionados
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-white border border-purple-100 rounded-2xl shadow-xs gap-3 sm:gap-4"
            >
              {/* Product Info */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-xl overflow-hidden border border-purple-50 flex-shrink-0">
                  {item.imagen ? (
                    <Image
                      src={item.imagen}
                      alt={item.product_name}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-purple-300">
                      Sin foto
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/producto/?id=${item.product_id}`}
                    className="text-xs sm:text-sm font-bold text-slate-900 hover:text-purple-600 transition-colors line-clamp-2"
                  >
                    {item.product_name}
                  </Link>
                  {item.sku && (
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                      SKU: {item.sku}
                    </p>
                  )}
                  <p className="text-xs font-bold text-purple-700 mt-1 sm:hidden">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="hidden sm:block text-right">
                  <span className="text-[10px] text-slate-400 block">Unitario</span>
                  <span className="text-xs font-bold text-slate-700">
                    {formatPrice(item.price)}
                  </span>
                </div>

                {/* Quantity */}
                <div className="inline-flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-purple-100 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-slate-900 min-w-[28px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-purple-100 font-bold text-xs"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[70px]">
                  <span className="text-[10px] text-slate-400 block sm:hidden">Total</span>
                  <span className="text-sm font-black text-slate-900">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </span>
                </div>

                {/* Delete */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Eliminar repuesto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Seguir comprando repuestos</span>
            </Link>
          </div>
        </div>

        {/* Order Summary (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs sticky top-20">
            <h3 className="text-sm sm:text-base font-black text-slate-900 pb-3 mb-3 border-b border-slate-100">
              Resumen de la Orden
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600 mb-5">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} piezas)</span>
                <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de envío estimado</span>
                <span className="font-bold text-purple-700">Por coordinar / Gratis</span>
              </div>
              <div className="border-t border-purple-100 pt-3 flex justify-between text-sm font-black text-slate-900">
                <span>Total a pagar</span>
                <span className="text-lg font-black text-purple-700">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-purple-600/20 transition-all active:scale-95 mb-3"
            >
              <span>Continuar al Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-[11px] text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>Pago seguro en Venezuela con comprobante y garantía.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
