'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  CreditCard,
  MapPin,
  Plus,
  ShieldCheck,
  AlertCircle,
  Truck,
  ArrowRight,
  UserCheck,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { storeApi } from '@/lib/api';
import { Address } from '@/types/store';
import { formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { items, subtotal, totalItems, clearCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address_line1: '',
    city: '',
    state: '',
    postal_code: '1010',
  });

  const [paymentMethod, setPaymentMethod] = useState<'pago_movil' | 'banesco' | 'binance' | 'zinli' | 'zelle' | 'efectivo'>('pago_movil');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderCompleted, setOrderCompleted] = useState<{
    order_id: number;
    order_number: string;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      storeApi.getAddresses()
        .then((res) => {
          if (res.success && res.data) {
            setAddresses(res.data);
            const defaultAddr = res.data.find((a) => a.is_default) || res.data[0];
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
            } else {
              setIsAddingAddress(true);
            }
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.address_line1 || !newAddress.city || !newAddress.state) {
      setErrorMsg('Por favor llena los campos requeridos de la dirección.');
      return;
    }

    try {
      const res = await storeApi.createAddress({
        address_line1: newAddress.address_line1,
        city: newAddress.city,
        state: newAddress.state,
        postal_code: newAddress.postal_code,
        country: 'Venezuela',
        is_default: addresses.length === 0 ? 1 : 0,
      });

      if (res.success && res.address_id) {
        const addrRes = await storeApi.getAddresses();
        if (addrRes.success && addrRes.data) {
          setAddresses(addrRes.data);
          setSelectedAddressId(res.address_id);
          setIsAddingAddress(false);
          setNewAddress({ address_line1: '', city: '', state: '', postal_code: '1010' });
        }
      } else {
        setErrorMsg(res.message || 'Error al guardar la dirección');
      }
    } catch {
      setErrorMsg('Error de conexión al guardar dirección');
    }
  };

  const handleProcessOrder = async () => {
    setErrorMsg(null);

    if (!selectedAddressId) {
      setErrorMsg('Selecciona o registra una dirección de entrega.');
      return;
    }

    if (!paymentReference.trim() && paymentMethod !== 'efectivo') {
      setErrorMsg('Por favor ingresa el número de referencia o comprobante de tu pago.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await storeApi.checkout({
        shipping_address_id: selectedAddressId,
        payment_method: paymentMethod,
        payment_reference: paymentReference.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.success && res.order_number) {
        clearCart();
        setOrderCompleted({
          order_id: res.order_id || 0,
          order_number: res.order_number,
          total: res.total || subtotal,
        });
      } else {
        setErrorMsg(res.message || 'No se pudo procesar la orden. Verifica las existencias.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al procesar el pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" text="Verificando sesión..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
          <UserCheck className="w-7 h-7" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Inicia sesión para continuar</h1>
        <p className="text-xs text-slate-500 mb-6">
          Para garantizar la seguridad y emitir tu orden con garantía certificada, necesitas una cuenta en Vixy Store.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            href="/auth/login"
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md shadow-purple-600/20"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/auth/register"
            className="w-full py-3 px-4 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
          >
            Crear Nueva Cuenta
          </Link>
        </div>
      </div>
    );
  }

  if (orderCompleted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
          <CheckCircle className="w-9 h-9" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
          Pedido Confirmado Exitosamente
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-1">
          ¡Gracias por tu compra!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mb-6">
          Número de orden: <strong className="text-purple-700 font-mono text-sm sm:text-base">{orderCompleted.order_number}</strong>
        </p>

        <div className="bg-white border border-purple-100 rounded-3xl p-5 text-left shadow-xs mb-6 space-y-2.5 text-xs text-slate-600">
          <div className="flex justify-between pb-2 border-b border-slate-100">
            <span>Monto Total:</span>
            <span className="font-bold text-slate-900 text-sm">{formatPrice(orderCompleted.total)}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-100">
            <span>Método de Pago:</span>
            <span className="font-bold text-purple-700 uppercase">{paymentMethod.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-100">
            <span>Referencia reportada:</span>
            <span className="font-mono text-slate-800 font-bold">{paymentReference || 'N/A'}</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Nuestro equipo de almacén verificará el comprobante bancario para preparar el despacho. Puedes consultar el progreso en tu perfil.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/cuenta"
            className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-purple-600/20 transition-all"
          >
            Ver Mis Pedidos
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            Seguir Comprando
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">No hay repuestos en tu orden</h2>
        <p className="text-xs text-slate-500 mb-4">Agrega productos al carrito antes de proceder al checkout.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Ir a la tienda</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-3xl font-black text-slate-900">Finalizar Compra</h1>
        <p className="text-xs text-slate-500 mt-0.5">Completa tu dirección de despacho y método de pago en Venezuela.</p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Dirección de Entrega */}
          <div className="bg-white border border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Dirección de Entrega</h2>
              </div>
              {!isAddingAddress && (
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar otra</span>
                </button>
              )}
            </div>

            {!isAddingAddress && addresses.length > 0 ? (
              <div className="space-y-2.5">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                        : 'border-slate-200 hover:border-purple-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping_address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-0.5 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">{addr.address_line1}</p>
                      <p className="text-slate-500">{addr.city}, {addr.state} (C.P. {addr.postal_code || '1010'})</p>
                      {addr.is_default ? (
                        <span className="inline-block mt-1 text-[9px] text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded">
                          Principal
                        </span>
                      ) : null}
                    </div>
                  </label>
                ))}
              </div>
            ) : null}

            {isAddingAddress || addresses.length === 0 ? (
              <form onSubmit={handleCreateAddress} className="space-y-3 mt-3 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800">Registrar Dirección</h3>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Dirección exacta (calle, edificio, referencia) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Av. Francisco de Miranda, Torre Centro, Local 3"
                    value={newAddress.address_line1}
                    onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ciudad *</label>
                    <input
                      type="text"
                      required
                      placeholder="Caracas"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Estado *</label>
                    <input
                      type="text"
                      required
                      placeholder="Distrito Capital"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl"
                  >
                    Guardar Dirección
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            ) : null}
          </div>

          {/* Método de Pago y QR */}
          <div className="bg-white border border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Método de Pago (Venezuela)</h2>
            </div>

            {/* Payment method selection tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
              <button
                type="button"
                onClick={() => setPaymentMethod('pago_movil')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'pago_movil'
                    ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600 text-purple-950 font-bold'
                    : 'border-slate-200 text-slate-600 hover:border-purple-200'
                }`}
              >
                <span className="text-xs">Pago Móvil</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('banesco')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'banesco'
                    ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600 text-purple-950 font-bold'
                    : 'border-slate-200 text-slate-600 hover:border-purple-200'
                }`}
              >
                <span className="text-xs">Banesco</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('binance')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'binance'
                    ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600 text-purple-950 font-bold'
                    : 'border-slate-200 text-slate-600 hover:border-purple-200'
                }`}
              >
                <span className="text-xs">Binance (USDT)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('zinli')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'zinli'
                    ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600 text-purple-950 font-bold'
                    : 'border-slate-200 text-slate-600 hover:border-purple-200'
                }`}
              >
                <span className="text-xs">Zinli</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'efectivo'
                    ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600 text-purple-950 font-bold'
                    : 'border-slate-200 text-slate-600 hover:border-purple-200'
                }`}
              >
                <span className="text-xs">Efectivo / Zelle</span>
              </button>
            </div>

            {/* QR display */}
            <div className="bg-purple-50/40 border border-purple-100 rounded-2xl p-4 mb-5">
              {paymentMethod === 'pago_movil' || paymentMethod === 'banesco' ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-32 h-32 bg-white p-2 rounded-2xl border border-purple-100 shadow-xs flex-shrink-0">
                    <Image
                      src="/qr/QRbanesco.png"
                      alt="QR Pago Banesco"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-black text-slate-900 text-sm">Banesco Banco Universal</p>
                    <p><strong>Teléfono Pago Móvil:</strong> 0414-1234567</p>
                    <p><strong>RIF:</strong> J-50123456-7</p>
                    <p><strong>Cuenta:</strong> 0134-0000-00-0000000000</p>
                    <p><strong>Beneficiario:</strong> Vixy Store C.A.</p>
                  </div>
                </div>
              ) : null}

              {paymentMethod === 'binance' ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-32 h-32 bg-white p-2 rounded-2xl border border-purple-100 shadow-xs flex-shrink-0">
                    <Image
                      src="/qr/QRbinance.png"
                      alt="QR Binance Pay"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-black text-slate-900 text-sm">Binance Pay (USDT)</p>
                    <p><strong>Binance Pay ID:</strong> 298410293</p>
                    <p><strong>Email Binance:</strong> binance@vixystore.com</p>
                    <p><strong>Moneda:</strong> USDT (Red BEP20 o TRC20)</p>
                  </div>
                </div>
              ) : null}

              {paymentMethod === 'zinli' ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-32 h-32 bg-white p-2 rounded-2xl border border-purple-100 shadow-xs flex-shrink-0">
                    <Image
                      src="/qr/QRzinli.png"
                      alt="QR Zinli"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-black text-slate-900 text-sm">Zinli Wallet</p>
                    <p><strong>Email Zinli:</strong> zinli@vixystore.com</p>
                    <p><strong>Titular:</strong> Vixy Store</p>
                    <p className="text-slate-500 text-[11px]">Transfiere directo escaneando el código QR.</p>
                  </div>
                </div>
              ) : null}

              {paymentMethod === 'efectivo' ? (
                <div className="text-xs text-slate-700 space-y-2">
                  <p className="font-black text-slate-900 text-sm">Pago en Tienda / Zelle</p>
                  <p><strong>Efectivo Divisas:</strong> USD en efectivo al retirar tu repuesto en tienda física.</p>
                  <p><strong>Zelle:</strong> zelle@vixystore.com (Vixy Store LLC)</p>
                </div>
              ) : null}
            </div>

            {/* Reference input */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Número de Referencia o Comprobante *
                </label>
                <input
                  type="text"
                  required={paymentMethod !== 'efectivo'}
                  placeholder="Ej: 849201 o ID de transacción Binance"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Notas u Observaciones del Despacho (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Enviar por Zoom agencia Chacao o entregar de mañana."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs sticky top-20">
            <h3 className="text-base font-black text-slate-900 pb-3 mb-3 border-b border-slate-100">
              Resumen de la Orden
            </h3>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 mb-4">
              {items.map((it) => (
                <div key={it.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-bold text-slate-800 truncate">{it.product_name}</p>
                    <p className="text-slate-400 text-[11px]">{it.quantity} × {formatPrice(it.price)}</p>
                  </div>
                  <span className="font-black text-slate-900">
                    {formatPrice(Number(it.price) * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3 mb-5">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} piezas)</span>
                <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="font-bold text-purple-700">Por coordinar / Gratis</span>
              </div>
              <div className="border-t border-purple-100 pt-3 flex justify-between text-base font-black text-slate-900">
                <span>Total:</span>
                <span className="text-purple-700 font-black">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProcessOrder}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-purple-600/25 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Procesando pedido...</span>
              ) : (
                <>
                  <span>Confirmar y Enviar Pedido</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>Envíos asegurados por MRW, Tealca o Zoom.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>Registro directo en el sistema ERP de Vixy.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
