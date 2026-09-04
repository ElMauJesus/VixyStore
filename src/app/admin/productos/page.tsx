'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { adminApi, storeApi } from '@/lib/api';
import { Product, Category, Supplier } from '@/types/store';
import { formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    supplier_id: '',
    purchase_price: '',
    price: '',
    stock_quantity: '0',
    min_stock_alert: '5',
    description: '',
    image_url: '',
    is_active: 1,
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, supRes] = await Promise.all([
        adminApi.getProducts({ busqueda: search || undefined }),
        storeApi.getCategories(),
        adminApi.getSuppliers(),
      ]);

      if (prodRes.success && prodRes.data) setProducts(prodRes.data);
      if (catRes.success && catRes.data) setCategories(catRes.data);
      if (supRes.success && supRes.data) setSuppliers(supRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category_id: categories[0]?.id ? String(categories[0].id) : '',
      supplier_id: suppliers[0]?.id ? String(suppliers[0].id) : '',
      purchase_price: '',
      price: '',
      stock_quantity: '0',
      min_stock_alert: '5',
      description: '',
      image_url: '',
      is_active: 1,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category_id: p.category_id ? String(p.category_id) : '',
      supplier_id: p.supplier_id ? String(p.supplier_id) : '',
      purchase_price: p.purchase_price ? String(p.purchase_price) : '',
      price: String(p.price),
      stock_quantity: String(p.stock_quantity),
      min_stock_alert: p.min_stock_alert ? String(p.min_stock_alert) : '5',
      description: p.description || '',
      image_url: p.imagen_principal || '',
      is_active: p.is_active ? 1 : 0,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.name.trim() || !formData.sku.trim() || !formData.price) {
      setModalError('Nombre, SKU y Precio son campos obligatorios.');
      return;
    }

    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
      supplier_id: formData.supplier_id ? parseInt(formData.supplier_id, 10) : null,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
      min_stock_alert: parseInt(formData.min_stock_alert, 10) || 5,
      description: formData.description.trim(),
      image_url: formData.image_url.trim() || null,
      is_active: formData.is_active ? 1 : 0,
    };

    try {
      let res;
      if (editingProduct) {
        res = await adminApi.updateProduct({ id: editingProduct.id, ...payload });
      } else {
        res = await adminApi.createProduct(payload);
      }

      if (res.success) {
        setIsModalOpen(false);
        await loadData();
      } else {
        setModalError(res.message || 'Error al guardar el repuesto.');
      }
    } catch (err: any) {
      setModalError(err?.message || 'Error de conexión.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que deseas desactivar/eliminar este producto?')) return;

    const res = await adminApi.deleteProduct(id);
    if (res.success) {
      await loadData();
    } else {
      alert(res.message || 'No se pudo eliminar el producto');
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900">
            Catálogo & Repuestos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Crea, actualiza precios, controla márgenes y administra el inventario general.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filter / Search bar */}
      <div className="bg-white border border-purple-100 rounded-2xl p-3 sm:p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
        </div>

        <button
          onClick={loadData}
          className="p-2 text-slate-500 hover:text-purple-600 bg-slate-50 border border-slate-200 rounded-xl"
          title="Recargar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" text="Cargando catálogo..." />
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Categoría</th>
                  <th className="py-3 px-3 text-right">Costo</th>
                  <th className="py-3 px-3 text-right">PVP</th>
                  <th className="py-3 px-3 text-center">Margen</th>
                  <th className="py-3 px-3 text-center">Stock</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const margin = p.margin_percentage ?? (p.purchase_price && Number(p.purchase_price) > 0
                    ? Math.round(((p.price - Number(p.purchase_price)) / Number(p.purchase_price)) * 100)
                    : null);

                  return (
                    <tr key={p.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 bg-slate-50 rounded-xl overflow-hidden border border-purple-100 flex-shrink-0">
                            {p.imagen_principal ? (
                              <Image
                                src={p.imagen_principal}
                                alt={p.name}
                                fill
                                className="object-contain p-1"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-purple-300">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-slate-400">ID: #{p.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {p.sku}
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-800 font-semibold block">
                          {p.categoria_nombre || 'Sin categoría'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {p.proveedor_nombre || 'Sin proveedor'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-slate-500">
                        {p.purchase_price ? formatPrice(p.purchase_price) : '—'}
                      </td>

                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        {formatPrice(p.price)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {margin !== null ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">
                            +{margin}%
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                            p.stock_quantity <= (p.min_stock_alert || 5)
                              ? 'bg-red-100 text-red-700'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {p.stock_quantity}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.is_active
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {p.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Editar repuesto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No hay productos que coincidan.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Editar Repuesto' : 'Nuevo Repuesto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Pastillas de Freno Delanteras Toyota Yaris"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SKU (Código) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VIX-FR-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Proveedor
                  </label>
                  <select
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
                    Precio Costo (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="15.00"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Precio Venta PVP (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock en Almacén
                  </label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mínimo para Alerta
                  </label>
                  <input
                    type="number"
                    value={formData.min_stock_alert}
                    onChange={(e) => setFormData({ ...formData, min_stock_alert: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL de la Imagen Principal
                  </label>
                  <input
                    type="text"
                    placeholder="URL de la imagen o ruta interna"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Descripción Técnica
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Especificaciones, modelos compatibles..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active_prod"
                    checked={formData.is_active === 1}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="is_active_prod" className="text-xs font-bold text-slate-700">
                    Producto Activo y Visible en Tienda
                  </label>
                </div>
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
                  {saving ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
