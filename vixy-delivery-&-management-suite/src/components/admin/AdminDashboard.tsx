import React from 'react';
import { 
  ShoppingBag, 
  Bike, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  DollarSign, 
  Compass, 
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Store,
  Terminal,
  FileCode,
  Image as ImageIcon
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

interface AdminDashboardProps {
  onNavigateTab: (tabId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { orders, driver, store, client, incidents, tasaBcv } = useDelivery();

  const totalPedidos = orders.length;
  const pedidosActivos = orders.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado').length;
  const pedidosEntregados = orders.filter(o => o.estado === 'entregado').length;
  const totalFacturadoUsd = orders.reduce((sum, o) => sum + o.montoTotalUsd, 0);
  const totalFacturadoBs = totalFacturadoUsd * tasaBcv;

  const activeOrder = orders.find(o => o.estado === 'en_camino_al_cliente') || orders[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">
      {/* 1. OPERATIONAL OVERVIEW BENTO TILE (Span 3) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between shadow-xs gap-4">
        <div className="space-y-1">
          <h2 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">
            Resumen Operativo del Día
          </h2>
          <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {totalPedidos}{' '}
            <span className="text-base font-medium text-slate-400 tracking-normal">
              pedidos procesados hoy
            </span>
          </p>
          <p className="text-xs text-slate-500 font-mono">
            Facturación: ${totalFacturadoUsd.toFixed(2)} USD • Bs. {totalFacturadoBs.toFixed(2)} (Tasa BCV: {tasaBcv.toFixed(2)})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:gap-8 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
          <div className="text-left md:text-center">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1 tracking-wider">
              Estado del API
            </p>
            <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">
              200 OK
            </p>
          </div>
          <div className="text-left md:text-center">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1 tracking-wider">
              Latencia BD
            </p>
            <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">
              12 ms
            </p>
          </div>
          <div className="text-left md:text-center">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase mb-1 tracking-wider">
              Envíos en Ruta
            </p>
            <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">
              {pedidosActivos > 0 ? pedidosActivos : 1}
            </p>
          </div>
        </div>
      </div>

      {/* 2. VERIFICATION VAULT BENTO TILE (Span 1, Row-span 2, Electric Orange) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-1 lg:row-span-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
        {/* Soft decorative visual circle */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-90">
              Bóveda Vault
            </h3>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-lg font-mono font-bold">
              Auditoría 30d
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-white/20 rounded-xl flex items-center justify-between border border-white/20 backdrop-blur-xs">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-medium truncate">Entrega_ID_882.jpg</span>
              </div>
              <span className="text-[10px] bg-emerald-400 text-neutral-950 px-2 py-0.5 rounded-lg uppercase font-bold shrink-0">
                Vigente
              </span>
            </div>

            <div className="p-3 bg-white/20 rounded-xl flex items-center justify-between border border-white/20 backdrop-blur-xs">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-medium truncate">Comercio_Pickup_21.jpg</span>
              </div>
              <span className="text-[10px] bg-emerald-400 text-neutral-950 px-2 py-0.5 rounded-lg uppercase font-bold shrink-0">
                Vigente
              </span>
            </div>

            <div className="p-3 bg-white/20 rounded-xl flex items-center justify-between border border-white/20 backdrop-blur-xs">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-medium truncate">Recibo_Pago_04.jpg</span>
              </div>
              <span className="text-[10px] bg-emerald-400 text-neutral-950 px-2 py-0.5 rounded-lg uppercase font-bold shrink-0">
                Vigente
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider opacity-80 font-mono truncate">
            /uploads/verificaciones/
          </span>
          <button
            onClick={() => onNavigateTab('recargas')}
            className="text-xs font-bold underline hover:text-amber-100 cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>Ver Bóveda</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3. REAL-TIME ORDER FLOW & RADAR BENTO TILE (Span 3, Dark Slate) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#0F172A] rounded-2xl p-0 overflow-hidden relative border border-slate-800 shadow-md">
        {/* Dotted Radial Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }} 
        />

        <div className="relative p-6 h-full flex flex-col justify-between">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
              Flujo de Pedidos en Vivo & Radar Satelital
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-slate-400 border border-slate-700 px-2.5 py-1 rounded-lg font-mono">
                CARACAS - DTTO CAPITAL (VE)
              </span>
              <button
                onClick={() => onNavigateTab('mapa_conductores')}
                className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-lg font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>VER MAPA DE CONDUCTORES</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Cards & Radar Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Order Card 1 (Active Delivery) */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 font-mono">
                  Pedido #{activeOrder?.codigoSeguimiento || 'VXY-901'}
                </p>
                <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-lg font-bold uppercase">
                  {activeOrder?.estado === 'en_camino_al_cliente' ? 'EN RUTA' : 'ACTIVO'}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <img
                  src={driver.fotoUrl}
                  alt={driver.nombre}
                  className="w-10 h-10 rounded-xl border-2 border-amber-500 object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs text-white font-bold truncate">
                    {driver.nombre} {driver.apellido}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    {driver.moto.marca} {driver.moto.modelo} [{driver.moto.placa}]
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-3/4 rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Destino: {activeOrder?.direccionEntrega?.sector || 'Chacao'}</span>
                  <span className="text-amber-400 font-bold">ETA: 4m 12s</span>
                </div>
              </div>
            </div>

            {/* Live Order Card 2 (Completed or Kitchen) */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 font-mono">
                  Pedido #VXY-899
                </p>
                <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-lg font-bold uppercase">
                  COMPLETADO
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-700 rounded-xl border-2 border-slate-600 flex items-center justify-center font-bold text-xs text-slate-300 shrink-0">
                  MG
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white font-bold truncate">
                    María G. López
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    Empire Keeway Horse [AH-1122]
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Entregado: Los Palos Grandes</span>
                  <span className="text-emerald-400 font-bold">Tiempo: 22m 10s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Coordinates Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Comercio: {store.nombre} (10.4910° N, 66.8520° W)
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Motorizado: {driver.nombre} en tránsito
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigateTab('mapa_conductores')}
                className="text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1 text-xs"
              >
                <span>Ir al Mapa de Conductores</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('pedidos')}
                className="text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1 text-xs"
              >
                <span>Ver Pedidos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. LIVE SUPPORT CHAT BENTO TILE (Span 1) */}
      <div className="col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
          Soporte Operativo en Vivo
        </h3>

        <div className="flex-1 space-y-3 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
            <p className="font-bold text-amber-600 dark:text-amber-400">
              [Comercio] {store.nombre}
            </p>
            El pedido #{activeOrder?.codigoSeguimiento || 'VXY-901'} fue empacado y sellado.
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
            <p className="font-bold text-blue-600 dark:text-blue-400">
              [Motorizado] {driver.nombre} Ramírez
            </p>
            Llegando al punto de entrega, cliente notificado por push.
          </div>

          {incidents.length > 0 && (
            <div className="bg-amber-500/10 p-2.5 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <p className="font-bold text-amber-600">
                [Alerta Ruta] {incidents[0].tipo}
              </p>
              {incidents[0].descripcion}
            </div>
          )}
        </div>

        <button
          onClick={() => onNavigateTab('soporte')}
          className="mt-4 w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl transition cursor-pointer"
        >
          Ver Mesa de Soporte ({incidents.filter(i => i.estado !== 'resuelta').length} Activas)
        </button>
      </div>

      {/* 5. TOP STORE BENTO TILE (Span 1) */}
      <div className="col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Comercio Destacado
          </h3>

          <div className="flex items-center space-x-3 mb-3">
            <img
              src={store.logoUrl}
              alt={store.nombre}
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                {store.nombre}
              </p>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                4.9 Calificación • RIF: {store.rif}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
            Facturación Hoy
          </p>
          <p className="text-xl font-black text-slate-800 dark:text-white font-mono">
            ${(totalFacturadoUsd * 0.85).toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </p>
          <button
            onClick={() => onNavigateTab('comercios')}
            className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Gestionar Comercios y Rubros</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 6. REGISTERED VIXY DRIVERS (FLEET MANAGEMENT) BENTO TILE (Span 2) */}
      <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Flota de Conductores Registrados
          </h3>
          <button
            onClick={() => onNavigateTab('conductores')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Ver Fichas de Carnet</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100 dark:border-slate-800">
              <tr className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                <th className="pb-2 font-bold">Conductor</th>
                <th className="pb-2 font-bold">Vehículo & Placa</th>
                <th className="pb-2 text-right font-bold">Documentos</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              <tr className="border-b border-slate-50 dark:border-slate-800/60">
                <td className="py-2.5 font-bold text-slate-800 dark:text-white flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{driver.nombre} {driver.apellido}</span>
                </td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400 font-mono text-xs">
                  {driver.moto.marca} ({driver.moto.anio}) • [{driver.moto.placa}]
                </td>
                <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[11px] whitespace-nowrap">
                  CERT-MED ✓
                </td>
              </tr>

              <tr className="border-b border-slate-50 dark:border-slate-800/60">
                <td className="py-2.5 font-bold text-slate-800 dark:text-white flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">Luis García</span>
                </td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400 font-mono text-xs">
                  Yamaha DT (2021) • [AG-5511]
                </td>
                <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[11px] whitespace-nowrap">
                  CERT-MED ✓
                </td>
              </tr>

              <tr className="border-b border-slate-50 dark:border-slate-800/60">
                <td className="py-2.5 font-bold text-slate-800 dark:text-white flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="truncate">Pedro Ruiz</span>
                </td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400 font-mono text-xs">
                  Haojin Águila (2023) • [AJ-9920]
                </td>
                <td className="py-2.5 text-right text-amber-600 dark:text-amber-400 font-bold font-mono text-[11px] whitespace-nowrap">
                  Por Vencer ⚠️
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. API CONFIG BENTO TILE (Span 1, Deep Slate-800) */}
      <div className="col-span-1 bg-[#1E293B] rounded-2xl p-6 text-white flex flex-col justify-between shadow-lg">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
            Configuración Servidor & API
          </h3>
          <p className="text-sm font-mono text-amber-400 font-bold truncate">
            AUTH_JWT_SECRET_V1
          </p>
        </div>

        <div className="mt-4 space-y-2 font-mono">
          <div className="flex justify-between text-[10px]">
            <span className="opacity-50">Contenedor</span>
            <span className="truncate pl-2">vixy-gateway:latest</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="opacity-50">Subdominio</span>
            <span className="truncate pl-2">pedidos.vixy.com</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="opacity-50">Versión PHP</span>
            <span>8.2.1 FPM</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="opacity-50">Base MySQL</span>
            <span>cPanel Puerto 3306</span>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('backend')}
          className="mt-4 border border-white/20 text-[10px] font-bold uppercase tracking-wider py-2 rounded-xl hover:bg-white/5 transition cursor-pointer"
        >
          Ver Código Backend & BD
        </button>
      </div>
    </div>
  );
};
