import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Wallet, 
  ShieldCheck, 
  User, 
  Bike, 
  Store, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  Search, 
  Lock, 
  FolderTree, 
  FileText, 
  CheckCircle2,
  RefreshCw,
  DollarSign,
  Percent,
  Receipt,
  CreditCard,
  Building,
  ExternalLink,
  Upload,
  AlertCircle,
  Clock,
  Sparkles,
  Calendar,
  TrendingUp,
  BarChart3,
  ArrowRightLeft,
  Radio,
  Check,
  Layers,
  Activity,
  PackageCheck
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { LiquidacionComercio, LiquidacionConductor, MetodoPagoTipo, Pedido } from '../../types/delivery';

export const GlobalWalletsManager: React.FC = () => {
  const { 
    globalLedger, 
    allClientWallets, 
    allDriverWallets, 
    allStoreWallets,
    liquidacionesComercios,
    liquidacionesConductores,
    porcentajeComisionComercio,
    setPorcentajeComisionComercio,
    deliveryRates,
    updateDeliveryRates,
    liquidarComercio,
    liquidarConductor,
    tasaBcv,
    orders,
    lastSyncTime,
    isLiveSyncing,
    syncCountdown,
    triggerManualSync
  } = useDelivery();

  // SubTab selector with default to the new Comprehensive Custody & Settlement Calculations
  const [activeSubTab, setActiveSubTab] = useState<'custodia_periodo' | 'comercios' | 'conductores' | 'clientes' | 'comprobantes'>('custodia_periodo');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Temporal Filter for All Calculations: 'dia' | 'semana' | 'mes' | 'historico'
  const [periodoFiltro, setPeriodoFiltro] = useState<'dia' | 'semana' | 'mes' | 'historico'>('dia');

  // Commission settings editing
  const [editingCommissions, setEditingCommissions] = useState(false);
  const [comisionComercioInput, setComisionComercioInput] = useState(porcentajeComisionComercio.toString());
  const [comisionDeliveryInput, setComisionDeliveryInput] = useState((deliveryRates?.porcentajeComisionDelivery ?? 15).toString());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Selected Wallet User for Individual Inspection (Shows ONLY this wallet's data)
  const [selectedIndividualStore, setSelectedIndividualStore] = useState<any | null>(null);
  const [selectedIndividualDriver, setSelectedIndividualDriver] = useState<any | null>(null);
  const [selectedClientUser, setSelectedClientUser] = useState<any | null>(null);

  // Liquidation Modals
  const [liquidationModalTarget, setLiquidationModalTarget] = useState<{
    tipo: 'comercio' | 'conductor';
    id: string;
    nombre: string;
    identificador: string; // RIF o Cédula
    montoBrutoDisponible: number;
    saldoEnWalletUsd: number;
  } | null>(null);

  const [liqForm, setLiqForm] = useState({
    montoBruto: '',
    metodoPago: 'pago_movil' as MetodoPagoTipo,
    bancoDestino: 'Banesco (0134)',
    cuentaTelefonoDestino: '',
    referenciaBancaria: '',
    notas: '',
    comprobanteUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80'
  });

  // Receipt Inspection Modal
  const [inspectingReceipt, setInspectingReceipt] = useState<{
    tipo: 'comercio' | 'conductor';
    titulo: string;
    url: string;
    referencia: string;
    banco?: string;
    cuentaTelefono?: string;
    montoBrutoUsd: number;
    comisionEmpresaUsd: number;
    montoNetoUsd: number;
    montoNetoBs: number;
    tasaBcv: number;
    fecha: string;
    autorizadoPor: string;
    comprobanteRutaSql: string;
    notas?: string;
  } | null>(null);

  const handleSaveCommissions = (e: React.FormEvent) => {
    e.preventDefault();
    const cStore = parseFloat(comisionComercioInput);
    const cDeliv = parseFloat(comisionDeliveryInput);
    if (!isNaN(cStore) && cStore >= 0 && cStore <= 50) {
      setPorcentajeComisionComercio(cStore);
    }
    if (!isNaN(cDeliv) && cDeliv >= 0 && cDeliv <= 50) {
      updateDeliveryRates({
        porcentajeComisionDelivery: cDeliv,
        comisionMotorizadoPorcentaje: 100 - cDeliv
      });
    }
    setSaveSuccessMsg(true);
    setEditingCommissions(false);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleOpenLiquidation = (target: typeof liquidationModalTarget) => {
    if (!target) return;
    setLiquidationModalTarget(target);
    setLiqForm({
      montoBruto: target.saldoEnWalletUsd > 0 ? target.saldoEnWalletUsd.toFixed(2) : target.montoBrutoDisponible.toFixed(2),
      metodoPago: 'pago_movil',
      bancoDestino: target.tipo === 'comercio' ? 'Banesco (0134)' : 'Banco de Venezuela (0102)',
      cuentaTelefonoDestino: target.tipo === 'comercio' ? '0414-9988221' : '0412-5544332',
      referenciaBancaria: `REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
      notas: `Liquidación de fondos autorizada por el backend administrativo para ${target.nombre}.`,
      comprobanteUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80'
    });
  };

  const handleProcessLiquidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liquidationModalTarget) return;

    const montoBruto = parseFloat(liqForm.montoBruto);
    if (isNaN(montoBruto) || montoBruto <= 0) {
      alert('Por favor ingrese un monto válido');
      return;
    }

    if (!liqForm.referenciaBancaria.trim()) {
      alert('Por favor ingrese el número de comprobante o referencia bancaria');
      return;
    }

    if (liquidationModalTarget.tipo === 'comercio') {
      const comisionEmpresaUsd = parseFloat(((montoBruto * porcentajeComisionComercio) / 100).toFixed(2));
      const montoNetoUsd = parseFloat((montoBruto - comisionEmpresaUsd).toFixed(2));
      const montoNetoBs = parseFloat((montoNetoUsd * tasaBcv).toFixed(2));
      const sqlRuta = `/uploads/comprobantes_liquidaciones/liq_com_${Date.now()}.png`;

      liquidarComercio({
        comercioId: liquidationModalTarget.id,
        comercioNombre: liquidationModalTarget.nombre,
        montoBrutoUsd: montoBruto,
        comisionEmpresaUsd,
        montoNetoUsd,
        montoNetoBs,
        tasaBcv,
        metodoPago: liqForm.metodoPago,
        bancoDestino: liqForm.bancoDestino,
        cuentaTelefonoDestino: liqForm.cuentaTelefonoDestino,
        referenciaBancaria: liqForm.referenciaBancaria,
        comprobanteUrl: liqForm.comprobanteUrl,
        comprobanteRutaSql: sqlRuta,
        estado: 'procesado',
        autorizadoPor: 'vixydely (Super Admin)',
        notas: liqForm.notas
      });
    } else {
      const comisionPct = deliveryRates?.porcentajeComisionDelivery ?? 15;
      const comisionEmpresaUsd = parseFloat(((montoBruto * comisionPct) / 100).toFixed(2));
      const montoNetoUsd = parseFloat((montoBruto - comisionEmpresaUsd).toFixed(2));
      const montoNetoBs = parseFloat((montoNetoUsd * tasaBcv).toFixed(2));
      const sqlRuta = `/uploads/comprobantes_liquidaciones/liq_cond_${Date.now()}.png`;

      liquidarConductor({
        conductorId: liquidationModalTarget.id,
        conductorNombre: liquidationModalTarget.nombre,
        montoBrutoUsd: montoBruto,
        comisionEmpresaUsd,
        montoNetoUsd,
        montoNetoBs,
        tasaBcv,
        carrerasLiquidadas: 10,
        metodoPago: liqForm.metodoPago,
        bancoDestino: liqForm.bancoDestino,
        cuentaTelefonoDestino: liqForm.cuentaTelefonoDestino,
        referenciaBancaria: liqForm.referenciaBancaria,
        comprobanteUrl: liqForm.comprobanteUrl,
        comprobanteRutaSql: sqlRuta,
        estado: 'procesado',
        autorizadoPor: 'vixydely (Super Admin)',
        notas: liqForm.notas
      });
    }

    setLiquidationModalTarget(null);
  };

  // Helper for period comparison (Day / Week / Month / All)
  const isDateInPeriod = (dateStr?: string, period: 'dia' | 'semana' | 'mes' | 'historico' = 'dia') => {
    if (period === 'historico' || !dateStr) return true;
    try {
      const cleanDate = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr;
      const itemDate = new Date(cleanDate);
      if (isNaN(itemDate.getTime())) return true;
      const now = new Date();
      const diffMs = Math.abs(now.getTime() - itemDate.getTime());
      const diffHours = diffMs / (1000 * 60 * 60);

      if (period === 'dia') {
        return diffHours <= 24 || itemDate.toDateString() === now.toDateString();
      }
      if (period === 'semana') {
        return diffHours <= 24 * 7;
      }
      if (period === 'mes') {
        return diffHours <= 24 * 31 || (itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear());
      }
      return true;
    } catch {
      return true;
    }
  };

  // Comprehensive Custody, Delivery, and Profit Settlement Calculations in USD and Bs
  const periodStats = useMemo(() => {
    // 1. Deliverys realizados y completados
    const deliverysEntregados = orders.filter(o => {
      const isEntregado = o.estado === 'entregado';
      const fecha = o.creadoEn || (o as any).fechaHora || (o as any).actualizadoEn || '';
      return isEntregado && isDateInPeriod(fecha, periodoFiltro);
    });

    const cantDeliverysRealizados = deliverysEntregados.length;
    const fleteDeliverysBrutoUsd = deliverysEntregados.reduce((acc, o) => acc + (o.costoEnvioUsd ?? (o as any).costoEnvio ?? 0), 0);
    const fleteDeliverysBrutoBs = fleteDeliverysBrutoUsd * tasaBcv;

    // Descuento de comision delivery en wallet
    const comisionDeliveryPct = deliveryRates?.porcentajeComisionDelivery ?? 15;
    const descuentoDeliveryUsd = parseFloat(((fleteDeliverysBrutoUsd * comisionDeliveryPct) / 100).toFixed(2));
    const descuentoDeliveryBs = parseFloat((descuentoDeliveryUsd * tasaBcv).toFixed(2));

    // Dinero neto acreditado/enviado al conductor
    const dineroEnviadoConductorUsd = parseFloat((fleteDeliverysBrutoUsd - descuentoDeliveryUsd).toFixed(2));
    const dineroEnviadoConductorBs = parseFloat((dineroEnviadoConductorUsd * tasaBcv).toFixed(2));

    // Ventas de comercios en custodia acreditadas
    const ventasComerciosBrutoUsd = deliverysEntregados.reduce((acc, o) => acc + (o.montoSubtotalUsd ?? (o as any).subtotal ?? 0), 0);
    const ventasComerciosBrutoBs = ventasComerciosBrutoUsd * tasaBcv;

    // Descuento de comision a comercios
    const descuentoComercioUsd = parseFloat(((ventasComerciosBrutoUsd * porcentajeComisionComercio) / 100).toFixed(2));
    const descuentoComercioBs = parseFloat((descuentoComercioUsd * tasaBcv).toFixed(2));

    // Dinero neto enviado/liquidado al comercio
    const dineroEnviadoComercioUsd = parseFloat((ventasComerciosBrutoUsd - descuentoComercioUsd).toFixed(2));
    const dineroEnviadoComercioBs = parseFloat((dineroEnviadoComercioUsd * tasaBcv).toFixed(2));

    // Ganancias que dan el comercio y el delivery a la empresa
    const gananciaComercioUsd = descuentoComercioUsd;
    const gananciaComercioBs = descuentoComercioBs;
    const gananciaDeliveryUsd = descuentoDeliveryUsd;
    const gananciaDeliveryBs = descuentoDeliveryBs;
    const gananciaTotalEmpresaUsd = parseFloat((gananciaComercioUsd + gananciaDeliveryUsd).toFixed(2));
    const gananciaTotalEmpresaBs = parseFloat((gananciaTotalEmpresaUsd * tasaBcv).toFixed(2));

    // Fondos en custodia activos (pedidos en curso no entregados aún)
    const pedidosEnCustodia = orders.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado');
    const custodiaActivaUsd = pedidosEnCustodia.reduce((acc, o) => acc + (o.montoTotalUsd ?? (o as any).total ?? 0), 0);
    const custodiaActivaBs = custodiaActivaUsd * tasaBcv;

    // Liquidaciones bancarias procesadas en el período
    const liqsComerciosPeriodo = liquidacionesComercios.filter(l => isDateInPeriod(l.fecha, periodoFiltro));
    const liqsConductoresPeriodo = liquidacionesConductores.filter(l => isDateInPeriod(l.fecha, periodoFiltro));

    return {
      cantDeliverysRealizados,
      fleteDeliverysBrutoUsd,
      fleteDeliverysBrutoBs,
      comisionDeliveryPct,
      descuentoDeliveryUsd,
      descuentoDeliveryBs,
      dineroEnviadoConductorUsd,
      dineroEnviadoConductorBs,
      ventasComerciosBrutoUsd,
      ventasComerciosBrutoBs,
      descuentoComercioUsd,
      descuentoComercioBs,
      dineroEnviadoComercioUsd,
      dineroEnviadoComercioBs,
      gananciaComercioUsd,
      gananciaComercioBs,
      gananciaDeliveryUsd,
      gananciaDeliveryBs,
      gananciaTotalEmpresaUsd,
      gananciaTotalEmpresaBs,
      custodiaActivaUsd,
      custodiaActivaBs,
      pedidosEnCustodiaCount: pedidosEnCustodia.length,
      pedidosEntregadosList: deliverysEntregados,
      liqsComerciosPeriodo,
      liqsConductoresPeriodo
    };
  }, [orders, liquidacionesComercios, liquidacionesConductores, periodoFiltro, tasaBcv, porcentajeComisionComercio, deliveryRates]);

  return (
    <div className="space-y-4 text-neutral-900 dark:text-neutral-100">
      {/* Live Synchronization & Period Navigation Bar */}
      <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Real-time 5s Sync Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold tracking-tight">Sincronización en Vivo (~5s)</span>
          </div>

          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono flex items-center gap-2">
            <span>Último sync: <strong className="text-neutral-800 dark:text-neutral-200">{lastSyncTime}</strong></span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span>Próximo ciclo: <strong className="text-purple-600 dark:text-purple-400">{syncCountdown}s</strong></span>
          </div>

          <button
            onClick={triggerManualSync}
            disabled={isLiveSyncing}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-purple-600 transition cursor-pointer"
            title="Forzar sincronización inmediata de 5s"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>

        {/* Temporal Filters: Day / Week / Month / All */}
        <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
          <button
            onClick={() => setPeriodoFiltro('dia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              periodoFiltro === 'dia'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Por Día (24h)</span>
          </button>
          <button
            onClick={() => setPeriodoFiltro('semana')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              periodoFiltro === 'semana'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Por Semana (7d)</span>
          </button>
          <button
            onClick={() => setPeriodoFiltro('mes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              periodoFiltro === 'mes'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Por Mes (30d)</span>
          </button>
          <button
            onClick={() => setPeriodoFiltro('historico')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              periodoFiltro === 'historico'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Histórico</span>
          </button>
        </div>

        {/* BCV Official Rate Tag */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-mono font-bold">
          <DollarSign className="w-3.5 h-3.5 text-purple-600" />
          <span>Tasa BCV: {tasaBcv.toFixed(2)} Bs / $</span>
        </div>
      </div>

      {/* Master Custody Ledger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Custodia */}
        <div className="bg-neutral-950 text-white p-4 rounded-2xl border border-purple-900/40 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-purple-300 font-medium">
            <span>Custodia Global Vixy</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono tracking-tight text-white">
              ${globalLedger.totalGlobalCustodiaUsd.toFixed(2)}
            </span>
            <span className="text-xs text-neutral-400 block font-mono">
              Bs. {(globalLedger.totalGlobalCustodiaUsd * tasaBcv).toFixed(2)}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-purple-300/80 font-mono">
            Balance total en cuentas bancarias
          </div>
        </div>

        {/* Comercios */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Carteras Comercios</span>
            <Store className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono tracking-tight text-neutral-900 dark:text-white">
              ${globalLedger.totalComerciosUsd.toFixed(2)}
            </span>
            <span className="text-xs text-neutral-500 block font-mono">
              {allStoreWallets.length} comercios registrados
            </span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            Comisión de empresa: {porcentajeComisionComercio}% separada
          </div>
        </div>

        {/* Conductores */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Carteras Repartidores</span>
            <Bike className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono tracking-tight text-neutral-900 dark:text-white">
              ${globalLedger.totalConductoresUsd.toFixed(2)}
            </span>
            <span className="text-xs text-neutral-500 block font-mono">
              {allDriverWallets.length} motorizados activos
            </span>
          </div>
          <div className="mt-2 text-[10px] text-purple-600 dark:text-purple-400 font-medium">
            Comisión delivery: {deliveryRates?.porcentajeComisionDelivery ?? 15}% descontada
          </div>
        </div>

        {/* Clientes */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Carteras Clientes</span>
            <User className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono tracking-tight text-neutral-900 dark:text-white">
              ${globalLedger.totalClientesUsd.toFixed(2)}
            </span>
            <span className="text-xs text-neutral-500 block font-mono">
              {allClientWallets.length} clientes con balance
            </span>
          </div>
          <div className="mt-2 text-[10px] text-neutral-400">
            Fondos prepagados para pedidos
          </div>
        </div>
      </div>

      {/* Regulación de Comisiones de la Empresa (Editable en Backend) */}
      <div className="p-4 bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              %
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                Separación Automática de Comisiones de la Empresa
                {saveSuccessMsg && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-normal animate-pulse">
                    ¡Porcentajes actualizados en SQL!
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                Los montos de la empresa son calculados y separados automáticamente. Al liquidar a un comercio o delivery, se paga únicamente su monto neto con la comisión descontada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!editingCommissions ? (
              <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-900/50 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 block">Comisión Comercios:</span>
                  <span className="font-bold font-mono text-purple-600 dark:text-purple-400">{porcentajeComisionComercio}%</span>
                </div>
                <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800" />
                <div>
                  <span className="text-[10px] text-neutral-400 block">Comisión Delivery:</span>
                  <span className="font-bold font-mono text-purple-600 dark:text-purple-400">{deliveryRates?.porcentajeComisionDelivery ?? 15}%</span>
                </div>
                <button
                  onClick={() => setEditingCommissions(true)}
                  className="ml-2 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition"
                >
                  Editar %
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveCommissions} className="flex items-center gap-2 bg-white dark:bg-neutral-900 p-1.5 rounded-xl border border-purple-300">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[10px] text-neutral-500 font-medium">Comercio:</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    value={comisionComercioInput}
                    onChange={(e) => setComisionComercioInput(e.target.value)}
                    className="w-14 px-1.5 py-0.5 text-xs font-mono font-bold bg-neutral-100 dark:bg-neutral-800 rounded-md border border-neutral-300 text-center"
                  />
                  <span className="text-xs font-mono">%</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[10px] text-neutral-500 font-medium">Delivery:</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    value={comisionDeliveryInput}
                    onChange={(e) => setComisionDeliveryInput(e.target.value)}
                    className="w-14 px-1.5 py-0.5 text-xs font-mono font-bold bg-neutral-100 dark:bg-neutral-800 rounded-md border border-neutral-300 text-center"
                  />
                  <span className="text-xs font-mono">%</span>
                </div>
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-bold cursor-pointer"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCommissions(false)}
                  className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-md text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Tabs & Entity Search */}
      <div className="bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveSubTab('custodia_periodo')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'custodia_periodo'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Acreditaciones Custodia & Ganancias ($ / Bs)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('comercios')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'comercios'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Cartera Comercios ({allStoreWallets.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('conductores')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'conductores'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Cartera Repartidores ({allDriverWallets.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('comprobantes')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'comprobantes'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Comprobantes y Liquidaciones SQL ({liquidacionesComercios.length + liquidacionesConductores.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('clientes')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'clientes'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Clientes ({allClientWallets.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por comercio, RIF o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:border-purple-500"
          />
        </div>
      </div>

      {/* 0. TAB ACREDITACIONES CUSTODIA & GANANCIAS EN WALLET (POR DÍA, POR SEMANA, POR MES) */}
      {activeSubTab === 'custodia_periodo' && (
        <div className="space-y-4">
          {/* Header Banner with Period Summary */}
          <div className="p-4 rounded-2xl bg-linear-to-r from-purple-900/40 via-purple-950/60 to-neutral-900 border border-purple-800/40 text-white flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                  Cálculos Financieros en Tiempo Real
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Período: <strong className="text-white capitalize">{periodoFiltro === 'dia' ? 'Hoy (Últimas 24h)' : periodoFiltro === 'semana' ? 'Última Semana (7 Días)' : periodoFiltro === 'mes' ? 'Mes en Curso (30 Días)' : 'Histórico Global'}</strong>
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Acreditaciones automáticas de saldo en custodia a las wallets al completarse los deliverys, con desglose exacto de descuentos de comisión en <strong className="text-emerald-400">$ USD</strong> y en <strong className="text-emerald-400">Bs (Tasa BCV {tasaBcv.toFixed(2)})</strong>.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-purple-300 block font-medium">Ganancia Neta Empresa</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ${periodStats.gananciaTotalEmpresaUsd.toFixed(2)}
                </span>
                <span className="text-xs text-neutral-300 font-mono">
                  (Bs. {periodStats.gananciaTotalEmpresaBs.toFixed(2)})
                </span>
              </div>
            </div>
          </div>

          {/* Core 8 Financial Ledger Cards ($ and Bs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Deliverys Realizados y Acreditados */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-bold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                  <PackageCheck className="w-4 h-4 text-purple-600" />
                  Deliverys Realizados
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                  {periodStats.cantDeliverysRealizados} entregas
                </span>
              </div>
              <div>
                <span className="text-xl font-black font-mono text-neutral-900 dark:text-white block">
                  ${periodStats.fleteDeliverysBrutoUsd.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  Bs. {periodStats.fleteDeliverysBrutoBs.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight">
                Monto bruto de fletes de delivery generados y acreditados a las wallets en el período.
              </p>
            </div>

            {/* 2. Descuento de Deliverys Hechos en la Wallet */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-bold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                  <Percent className="w-4 h-4 text-purple-600" />
                  Descuento Delivery Wallet
                </span>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                  {periodStats.comisionDeliveryPct}% comisión
                </span>
              </div>
              <div>
                <span className="text-xl font-black font-mono text-purple-600 dark:text-purple-400 block">
                  -${periodStats.descuentoDeliveryUsd.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  -Bs. {periodStats.descuentoDeliveryBs.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight">
                Retención de comisión de la empresa aplicada al motorizado en cada carrera entregada.
              </p>
            </div>

            {/* 3. Dinero que se le Envía al Conductor */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-bold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                  <Bike className="w-4 h-4 text-emerald-600" />
                  Dinero al Conductor
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Neto Acreditado
                </span>
              </div>
              <div>
                <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                  ${periodStats.dineroEnviadoConductorUsd.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  Bs. {periodStats.dineroEnviadoConductorBs.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight">
                Flete neto pagado al conductor con el descuento de comisión ya deducido ({100 - periodStats.comisionDeliveryPct}% restante).
              </p>
            </div>

            {/* 4. Ventas Comercios en Custodia */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-bold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                  <Store className="w-4 h-4 text-purple-600" />
                  Ventas Comercios (Custodia)
                </span>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                  Bruto Acreditado
                </span>
              </div>
              <div>
                <span className="text-xl font-black font-mono text-neutral-900 dark:text-white block">
                  ${periodStats.ventasComerciosBrutoUsd.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  Bs. {periodStats.ventasComerciosBrutoBs.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight">
                Ventas de alimentos y artículos acreditadas desde custodia al entregarse las órdenes.
              </p>
            </div>

            {/* 5. Descuento a Comercios */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-bold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                  <Percent className="w-4 h-4 text-purple-600" />
                  Descuento Comercios
                </span>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                  {porcentajeComisionComercio}% actual
                </span>
              </div>
              <div>
                <span className="text-xl font-black font-mono text-purple-600 dark:text-purple-400 block">
                  -${periodStats.descuentoComercioUsd.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  -Bs. {periodStats.descuentoComercioBs.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight">
                Comisión de empresa sobre ventas. Comienza en 0% sin afectar los precios de Vixy Store.
              </p>
            </div>

            {/* 6. Dinero que se le Envía al Comercio */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-bold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                  <Building className="w-4 h-4 text-emerald-600" />
                  Dinero al Comercio
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Neto a Liquidar
                </span>
              </div>
              <div>
                <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                  ${periodStats.dineroEnviadoComercioUsd.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  Bs. {periodStats.dineroEnviadoComercioBs.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight">
                Monto que se le liquida a las tiendas restando el porcentaje de comisión fijado ({porcentajeComisionComercio}%).
              </p>
            </div>

            {/* 7. Ganancia Total Empresa (Comercio + Delivery) */}
            <div className="p-4 rounded-2xl bg-linear-to-br from-purple-900/30 to-purple-950/40 border border-purple-800/40 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-purple-300 font-medium">
                <span className="font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  Ganancia Empresa
                </span>
                <span className="text-[10px] text-purple-300 font-bold">
                  Comercio + Delivery
                </span>
              </div>
              <div>
                <span className="text-xl font-black font-mono text-white block">
                  ${periodStats.gananciaTotalEmpresaUsd.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-purple-300">
                  Bs. {periodStats.gananciaTotalEmpresaBs.toFixed(2)}
                </span>
              </div>
              <div className="text-[10px] text-neutral-300 space-y-0.5 font-mono">
                <div className="flex justify-between">
                  <span>De Comercio ({porcentajeComisionComercio}%):</span>
                  <span>${periodStats.gananciaComercioUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>De Delivery ({periodStats.comisionDeliveryPct}%):</span>
                  <span>${periodStats.gananciaDeliveryUsd.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 8. Saldo en Custodia Activo en Tránsito */}
            <div className="p-4 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-bold flex items-center gap-1.5 text-neutral-200">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Custodia en Tránsito
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 text-[10px] font-bold">
                  {periodStats.pedidosEnCustodiaCount} pedidos
                </span>
              </div>
              <div>
                <span className="text-xl font-black font-mono text-white block">
                  ${periodStats.custodiaActivaUsd.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  Bs. {periodStats.custodiaActivaBs.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight">
                Dinero retenido en custodia en espera de confirmación de entrega para acreditarse.
              </p>
            </div>
          </div>

          {/* Detailed Audit Table of Deliveries & Custody Settlements */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-purple-600" />
                  Auditoría de Deliverys y Acreditaciones a la Wallet ({periodStats.pedidosEntregadosList.length} entregas)
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Detalle individual de cada orden entregada con los importes en $ y Bs acreditados a conductores y comercios.
                </p>
              </div>
              <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                1 USD = {tasaBcv.toFixed(2)} Bs (BCV)
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-100 dark:bg-neutral-800/60 text-neutral-500 font-bold border-b border-neutral-200 dark:border-neutral-700">
                    <th className="p-3">Pedido & Fecha</th>
                    <th className="p-3">Comercio Beneficiario</th>
                    <th className="p-3">Conductor Asignado</th>
                    <th className="p-3 text-right">Flete Delivery ($ / Bs)</th>
                    <th className="p-3 text-right">Comisión Delivery</th>
                    <th className="p-3 text-right">Dinero al Conductor</th>
                    <th className="p-3 text-right">Venta Tienda ($ / Bs)</th>
                    <th className="p-3 text-right">Comisión Comercio</th>
                    <th className="p-3 text-right">Dinero al Comercio</th>
                    <th className="p-3 text-right">Ganancia Vixy</th>
                    <th className="p-3 text-center">Estado Wallet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
                  {periodStats.pedidosEntregadosList.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-neutral-400 font-sans">
                        <PackageCheck className="w-8 h-8 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
                        <p className="font-bold text-sm text-neutral-700 dark:text-neutral-300">No hay entregas registradas en este período</p>
                        <p className="text-xs mt-1">Prueba seleccionando "Por Semana", "Por Mes" o "Histórico" en la barra superior.</p>
                      </td>
                    </tr>
                  ) : (
                    periodStats.pedidosEntregadosList.map((ped: Pedido) => {
                      const flete = ped.costoEnvioUsd ?? (ped as any).costoEnvio ?? 0;
                      const fleteBs = flete * tasaBcv;
                      const comisionDelivUsd = (flete * periodStats.comisionDeliveryPct) / 100;
                      const comisionDelivBs = comisionDelivUsd * tasaBcv;
                      const netoConductorUsd = flete - comisionDelivUsd;
                      const netoConductorBs = netoConductorUsd * tasaBcv;

                      const venta = ped.montoSubtotalUsd ?? (ped as any).subtotal ?? 0;
                      const ventaBs = venta * tasaBcv;
                      const comisionComUsd = (venta * porcentajeComisionComercio) / 100;
                      const comisionComBs = comisionComUsd * tasaBcv;
                      const netoComercioUsd = venta - comisionComUsd;
                      const netoComercioBs = netoComercioUsd * tasaBcv;

                      const gananciaVixyUsd = comisionDelivUsd + comisionComUsd;
                      const gananciaVixyBs = gananciaVixyUsd * tasaBcv;

                      return (
                        <tr key={ped.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition">
                          <td className="p-3">
                            <span className="font-bold text-neutral-900 dark:text-white block font-sans">
                              {ped.codigoSeguimiento || ped.id}
                            </span>
                            <span className="text-[10px] text-neutral-400 block">
                              {ped.creadoEn || '2026-09-07 10:15'}
                            </span>
                          </td>
                          <td className="p-3 font-sans">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 block truncate max-w-[130px]">
                              {ped.comercio?.nombre || 'Comercio Vixy'}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {ped.comercio?.rif || 'RIF: J-50019281'}
                            </span>
                          </td>
                          <td className="p-3 font-sans">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 block truncate max-w-[120px]">
                              {ped.conductor?.nombre || 'Motorizado Asignado'}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {ped.conductor?.telefono || '+58 412-0000000'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-bold text-neutral-900 dark:text-white block">
                              ${flete.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              Bs. {fleteBs.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-3 text-right text-purple-600 dark:text-purple-400">
                            <span className="font-bold block">
                              -${comisionDelivUsd.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              -Bs. {comisionDelivBs.toFixed(2)} ({periodStats.comisionDeliveryPct}%)
                            </span>
                          </td>
                          <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                            <span className="block">${netoConductorUsd.toFixed(2)}</span>
                            <span className="text-[10px] text-neutral-500">Bs. {netoConductorBs.toFixed(2)}</span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-bold text-neutral-900 dark:text-white block">
                              ${venta.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              Bs. {ventaBs.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-3 text-right text-purple-600 dark:text-purple-400">
                            <span className="font-bold block">
                              -${comisionComUsd.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              -Bs. {comisionComBs.toFixed(2)} ({porcentajeComisionComercio}%)
                            </span>
                          </td>
                          <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                            <span className="block">${netoComercioUsd.toFixed(2)}</span>
                            <span className="text-[10px] text-neutral-500">Bs. {netoComercioBs.toFixed(2)}</span>
                          </td>
                          <td className="p-3 text-right font-bold text-purple-700 dark:text-purple-300">
                            <span className="block">+${gananciaVixyUsd.toFixed(2)}</span>
                            <span className="text-[10px] text-neutral-400">Bs. {gananciaVixyBs.toFixed(2)}</span>
                          </td>
                          <td className="p-3 text-center font-sans">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                              <Check className="w-3 h-3" />
                              Acreditado
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 1. TAB COMERCIOS (Lista Detallada con Separación de Comisión y Estado de Fondos) */}
      {activeSubTab === 'comercios' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
              Mostrando ingresos globales y desglose individual por tienda con retiros y fondos actuales en wallet.
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-mono font-bold">
              Tasa BCV Oficial: {tasaBcv.toFixed(2)} Bs/$
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-850 text-neutral-500 uppercase text-[10px] font-bold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-3">Comercio / RIF</th>
                  <th className="p-3 text-right">Ventas Brutas</th>
                  <th className="p-3 text-right">Comisión Vixy ({porcentajeComisionComercio}%)</th>
                  <th className="p-3 text-right">Ingreso Neto</th>
                  <th className="p-3 text-right">Monto Retirado</th>
                  <th className="p-3 text-right">Dinero en Wallet</th>
                  <th className="p-3 text-center">Estado de Fondos</th>
                  <th className="p-3 text-center">Gestión Individual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {allStoreWallets
                  .filter(s => {
                    if (!searchTerm.trim()) return true;
                    const q = searchTerm.toLowerCase();
                    return s.comercioNombre.toLowerCase().includes(q) || s.rif.toLowerCase().includes(q);
                  })
                  .map(s => {
                    const tieneDineroEnWallet = s.saldoEnWalletUsd > 0;
                    return (
                      <tr key={s.comercioId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition">
                        <td className="p-3">
                          <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-purple-600" />
                            {s.comercioNombre}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            RIF: {s.rif} • ID: {s.comercioId}
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-neutral-900 dark:text-white">
                          ${s.ventasBrutasUsd.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono text-purple-600 dark:text-purple-400 font-bold">
                          -${s.comisionEmpresaUsd.toFixed(2)}
                          <span className="block text-[9px] text-neutral-400 font-normal">Retenido por Vixy</span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ${s.ingresoNetoUsd.toFixed(2)}
                          <span className="block text-[9px] text-neutral-400 font-mono">
                            Bs. {(s.ingresoNetoUsd * tasaBcv).toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-neutral-500">
                          -${s.totalRetiradoUsd.toFixed(2)}
                          <span className="block text-[9px] text-neutral-400">
                            {s.liquidaciones.length} transferencias
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold">
                          <span className={tieneDineroEnWallet ? 'text-emerald-600 dark:text-emerald-400 text-sm' : 'text-neutral-400'}>
                            ${s.saldoEnWalletUsd.toFixed(2)} USD
                          </span>
                          <span className="block text-[9px] text-neutral-400 font-mono">
                            Bs. {s.saldoEnWalletBs.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {tieneDineroEnWallet ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Dinero en Wallet (${s.saldoEnWalletUsd.toFixed(2)})
                            </span>
                          ) : s.ventasBrutasUsd > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              Totalmente Retirado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                              Sin Movimientos
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Ver cartera individual aislada */}
                            <button
                              onClick={() => setSelectedIndividualStore(s)}
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer text-xs font-bold flex items-center gap-1"
                              title="Ver únicamente los ingresos de este comercio"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Cartera</span>
                            </button>

                            {/* Liquidar pago */}
                            <button
                              onClick={() => handleOpenLiquidation({
                                tipo: 'comercio',
                                id: s.comercioId,
                                nombre: s.comercioNombre,
                                identificador: s.rif,
                                montoBrutoDisponible: s.ventasBrutasUsd,
                                saldoEnWalletUsd: s.saldoEnWalletUsd
                              })}
                              disabled={!tieneDineroEnWallet}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                                tieneDineroEnWallet
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                              }`}
                              title={tieneDineroEnWallet ? 'Pagar ingresos netos y registrar comprobante SQL' : 'No posee fondos pendientes por retirar'}
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Liquidar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. TAB REPARTIDORES (Delivery) */}
      {activeSubTab === 'conductores' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
              Ingresos individuales de repartidores con descuento automático de comisión de la empresa ({deliveryRates?.porcentajeComisionDelivery ?? 15}%).
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-mono font-bold">
              Descuento Empresa Aplicado al Liquidar
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-850 text-neutral-500 uppercase text-[10px] font-bold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-3">Repartidor / Cédula</th>
                  <th className="p-3 text-center">Carreras</th>
                  <th className="p-3 text-right">Ingresos Brutos Flete</th>
                  <th className="p-3 text-right">Comisión Empresa ({deliveryRates?.porcentajeComisionDelivery ?? 15}%)</th>
                  <th className="p-3 text-right">Ganancia Neta</th>
                  <th className="p-3 text-right">Ya Pagado</th>
                  <th className="p-3 text-right">Pendiente en Wallet</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-center">Gestión Individual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {allDriverWallets
                  .filter(d => {
                    if (!searchTerm.trim()) return true;
                    const q = searchTerm.toLowerCase();
                    return d.conductorNombre.toLowerCase().includes(q) || d.cedula.toLowerCase().includes(q);
                  })
                  .map(d => {
                    const tienePendiente = d.saldoEnWalletUsd > 0;
                    return (
                      <tr key={d.conductorId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition">
                        <td className="p-3">
                          <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <Bike className="w-3.5 h-3.5 text-purple-600" />
                            {d.conductorNombre}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            Cédula: {d.cedula} • ID: {d.conductorId}
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-neutral-900 dark:text-white">
                          {d.carrerasEntregadas} entregas
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-neutral-900 dark:text-white">
                          ${d.ingresoBrutoDeliveryUsd.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono text-purple-600 dark:text-purple-400 font-bold">
                          -${d.comisionEmpresaDeliveryUsd.toFixed(2)}
                          <span className="block text-[9px] text-neutral-400 font-normal">Descuento empresa</span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ${d.gananciaNetaConductorUsd.toFixed(2)}
                          <span className="block text-[9px] text-neutral-400 font-mono">
                            Bs. {(d.gananciaNetaConductorUsd * tasaBcv).toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-neutral-500">
                          -${d.totalRetiradoUsd.toFixed(2)}
                          <span className="block text-[9px] text-neutral-400">
                            {d.liquidaciones.length} transferencias
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold">
                          <span className={tienePendiente ? 'text-emerald-600 dark:text-emerald-400 text-sm' : 'text-neutral-400'}>
                            ${d.saldoEnWalletUsd.toFixed(2)} USD
                          </span>
                          <span className="block text-[9px] text-neutral-400 font-mono">
                            Bs. {d.saldoEnWalletBs.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {tienePendiente ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Por Liquidar (${d.saldoEnWalletUsd.toFixed(2)})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              Al Día / Liquidado
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedIndividualDriver(d)}
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer text-xs font-bold flex items-center gap-1"
                              title="Ver únicamente la cartera de este conductor"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Cartera</span>
                            </button>

                            <button
                              onClick={() => handleOpenLiquidation({
                                tipo: 'conductor',
                                id: d.conductorId,
                                nombre: d.conductorNombre,
                                identificador: d.cedula,
                                montoBrutoDisponible: d.ingresoBrutoDeliveryUsd,
                                saldoEnWalletUsd: d.saldoEnWalletUsd
                              })}
                              disabled={!tienePendiente}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                                tienePendiente
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                              }`}
                              title={tienePendiente ? 'Enviar ganancias netas y subir comprobante SQL' : 'No posee ganancias pendientes por transferir'}
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Enviar Pago</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TAB COMPROBANTES Y LIQUIDACIONES SQL */}
      {activeSubTab === 'comprobantes' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs space-y-4 p-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Historial de Comprobantes de Pago Bancario Registrados en SQL
              </h3>
              <p className="text-xs text-neutral-500">
                Cada gestión de liquidación crea un registro detallado en base de datos con comprobante auditable.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
              {liquidacionesComercios.length + liquidacionesConductores.length} Comprobantes Emitidos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Liquidaciones de Comercios */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-purple-600" />
                <span>Liquidaciones a Comercios ({liquidacionesComercios.length})</span>
              </div>
              {liquidacionesComercios.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400 border border-dashed rounded-xl">
                  No hay liquidaciones de comercios registradas aún.
                </div>
              ) : (
                liquidacionesComercios.map(liq => (
                  <div 
                    key={liq.id}
                    className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between hover:border-purple-500/40 transition"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-2">
                        <span>{liq.comercioNombre}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-mono font-bold">
                          Pagado: ${liq.montoNetoUsd.toFixed(2)} USD
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Ref: {liq.referenciaBancaria} • {liq.bancoDestino || 'Banco'}
                      </div>
                      <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                        Bruto: ${liq.montoBrutoUsd.toFixed(2)} | Comisión Vixy: -${liq.comisionEmpresaUsd.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setInspectingReceipt({
                          tipo: 'comercio',
                          titulo: `Liquidación: ${liq.comercioNombre}`,
                          url: liq.comprobanteUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
                          referencia: liq.referenciaBancaria,
                          banco: liq.bancoDestino,
                          cuentaTelefono: liq.cuentaTelefonoDestino,
                          montoBrutoUsd: liq.montoBrutoUsd,
                          comisionEmpresaUsd: liq.comisionEmpresaUsd,
                          montoNetoUsd: liq.montoNetoUsd,
                          montoNetoBs: liq.montoNetoBs,
                          tasaBcv: liq.tasaBcv,
                          fecha: liq.fecha,
                          autorizadoPor: liq.autorizadoPor,
                          comprobanteRutaSql: liq.comprobanteRutaSql,
                          notas: liq.notas
                        })}
                        className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-purple-500 rounded-lg text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver Comprobante</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Liquidaciones de Conductores */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-purple-600" />
                <span>Liquidaciones a Motorizados ({liquidacionesConductores.length})</span>
              </div>
              {liquidacionesConductores.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400 border border-dashed rounded-xl">
                  No hay pagos a motorizados registrados aún.
                </div>
              ) : (
                liquidacionesConductores.map(liq => (
                  <div 
                    key={liq.id}
                    className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between hover:border-purple-500/40 transition"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-2">
                        <span>{liq.conductorNombre}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-mono font-bold">
                          Enviado: ${liq.montoNetoUsd.toFixed(2)} USD
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Ref: {liq.referenciaBancaria} • {liq.bancoDestino || 'Banco'}
                      </div>
                      <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                        Bruto Flete: ${liq.montoBrutoUsd.toFixed(2)} | Comisión Empresa: -${liq.comisionEmpresaUsd.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setInspectingReceipt({
                          tipo: 'conductor',
                          titulo: `Pago Conductor: ${liq.conductorNombre}`,
                          url: liq.comprobanteUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
                          referencia: liq.referenciaBancaria,
                          banco: liq.bancoDestino,
                          cuentaTelefono: liq.cuentaTelefonoDestino,
                          montoBrutoUsd: liq.montoBrutoUsd,
                          comisionEmpresaUsd: liq.comisionEmpresaUsd,
                          montoNetoUsd: liq.montoNetoUsd,
                          montoNetoBs: liq.montoNetoBs,
                          tasaBcv: liq.tasaBcv,
                          fecha: liq.fecha,
                          autorizadoPor: liq.autorizadoPor,
                          comprobanteRutaSql: liq.comprobanteRutaSql,
                          notas: liq.notas
                        })}
                        className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-purple-500 rounded-lg text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver Comprobante</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB CLIENTES */}
      {activeSubTab === 'clientes' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-850 text-neutral-500 uppercase text-[10px] font-bold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-3">Cliente / Cédula</th>
                  <th className="p-3">Carpeta Aislada SQL</th>
                  <th className="p-3 text-right">Saldo USD</th>
                  <th className="p-3 text-right">Saldo Bs.</th>
                  <th className="p-3 text-right">Total Recargado</th>
                  <th className="p-3 text-right">Total Gastado</th>
                  <th className="p-3 text-center">Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {allClientWallets
                  .filter(c => {
                    if (!searchTerm.trim()) return true;
                    const q = searchTerm.toLowerCase();
                    return c.clienteNombre.toLowerCase().includes(q) || c.cedula.toLowerCase().includes(q);
                  })
                  .map(c => (
                    <tr key={c.clienteId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition">
                      <td className="p-3">
                        <div className="font-bold text-neutral-900 dark:text-white">{c.clienteNombre}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{c.cedula} • ID: {c.clienteId}</div>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1">
                        <FolderTree className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-xs">{c.carpetaComprobantes}</span>
                      </td>
                      <td className="p-3 text-right font-bold text-neutral-900 dark:text-white font-mono">
                        ${c.saldoUsd.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-neutral-500 font-mono">
                        Bs. {(c.saldoUsd * tasaBcv).toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-purple-600 dark:text-purple-400 font-mono">
                        +${c.totalRecargadoUsd.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-neutral-500 font-mono">
                        -${c.totalGastadoUsd.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedClientUser(c)}
                          className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-purple-600 transition cursor-pointer"
                          title="Ver Transacciones"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CARTERA INDIVIDUAL EXCLUSIVA DE UN COMERCIO       */}
      {/* "debe mostrar los ingresos unicamente de esa cartera"     */}
      {/* ======================================================== */}
      {selectedIndividualStore && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                    Cartera Individual: {selectedIndividualStore.comercioNombre}
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    RIF: {selectedIndividualStore.rif} • Mostrando ingresos ÚNICAMENTE de esta tienda
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedIndividualStore(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center font-bold cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* Desglose Matemático Detallado con Separación Automática */}
            {(() => {
              const totalDeliveryPedidos = selectedIndividualStore.pedidosComercio?.reduce((acc: number, p: any) => acc + (p.costoDelivery || 0), 0) || 0;
              const comisionDeliveryEmpresa = parseFloat(((totalDeliveryPedidos * (deliveryRates?.porcentajeComisionDelivery ?? 15)) / 100).toFixed(2));
              const totalComisionesEmpresa = parseFloat((selectedIndividualStore.comisionEmpresaUsd + comisionDeliveryEmpresa).toFixed(2));
              return (
                <div className="space-y-2.5">
                  {/* Fila 1: Ingresos de Productos, Delivery y Comisiones */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block font-medium">Ventas Artículos</span>
                      <span className="text-sm font-bold font-mono text-neutral-900 dark:text-white">
                        ${selectedIndividualStore.ventasBrutasUsd.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-neutral-400 block">{selectedIndividualStore.pedidosComercio?.length || 0} pedidos</span>
                    </div>

                    <div className="p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block font-medium">Delivery Cobrado</span>
                      <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
                        ${totalDeliveryPedidos.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-neutral-400 block">Separado para motorizados</span>
                    </div>

                    <div className="p-2.5 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900/40">
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 block font-medium">Comisión Vixy Comercio ({porcentajeComisionComercio}%)</span>
                      <span className="text-sm font-bold font-mono text-purple-600 dark:text-purple-400">
                        -${selectedIndividualStore.comisionEmpresaUsd.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-neutral-400 block">Deducción de artículos</span>
                    </div>

                    <div className="p-2.5 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900/40">
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 block font-medium">Comisión Vixy Delivery ({deliveryRates?.porcentajeComisionDelivery ?? 15}%)</span>
                      <span className="text-sm font-bold font-mono text-purple-600 dark:text-purple-400">
                        -${comisionDeliveryEmpresa.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-neutral-400 block">Deducción de envíos</span>
                    </div>
                  </div>

                  {/* Fila 2: Total Empresa, Neto Comercio, Retirado y Dinero en Wallet */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-purple-100/50 dark:bg-purple-900/30 rounded-xl border border-purple-300 dark:border-purple-800">
                      <span className="text-[10px] text-purple-700 dark:text-purple-300 block font-bold">MONTO DE LA EMPRESA</span>
                      <span className="text-sm font-bold font-mono text-purple-800 dark:text-purple-200">
                        ${totalComisionesEmpresa.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-purple-600 dark:text-purple-400 block">Total retenido por Vixy</span>
                    </div>

                    <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">Ingreso Neto Comercio</span>
                      <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        ${selectedIndividualStore.ingresoNetoUsd.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-neutral-400 block">Bs. {(selectedIndividualStore.ingresoNetoUsd * tasaBcv).toFixed(2)}</span>
                    </div>

                    <div className="p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block font-medium">Total Ya Retirado</span>
                      <span className="text-sm font-bold font-mono text-neutral-700 dark:text-neutral-300">
                        ${selectedIndividualStore.totalRetiradoUsd.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-neutral-400 block">{selectedIndividualStore.liquidaciones?.length || 0} retiros en SQL</span>
                    </div>

                    <div className="p-2.5 bg-neutral-900 text-white rounded-xl border border-neutral-700">
                      <span className="text-[10px] text-neutral-400 block font-medium">Dinero Aún en Wallet</span>
                      <span className="text-sm font-bold font-mono text-white">
                        ${selectedIndividualStore.saldoEnWalletUsd.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-emerald-400 block font-mono">
                        {selectedIndividualStore.saldoEnWalletUsd > 0 ? 'Disponible para retiro' : 'Totalmente retirado'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Órdenes Exclusivas de este Comercio */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Pedidos Realizados a Este Comercio ({selectedIndividualStore.pedidosComercio?.length || 0})</span>
                <span className="text-[10px] text-neutral-400 font-normal">Sin mezclar con otras tiendas</span>
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {(!selectedIndividualStore.pedidosComercio || selectedIndividualStore.pedidosComercio.length === 0) ? (
                  <div className="p-4 text-center text-neutral-400 text-xs border border-dashed rounded-xl">
                    No hay pedidos registrados para esta tienda en la base de datos.
                  </div>
                ) : (
                  selectedIndividualStore.pedidosComercio.map((p: any) => (
                    <div key={p.id} className="p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-neutral-900 dark:text-white font-mono">
                          {p.codigoSeguimiento} • {p.clienteNombre}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {p.fechaCreacion} • Estado: {p.estado}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          ${p.subtotal.toFixed(2)} USD
                        </span>
                        <span className="block text-[9px] text-purple-600 dark:text-purple-400">
                          Comisión: -${((p.subtotal * porcentajeComisionComercio) / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Liquidaciones y Comprobantes de Este Comercio */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Liquidaciones y Retiros Aprobados ({selectedIndividualStore.liquidaciones?.length || 0})</span>
                <span className="text-[10px] text-neutral-400 font-normal">Guardadas en SQL</span>
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {(!selectedIndividualStore.liquidaciones || selectedIndividualStore.liquidaciones.length === 0) ? (
                  <div className="p-4 text-center text-neutral-400 text-xs border border-dashed rounded-xl">
                    Aún no se han emitido retiros para este comercio. El saldo total permanece en su wallet.
                  </div>
                ) : (
                  selectedIndividualStore.liquidaciones.map((l: any) => (
                    <div key={l.id} className="p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-neutral-900 dark:text-white">
                          Ref: {l.referenciaBancaria} ({l.metodoPago})
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {l.fecha} • Destino: {l.bancoDestino} ({l.cuentaTelefonoDestino})
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right font-mono">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            ${l.montoNetoUsd.toFixed(2)} USD
                          </span>
                          <span className="block text-[9px] text-neutral-400">
                            Bs. {l.montoNetoBs.toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => setInspectingReceipt({
                            tipo: 'comercio',
                            titulo: `Comprobante: ${selectedIndividualStore.comercioNombre}`,
                            url: l.comprobanteUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
                            referencia: l.referenciaBancaria,
                            banco: l.bancoDestino,
                            cuentaTelefono: l.cuentaTelefonoDestino,
                            montoBrutoUsd: l.montoBrutoUsd,
                            comisionEmpresaUsd: l.comisionEmpresaUsd,
                            montoNetoUsd: l.montoNetoUsd,
                            montoNetoBs: l.montoNetoBs,
                            tasaBcv: l.tasaBcv,
                            fecha: l.fecha,
                            autorizadoPor: l.autorizadoPor,
                            comprobanteRutaSql: l.comprobanteRutaSql,
                            notas: l.notas
                          })}
                          className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition cursor-pointer"
                          title="Inspeccionar Comprobante"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedIndividualStore(null)}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </button>

              {selectedIndividualStore.saldoEnWalletUsd > 0 && (
                <button
                  onClick={() => {
                    const s = selectedIndividualStore;
                    setSelectedIndividualStore(null);
                    handleOpenLiquidation({
                      tipo: 'comercio',
                      id: s.comercioId,
                      nombre: s.comercioNombre,
                      identificador: s.rif,
                      montoBrutoDisponible: s.ventasBrutasUsd,
                      saldoEnWalletUsd: s.saldoEnWalletUsd
                    });
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Liquidar Saldo en Wallet (${selectedIndividualStore.saldoEnWalletUsd.toFixed(2)})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CARTERA INDIVIDUAL EXCLUSIVA DE UN MOTORIZADO    */}
      {/* "de forma individual se podra ver por usuario su cartera" */}
      {/* ======================================================== */}
      {selectedIndividualDriver && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center font-bold">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                    Cartera Repartidor: {selectedIndividualDriver.conductorNombre}
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    Cédula: {selectedIndividualDriver.cedula} • Ingresos netos con comisión ya descontada
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedIndividualDriver(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center font-bold cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* Desglose Financiero */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block font-medium">Ingresos Brutos</span>
                <span className="text-base font-bold font-mono text-neutral-900 dark:text-white">
                  ${selectedIndividualDriver.ingresoBrutoDeliveryUsd.toFixed(2)}
                </span>
                <span className="text-[9px] text-neutral-400 block">{selectedIndividualDriver.carrerasEntregadas} carreras</span>
              </div>
              <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900/40">
                <span className="text-[10px] text-purple-600 dark:text-purple-400 block font-medium">Comisión Empresa ({deliveryRates?.porcentajeComisionDelivery ?? 15}%)</span>
                <span className="text-base font-bold font-mono text-purple-600 dark:text-purple-400">
                  -${selectedIndividualDriver.comisionEmpresaDeliveryUsd.toFixed(2)}
                </span>
                <span className="text-[9px] text-neutral-400 block">Retenido por la empresa</span>
              </div>
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">Ganancia Neta</span>
                <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ${selectedIndividualDriver.gananciaNetaConductorUsd.toFixed(2)}
                </span>
                <span className="text-[9px] text-neutral-400 block">Bs. {(selectedIndividualDriver.gananciaNetaConductorUsd * tasaBcv).toFixed(2)}</span>
              </div>
              <div className="p-3 bg-neutral-900 text-white rounded-xl border border-neutral-700">
                <span className="text-[10px] text-neutral-400 block font-medium">Pendiente en Wallet</span>
                <span className="text-base font-bold font-mono text-white">
                  ${selectedIndividualDriver.saldoEnWalletUsd.toFixed(2)}
                </span>
                <span className="text-[9px] text-emerald-400 block font-mono">
                  {selectedIndividualDriver.saldoEnWalletUsd > 0 ? 'Listo para liquidar' : 'Al día / Transferido'}
                </span>
              </div>
            </div>

            {/* Historial de Liquidaciones Recibidas */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Liquidaciones de Ingresos Enviadas ({selectedIndividualDriver.liquidaciones?.length || 0})</span>
                <span className="text-[10px] text-neutral-400 font-normal">Comprobantes oficiales en SQL</span>
              </h4>
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {(!selectedIndividualDriver.liquidaciones || selectedIndividualDriver.liquidaciones.length === 0) ? (
                  <div className="p-4 text-center text-neutral-400 text-xs border border-dashed rounded-xl">
                    No se han registrado pagos transferidos para este repartidor aún.
                  </div>
                ) : (
                  selectedIndividualDriver.liquidaciones.map((l: any) => (
                    <div key={l.id} className="p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-neutral-900 dark:text-white">
                          Ref: {l.referenciaBancaria} ({l.metodoPago})
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {l.fecha} • Destino: {l.bancoDestino} ({l.cuentaTelefonoDestino})
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right font-mono">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            ${l.montoNetoUsd.toFixed(2)} USD
                          </span>
                          <span className="block text-[9px] text-neutral-400">
                            Bs. {l.montoNetoBs.toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => setInspectingReceipt({
                            tipo: 'conductor',
                            titulo: `Comprobante: ${selectedIndividualDriver.conductorNombre}`,
                            url: l.comprobanteUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
                            referencia: l.referenciaBancaria,
                            banco: l.bancoDestino,
                            cuentaTelefono: l.cuentaTelefonoDestino,
                            montoBrutoUsd: l.montoBrutoUsd,
                            comisionEmpresaUsd: l.comisionEmpresaUsd,
                            montoNetoUsd: l.montoNetoUsd,
                            montoNetoBs: l.montoNetoBs,
                            tasaBcv: l.tasaBcv,
                            fecha: l.fecha,
                            autorizadoPor: l.autorizadoPor,
                            comprobanteRutaSql: l.comprobanteRutaSql,
                            notas: l.notas
                          })}
                          className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition cursor-pointer"
                          title="Inspeccionar Comprobante"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedIndividualDriver(null)}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </button>

              {selectedIndividualDriver.saldoEnWalletUsd > 0 && (
                <button
                  onClick={() => {
                    const d = selectedIndividualDriver;
                    setSelectedIndividualDriver(null);
                    handleOpenLiquidation({
                      tipo: 'conductor',
                      id: d.conductorId,
                      nombre: d.conductorNombre,
                      identificador: d.cedula,
                      montoBrutoDisponible: d.ingresoBrutoDeliveryUsd,
                      saldoEnWalletUsd: d.saldoEnWalletUsd
                    });
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Enviar Ganancias (${selectedIndividualDriver.saldoEnWalletUsd.toFixed(2)})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: FORMULARIO DE LIQUIDACIÓN Y PAGO BANCARIO SQL    */}
      {/* ======================================================== */}
      {liquidationModalTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Procesar Liquidación de {liquidationModalTarget.tipo === 'comercio' ? 'Comercio' : 'Repartidor'}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {liquidationModalTarget.nombre} ({liquidationModalTarget.identificador})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLiquidationModalTarget(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessLiquidation} className="space-y-3 text-xs">
              {/* Cálculo en Tiempo Real */}
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-900/50 space-y-1.5">
                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Monto Bruto a Liquidar:</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">
                    ${parseFloat(liqForm.montoBruto || '0').toFixed(2)} USD
                  </span>
                </div>
                <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
                  <span>
                    Comisión de Empresa (
                    {liquidationModalTarget.tipo === 'comercio' ? porcentajeComisionComercio : (deliveryRates?.porcentajeComisionDelivery ?? 15)}%):
                  </span>
                  <span className="font-mono font-bold">
                    -${((parseFloat(liqForm.montoBruto || '0') * (liquidationModalTarget.tipo === 'comercio' ? porcentajeComisionComercio : (deliveryRates?.porcentajeComisionDelivery ?? 15))) / 100).toFixed(2)} USD
                  </span>
                </div>
                <div className="border-t border-purple-200 dark:border-purple-900/50 pt-1.5 flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  <span>Neto a Transferir al Usuario:</span>
                  <span className="font-mono">
                    ${(parseFloat(liqForm.montoBruto || '0') - (parseFloat(liqForm.montoBruto || '0') * (liquidationModalTarget.tipo === 'comercio' ? porcentajeComisionComercio : (deliveryRates?.porcentajeComisionDelivery ?? 15)) / 100)).toFixed(2)} USD
                  </span>
                </div>
                <div className="text-right text-[10px] text-neutral-500 font-mono">
                  Equivalente BCV: Bs. {((parseFloat(liqForm.montoBruto || '0') - (parseFloat(liqForm.montoBruto || '0') * (liquidationModalTarget.tipo === 'comercio' ? porcentajeComisionComercio : (deliveryRates?.porcentajeComisionDelivery ?? 15)) / 100)) * tasaBcv).toFixed(2)}
                </div>
              </div>

              {/* Inputs */}
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  Monto Bruto ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={liqForm.montoBruto}
                  onChange={(e) => setLiqForm({ ...liqForm, montoBruto: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={liqForm.metodoPago}
                    onChange={(e) => setLiqForm({ ...liqForm, metodoPago: e.target.value as MetodoPagoTipo })}
                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700"
                  >
                    <option value="pago_movil">Pago Móvil</option>
                    <option value="transferencia_bancaria">Transferencia Bancaria</option>
                    <option value="zelle">Zelle</option>
                    <option value="zinli">Zinli</option>
                    <option value="binance_pay">Binance USDT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                    Banco Destino
                  </label>
                  <input
                    type="text"
                    required
                    value={liqForm.bancoDestino}
                    onChange={(e) => setLiqForm({ ...liqForm, bancoDestino: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                    Teléfono / Cuenta Destino
                  </label>
                  <input
                    type="text"
                    required
                    value={liqForm.cuentaTelefonoDestino}
                    onChange={(e) => setLiqForm({ ...liqForm, cuentaTelefonoDestino: e.target.value })}
                    placeholder="0414-1234567"
                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                    Referencia Bancaria
                  </label>
                  <input
                    type="text"
                    required
                    value={liqForm.referenciaBancaria}
                    onChange={(e) => setLiqForm({ ...liqForm, referenciaBancaria: e.target.value })}
                    placeholder="REF-001928"
                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  Comprobante de Pago Guardado en SQL
                </label>
                <div className="p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src={liqForm.comprobanteUrl} 
                      alt="Receipt" 
                      className="w-10 h-10 object-cover rounded-lg border border-neutral-300 dark:border-neutral-700"
                    />
                    <div>
                      <span className="font-mono text-[11px] block font-bold text-neutral-800 dark:text-neutral-200">
                        recibo_{Date.now()}.png
                      </span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                        /uploads/comprobantes_liquidaciones/
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                    Listo para SQL
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  Notas de la Transacción
                </label>
                <textarea
                  rows={2}
                  value={liqForm.notas}
                  onChange={(e) => setLiqForm({ ...liqForm, notas: e.target.value })}
                  className="w-full px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setLiquidationModalTarget(null)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar y Guardar en SQL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: INSPECCIÓN DE COMPROBANTE DE PAGO BANCARIO SQL   */}
      {/* ======================================================== */}
      {inspectingReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Comprobante Bancario Registrado en SQL
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    Ref: {inspectingReceipt.referencia}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingReceipt(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Imagen del Comprobante */}
            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950 flex items-center justify-center">
              <img
                src={inspectingReceipt.url}
                alt="Comprobante Bancario"
                className="max-h-72 w-auto object-contain"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs text-white p-2 rounded-xl text-[10px] font-mono flex items-center justify-between">
                <span className="truncate">{inspectingReceipt.comprobanteRutaSql}</span>
                <span className="text-emerald-400 font-bold shrink-0">Guardado en Servidor</span>
              </div>
            </div>

            {/* Desglose de Pago */}
            <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-xs space-y-1.5">
              <div className="flex justify-between text-neutral-500">
                <span>Beneficiario:</span>
                <span className="font-bold text-neutral-900 dark:text-white">{inspectingReceipt.titulo}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Banco & Cuenta:</span>
                <span className="font-mono text-neutral-900 dark:text-white">
                  {inspectingReceipt.banco} ({inspectingReceipt.cuentaTelefono})
                </span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Monto Bruto:</span>
                <span className="font-mono text-neutral-900 dark:text-white">${inspectingReceipt.montoBrutoUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-purple-600 dark:text-purple-400">
                <span>Comisión Empresa Vixy:</span>
                <span className="font-mono font-bold">-${inspectingReceipt.comisionEmpresaUsd.toFixed(2)} USD</span>
              </div>
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-1 flex justify-between font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                <span>Neto Pagado:</span>
                <span className="font-mono">
                  ${inspectingReceipt.montoNetoUsd.toFixed(2)} USD (Bs. {inspectingReceipt.montoNetoBs.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-neutral-400 pt-1">
                <span>Fecha: {inspectingReceipt.fecha}</span>
                <span>Autorizado: {inspectingReceipt.autorizadoPor}</span>
              </div>
              {inspectingReceipt.notas && (
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400 italic pt-1 border-t border-neutral-200 dark:border-neutral-700">
                  "{inspectingReceipt.notas}"
                </div>
              )}
            </div>

            <div className="text-right">
              <button
                onClick={() => setInspectingReceipt(null)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar Comprobante
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: TRANSACCIONES DE CLIENTE */}
      {selectedClientUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Historial de Cartera: {selectedClientUser.clienteNombre}
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    Cédula: {selectedClientUser.cedula}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedClientUser(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {(!selectedClientUser.transacciones || selectedClientUser.transacciones.length === 0) ? (
                <div className="p-8 text-center text-neutral-400 text-xs">
                  No hay transacciones registradas para este cliente.
                </div>
              ) : (
                selectedClientUser.transacciones.map((tx: any) => (
                  <div 
                    key={tx.id}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {tx.descripcion}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {tx.fecha} • Ref: {tx.referencia || 'N/A'}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className={`font-bold ${(tx.monto || tx.montoUsd) > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-neutral-900 dark:text-white'}`}>
                        {(tx.monto || tx.montoUsd) > 0 ? '+' : ''}${(tx.monto || tx.montoUsd).toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 text-right">
              <button
                onClick={() => setSelectedClientUser(null)}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
