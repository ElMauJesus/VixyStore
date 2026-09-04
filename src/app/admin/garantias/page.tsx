'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { WarrantyLog, Product, Supplier } from '@/types/store';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminWarrantiesPage() {
  const [logs, setLogs] = useState<WarrantyLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WarrantyLog | null>(null);
  const [formData, setFormData] = useState({
    product_id: '',
    supplier_id: '',
    failure_reason: '',
    claim_status: 'pending',
    supplier_resolution: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [warRes, prodRes, supRes] = await Promise.all([
        adminApi.getWarrantyLogs(),
        adminApi.getProducts({ pagina: 1 }),
        adminApi.getSuppliers(),
      ]);

      if (warRes.success && warRes.data) setLogs(warRes.data);
      if (prodRes.success && prodRes.data) setProducts(prodRes.data);
      if (supRes.success && supRes.data) setSuppliers(supRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingLog(null);
    setFormData({
      product_id: products[0]?.id ? String(products[0].id) : '',
      supplier_id: suppliers[0]?.id ? String(suppliers[0].id) : '',
      failure_reason: '',
      claim_status: 'pending',
      supplier_resolution: '',
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (log: WarrantyLog) => {
    setEditingLog(log);
    setFormData({
      product_id: String(log.product_id),
      supplier_id: String(log.supplier_id),
      failure_reason: log.failure_reason,
      claim_status: log.claim_status,
      supplier_resolution: log.supplier_resolution || '',
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.failure_reason.trim()) {
      setErrorMsg('El motivo del reclamo o falla técnica es requerido.');
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (editingLog) {
        res = await adminApi.updateWarrantyLog({
          id: editingLog.id,
          claim_status: formData.claim_status,
          supplier_resolution: formData.supplier_resolution.trim() || undefined,
        });
      } else {
        res = await adminApi.createWarrantyLog({
          product_id: parseInt(formData.product_id, 10),
          supplier_id: parseInt(formData.supplier_id, 10),
          failure_reason: formData.failure_reason.trim(),
          claim_status: formData.claim_status,
        });
      }

      if (res.success) {
        setIsModalOpen(false);
        await loadData();
      } else {
        setErrorMsg(res.message || 'Error al procesar la ficha de garantía.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error de conexión.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900">
            Control de Calidad & Garantías
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fichas técnicas de reclamos a proveedores y piezas defectuosas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-purple-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Ficha</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" text="Cargando fichas de garantía..." />
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-3">Repuesto</th>
                  <th className="py-3 px-3">Proveedor</th>
                  <th className="py-3 px-3">Falla Reportada</th>
                  <th className="py-3 px-3 text-center">Estado Reclamo</th>
                  <th className="py-3 px-3">Resolución</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-900">
                      {item.product_name}
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-semibold">
                      {item.supplier_name}
                    </td>

                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {item.failure_reason}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                          item.claim_status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.claim_status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : item.claim_status === 'refunded'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.claim_status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                      {item.supplier_resolution || 'En espera'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Actualizar estado"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No hay fichas de garantía registradas actualmente.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingLog ? 'Actualizar Ficha de Garantía' : 'Nueva Ficha de Garantía'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-3.5">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {!editingLog && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Repuesto Afectado *
                    </label>
                    <select
                      required
                      value={formData.product_id}
                      onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="">Seleccionar repuesto...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (SKU: {p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Proveedor Responsable *
                    </label>
                    <select
                      required
                      value={formData.supplier_id}
                      onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="">Seleccionar proveedor...</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Descripción de la Falla *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Ej: Falla de aislamiento, defecto de fábrica..."
                      value={formData.failure_reason}
                      onChange={(e) => setFormData({ ...formData, failure_reason: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estado del Reclamo
                </label>
                <select
                  value={formData.claim_status}
                  onChange={(e) => setFormData({ ...formData, claim_status: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="pending">En Espera (Pendiente)</option>
                  <option value="accepted">Aceptado por Proveedor</option>
                  <option value="refunded">Reembolsado / Nota de Crédito</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Resolución del Proveedor
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Proveedor envía pieza de recambio..."
                  value={formData.supplier_resolution}
                  onChange={(e) => setFormData({ ...formData, supplier_resolution: e.target.value })}
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
                  {submitting ? 'Guardando...' : 'Guardar Ficha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
