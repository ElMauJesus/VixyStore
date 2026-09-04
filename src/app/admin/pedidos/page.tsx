'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  X,
  AlertCircle,
  RefreshCw,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Order, OrderStatus, PaymentStatus } from '@/types/store';
import { formatPrice, formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPayment, setFilterPayment] = useState<string>('');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [statusForm, setStatusForm] = useState<{
    status: OrderStatus;
    payment_status: PaymentStatus;
    notes: string;
  }>({
    status: 'pending',
    payment_status: 'pending',
    notes: '',
  });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({
        status: filterStatus || undefined,
        payment_status: filterPayment || undefined,
      });

      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filterStatus, filterPayment]);

  const handleOpenDetail = async (orderId: number) => {
    setLoadingDetail(true);
    try {
      const res = await adminApi.getOrderDetail(orderId);
      if (res.success && res.data) {
        setSelectedOrder(res.data);
        setStatusForm({
          status: res.data.status,
          payment_status: res.data.payment_status,
          notes: res.data.notes || '',
        });
      }
    } catch {
      // ignore
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const res = await adminApi.updateOrderStatus(selectedOrder.id, {
        status: statusForm.status,
        payment_status: statusForm.payment_status,
        notes: statusForm.notes,
      });

      if (res.success) {
        setSelectedOrder({
          ...selectedOrder,
          status: statusForm.status,
          payment_status: statusForm.payment_status,
          notes: statusForm.notes,
        });
        await loadOrders();
      } else {
        alert(res.message || 'Error al actualizar el pedido');
      }
    } catch {
      alert('Error de conexión al actualizar');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900">
            Control de Pedidos & Ventas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Valida referencias de Pago Móvil, Binance Pay, Zinli y Banesco.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="p-2 self-start sm:self-auto text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-purple-50"
          title="Refrescar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-purple-100 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-slate-700">Estado:</span>
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 rounded-xl transition-colors font-bold ${
            !filterStatus ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-purple-50'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3 py-1.5 rounded-xl transition-colors font-bold ${
            filterStatus === 'pending' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-purple-50'
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFilterStatus('processing')}
          className={`px-3 py-1.5 rounded-xl transition-colors font-bold ${
            filterStatus === 'processing' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-purple-50'
          }`}
        >
          En Preparación
        </button>
        <button
          onClick={() => setFilterStatus('shipped')}
          className={`px-3 py-1.5 rounded-xl transition-colors font-bold ${
            filterStatus === 'shipped' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-purple-50'
          }`}
        >
          Enviados
        </button>
        <button
          onClick={() => setFilterStatus('delivered')}
          className={`px-3 py-1.5 rounded-xl transition-colors font-bold ${
            filterStatus === 'delivered' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-purple-50'
          }`}
        >
          Entregados
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="font-bold text-slate-700">Pago:</span>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 font-semibold"
          >
            <option value="">Cualquier estado</option>
            <option value="pending">Pago Pendiente</option>
            <option value="paid">Pago Verificado</option>
            <option value="failed">Pago Rechazado</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" text="Cargando órdenes..." />
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Orden</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Método / Ref.</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3 text-center">Estado Pago</th>
                  <th className="py-3 px-3 text-center">Estado Pedido</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-purple-950">
                      {ord.order_number}
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">
                        {ord.first_name} {ord.last_name}
                      </p>
                      <p className="text-[10px] text-slate-400">{ord.phone || ord.email}</p>
                    </td>

                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {formatDate(ord.created_at)}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 uppercase block text-[10px]">
                        {ord.payment_method?.replace('_', ' ')}
                      </span>
                      {ord.payment_reference ? (
                        <span className="font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[10px] inline-block font-bold">
                          Ref: {ord.payment_reference}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Sin ref.</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      {formatPrice(ord.total_amount)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                          ord.payment_status === 'paid'
                            ? 'bg-purple-100 text-purple-800'
                            : ord.payment_status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.payment_status === 'paid' ? 'Verificado' : ord.payment_status === 'failed' ? 'Rechazado' : 'Por verificar'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-purple-100 text-purple-900'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(ord.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Revisar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No hay pedidos registrados con estos filtros.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-black text-purple-950 font-mono">
                  Orden #{selectedOrder.order_number}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Emitida el {formatDate(selectedOrder.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-purple-50/40 rounded-2xl text-xs text-slate-700 border border-purple-100">
                <div>
                  <p className="font-bold text-slate-900 mb-0.5">Cliente</p>
                  <p>{selectedOrder.first_name} {selectedOrder.last_name}</p>
                  <p className="text-slate-500 text-[11px]">{selectedOrder.email}</p>
                  <p className="text-slate-500 text-[11px]">{selectedOrder.phone || 'Sin teléfono'}</p>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-0.5">Pago</p>
                  <p className="uppercase font-bold text-purple-800">
                    {selectedOrder.payment_method?.replace('_', ' ')}
                  </p>
                  <p className="font-mono text-xs">
                    Ref: <strong>{selectedOrder.payment_reference || 'Ninguna'}</strong>
                  </p>
                  <p className="text-slate-500 font-black mt-1">Total: {formatPrice(selectedOrder.total_amount)}</p>
                </div>

                {selectedOrder.shipping_address && (
                  <div className="col-span-2 pt-2 border-t border-purple-100">
                    <p className="font-bold text-slate-900 mb-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" />
                      <span>Dirección de Despacho</span>
                    </p>
                    <p className="text-slate-600">{selectedOrder.shipping_address}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">
                  Repuestos Solicitados ({selectedOrder.items?.length || 0})
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Producto</th>
                        <th className="py-2 px-3 text-center">Cant.</th>
                        <th className="py-2 px-3 text-right">Precio Unit.</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items?.map((it) => (
                        <tr key={it.id}>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {it.product_name}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            {it.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-500">
                            {formatPrice(it.unit_price)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900">
                            {formatPrice(it.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="pt-3 border-t border-slate-200 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-900">
                  Actualizar Estados Operativos
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Estado del Pedido
                    </label>
                    <select
                      value={statusForm.status}
                      onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value as any })}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="pending">Pendiente de revisión</option>
                      <option value="processing">En preparación / Almacén</option>
                      <option value="shipped">Enviado (MRW/Tealca/Zoom)</option>
                      <option value="delivered">Entregado al cliente</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Estado del Pago
                    </label>
                    <select
                      value={statusForm.payment_status}
                      onChange={(e) => setStatusForm({ ...statusForm, payment_status: e.target.value as any })}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="pending">Pendiente por verificar</option>
                      <option value="paid">Pago Verificado (Acreditado)</option>
                      <option value="failed">Pago Rechazado / Inválido</option>
                      <option value="refunded">Reembolsado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notas Internas / Guía de Encomienda
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Guía Zoom 04910293 verificada"
                    value={statusForm.notes}
                    onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 disabled:opacity-50"
                  >
                    {updating ? 'Actualizando...' : 'Guardar Estado'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
