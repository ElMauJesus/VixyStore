'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Supplier } from '@/types/store';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    tax_id: '',
    is_active: 1,
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSuppliers({ busqueda: search || undefined });
      if (res.success && res.data) {
        setSuppliers(res.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [search]);

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      tax_id: '',
      is_active: 1,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      contact_name: s.contact_name || '',
      email: s.email || '',
      phone: s.phone || '',
      address: s.address || '',
      tax_id: s.tax_id || '',
      is_active: s.is_active ? 1 : 0,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.name.trim()) {
      setModalError('La razón social o nombre del proveedor es requerida.');
      return;
    }

    setSaving(true);
    try {
      let res;
      if (editingSupplier) {
        res = await adminApi.updateSupplier({
          id: editingSupplier.id,
          ...formData,
        });
      } else {
        res = await adminApi.createSupplier(formData);
      }

      if (res.success) {
        setIsModalOpen(false);
        await loadSuppliers();
      } else {
        setModalError(res.message || 'Error al guardar el proveedor.');
      }
    } catch (err: any) {
      setModalError(err?.message || 'Error de conexión.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que deseas dar de baja a este proveedor?')) return;
    const res = await adminApi.deleteSupplier(id);
    if (res.success) {
      await loadSuppliers();
    } else {
      alert(res.message || 'Error al eliminar proveedor');
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900">
            Proveedores & Fabricantes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de aliados comerciales, contactos directos, RIF y términos de compra.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Search & Actions */}
      <div className="bg-white border border-purple-100 rounded-2xl p-3 sm:p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Buscar por empresa, contacto, RIF o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
        </div>

        <button
          onClick={loadSuppliers}
          className="p-2 text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-purple-50"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" text="Cargando proveedores..." />
          </div>
        ) : suppliers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-3">RIF</th>
                  <th className="py-3 px-3">Contacto</th>
                  <th className="py-3 px-3">Comunicación</th>
                  <th className="py-3 px-3 text-center">Productos</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{s.name}</p>
                      {s.address && (
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-purple-400" />
                          <span>{s.address}</span>
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">
                      {s.tax_id || 'N/A'}
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {s.contact_name || 'Sin especificar'}
                    </td>

                    <td className="py-3 px-3">
                      {s.email && (
                        <p className="text-slate-600 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-purple-400" />
                          <span>{s.email}</span>
                        </p>
                      )}
                      {s.phone && (
                        <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-purple-400" />
                          <span>{s.phone}</span>
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-50 text-purple-700">
                        {s.product_count ?? 0}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          s.is_active
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No hay proveedores registrados aún.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-3.5">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Razón Social / Nombre Comercial *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Distribuidora de Repuestos Caracas C.A."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RIF / Número Fiscal
                  </label>
                  <input
                    type="text"
                    placeholder="J-30129482-1"
                    value={formData.tax_id}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Persona de Contacto
                  </label>
                  <input
                    type="text"
                    placeholder="Ing. José Rodríguez"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="ventas@proveedor.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="0212-9998877"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dirección Física
                </label>
                <input
                  type="text"
                  placeholder="Zona Industrial La Yaguara, Galpón 4"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sup_is_active_check"
                  checked={formData.is_active === 1}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="sup_is_active_check" className="text-xs font-bold text-slate-700">
                  Proveedor Activo
                </label>
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
                  disabled={saving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
