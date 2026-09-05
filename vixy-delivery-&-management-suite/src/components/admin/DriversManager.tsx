import React, { useState, useMemo } from 'react';
import { 
  Bike, 
  ShieldCheck, 
  Star, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Award,
  Search,
  ChevronRight,
  Clock,
  DollarSign,
  Receipt,
  Eye,
  ExternalLink,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hash,
  ArrowUpRight,
  Sparkles,
  Info,
  LayoutGrid,
  List,
  UserCheck,
  Zap,
  Filter
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { Conductor } from '../../types/delivery';
import { DriverCarnetFicha } from './DriverCarnetFicha';

type TimeFrame = 'dia' | 'semana' | 'mes';

export const DriversManager: React.FC = () => {
  const { 
    allDrivers, 
    orders, 
    rechargeRequests, 
    tasaBcv, 
    openCall, 
    calculateDeliveryTripCost,
    deliveryRates 
  } = useDelivery();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'disponible' | 'en_ruta'>('todos');
  const [viewMode, setViewMode] = useState<'lista' | 'cuadricula'>('lista');
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);
  const [driverTimeframes, setDriverTimeframes] = useState<Record<string, TimeFrame>>({});
  const [selectedDriver, setSelectedDriver] = useState<Conductor | null>(null);
  const [profileTab, setProfileTab] = useState<'viajes' | 'pagos' | 'legal' | 'vehiculo' | 'billetera'>('viajes');
  const [timeframe, setTimeframe] = useState<TimeFrame>('dia');
  const [inspectingReceipt, setInspectingReceipt] = useState<{ 
    url: string; 
    ref: string; 
    date: string; 
    isVigente: boolean; 
    diffDays: number 
  } | null>(null);

  // Filtered driver roster
  const filteredDrivers = useMemo(() => {
    return allDrivers.filter(driver => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || 
        driver.nombre.toLowerCase().includes(q) ||
        driver.apellido.toLowerCase().includes(q) ||
        driver.legal.cedula.toLowerCase().includes(q) ||
        driver.moto.placa.toLowerCase().includes(q) ||
        driver.moto.modelo.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (statusFilter === 'disponible') return driver.disponible;
      if (statusFilter === 'en_ruta') return !driver.disponible;
      return true;
    });
  }, [allDrivers, searchTerm, statusFilter]);

  // Compute 30-day validity rule for payment receipts
  const checkReceiptValidity = (fechaStr: string) => {
    const receiptDate = new Date(fechaStr.replace(' ', 'T'));
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - receiptDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const isVigente = diffDays <= 30;
    const remainingDays = 30 - diffDays;

    return {
      diffDays,
      remainingDays: Math.max(0, remainingDays),
      isVigente,
      statusLabel: isVigente 
        ? `Vigente • ${remainingDays}d restantes`
        : `Expirado • ${diffDays}d (>30d)`
    };
  };

  // Dynamic trips breakdown applying the exact formula:
  // Tarifa mínima $2.00 USD (cubre hasta 3.0 km) + $0.50 USD por cada km adicional después de los 3 km
  const getDriverTrips = (driverId: string, tf: TimeFrame) => {
    let baseTrips: {
      id: string;
      comercio: string;
      cliente: string;
      hora: string;
      distanciaKm: number;
      estado: string;
    }[] = [];

    if (tf === 'dia') {
      baseTrips = [
        {
          id: 'VIX-8041',
          comercio: 'Burger House Caracas',
          cliente: 'Mariana Pérez (Los Palos Grandes)',
          hora: '15:35',
          distanciaKm: 2.8,
          estado: 'Entregado a tiempo'
        },
        {
          id: 'VIX-8038',
          comercio: 'Ferretería El Tornillo Master',
          cliente: 'Carlos Mendoza (Chacao)',
          hora: '11:12',
          distanciaKm: 3.4,
          estado: 'Entregado a tiempo'
        },
        {
          id: 'VIX-8035',
          comercio: 'Burger House Caracas',
          cliente: 'Valentina Silva (Parque Cristal)',
          hora: '09:40',
          distanciaKm: 1.9,
          estado: 'Entregado a tiempo'
        }
      ];
    } else if (tf === 'semana') {
      baseTrips = [
        { id: 'VIX-8041', comercio: 'Burger House Caracas', cliente: 'Mariana Pérez (Los Palos Grandes)', hora: 'Hoy 15:35', distanciaKm: 2.8, estado: 'Entregado' },
        { id: 'VIX-8038', comercio: 'Ferretería El Tornillo Master', cliente: 'Carlos Mendoza (Chacao)', hora: 'Hoy 11:12', distanciaKm: 3.4, estado: 'Entregado' },
        { id: 'VIX-8035', comercio: 'Burger House Caracas', cliente: 'Valentina Silva (Parque Cristal)', hora: 'Hoy 09:40', distanciaKm: 1.9, estado: 'Entregado' },
        { id: 'VIX-8029', comercio: 'Farmacia & Salud La Castellana', cliente: 'Roberto Gómez (Altamira)', hora: 'Ayer 18:20', distanciaKm: 4.1, estado: 'Entregado' },
        { id: 'VIX-8022', comercio: 'Doña Bárbara Criollo & Grill', cliente: 'Elena Rivas (Las Mercedes)', hora: 'Ayer 13:10', distanciaKm: 5.0, estado: 'Entregado' },
        { id: 'VIX-8015', comercio: 'Supermercado Central Bello Monte', cliente: 'Andrés Gil (Bello Monte)', hora: 'Mar 17:05', distanciaKm: 2.9, estado: 'Entregado' },
        { id: 'VIX-8004', comercio: 'Burger House Caracas', cliente: 'Patricia Lugo (El Rosal)', hora: 'Lun 20:15', distanciaKm: 2.2, estado: 'Entregado' }
      ];
    } else {
      baseTrips = [
        { id: 'VIX-8041', comercio: 'Burger House Caracas', cliente: 'Mariana Pérez (Los Palos Grandes)', hora: '02 Sep 15:35', distanciaKm: 2.8, estado: 'Entregado' },
        { id: 'VIX-8038', comercio: 'Ferretería El Tornillo Master', cliente: 'Carlos Mendoza (Chacao)', hora: '02 Sep 11:12', distanciaKm: 3.4, estado: 'Entregado' },
        { id: 'VIX-8029', comercio: 'Farmacia & Salud La Castellana', cliente: 'Roberto Gómez (Altamira)', hora: '01 Sep 18:20', distanciaKm: 4.1, estado: 'Entregado' },
        { id: 'VIX-7988', comercio: 'Doña Bárbara Criollo & Grill', cliente: 'Elena Rivas (Las Mercedes)', hora: '28 Ago 14:10', distanciaKm: 5.0, estado: 'Entregado' },
        { id: 'VIX-7945', comercio: 'Burger House Caracas', cliente: 'David Morales (Chacao)', hora: '24 Ago 19:30', distanciaKm: 2.0, estado: 'Entregado' },
        { id: 'VIX-7901', comercio: 'Ferretería El Tornillo Master', cliente: 'Gabriel Ramos (Los Ruices)', hora: '19 Ago 11:15', distanciaKm: 4.6, estado: 'Entregado' },
        { id: 'VIX-7860', comercio: 'Supermercado Central Bello Monte', cliente: 'Sonia Torres (La Florida)', hora: '14 Ago 16:40', distanciaKm: 3.8, estado: 'Entregado' }
      ];
    }

    return baseTrips.map(trip => {
      const calc = calculateDeliveryTripCost(trip.distanciaKm);
      return {
        ...trip,
        costoTotalUsd: calc.totalViajeUsd,
        costoTotalBs: calc.totalViajeBs,
        gananciaUsd: calc.gananciaMotorizadoUsd,
        comisionUsd: calc.comisionPlataformaUsd,
        distanciaExcedenteKm: calc.distanciaExcedenteKm,
        costoAdicionalUsd: calc.costoAdicionalUsd
      };
    });
  };

  // Payment receipts for the selected driver
  const getDriverPayments = (driverId: string) => {
    return [
      {
        id: 'pago-cond-01',
        montoUsd: 5.00,
        montoBs: 5.00 * tasaBcv,
        metodoPago: 'Binance Pay (USDT)',
        referencia: 'BINANCE-PAY-9812903',
        fecha: '2026-09-02 14:30:10',
        comprobanteUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
        estado: 'Aprobado y Acreditado'
      },
      {
        id: 'pago-cond-02',
        montoUsd: 3.00,
        montoBs: 3.00 * tasaBcv,
        metodoPago: 'Zinli Wallet',
        referencia: 'ZINLI-TR-448102',
        fecha: '2026-09-01 18:20:00',
        comprobanteUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        estado: 'Aprobado y Acreditado'
      },
      {
        id: 'pago-cond-03',
        montoUsd: 10.00,
        montoBs: 10.00 * tasaBcv,
        metodoPago: 'Pago Móvil Banesco',
        referencia: 'PM-0134-5541920',
        fecha: '2026-07-20 10:15:00', // Older than 30 days to demonstrate 30-day expiration rule!
        comprobanteUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
        estado: 'Histórico Archivado (>30 días)'
      }
    ];
  };

  const totalDriversCount = allDrivers.length;
  const onlineDriversCount = allDrivers.filter(d => d.disponible).length;
  const enRutaDriversCount = totalDriversCount - onlineDriversCount;

  return (
    <div className="space-y-6">
      {/* 1. HEADER BENTO BANNER WITH OPERATIONAL TARIFFS */}
      <div className="p-5 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Padrón Motorizados • Credenciales Oficiales Vixy
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              INTT Grado 2 • MPPS Certificado
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Bike className="w-6 h-6 text-amber-500" />
            Fichas y Carnets de Conductores
          </h2>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Visualiza las credenciales oficiales tipo ficha con datos civiles, foto carnet, estatus en tiempo real y chapa del vehículo. Haz clic en <strong>Ver Ficha Completa</strong> para consultar su expediente legal, carreras calculadas y auditoría de recibos.
          </p>
        </div>

        {/* Operational Tariff Pill */}
        <div className="p-3.5 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 shrink-0 space-y-1">
          <span className="text-[10px] font-mono uppercase font-bold text-amber-600 dark:text-amber-400 block">
            Tarifa Oficial de Despacho Vigente
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-display font-black text-neutral-900 dark:text-white font-mono">
              ${deliveryRates.tarifaBaseMinimaUsd.toFixed(2)} USD
            </span>
            <span className="text-xs text-neutral-400">
              (hasta {deliveryRates.distanciaBaseKm.toFixed(1)} km)
            </span>
          </div>
          <p className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            +${deliveryRates.costoPorFraccionUsd.toFixed(2)} USD / km adicional (&gt;3 km)
          </p>
        </div>
      </div>

      {/* 2. STATS & CONTROL BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block">Total Padrón</span>
          <p className="text-xl font-display font-black text-neutral-900 dark:text-white font-mono mt-0.5">
            {totalDriversCount}
          </p>
          <span className="text-[10px] text-neutral-500">Conductores activos</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase block flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En Línea / Libres
          </span>
          <p className="text-xl font-display font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            {onlineDriversCount}
          </p>
          <span className="text-[10px] text-neutral-500">Listos para despacho</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase block flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            En Reparto Activo
          </span>
          <p className="text-xl font-display font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
            {enRutaDriversCount}
          </p>
          <span className="text-[10px] text-neutral-500">En tránsito con pedidos</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase block">
            Comisión Plataforma
          </span>
          <p className="text-xl font-display font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5">
            {deliveryRates.porcentajeComisionDelivery}%
          </p>
          <span className="text-[10px] text-neutral-500">{deliveryRates.comisionMotorizadoPorcentaje}% neto al motorizado</span>
        </div>
      </div>

      {/* 3. SEARCH, FILTERS & VIEW MODE SWITCHER */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, C.I., placa o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800/80 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Filter Pills & View Mode */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'todos'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Todos ({totalDriversCount})
            </button>
            <button
              onClick={() => setStatusFilter('disponible')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'disponible'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Libres
            </button>
            <button
              onClick={() => setStatusFilter('en_ruta')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'en_ruta'
                  ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              En Ruta
            </button>
          </div>

          {/* View Mode Toggle: Lista de Carnets (Horizontal) vs Cuadrícula */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setViewMode('lista')}
              className={`py-1.5 px-3 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                viewMode === 'lista'
                  ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Carnets Oficiales en Lista (Fichas Horizontales)"
            >
              <List className="w-4 h-4" />
              <span>Lista de Carnets</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('cuadricula')}
              className={`py-1.5 px-3 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                viewMode === 'cuadricula'
                  ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Carnets en Cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cuadrícula</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. DRIVERS ROSTER CONTAINER */}
      {filteredDrivers.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 space-y-2">
          <Bike className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-700" />
          <p className="text-sm font-medium">No se encontraron conductores con el criterio de búsqueda.</p>
        </div>
      ) : viewMode === 'lista' ? (
        /* LISTA DE FICHAS COMPACTAS (HORIZONTAL) */
        <div className="space-y-3">
          {filteredDrivers.map((driver, idx) => {
            const carnetCode = `VIX-C${String(idx + 1).padStart(3, '0')}`;
            const tf = driverTimeframes[driver.id] || 'dia';
            const activities = getDriverTrips(driver.id, tf);
            const isExpanded = expandedDriverId === driver.id;

            return (
              <DriverCarnetFicha
                key={driver.id}
                conductor={driver}
                carnetCode={carnetCode}
                isExpanded={isExpanded}
                onToggle={() => setExpandedDriverId(prev => prev === driver.id ? null : driver.id)}
                activities={activities}
                tasaBcv={tasaBcv}
                timeframe={tf}
                onTimeframeChange={(newTf) => setDriverTimeframes(prev => ({ ...prev, [driver.id]: newTf }))}
                onCall={() => openCall(driver.telefono, `${driver.nombre} ${driver.apellido}`, 'conductor')}
                onOpenDossier={() => {
                  setSelectedDriver(driver);
                  setProfileTab('viajes');
                }}
              />
            );
          })}
        </div>
      ) : (
        /* GRID DE FICHAS COMPACTAS */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredDrivers.map((driver, idx) => {
            const carnetCode = `VIX-C${String(idx + 1).padStart(3, '0')}`;
            const tf = driverTimeframes[driver.id] || 'dia';
            const activities = getDriverTrips(driver.id, tf);
            const isExpanded = expandedDriverId === driver.id;

            return (
              <div key={driver.id} className={isExpanded ? 'md:col-span-2 xl:col-span-3' : ''}>
                <DriverCarnetFicha
                  conductor={driver}
                  carnetCode={carnetCode}
                  isExpanded={isExpanded}
                  onToggle={() => setExpandedDriverId(prev => prev === driver.id ? null : driver.id)}
                  activities={activities}
                  tasaBcv={tasaBcv}
                  timeframe={tf}
                  onTimeframeChange={(newTf) => setDriverTimeframes(prev => ({ ...prev, [driver.id]: newTf }))}
                  onCall={() => openCall(driver.telefono, `${driver.nombre} ${driver.apellido}`, 'conductor')}
                  onOpenDossier={() => {
                    setSelectedDriver(driver);
                    setProfileTab('viajes');
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL: FICHA COMPLETA INTEGRAL DEL CONDUCTOR (DOSSIER OFICIAL) */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-700 max-w-3xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            
            {/* Modal Header: High Credential Badge Banner */}
            <div className="relative bg-neutral-950 text-white overflow-hidden shrink-0 border-b border-neutral-800">
              {/* Venezuelan Tricolor Ribbon */}
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-blue-600 to-red-600" />

              <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <img
                      src={selectedDriver.fotoUrl}
                      alt={selectedDriver.nombre}
                      className="w-14 h-16 sm:w-16 sm:h-20 rounded-xl sm:rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                    />
                    <span 
                      className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[8px] font-bold border border-black ${
                        selectedDriver.disponible ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                    >
                      {selectedDriver.disponible ? 'DISPONIBLE' : 'EN RUTA'}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <h3 className="text-base sm:text-lg font-display font-extrabold text-white truncate">
                        {selectedDriver.nombre} {selectedDriver.apellido}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-amber-400 text-neutral-950 whitespace-nowrap shrink-0">
                        Ficha Vixy
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 font-mono truncate">
                      C.I: {selectedDriver.legal.cedula} • Tel: {selectedDriver.telefono}
                    </p>

                    <div className="flex items-center gap-2 text-xs flex-wrap pt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-amber-400 text-neutral-950 font-mono font-bold text-[10px] shrink-0">
                        [{selectedDriver.moto.placa}]
                      </span>
                      <span className="text-neutral-400">•</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {selectedDriver.rating.toFixed(1)}
                      </span>
                      <span className="text-neutral-400">•</span>
                      <span className="text-neutral-300 truncate">{selectedDriver.totalEntregas} carreras</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openCall(selectedDriver.telefono, `${selectedDriver.nombre} ${selectedDriver.apellido}`, 'conductor')}
                    className="p-2 sm:p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition cursor-pointer shadow-xs"
                    title="Llamar al motorizado"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDriver(null)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Dossier Navigation Sub-Tabs */}
            <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 px-4 gap-1 overflow-x-auto shrink-0 scrollbar-thin">
              <button
                onClick={() => setProfileTab('viajes')}
                className={`py-3 px-3.5 text-xs font-display font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  profileTab === 'viajes'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Viajes Realizados</span>
              </button>

              <button
                onClick={() => setProfileTab('pagos')}
                className={`py-3 px-3.5 text-xs font-display font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  profileTab === 'pagos'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5 shrink-0" />
                <span>Comprobantes de Pago</span>
              </button>

              <button
                onClick={() => setProfileTab('legal')}
                className={`py-3 px-3.5 text-xs font-display font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  profileTab === 'legal'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Expediente Legal</span>
              </button>

              <button
                onClick={() => setProfileTab('vehiculo')}
                className={`py-3 px-3.5 text-xs font-display font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  profileTab === 'vehiculo'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                }`}
              >
                <Bike className="w-3.5 h-3.5 shrink-0" />
                <span>Datos del Vehículo</span>
              </button>

              <button
                onClick={() => setProfileTab('billetera')}
                className={`py-3 px-3.5 text-xs font-display font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  profileTab === 'billetera'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>Billetera Operativa</span>
              </button>
            </div>

            {/* Dossier Tab Content (Scrollable) */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* TAB 1: VIAJES REALIZADOS (DIA / SEMANA / MES) */}
              {profileTab === 'viajes' && (
                <div className="space-y-4">
                  {/* Official Tariff Rule Banner */}
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-xs">
                    <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white">
                        Regla de Tarificación Aplicada
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-300 mt-0.5">
                        Tarifa mínima de <strong>$2.00 USD</strong> hasta 3.0 km de recorrido. A partir del km 3, el costo es de <strong>$0.50 USD por cada km adicional</strong>. El conductor percibe el <strong>{deliveryRates.comisionMotorizadoPorcentaje}%</strong> neto.
                      </p>
                    </div>
                  </div>

                  {/* Timeframe Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        Período de Consulta de Carreras:
                      </span>
                    </div>

                    <div className="flex items-center bg-white dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs">
                      <button
                        onClick={() => setTimeframe('dia')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                          timeframe === 'dia'
                            ? 'bg-amber-500 text-neutral-950 font-black shadow-xs'
                            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        Día (Hoy)
                      </button>
                      <button
                        onClick={() => setTimeframe('semana')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                          timeframe === 'semana'
                            ? 'bg-amber-500 text-neutral-950 font-black shadow-xs'
                            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        Esta Semana
                      </button>
                      <button
                        onClick={() => setTimeframe('mes')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                          timeframe === 'mes'
                            ? 'bg-amber-500 text-neutral-950 font-black shadow-xs'
                            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        Este Mes
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Cards for the Timeframe */}
                  {(() => {
                    const trips = getDriverTrips(selectedDriver.id, timeframe);
                    const totalGanancia = trips.reduce((s, t) => s + t.gananciaUsd, 0);
                    const totalKm = trips.reduce((s, t) => s + t.distanciaKm, 0);
                    const comisionPagada = trips.reduce((s, t) => s + t.comisionUsd, 0);

                    return (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              Viajes en {timeframe === 'dia' ? 'el Día' : timeframe === 'semana' ? 'la Semana' : 'el Mes'}
                            </span>
                            <p className="text-xl font-display font-black text-neutral-900 dark:text-white font-mono">
                              {trips.length} carreras
                            </p>
                            <p className="text-[10px] text-neutral-500 font-mono">
                              {totalKm.toFixed(1)} km recorridos totales
                            </p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              Ganancia Neta Conductor ({deliveryRates.comisionMotorizadoPorcentaje}%)
                            </span>
                            <p className="text-xl font-display font-black text-emerald-600 dark:text-emerald-400 font-mono">
                              ${totalGanancia.toFixed(2)} USD
                            </p>
                            <p className="text-[10px] text-neutral-500 font-mono">
                              Bs. {(totalGanancia * tasaBcv).toFixed(2)}
                            </p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              Comisión Retenida ({deliveryRates.porcentajeComisionDelivery}%)
                            </span>
                            <p className="text-xl font-display font-black text-purple-600 dark:text-purple-400 font-mono">
                              ${comisionPagada.toFixed(2)} USD
                            </p>
                            <p className="text-[10px] text-neutral-500">
                              Flete plataforma Vixy
                            </p>
                          </div>
                        </div>

                        {/* List of Individual Trips with Exact Formula */}
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                              Detalle de Carreras ({trips.length})
                            </span>
                            <span className="text-[11px] text-neutral-500 font-mono">
                              Mínimo $2.00 (≤3km) • +$0.50/km adicional
                            </span>
                          </div>

                          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {trips.map(trip => (
                              <div key={trip.id} className="p-3.5 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                      #{trip.id}
                                    </span>
                                    <span className="text-neutral-400">•</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                                      {trip.comercio}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-neutral-500 truncate">
                                    Entregado a: {trip.cliente}
                                  </p>

                                  {/* Pricing Breakdown Pill */}
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-300">
                                    {trip.distanciaKm <= 3.0 ? (
                                      <span>Tarifa mínima: <strong>$2.00 USD</strong> (≤ 3.0 km)</span>
                                    ) : (
                                      <span>
                                        Tarifa: $2.00 + (+{trip.distanciaExcedenteKm.toFixed(1)} km × $0.50) = <strong>${trip.costoTotalUsd.toFixed(2)} USD</strong>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800 pt-2 sm:pt-0">
                                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                    +${trip.gananciaUsd.toFixed(2)} USD
                                  </span>
                                  <span className="block text-[10px] text-neutral-500 font-mono">
                                    Bs. {(trip.gananciaUsd * tasaBcv).toFixed(2)}
                                  </span>
                                  <span className="block text-[10px] text-neutral-400 font-mono mt-0.5">
                                    {trip.distanciaKm} km • {trip.hora}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* TAB 2: REGISTROS DE PAGOS CON VIGENCIA MAXIMA DE 30 DIAS */}
              {profileTab === 'pagos' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300">
                    <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white">
                        Política de Auditoría: Vigencia Máxima de 30 Días para Comprobantes
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">
                        Los comprobantes fotográficos de recargas y pagos tienen una vigencia legal de 30 días para su verificación y conciliación. Pasado este plazo, el comprobante se cataloga como archivado/expirado.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Historial de Comprobantes de Recarga y Pagos
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        Máx. 30 días de vigencia
                      </span>
                    </div>

                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {getDriverPayments(selectedDriver.id).map(pago => {
                        const validity = checkReceiptValidity(pago.fecha);

                        return (
                          <div key={pago.id} className="p-4 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                            <div className="flex items-start gap-3">
                              {/* Voucher thumbnail */}
                              <div 
                                onClick={() => setInspectingReceipt({
                                  url: pago.comprobanteUrl,
                                  ref: pago.referencia,
                                  date: pago.fecha,
                                  isVigente: validity.isVigente,
                                  diffDays: validity.diffDays
                                })}
                                className="relative w-14 h-14 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-950 shrink-0 cursor-pointer group"
                              >
                                <img
                                  src={pago.comprobanteUrl}
                                  alt="Comprobante"
                                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                  <Eye className="w-4 h-4" />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-neutral-900 dark:text-white">
                                    {pago.metodoPago}
                                  </span>
                                  {validity.isVigente ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      {validity.statusLabel}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" />
                                      {validity.statusLabel}
                                    </span>
                                  )}
                                </div>

                                <p className="font-mono text-neutral-500 text-[11px]">
                                  Ref: {pago.referencia} • Fecha: {pago.fecha}
                                </p>

                                <p className="text-[10px] text-neutral-400">
                                  Estatus: <strong className="text-neutral-700 dark:text-neutral-300">{pago.estado}</strong>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              <div className="text-right">
                                <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                                  ${pago.montoUsd.toFixed(2)} USD
                                </span>
                                <span className="block font-mono text-[10px] text-neutral-400">
                                  Bs. {pago.montoBs.toFixed(0)}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => setInspectingReceipt({
                                  url: pago.comprobanteUrl,
                                  ref: pago.referencia,
                                  date: pago.fecha,
                                  isVigente: validity.isVigente,
                                  diffDays: validity.diffDays
                                })}
                                className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver Comprobante</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: EXPEDIENTE LEGAL & INTT */}
              {profileTab === 'legal' && (
                <div className="space-y-4">
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/70 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-3 text-xs">
                    <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Documentación Legal Obligatoria (INTT & MPPS)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Cédula de Identidad</span>
                        <p className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                          {selectedDriver.legal.cedula}
                        </p>
                        <p className="text-[10px] text-emerald-500 font-bold">✓ Verificada en SAIME</p>
                      </div>

                      <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Licencia de Conducir (INTT)</span>
                        <p className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                          Grado {selectedDriver.legal.licenciaGrado} • {selectedDriver.legal.licenciaNumero}
                        </p>
                        <p className="text-[10px] text-emerald-500 font-bold">
                          ✓ Vigente hasta {selectedDriver.legal.licenciaVencimiento}
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Certificado Médico Vial (MPPS)</span>
                        <p className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                          {selectedDriver.legal.certificadoMedicoNumero}
                        </p>
                        <p className="text-[10px] text-emerald-500 font-bold">
                          ✓ Aprobado hasta {selectedDriver.legal.certificadoMedicoVencimiento}
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Póliza RCV (Responsabilidad Civil)</span>
                        <p className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                          {selectedDriver.legal.rcvAseguradora}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-mono break-words">
                          Póliza: {selectedDriver.legal.rcvPolizaNumero} • Hasta {selectedDriver.legal.rcvVencimiento}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: FICHA DEL VEHICULO */}
              {profileTab === 'vehiculo' && (
                <div className="space-y-4">
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/70 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-3 text-xs">
                    <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Bike className="w-4 h-4 text-amber-500" />
                      Ficha Técnica de la Motocicleta Asignada
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Marca & Modelo</span>
                        <p className="font-bold text-neutral-900 dark:text-white text-sm">
                          {selectedDriver.moto.marca} {selectedDriver.moto.modelo} ({selectedDriver.moto.ano})
                        </p>
                        <p className="text-[10px] text-neutral-500">Color: {selectedDriver.moto.color}</p>
                      </div>

                      <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Placa Legal INTT</span>
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-400 border border-neutral-900 text-neutral-950 font-mono font-black text-sm">
                          <span>VEN</span>
                          <span>{selectedDriver.moto.placa}</span>
                        </div>
                        <p className="text-[10px] text-emerald-500 font-bold mt-1">✓ Carnet de Circulación Activo</p>
                      </div>

                      <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Serial del Motor</span>
                        <p className="font-mono text-neutral-800 dark:text-neutral-200 text-xs break-all">
                          {selectedDriver.moto.serialMotor}
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Serial de Chasis (NIV)</span>
                        <p className="font-mono text-neutral-800 dark:text-neutral-200 text-xs break-all">
                          {selectedDriver.moto.serialChasis}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: BILLETERA OPERATIVA */}
              {profileTab === 'billetera' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/70 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Saldo Disponible</span>
                      <p className={`text-2xl font-black font-mono ${
                        selectedDriver.billetera.saldoUsd >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                      }`}>
                        ${selectedDriver.billetera.saldoUsd.toFixed(2)} USD
                      </p>
                      <p className="text-xs text-neutral-500 font-mono">
                        Bs. {(selectedDriver.billetera.saldoUsd * tasaBcv).toFixed(2)}
                      </p>
                    </div>

                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/70 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Límite de Saldo Negativo</span>
                      <p className="text-2xl font-black font-mono text-neutral-800 dark:text-neutral-200">
                        ${selectedDriver.billetera.limiteSaldoNegativo.toFixed(2)} USD
                      </p>
                      <p className="text-xs text-neutral-500">
                        Límite de crédito operativo para continuar tomando pedidos
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Full Image Inspection for Payment Voucher (with 30-day validity notice) */}
      {inspectingReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-60 animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-3 p-5 text-white">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h4 className="font-bold text-sm text-white font-display">
                  Auditoría de Comprobante de Pago
                </h4>
                <p className="text-xs text-neutral-400 font-mono">
                  Referencia: {inspectingReceipt.ref} • {inspectingReceipt.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingReceipt(null)}
                className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Validity Watermark Banner */}
            <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
              inspectingReceipt.isVigente
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                : 'bg-red-950/50 border-red-800 text-red-300'
            }`}>
              {inspectingReceipt.isVigente ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Comprobante Vigente:</strong> Tiene {inspectingReceipt.diffDays} días de antigüedad (Dentro del límite reglamentario de 30 días).</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span><strong>Comprobante Expirado:</strong> Tiene {inspectingReceipt.diffDays} días de antigüedad. Superó la vigencia máxima de 30 días.</span>
                </>
              )}
            </div>

            {/* Receipt Image Display */}
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-black max-h-[380px] flex items-center justify-center">
              <img
                src={inspectingReceipt.url}
                alt="Voucher de pago"
                className="max-h-[380px] w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectingReceipt(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold cursor-pointer transition"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
