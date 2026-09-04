'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Boxes,
  AlertTriangle,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { InventorySummary, Order } from '@/types/store';
import { formatPrice, formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, ordRes] = await Promise.all([
        adminApi.getInventorySummary(),
        adminApi.getOrders({ pagina: 1 }),
      ]);

      if (invRes.success && invRes.data) {
        setSummary(invRes.data);
      }
      if (ordRes.success && ordRes.data) {
        setRecentOrders(ordRes.data.slice(0, 5));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" text="Cargando métricas empresariales..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900">
            Panel de Control ERP
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Resumen global de inventario, abastecimiento y pedidos en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-purple-50 transition-colors"
            title="Refrescar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Gestionar Productos</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-purple-100 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Catálogo Activo</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {summary?.total_products || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Repuestos registrados</p>
        </div>

        <div className="bg-white border border-purple-100 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Unidades Físicas</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Boxes className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {summary?.total_units || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">En almacén</p>
        </div>

        <div className="bg-white border border-purple-100 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Stock Crítico</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-2">
            {summary?.low_stock_count || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Bajo el mínimo</p>
        </div>

        <div className="bg-white border border-purple-100 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Pedidos</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-purple-700 mt-2">
            {recentOrders.length}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Recientes en tienda</p>
        </div>
      </div>

      {/* Main Grid: Low Stock Alert & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Low Stock Alerts */}
        <div className="lg:col-span-7 bg-white border border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Repuestos que Requieren Reabastecimiento
              </h3>
            </div>
            <Link
              href="/admin/inventario"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>Ver Inventario</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {summary?.low_stock_alerts && summary.low_stock_alerts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-2">Producto</th>
                    <th className="pb-2">SKU</th>
                    <th className="pb-2 text-center">Stock</th>
                    <th className="pb-2 text-center">Mínimo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.low_stock_alerts.map((item) => (
                    <tr key={item.id} className="hover:bg-purple-50/40">
                      <td className="py-2.5 font-bold text-slate-900">
                        {item.name}
                      </td>
                      <td className="py-2.5 font-mono text-slate-500">{item.sku}</td>
                      <td className="py-2.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700">
                          {item.stock_quantity}
                        </span>
                      </td>
                      <td className="py-2.5 text-center text-slate-500 font-medium">
                        {item.min_stock_alert}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              Todos los repuestos tienen niveles de stock saludables.
            </p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-5 bg-white border border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Últimos Pedidos</h3>
            <Link
              href="/admin/pedidos"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>Ver Todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-2.5">
              {recentOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 bg-purple-50/40 border border-purple-100/80 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-black text-purple-900 block">
                      {ord.order_number}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {ord.first_name} {ord.last_name} • {ord.payment_method?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 block">
                      {formatPrice(ord.total_amount)}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-900'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              No hay pedidos recientes.
            </p>
          )}
        </div>
      </div>

      {/* Kardex Logs */}
      <div className="bg-white border border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Movimientos Recientes de Inventario (Kardex)
            </h3>
          </div>
          <Link
            href="/admin/inventario"
            className="text-xs font-bold text-purple-600 hover:text-purple-700"
          >
            Ajustar Stock
          </Link>
        </div>

        {summary?.recent_logs && summary.recent_logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3 text-center">Tipo</th>
                  <th className="py-2.5 px-3 text-center">Cantidad</th>
                  <th className="py-2.5 px-3 text-center">Stock Final</th>
                  <th className="py-2.5 px-3">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.recent_logs.map((log) => (
                  <tr key={log.id} className="hover:bg-purple-50/30">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {log.product_name}
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
                        {log.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-black text-slate-800">
                      {log.type === 'OUT' ? `-${log.quantity_changed}` : `+${log.quantity_changed}`}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                      {log.new_stock}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-6 text-center">
            Sin movimientos recientes registrados.
          </p>
        )}
      </div>
    </div>
  );
}
