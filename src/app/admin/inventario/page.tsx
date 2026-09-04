'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  AlertCircle,
  Plus,
  RefreshCw,
  X,
  History,
  CheckCircle,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { InventorySummary, Product } from '@/types/store';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminInventoryPage() {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Movement Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    quantity: '1',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, prodRes] = await Promise.all([
        adminApi.getInventorySummary(),
        adminApi.getProducts({ pagina: 1 }),
      ]);

      if (sumRes.success && sumRes.data) setSummary(sumRes.data);
      if (prodRes.success && prodRes.data) setProducts(prodRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenMovementModal = (preselectedProductId?: number) => {
    setFormData({
      product_id: preselectedProductId ? String(preselectedProductId) : (products[0]?.id ? String(products[0].id) : ''),
      type: 'IN',
      quantity: '1',
      reason: '',
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const pid = parseInt(formData.product_id, 10);
    const qty = parseInt(formData.quantity, 10);

    if (!pid || qty <= 0) {
      setErrorMsg('Selecciona un repuesto válido y una cantidad mayor a cero.');
      return;
    }

    if (!formData.reason.trim()) {
      setErrorMsg('Debes especificar un motivo para el movimiento.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminApi.addInventoryMovement({
        product_id: pid,
        type: formData.type,
        quantity: qty,
        reason: formData.reason.trim(),
      });

      if (res.success) {
        setIsModalOpen(false);
        await loadData();
      } else {
        setErrorMsg(res.message || 'Error al registrar el movimiento.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error de conexión.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" text="Cargando datos de inventario..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900">
            Control de Inventario & Kardex
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de entradas por recepción de proveedores, salidas y auditorías.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-purple-50"
            title="Refrescar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenMovementModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-purple-100 rounded-2xl p-4 sm:p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500">Unidades Físicas</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{summary?.total_units || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Existencia real acumulada</p>
        </div>

        <div className="bg-white border border-purple-100 rounded-2xl p-4 sm:p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500">Total Referencias</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{summary?.total_products || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Modelos de repuestos</p>
        </div>

        <div className="bg-white border border-purple-100 rounded-2xl p-4 sm:p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500">Stock Crítico</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-2">{summary?.low_stock_count || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Por debajo del mínimo</p>
        </div>

        <div className="bg-white border border-purple-100 rounded-2xl p-4 sm:p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500">Agotados</span>
          <p className="text-xl sm:text-2xl font-black text-red-600 mt-2">{summary?.out_of_stock_count || 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Sin existencias (0)</p>
        </div>
      </div>

      {/* Low Stock Urgent List */}
      {summary?.low_stock_alerts && summary.low_stock_alerts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-xs sm:text-sm font-bold text-amber-950">
              Atención: Repuestos que requieren reposición inmediata
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.low_stock_alerts.map((al) => (
              <div
                key={al.id}
                className="bg-white border border-amber-200 rounded-2xl p-3 flex items-center justify-between shadow-2xs"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{al.name}</p>
                  <p className="text-[10px] font-mono text-slate-400">SKU: {al.sku}</p>
                  <p className="text-[11px] text-amber-700 font-bold mt-1">
                    Disponible: {al.stock_quantity} (Mín: {al.min_stock_alert})
                  </p>
                </div>
                <button
                  onClick={() => handleOpenMovementModal(al.id)}
                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] rounded-xl"
                >
                  Reponer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log / Kardex Table */}
      <div className="bg-white border border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-purple-600" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900">
            Libro de Movimientos (Kardex Completo)
          </h2>
        </div>

        {summary?.recent_logs && summary.recent_logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3 text-center">Tipo</th>
                  <th className="py-2.5 px-3 text-center">Movimiento</th>
                  <th className="py-2.5 px-3 text-center">Previo</th>
                  <th className="py-2.5 px-3 text-center">Final</th>
                  <th className="py-2.5 px-3">Motivo</th>
                  <th className="py-2.5 px-3">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.recent_logs.map((log) => (
                  <tr key={log.id} className="hover:bg-purple-50/30">
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 block">{log.product_name}</span>
                      <span className="font-mono text-slate-400 text-[10px]">{log.sku}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.type === 'IN'
                            ? 'bg-purple-100 text-purple-800'
                            : log.type === 'OUT'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.type === 'IN' ? 'Entrada' : log.type === 'OUT' ? 'Salida' : 'Ajuste'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-black">
                      {log.type === 'OUT' ? `-${log.quantity_changed}` : `+${log.quantity_changed}`}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500">
                      {log.previous_stock}
                    </td>
                    <td className="py-2.5 px-3 text-center font-black text-slate-900">
                      {log.new_stock}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {log.reason}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {log.user_name || 'Admin'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-10 text-center">
            No se han registrado movimientos todavía.
          </p>
        )}
      </div>

      {/* Movement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Nuevo Movimiento de Inventario
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="p-5 sm:p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Repuesto / Producto *
                </label>
                <select
                  required
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="">Selecciona un repuesto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (SKU: {p.sku}) — Stock actual: {p.stock_quantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Movimiento *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white font-bold"
                  >
                    <option value="IN">Entrada (+ stock)</option>
                    <option value="OUT">Salida (- stock)</option>
                    <option value="ADJUSTMENT">Ajuste / Conteo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cantidad de Unidades *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo / Justificación *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ej: Factura Compra #1049 de Repuestos La Guaira, o Merma por defecto"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Procesando...' : 'Registrar Movimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
