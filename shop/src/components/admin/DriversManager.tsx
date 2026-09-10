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
  Filter,
  RefreshCw
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
    deliveryRates,
    approveDriver,
    rejectDriver
  } = useDelivery();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'disponible' | 'en_ruta' | 'pendiente' | 'aprobado' | 'rechazado'>('todos');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [inspectingDoc, setInspectingDoc] = useState<{ title: string; url: string } | null>(null);
  const [viewMode, setViewMode] = useState<'lista' | 'cuadricula'>('lista');
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);
  const [driverTimeframes, setDriverTimeframes] = useState<Record<string, TimeFrame>>({});
  const [selectedDriver, setSelectedDriver] = useState<Conductor | null>(null);
  const [profileTab, setProfileTab] = useState<'viajes' | 'pagos' | 'legal' | 'vehiculo' | 'billetera' | 'documentos'>('viajes');
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
      if (!driver) return false;
      const q = searchTerm.toLowerCase().trim();
      const dNom = (driver.nombre || '').toLowerCase();
      const dApe = (driver.apellido || '').toLowerCase();
      const dCed = (driver.legal?.cedula || driver.cedula || '').toLowerCase();
      const dPlaca = (driver.moto?.placa || '').toLowerCase();
      const dMod = (driver.moto?.modelo || '').toLowerCase();

      const matchesSearch = !q || dNom.includes(q) || dApe.includes(q) || dCed.includes(q) || dPlaca.includes(q) || dMod.includes(q);

      if (!matchesSearch) return false;
      if (statusFilter === 'disponible') return Boolean(driver.disponible);
      if (statusFilter === 'en_ruta') return !driver.disponible;
      if (statusFilter === 'pendiente') return (driver.status === 'pendiente' || driver.estadoVerificacion === 'pendiente' || (!driver.status && !driver.estadoVerificacion));
      if (statusFilter === 'aprobado') return (driver.status === 'aprobado' || driver.estadoVerificacion === 'aprobado');
      if (statusFilter === 'rechazado') return (driver.status === 'rechazado' || driver.estadoVerificacion === 'rechazado');
      return true;
    });
  }, [allDrivers, searchTerm, statusFilter]);

  const handleApproveDriver = async (driverId: string) => {
    setActionLoadingId(driverId);
    try {
      await approveDriver(driverId);
      if (selectedDriver && (selectedDriver.id === driverId || selectedDriver.cedula === driverId)) {
        setSelectedDriver(prev => prev ? { ...prev, status: 'aprobado' as any, estadoVerificacion: 'aprobado' as any, disponible: true } : null);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectDriver = async (driverId: string) => {
    if (!window.confirm('¿Seguro que deseas rechazar a este conductor? No podrá iniciar sesión en la app de delivery.')) return;
    setActionLoadingId(driverId);
    try {
      await rejectDriver(driverId);
      if (selectedDriver && (selectedDriver.id === driverId || selectedDriver.cedula === driverId)) {
        setSelectedDriver(prev => prev ? { ...prev, status: 'rechazado' as any, estadoVerificacion: 'rechazado' as any, disponible: false } : null);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const getDriverStatusBadge = (drv: Conductor) => {
    const st = drv.status || drv.estadoVerificacion || 'pendiente';
    if (st === 'aprobado') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" />
          <span>Verificado</span>
        </span>
      );
    }
    if (st === 'rechazado') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-black border border-rose-500/30">
          <XCircle className="w-3 h-3" />
          <span>Rechazado</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black border border-amber-500/30 animate-pulse">
        <Clock className="w-3 h-3" />
        <span>Pendiente</span>
      </span>
    );
  };

  // Compute 30-day validity rule for payment receipts
  const checkReceiptValidity = (fechaStr?: string) => {
    if (!fechaStr) {
      return {
        diffDays: 0,
        remainingDays: 0,
        isVigente: false,
        statusLabel: 'Sin comprobante'
      };
    }
    const receiptDate = new Date(String(fechaStr).replace(' ', 'T'));
    if (isNaN(receiptDate.getTime())) {
      return {
        diffDays: 0,
        remainingDays: 0,
        isVigente: false,
        statusLabel: 'Fecha inválida'
      };
    }
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

  // Trips tomados SOLO de pedidos reales del conductor (nunca datos demo)
  const getDriverTrips = (driverId: string, tf: TimeFrame) => {
    const drv = allDrivers.find(d => d.id === driverId);
    const drvName = drv ? `${drv.nombre} ${drv.apellido}` : '';
    const drvCedula = drv?.cedula || '';
    const horasPorVentana = tf === 'dia' ? 24 : tf === 'semana' ? 24 * 7 : 24 * 30;
    const cutoff = Date.now() - horasPorVentana * 60 * 60 * 1000;

    return orders
      .filter(o => {
        const c = o.conductor;
        if (!c) return false;
        if (driverId && c.id === driverId) return true;
        if (drvCedula && c.cedula && c.cedula === drvCedula) return true;
        if (drvName && `${c.nombre || ''} ${c.apellido || ''}`.toLowerCase().replace(/\s+/g, ' ').trim() === drvName.toLowerCase().replace(/\s+/g, ' ').trim()) return true;
        return false;
      })
      .filter(o => {
        if (tf === 'mes') return true;
        const ts = new Date(o.fechaCreacion || '').getTime();
        return isNaN(ts) || ts >= cutoff;
      })
      .map(o => {
        const distKm = Number(o.distanciaKm || 3.0);
        const calc = calculateDeliveryTripCost(distKm);
        const cliente = o.cliente ? `${o.cliente.nombre || ''} ${o.cliente.apellido || ''}`.trim() : '';
        return {
          id: o.codigoSeguimiento || String(o.id),
          comercio: o.comercio?.nombre || 'Comercio',
          cliente: cliente || 'Cliente',
          hora: o.fechaCreacion ? new Date(o.fechaCreacion).toLocaleString('es-VE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '',
          distanciaKm: distKm,
          estado: o.estado || 'Entregado',
          costoTotalUsd: calc.totalViajeUsd,
          costoTotalBs: calc.totalViajeBs,
          gananciaUsd: calc.gananciaMotorizadoUsd,
          comisionUsd: calc.comisionPlataformaUsd,
          distanciaExcedenteKm: calc.distanciaExcedenteKm,
          costoAdicionalUsd: calc.costoAdicionalUsd
        };
      })
      .sort((a, b) => (a.id < b.id ? 1 : -1));
  };

  // Comprobantes tomados SOLO de recargas reales del conductor (nunca datos demo)
  const getDriverPayments = (driverId: string) => {
    const drv = allDrivers.find(d => d.id === driverId);
    const drvName = drv ? `${drv.nombre} ${drv.apellido}`.toLowerCase().trim() : '';
    const drvCedula = drv?.cedula || '';

    return rechargeRequests
      .filter(r => {
        if (r.usuarioTipo !== 'conductor') return false;
        if (driverId && r.usuarioId && r.usuarioId === driverId) return true;
        if (!drvName && !drvCedula) return false;
        if (drvCedula && r.usuarioCedula && r.usuarioCedula === drvCedula) return true;
        return !!drvName && String(r.usuarioNombre || '').toLowerCase().trim().split(' ')[0] === drvName.split(' ')[0];
      })
      .map(r => ({
        id: r.id,
        montoUsd: Number(r.montoUsd || 0),
        montoBs: Number(r.montoBs || (r.montoUsd || 0) * tasaBcv),
        metodoPago: String(r.metodoPago || 'pago_movil').replace(/_/g, ' ').toUpperCase(),
        referencia: r.referencia || 'S/P',
        fecha: r.fecha || '',
        comprobanteUrl: r.comprobanteUrl || '',
        estado: r.estado === 'aprobada' ? 'Aprobado y Acreditado' : r.estado === 'rechazada' ? 'Rechazado' : 'Pendiente de Autorización'
      }));
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
              ${(deliveryRates?.tarifaBaseMinimaUsd ?? 2.00).toFixed(2)} USD
            </span>
            <span className="text-xs text-neutral-400">
              (hasta {(deliveryRates?.distanciaBaseKm ?? 3.0).toFixed(1)} km)
            </span>
          </div>
          <p className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            +${(deliveryRates?.costoPorFraccionUsd ?? 0.50).toFixed(2)} USD / km adicional (&gt;3 km)
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
                      {getDriverStatusBadge(selectedDriver)}
                    </div>

                    <p className="text-xs text-neutral-300 font-mono truncate">
                      C.I: {selectedDriver.legal?.cedula || selectedDriver.cedula || 'N/A'} • Tel: {selectedDriver.telefono}
                    </p>

                    <div className="flex items-center gap-2 text-xs flex-wrap pt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-amber-400 text-neutral-950 font-mono font-bold text-[10px] shrink-0">
                        [{selectedDriver.moto?.placa || 'S/P'}]
                      </span>
                      <span className="text-neutral-400">•</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {(selectedDriver.rating ?? 5.0).toFixed(1)}
                      </span>
                      <span className="text-neutral-400">•</span>
                      <span className="text-neutral-300 truncate">{selectedDriver.totalEntregas ?? selectedDriver.totalViajes ?? 0} carreras</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {/* Action: Aprobar Conductor */}
                  {selectedDriver.status !== 'aprobado' && selectedDriver.estadoVerificacion !== 'aprobado' && (
                    <button
                      type="button"
                      disabled={actionLoadingId === selectedDriver.id}
                      onClick={() => handleApproveDriver(selectedDriver.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50"
                      title="Verificar y autorizar conductor para recibir encomiendas"
                    >
                      {actionLoadingId === selectedDriver.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Aprobar / Verificar</span>
                    </button>
                  )}

                  {/* Action: Rechazar Conductor */}
                  {selectedDriver.status !== 'rechazado' && selectedDriver.estadoVerificacion !== 'rechazado' && (
                    <button
                      type="button"
                      disabled={actionLoadingId === selectedDriver.id}
                      onClick={() => handleRejectDriver(selectedDriver.id)}
                      className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 active:scale-95 text-rose-400 font-bold text-xs rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                      title="Rechazar expediente del conductor"
                    >
                      {actionLoadingId === selectedDriver.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>Rechazar</span>
                    </button>
                  )}

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
                onClick={() => setProfileTab('documentos')}
                className={`py-3 px-3.5 text-xs font-display font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  profileTab === 'documentos'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>Expediente y Documentos</span>
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
                              {(totalKm ?? 0).toFixed(1)} km recorridos totales
                            </p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              Ganancia Neta Conductor ({deliveryRates?.comisionMotorizadoPorcentaje ?? 85}%)
                            </span>
                            <p className="text-xl font-display font-black text-emerald-600 dark:text-emerald-400 font-mono">
                              ${(totalGanancia ?? 0).toFixed(2)} USD
                            </p>
                            <p className="text-[10px] text-neutral-500 font-mono">
                              Bs. {((totalGanancia ?? 0) * (tasaBcv ?? 78.50)).toFixed(2)}
                            </p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              Comisión Retenida ({deliveryRates?.porcentajeComisionDelivery ?? 15}%)
                            </span>
                            <p className="text-xl font-display font-black text-purple-600 dark:text-purple-400 font-mono">
                              ${(comisionPagada ?? 0).toFixed(2)} USD
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
                                    {(trip.distanciaKm ?? 0) <= 3.0 ? (
                                      <span>Tarifa mínima: <strong>$2.00 USD</strong> (≤ 3.0 km)</span>
                                    ) : (
                                      <span>
                                        Tarifa: $2.00 + (+{(trip.distanciaExcedenteKm ?? 0).toFixed(1)} km × $0.50) = <strong>${(trip.costoTotalUsd ?? 0).toFixed(2)} USD</strong>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800 pt-2 sm:pt-0">
                                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                    +${(trip.gananciaUsd ?? 0).toFixed(2)} USD
                                  </span>
                                  <span className="block text-[10px] text-neutral-500 font-mono">
                                    Bs. {((trip.gananciaUsd ?? 0) * (tasaBcv ?? 78.50)).toFixed(2)}
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
                          {selectedDriver.legal?.cedula || selectedDriver.cedula || 'N/A'}
                        </p>
                        <p className="text-[10px] text-emerald-500 font-bold">✓ Verificada</p>
                      </div>

                      <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Licencia de Conducir (INTT)</span>
                        <p className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                          Grado {selectedDriver.legal?.licenciaGrado || '2da'} • {selectedDriver.legal?.licenciaNumero || 'S/N'}
                        </p>
                        <p className="text-[10px] text-emerald-500 font-bold">
                          ✓ Vigente hasta {selectedDriver.legal?.licenciaVencimiento || '2026-12-31'}
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Certificado Médico Vial (MPPS)</span>
                        <p className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                          {selectedDriver.legal?.certificadoMedicoNumero || 'S/N'}
                        </p>
                        <p className="text-[10px] text-emerald-500 font-bold">
                          ✓ Aprobado hasta {selectedDriver.legal?.certificadoMedicoVencimiento || '2026-12-31'}
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Póliza RCV (Responsabilidad Civil)</span>
                        <p className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                          {selectedDriver.legal?.rcvAseguradora || 'Seguros Caracas'}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-mono break-words">
                          Póliza: {selectedDriver.legal?.rcvPolizaNumero || 'S/N'} • Hasta {selectedDriver.legal?.rcvVencimiento || '2026-12-31'}
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
                          {selectedDriver.moto?.marca || 'Bera'} {selectedDriver.moto?.modelo || 'SBR'} {selectedDriver.moto?.ano ? `(${selectedDriver.moto.ano})` : ''}
                        </p>
                        <p className="text-[10px] text-neutral-500">Color: {selectedDriver.moto?.color || 'Negro'}</p>
                      </div>

                      <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Placa Legal INTT</span>
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-400 border border-neutral-900 text-neutral-950 font-mono font-black text-sm">
                          <span>VEN</span>
                          <span>{selectedDriver.moto?.placa || 'S/P'}</span>
                        </div>
                        <p className="text-[10px] text-emerald-500 font-bold mt-1">✓ Carnet de Circulación Activo</p>
                      </div>

                      <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Serial del Motor</span>
                        <p className="font-mono text-neutral-800 dark:text-neutral-200 text-xs break-all">
                          {selectedDriver.moto?.serialMotor || 'N/A'}
                        </p>
                      </div>

                      <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Serial de Chasis (NIV)</span>
                        <p className="font-mono text-neutral-800 dark:text-neutral-200 text-xs break-all">
                          {selectedDriver.moto?.serialChasis || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: EXPEDIENTE Y DOCUMENTOS OFICIALES (IMGS-C-D) */}
              {profileTab === 'documentos' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span>Expediente Documental Registrado</span>
                      </h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Documentos auditables almacenados en carpeta de verificación del repartidor (imgs-c-d/deliverys/{selectedDriver.id}).
                      </p>
                    </div>
                    {getDriverStatusBadge(selectedDriver)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: 'cedula', title: 'Cédula de Identidad', file: 'cedula_identidad.svg' },
                      { key: 'licencia', title: 'Licencia de Conducir', file: 'licencia_conducir.svg' },
                      { key: 'carnet', title: 'Carnet de Circulación', file: 'carnet_circulacion.svg' },
                      { key: 'medico', title: 'Certificado Médico', file: 'certificado_medico.svg' },
                      { key: 'rcv', title: 'Póliza RCV Vigente', file: 'poliza_rcv.svg' },
                      { key: 'foto', title: 'Fotografía de Perfil', file: 'foto_perfil.svg' },
                    ].map(doc => {
                      const docUrl = `/imgs-c-d/deliverys/${selectedDriver.id}/${doc.file}`;
                      return (
                        <div key={doc.key} className="p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800 flex flex-col justify-between space-y-2 hover:border-amber-500/50 transition">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-200">{doc.title}</span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Adjunto
                            </span>
                          </div>
                          
                          <div 
                            onClick={() => setInspectingDoc({ title: doc.title, url: docUrl })}
                            className="h-32 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-center overflow-hidden cursor-pointer group relative"
                          >
                            <img 
                              src={docUrl} 
                              alt={doc.title} 
                              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                              onError={(e: any) => {
                                e.target.onerror = null;
                                e.target.src = selectedDriver.fotoUrl;
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-bold">
                              <Eye className="w-4 h-4" />
                              <span>Ampliar</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setInspectingDoc({ title: doc.title, url: docUrl })}
                            className="w-full py-1.5 text-center text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Inspeccionar Archivo</span>
                          </button>
                        </div>
                      );
                    })}
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
                        (selectedDriver.billetera?.saldoUsd ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                      }`}>
                        ${(selectedDriver.billetera?.saldoUsd ?? 0).toFixed(2)} USD
                      </p>
                      <p className="text-xs text-neutral-500 font-mono">
                        Bs. {((selectedDriver.billetera?.saldoUsd ?? 0) * (tasaBcv ?? 78.50)).toFixed(2)}
                      </p>
                    </div>

                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/70 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Límite de Saldo Negativo</span>
                      <p className="text-2xl font-black font-mono text-neutral-800 dark:text-neutral-200">
                        ${(selectedDriver.billetera?.limiteSaldoNegativo ?? -0.50).toFixed(2)} USD
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
