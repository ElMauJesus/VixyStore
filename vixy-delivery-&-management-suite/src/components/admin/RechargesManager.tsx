import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Eye, 
  DollarSign, 
  User, 
  Bike, 
  Building, 
  ShieldCheck, 
  FileText, 
  ArrowUpRight,
  Filter,
  Check,
  X,
  FolderTree,
  FolderLock,
  Calendar,
  AlertTriangle,
  Info,
  Phone,
  CreditCard,
  ChevronRight,
  ExternalLink,
  Star
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { SolicitudRecarga, Conductor } from '../../types/delivery';

export const RechargesManager: React.FC = () => {
  const { 
    rechargeRequests, 
    aprobarRecarga, 
    rechazarRecarga, 
    tasaBcv,
    allDrivers,
    verificationPhotos,
    openCall
  } = useDelivery();

  const [activeSubTab, setActiveSubTab] = useState<'recargas' | 'vault'>('recargas');
  const [filterRole, setFilterRole] = useState<'all' | 'cliente' | 'conductor'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendiente' | 'aprobada' | 'rechazada'>('pendiente');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<SolicitudRecarga | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  // Independent Driver Profile State for the driver who submitted the recharge
  const [inspectingDriver, setInspectingDriver] = useState<Conductor | null>(null);

  // Vault receipts search & filter
  const [vaultSearch, setVaultSearch] = useState('');

  // 30-day validity calculator helper
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
      label: isVigente 
        ? `Vigente • ${remainingDays}d` 
        : `Expirado • ${diffDays}d (>30d)`
    };
  };

  const filteredRequests = useMemo(() => {
    return rechargeRequests.filter(req => {
      if (filterRole !== 'all' && req.usuarioTipo !== filterRole) return false;
      if (filterStatus !== 'all' && req.estado !== filterStatus) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = req.usuarioNombre.toLowerCase().includes(q);
        const matchRef = req.referencia.toLowerCase().includes(q);
        const matchId = req.id.toLowerCase().includes(q);
        if (!matchName && !matchRef && !matchId) return false;
      }
      return true;
    });
  }, [rechargeRequests, filterRole, filterStatus, searchTerm]);

  const countPending = rechargeRequests.filter(r => r.estado === 'pendiente').length;
  const countApproved = rechargeRequests.filter(r => r.estado === 'aprobada').length;
  const countRejected = rechargeRequests.filter(r => r.estado === 'rechazada').length;
  const totalApprovedUsd = rechargeRequests
    .filter(r => r.estado === 'aprobada')
    .reduce((sum, r) => sum + r.montoUsd, 0);

  const handleApprove = (id: string) => {
    aprobarRecarga(id, 'Comprobante verificado con conciliación bancaria exitosa.');
  };

  const handleRejectConfirm = () => {
    if (showRejectModal) {
      rechazarRecarga(showRejectModal, rejectNote.trim() || 'Comprobante no coincide con extracto bancario.');
      setShowRejectModal(null);
      setRejectNote('');
    }
  };

  // Find the exact driver associated with a recharge request
  const openDriverProfileForRequest = (req: SolicitudRecarga) => {
    const foundDriver = allDrivers.find(d => 
      d.id === req.usuarioId || 
      `${d.nombre} ${d.apellido}`.toLowerCase() === req.usuarioNombre.toLowerCase() ||
      d.nombre.toLowerCase().includes(req.usuarioNombre.toLowerCase())
    ) || allDrivers[0];

    setInspectingDriver(foundDriver);
  };

  return (
    <div className="space-y-4 text-neutral-900 dark:text-neutral-100">
      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-600/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Autorización de Recarga & Verificación Vault
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  Vigencia Máx. 30 Días
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Verificación de comprobantes de pago de motorizados y clientes. Auditoría independiente del perfil del conductor.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-right">
            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-medium block">Pendientes</span>
            <span className="text-sm font-bold text-purple-700 dark:text-purple-300 font-mono">{countPending}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-right">
            <span className="text-[10px] text-neutral-500 block">Aprobadas</span>
            <span className="text-sm font-bold text-neutral-900 dark:text-white font-mono">{countApproved}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-right">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">Total Acreditado</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">${totalApprovedUsd.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation: Solicitudes de Recarga vs. Verificación Vault */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('recargas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'recargas'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Solicitudes de Recarga ({rechargeRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('vault')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'vault'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
            }`}
          >
            <FolderLock className="w-4 h-4" />
            <span>Verificación Vault (Bóveda de Comprobantes)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-500">
          <Clock className="w-3.5 h-3.5 text-purple-600" />
          <span>Vigencia legal de comprobantes: <strong>30 días continuos</strong></span>
        </div>
      </div>

      {/* VIEW 1: RECARGAS REQUESTS */}
      {activeSubTab === 'recargas' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Selector */}
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setFilterStatus('pendiente')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    filterStatus === 'pendiente'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Pendientes ({countPending})
                </button>
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Todas ({rechargeRequests.length})
                </button>
                <button
                  onClick={() => setFilterStatus('aprobada')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    filterStatus === 'aprobada'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Aprobadas ({countApproved})
                </button>
                <button
                  onClick={() => setFilterStatus('rechazada')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    filterStatus === 'rechazada'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Rechazadas ({countRejected})
                </button>
              </div>

              {/* Role selector */}
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setFilterRole('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    filterRole === 'all' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs' : 'text-neutral-500'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterRole('cliente')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                    filterRole === 'cliente' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs' : 'text-neutral-500'
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>Clientes</span>
                </button>
                <button
                  onClick={() => setFilterRole('conductor')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                    filterRole === 'conductor' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs' : 'text-neutral-500'
                  }`}
                >
                  <Bike className="w-3 h-3 text-amber-500" />
                  <span>Motorizados</span>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por usuario o referencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:border-purple-500"
              />
            </div>
          </div>

          {/* Requests List */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 space-y-2">
                <ShieldCheck className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-700" />
                <p className="text-sm font-medium">No hay solicitudes de recarga que coincidan con el filtro.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredRequests.map(req => {
                  const isClient = req.usuarioTipo === 'cliente';
                  const isConductor = req.usuarioTipo === 'conductor';
                  const validity = checkReceiptValidity(req.fecha);

                  return (
                    <div 
                      key={req.id}
                      className="p-4 hover:bg-neutral-50/60 dark:hover:bg-neutral-850/60 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      {/* Left Block: User Identity & Voucher Preview */}
                      <div className="flex items-start gap-3">
                        {/* Thumbnail with quick receipt inspection */}
                        <div 
                          onClick={() => setSelectedRequest(req)}
                          className="relative w-14 h-14 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-950 shrink-0 cursor-pointer group"
                        >
                          <img
                            src={req.comprobanteUrl}
                            alt="Comprobante"
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-neutral-900 dark:text-white">
                              {req.usuarioNombre}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isClient 
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}>
                              {isClient ? 'Cliente' : 'Motorizado Vixy'}
                            </span>

                            {/* 30-Day Validity Tag */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              validity.isVigente
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                            }`}>
                              {validity.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap font-mono">
                            <span>Ref: <strong>{req.referencia}</strong></span>
                            <span>•</span>
                            <span className="uppercase">{req.metodoPago}</span>
                            <span>•</span>
                            <span>{req.fecha}</span>
                          </div>

                          {/* Independent Driver Profile Access Button */}
                          {isConductor && (
                            <button
                              type="button"
                              onClick={() => openDriverProfileForRequest(req)}
                              className="mt-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition w-fit"
                            >
                              <Bike className="w-3.5 h-3.5 shrink-0" />
                              <span>Ver Expediente del Conductor</span>
                              <ChevronRight className="w-3 h-3 shrink-0" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right Block: Amount and Approvals */}
                      <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-neutral-100 dark:border-neutral-800">
                        <div className="text-left lg:text-right">
                          <span className="text-base font-bold text-neutral-900 dark:text-white font-mono block">
                            ${req.montoUsd.toFixed(2)} USD
                          </span>
                          <span className="text-xs text-neutral-500 font-mono">
                            Bs. {req.montoBs.toFixed(2)}
                          </span>
                        </div>

                        {req.estado === 'pendiente' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-600 dark:text-neutral-300 rounded-xl transition cursor-pointer"
                              title="Auditar Comprobante"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aprobar</span>
                            </button>
                            <button
                              onClick={() => setShowRejectModal(req.id)}
                              className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-red-50 hover:text-red-600 text-neutral-500 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Rechazar</span>
                            </button>
                          </div>
                        ) : req.estado === 'aprobada' ? (
                          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Acreditado</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-red-500/20">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rechazada</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: VERIFICACIÓN VAULT (BÓVEDA DE COMPROBANTES Y ENTREGAS) */}
      {activeSubTab === 'vault' && (
        <div className="space-y-4">
          {/* Policy Banner for Vault */}
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300">
            <FolderLock className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-neutral-900 dark:text-white">
                Verificación Vault Central: Bóveda de Comprobantes Bancarios y Fotográficos
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">
                Depósito centralizado de comprobantes de pago de recarga y fotos de entrega. Aplica el límite máximo reglamentario de <strong>30 días de vigencia</strong> para auditoría financiera en la plataforma.
              </p>
            </div>
          </div>

          {/* Grid of Vault Proofs with 30-Day Validity Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rechargeRequests.map((req) => {
              const validity = checkReceiptValidity(req.fecha);
              const isConductor = req.usuarioTipo === 'conductor';

              return (
                <div
                  key={req.id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:border-purple-400 dark:hover:border-purple-600 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Image Box */}
                    <div 
                      onClick={() => setSelectedRequest(req)}
                      className="relative aspect-video bg-neutral-950 overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={req.comprobanteUrl}
                        alt="Comprobante"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/75 backdrop-blur-xs rounded-xl text-[10px] font-mono font-bold text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${validity.isVigente ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {validity.isVigente ? 'Vigente' : 'Expirado'}
                      </div>

                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-black/80 backdrop-blur-xs rounded-xl text-[10px] font-mono font-bold text-white">
                        ${req.montoUsd.toFixed(2)} USD
                      </div>
                    </div>

                    <div className="p-4 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {req.fecha}</span>
                        <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{req.metodoPago}</span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                          {req.usuarioTipo === 'conductor' ? (
                            <Bike className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          )}
                          <span>{req.usuarioNombre}</span>
                        </p>
                        <p className="text-neutral-500 font-mono text-[11px]">
                          Ref: {req.referencia}
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate">
                          Almacén: <code className="text-[10px] font-mono break-all">{req.carpetaAlmacenamiento}</code>
                        </p>
                      </div>

                      {/* 30-Day Badge */}
                      <div className={`p-2 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 ${
                        validity.isVigente
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                      }`}>
                        {validity.isVigente ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{validity.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vault Card Footer */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-850/80 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(req)}
                      className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Auditar</span>
                    </button>

                    {isConductor && (
                      <button
                        type="button"
                        onClick={() => openDriverProfileForRequest(req)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Ver Perfil</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: View Receipt & Audit Details */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Auditoría de Comprobante de Recarga
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Receipt image */}
              <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 p-2 text-center">
                <img 
                  src={selectedRequest.comprobanteUrl} 
                  alt="Comprobante Bancario" 
                  className="max-h-64 mx-auto rounded-xl object-contain shadow-xs"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block font-mono">
                  {selectedRequest.carpetaAlmacenamiento}
                </span>
              </div>

              {/* 30-Day Validity Banner */}
              {(() => {
                const validity = checkReceiptValidity(selectedRequest.fecha);
                return (
                  <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                    validity.isVigente
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                  }`}>
                    {validity.isVigente ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                    )}
                    <span>
                      <strong>Política de 30 Días:</strong> {validity.isVigente 
                        ? `Comprobante Vigente (tiene ${validity.diffDays} días de antigüedad, quedan ${validity.remainingDays} días).`
                        : `Comprobante Expirado (tiene ${validity.diffDays} días de antigüedad, mayor al plazo límite de 30 días).`}
                    </span>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-2 bg-neutral-50 dark:bg-neutral-850 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Usuario</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{selectedRequest.usuarioNombre}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Monto Total</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                    ${selectedRequest.montoUsd.toFixed(2)} USD ({selectedRequest.montoBs.toFixed(2)} Bs)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Método</span>
                  <span className="font-mono text-neutral-800 dark:text-neutral-200 uppercase">{selectedRequest.metodoPago}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Referencia Bancaria</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">{selectedRequest.referencia}</span>
                </div>
              </div>

              {/* Quick driver profile prompt inside modal if it's a driver */}
              {selectedRequest.usuarioTipo === 'conductor' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bike className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      Conductor: {selectedRequest.usuarioNombre}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      openDriverProfileForRequest(selectedRequest);
                      setSelectedRequest(null);
                    }}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Ver Perfil Completo
                  </button>
                </div>
              )}
            </div>

            {selectedRequest.estado === 'pendiente' && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => {
                    handleApprove(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Aprobar y Acreditar Saldo Ahora</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: INDEPENDENT DRIVER PROFILE MODAL (para quien hizo la recarga y envió el comprobante) */}
      {inspectingDriver && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-60 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-700 max-w-2xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            {/* Header with Photo, Full Name, and Badge */}
            <div className="p-5 bg-neutral-950 text-white flex items-start justify-between gap-4 shrink-0 border-b border-neutral-800">
              <div className="flex items-center gap-4">
                <img
                  src={inspectingDriver.fotoUrl}
                  alt={inspectingDriver.nombre}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-white">
                      {inspectingDriver.nombre} {inspectingDriver.apellido}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-neutral-950">
                      Perfil del Remitente de Recarga
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 font-mono mt-0.5">
                    C.I: {inspectingDriver.legal.cedula} • Tel: {inspectingDriver.telefono}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-amber-400 mt-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{inspectingDriver.rating.toFixed(1)} rating ({inspectingDriver.totalEntregas} viajes)</span>
                    <span>•</span>
                    <span className="font-mono text-neutral-300">🛵 Placa: {inspectingDriver.moto.placa}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openCall(inspectingDriver.telefono, `${inspectingDriver.nombre} ${inspectingDriver.apellido}`, 'conductor')}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition cursor-pointer"
                  title="Llamar al conductor"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingDriver(null)}
                  className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body of Driver Profile */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Financial State of this Driver */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Saldo Actual en Cartera</span>
                  <p className={`text-xl font-black font-mono ${
                    inspectingDriver.billetera.saldoUsd >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                  }`}>
                    ${inspectingDriver.billetera.saldoUsd.toFixed(2)} USD
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    Bs. {(inspectingDriver.billetera.saldoUsd * tasaBcv).toFixed(2)}
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Límite de Saldo Negativo</span>
                  <p className="text-xl font-black font-mono text-neutral-800 dark:text-neutral-200">
                    ${inspectingDriver.billetera.limiteSaldoNegativo.toFixed(2)} USD
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    Capacidad de continuar recibiendo pedidos con saldo deudor
                  </p>
                </div>
              </div>

              {/* Legal & Vehicle details */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-3">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Expediente y Documentación Legal del Conductor
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block font-bold uppercase">Licencia INTT</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">Grado {inspectingDriver.legal.licenciaGrado} • {inspectingDriver.legal.licenciaNumero}</span>
                    <span className="text-[10px] text-emerald-500 block">Vigente hasta {inspectingDriver.legal.licenciaVencimiento}</span>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block font-bold uppercase">Certificado Médico MPPS</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">{inspectingDriver.legal.certificadoMedicoNumero}</span>
                    <span className="text-[10px] text-emerald-500 block">Vigente hasta {inspectingDriver.legal.certificadoMedicoVencimiento}</span>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block font-bold uppercase">Vehículo Asignado</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{inspectingDriver.moto.marca} {inspectingDriver.moto.modelo} ({inspectingDriver.moto.ano})</span>
                    <span className="text-[10px] font-mono text-neutral-500 block">Color: {inspectingDriver.moto.color}</span>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block font-bold uppercase">Placa & Seriales</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 block">Placa: {inspectingDriver.moto.placa}</span>
                    <span className="text-[10px] font-mono text-neutral-400 truncate block">Motor: {inspectingDriver.moto.serialMotor}</span>
                  </div>
                </div>
              </div>

              {/* Recharges submitted by this specific driver */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block">
                  Comprobantes y Recargas Enviadas por {inspectingDriver.nombre}
                </span>

                <div className="divide-y divide-neutral-100 dark:divide-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                  {rechargeRequests
                    .filter(r => r.usuarioId === inspectingDriver.id || r.usuarioNombre.includes(inspectingDriver.nombre))
                    .map(rec => {
                      const validity = checkReceiptValidity(rec.fecha);
                      return (
                        <div key={rec.id} className="p-3 bg-white dark:bg-neutral-900 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                                Ref: {rec.referencia}
                              </span>
                              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                                validity.isVigente ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                              }`}>
                                {validity.label}
                              </span>
                            </div>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              {rec.fecha} • {rec.metodoPago}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-neutral-900 dark:text-white">
                              ${rec.montoUsd.toFixed(2)} USD
                            </span>
                            <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              {rec.estado}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-850/80 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setInspectingDriver(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cerrar Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Reject Note */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-500">
              <XCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Rechazar Solicitud de Recarga</h3>
            </div>
            <p className="text-xs text-neutral-500">
              Indica la razón del rechazo para que el usuario sea notificado en su aplicación:
            </p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Ej: Referencia no encontrada en extracto bancario o monto incorrecto..."
              className="w-full text-xs p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 outline-hidden"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectNote('');
                }}
                className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
