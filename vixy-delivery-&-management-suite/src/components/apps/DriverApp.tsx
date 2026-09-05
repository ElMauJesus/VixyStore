import React, { useState } from 'react';
import { 
  Bike, 
  MapPin, 
  Clock, 
  Phone, 
  MessageSquare, 
  Camera, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation,
  FileText,
  Upload,
  User,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  AlertOctagon,
  CreditCard,
  RefreshCcw,
  Plus,
  Coins,
  X,
  Flame,
  Compass,
  DollarSign,
  Store,
  Smartphone,
  Filter,
  LogOut,
  Lock
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { MetodoPagoTipo } from '../../types/delivery';
import { DeliveryRadarMap } from '../common/DeliveryRadarMap';

export const DriverApp: React.FC = () => {
  const { 
    driver, 
    driverWallet,
    driverLoggedIn,
    loginDriver,
    logoutDriver,
    solicitarRecargaConductor,
    rechargeDriverWallet,
    orders, 
    driverAcceptOrder, 
    driverRejectOrder,
    calculateDeliveryTripCost,
    deliveryRates,
    driverPickUpOrder, 
    driverDeliverOrder, 
    openCall, 
    openChat,
    reportIncident,
    updateDriverAvailability,
    tasaBcv,
    realGpsActive,
    realGpsCoords,
    realGpsError,
    requestPushNotificationPermission,
    playNotificationSound
  } = useDelivery();

  const [driverIdentifier, setDriverIdentifier] = useState('V-24891023');
  const [driverPassword, setDriverPassword] = useState('chofer123');
  const [driverAuthError, setDriverAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'viajes' | 'mapa' | 'cartera' | 'ficha_legal' | 'resenas'>('viajes');
  const [photoPreview, setPhotoPreview] = useState<string>('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80');
  const [photoComment, setPhotoComment] = useState('Entregado en mano en puerta principal con empaque sellado.');
  const [showDeliveryModal, setShowDeliveryModal] = useState<string | null>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentType, setIncidentType] = useState<'retraso' | 'accidente_moto' | 'cliente_ausente'>('retraso');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [rejectModalOrderId, setRejectModalOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Distancia no conveniente / zona congestionada');

  // Driver Wallet Recharge Modal
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(5.0);
  const [rechargeMethod, setRechargeMethod] = useState<MetodoPagoTipo>('binance');
  const [rechargeReference, setRechargeReference] = useState('');

  // Sub-view inside 'viajes' tab: 'activo' (viaje en curso) or 'disponibles' (solicitudes pendientes)
  const [viajesSubView, setViajesSubView] = useState<'activo' | 'disponibles'>('disponibles');
  // Filter for requests: 'todos' | 'clientes' | 'comercios'
  const [offerOriginFilter, setOfferOriginFilter] = useState<'todos' | 'clientes' | 'comercios'>('todos');

  // Active in-course ride (only when already accepted and in route to store or client)
  const activeRide = orders.find(o => 
    o.conductor?.id === driver.id && 
    (o.estado === 'en_camino_al_comercio' || o.estado === 'en_camino_al_cliente')
  );

  // Keep assignedOrder alias for compatibility with incident reports and delivery modal
  const assignedOrder = activeRide;

  // Pending offers from clients and stores waiting for a driver:
  const pendingOffers = orders.filter(o => 
    ((!o.conductor && (o.estado === 'esperando_repartidor' || o.estado === 'en_preparacion' || o.estado === 'pago_verificado')) ||
     (o.conductor?.id === driver.id && o.estado === 'esperando_repartidor')) &&
    o.estado !== 'entregado' &&
    o.estado !== 'cancelado'
  );

  const clientOffers = pendingOffers.filter(o => !o.esPedidoTienda);
  const storeOffers = pendingOffers.filter(o => o.esPedidoTienda);

  const filteredOffers = offerOriginFilter === 'todos' 
    ? pendingOffers 
    : offerOriginFilter === 'clientes' 
    ? clientOffers 
    : storeOffers;

  const formatCountdown = (totalSec: number) => {
    if (totalSec <= 0) return '00:00';
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFinishDelivery = (orderId: string) => {
    driverDeliverOrder(orderId, photoPreview, photoComment);
    setShowDeliveryModal(null);
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentDesc.trim()) return;
    reportIncident({
      pedidoId: assignedOrder?.id,
      reportadoPor: 'conductor',
      reportanteNombre: `${driver.nombre} Ramírez (Motorizado)`,
      tipo: incidentType,
      prioridad: incidentType === 'accidente_moto' ? 'alta' : 'media',
      descripcion: incidentDesc.trim()
    });
    setIncidentDesc('');
    setShowIncidentModal(false);
    alert('Incidencia enviada al Centro de Control de Vixy.');
  };

  const handleProcessRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (rechargeAmount <= 0) return;
    const ref = rechargeReference.trim() || `DRV-REF-${Math.floor(100000 + Math.random() * 900000)}`;
    solicitarRecargaConductor(
      rechargeAmount,
      rechargeMethod,
      ref
    );
    setShowRechargeModal(false);
    setRechargeReference('');
    alert(`✓ Solicitud de recarga de $${rechargeAmount.toFixed(2)} enviada al Backend Central.\n\nUn operador de finanzas autorizará la recarga tras validar el comprobante en su carpeta /uploads/conductores/${driver.id}/comprobantes/.`);
  };

  const isBlocked = driverWallet.bloqueadoPorSaldo;

  const handleDriverLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverIdentifier.trim()) {
      setDriverAuthError('Ingresa tu cédula o teléfono registrado.');
      return;
    }
    const res = loginDriver(driverIdentifier.trim(), driverPassword);
    if (!res?.success) {
      setDriverAuthError(res?.error || 'Credenciales de conductor incorrectas');
    } else {
      setDriverAuthError('');
    }
  };

  const handleDriverLogout = () => {
    if (window.confirm('¿Seguro que deseas cerrar la sesión de Conductor?')) {
      logoutDriver();
    }
  };

  // IF DRIVER IS LOGGED OUT
  if (!driverLoggedIn) {
    return (
      <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-4 items-center justify-center overflow-y-auto">
        <div className="w-full max-w-sm bg-white dark:bg-neutral-850 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4 my-auto">
          <div className="text-center space-y-1">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-500/20">
              <Bike className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-neutral-900 dark:text-white">Vixy Conductor</h2>
            <p className="text-xs text-neutral-500">App para Repartidores y Flota de Motos</p>
          </div>

          {driverAuthError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{driverAuthError}</span>
            </div>
          )}

          <form onSubmit={handleDriverLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-neutral-500">Cédula o Teléfono Registrado</label>
              <input
                type="text"
                required
                value={driverIdentifier}
                onChange={(e) => setDriverIdentifier(e.target.value)}
                placeholder="V-24891023 o 0414-9988776"
                className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-neutral-500">Contraseña de Repartidor</label>
              <input
                type="password"
                required
                value={driverPassword}
                onChange={(e) => setDriverPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Iniciar Turno de Reparto</span>
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <button
              type="button"
              onClick={() => {
                loginDriver('V-24891023', 'chofer123');
                setDriverAuthError('');
              }}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              Acceso Rápido como Conductor Demo (Carlos Ramírez)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* Top Driver Bar */}
      <div className="p-3 bg-white dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={driver.fotoUrl}
            alt={driver.nombre}
            className="w-9 h-9 rounded-xl object-cover border border-amber-500 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white leading-tight truncate">
                {driver.nombre} {driver.apellido}
              </h3>
              <span className="flex items-center text-[10px] text-amber-500 font-bold ml-1 shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-500 mr-0.5" />
                {driver.rating}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono truncate">
              {driver.moto.marca} • Placa: {driver.moto.placa}
            </p>
          </div>
        </div>

        {/* Driver Wallet Quick Badge, Availability Toggle & Logout */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('cartera')}
            className={`px-2 py-1 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 border transition cursor-pointer ${
              isBlocked 
                ? 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse'
                : driverWallet.saldoUsd < 0
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
            }`}
            title="Ir a mi Cartera"
          >
            <Wallet className="w-3 h-3" />
            <span>${driverWallet.saldoUsd.toFixed(2)}</span>
          </button>

          <button
            onClick={() => updateDriverAvailability(!driver.disponible)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 ${
              driver.disponible
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${driver.disponible ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
            {driver.disponible ? 'Activo' : 'Pausa'}
          </button>

          <button
            onClick={handleDriverLogout}
            className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-red-500/10 hover:text-red-500 text-neutral-500 transition cursor-pointer border border-neutral-200 dark:border-neutral-700 flex items-center gap-1 text-[10px] font-bold"
            title="Cerrar Sesión de Conductor"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>

      {/* Real-time GPS Telemetry & Push Notifications Bar */}
      <div className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-750 flex items-center justify-between text-[10px] shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-2 h-2 rounded-full ${realGpsActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
          <span className="font-bold text-neutral-700 dark:text-neutral-300">
            {realGpsActive ? 'GPS Activo:' : 'GPS Local:'}
          </span>
          <span className="font-mono text-neutral-500 truncate">
            {realGpsCoords 
              ? `${realGpsCoords.lat.toFixed(4)}°, ${realGpsCoords.lng.toFixed(4)}° (±${realGpsCoords.accuracy}m • ${realGpsCoords.speed} km/h)` 
              : driver.ubicacionActual}
          </span>
        </div>
        <button
          onClick={() => requestPushNotificationPermission()}
          className="px-2 py-0.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-650 font-bold text-neutral-700 dark:text-neutral-200 transition shrink-0 cursor-pointer text-[10px]"
          title="Permitir notificaciones de audio y push en pantalla"
        >
          🔔 Notificaciones
        </button>
      </div>

      {/* Negative Balance Hard Limit Warning Banner (Limit: -$0.50 USD) */}
      {isBlocked && (
        <div className="px-3 py-2 bg-red-600 text-white text-xs flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <AlertOctagon className="w-4 h-4 text-white shrink-0 animate-bounce" />
            <span className="text-[11px] font-semibold truncate">
              ⛔ Cartera bloqueada: Saldo deudor ${driverWallet.saldoUsd.toFixed(2)} excede el límite de -$0.50 USD
            </span>
          </div>
          <button
            onClick={() => {
              setActiveTab('cartera');
              setShowRechargeModal(true);
            }}
            className="px-2.5 py-0.5 bg-white text-red-600 font-bold text-[10px] rounded-lg shrink-0 shadow-xs hover:bg-red-50"
          >
            Recargar Ya
          </button>
        </div>
      )}

      {/* Main Viewport Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* TAB 1: VIAJES */}
        {activeTab === 'viajes' && (
          <>
            {/* Sub-view switcher when there is an active ride */}
            {activeRide && (
              <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1 mb-2">
                <button
                  onClick={() => setViajesSubView('activo')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    viajesSubView === 'activo'
                      ? 'bg-white dark:bg-neutral-700 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Viaje en Curso</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </button>
                <button
                  onClick={() => setViajesSubView('disponibles')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    viajesSubView === 'disponibles'
                      ? 'bg-white dark:bg-neutral-700 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <span>Solicitudes ({pendingOffers.length})</span>
                  {pendingOffers.length > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full animate-bounce">
                      {pendingOffers.length}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* If driver has active ride and subview is 'activo' */}
            {activeRide && viajesSubView === 'activo' ? (
              <div className="space-y-3">
                {/* Incoming notification banner if there are also pending offers */}
                {pendingOffers.length > 0 && (
                  <div 
                    onClick={() => setViajesSubView('disponibles')}
                    className="p-3 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                        <Bike className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                          ¡{pendingOffers.length} Pedido{pendingOffers.length > 1 ? 's' : ''} esperando motorizado!
                        </h5>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          {clientOffers.length} de clientes • {storeOffers.length} de comercios
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                      Ver y Aceptar →
                    </span>
                  </div>
                )}

                {/* Active Ride Card */}
                <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border-2 border-amber-500 shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    <div>
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
                        Viaje Activo en Curso
                      </span>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                        Pedido #{activeRide.codigoSeguimiento}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full capitalize">
                      {activeRide.estado.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Real-Time Delivery Countdown Indicator */}
                  {activeRide.estado === 'en_camino_al_cliente' && (
                    <div className="p-3 bg-neutral-900 text-white rounded-xl flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                        <div>
                          <span className="text-[10px] text-neutral-400 block font-medium">
                            Tiempo Estimado para Entrega (En Vivo)
                          </span>
                          <span className="text-base font-extrabold font-mono text-amber-400">
                            {formatCountdown(activeRide.tiempoEstimadoRestanteSegundos)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-amber-500 px-2 py-0.5 rounded font-bold text-neutral-950">
                        Ruta Activa
                      </span>
                    </div>
                  )}

                  {/* Route Points */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase block">1. Retiro en Comercio</span>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200">{activeRide.comercio.nombre}</p>
                        <p className="text-[11px] text-neutral-500">{activeRide.comercio.direccion}</p>
                      </div>
                    </div>

                    <div className="w-0.5 h-3 bg-neutral-300 dark:bg-neutral-700 ml-2.5" />

                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Navigation className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase block">2. Entrega a Cliente</span>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {activeRide.detallesEntregaTienda?.contactoCliente || activeRide.cliente.nombre} {!activeRide.esPedidoTienda && activeRide.cliente.apellido} ({activeRide.detallesEntregaTienda?.telefonoCliente || activeRide.cliente.telefono})
                        </p>
                        <p className="text-[11px] text-neutral-500">{activeRide.detallesEntregaTienda?.ubicacionEscrita || activeRide.cliente.direccion}</p>
                        <p className="text-[10px] text-amber-500 mt-0.5">Ref: {activeRide.detallesEntregaTienda?.puntoReferencia || activeRide.cliente.puntoReferencia || 'Sin referencia'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Communication buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => openCall(`Motorizado ${driver.nombre}`, `${activeRide.detallesEntregaTienda?.contactoCliente || activeRide.cliente.nombre}`, activeRide.detallesEntregaTienda?.telefonoCliente || activeRide.cliente.telefono, 'Cliente')}
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Llamar al Cliente
                    </button>

                    <button
                      onClick={() => openChat(activeRide.id)}
                      className="py-2 px-3 bg-neutral-900 dark:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-neutral-700 shadow-xs cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat del Pedido
                    </button>
                  </div>

                  {/* Primary Action Button */}
                  {activeRide.estado === 'en_camino_al_comercio' && (
                    <button
                      onClick={() => driverPickUpOrder(activeRide.id)}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmar Retiro en {activeRide.comercio.nombre}
                    </button>
                  )}

                  {activeRide.estado === 'en_camino_al_cliente' && (
                    <button
                      onClick={() => setShowDeliveryModal(activeRide.id)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      Tomar Foto Comprobante y Entregar
                    </button>
                  )}

                  <button
                    onClick={() => setShowIncidentModal(true)}
                    className="w-full text-center text-[10px] text-amber-500 hover:underline pt-1 flex items-center justify-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Reportar Incidencia en Ruta (Tráfico, Lluvia, etc.)
                  </button>
                </div>
              </div>
            ) : (
              /* Available orders to accept (from Clients and Stores) */
              <div className="space-y-3">
                {/* Banner linking to Map & Heatmap */}
                <div 
                  onClick={() => setActiveTab('mapa')}
                  className="p-3 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 rounded-2xl flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                      <Flame className="w-4 h-4 animate-bounce" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-neutral-900 dark:text-white">
                        Mapa en Tiempo Real & Zonas de Calor
                      </h5>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                        Visualiza comercios activos y puntos de alta demanda en Caracas
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-500 font-mono flex items-center gap-1">
                    Abrir Mapa →
                  </span>
                </div>

                {/* Filter Selector by Order Origin: Todos | Clientes | Comercios */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 flex-1 overflow-x-auto pb-0.5">
                    <button
                      onClick={() => setOfferOriginFilter('todos')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        offerOriginFilter === 'todos'
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                      }`}
                    >
                      <Filter className="w-3 h-3" />
                      Todos ({pendingOffers.length})
                    </button>
                    <button
                      onClick={() => setOfferOriginFilter('clientes')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        offerOriginFilter === 'clientes'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      De Clientes ({clientOffers.length})
                    </button>
                    <button
                      onClick={() => setOfferOriginFilter('comercios')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        offerOriginFilter === 'comercios'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20'
                      }`}
                    >
                      <Store className="w-3 h-3" />
                      De Comercios ({storeOffers.length})
                    </button>
                  </div>
                </div>

                {/* List of filtered offers */}
                {filteredOffers.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Solicitudes Disponibles para Aceptar ({filteredOffers.length})
                      </h4>
                      <span className="text-[10px] text-amber-500 font-bold">
                        En vivo • Caracas
                      </span>
                    </div>

                    {filteredOffers.map(order => {
                      const tripCalculation = calculateDeliveryTripCost(order.metricasTiempo?.distanciaKm || 3.8);

                      return (
                        <div
                          key={order.id}
                          className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border-2 border-neutral-200 dark:border-neutral-750 shadow-sm space-y-3 hover:border-amber-500/40 transition"
                        >
                          {/* Order Origin Header & Net Profit */}
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {order.esPedidoTienda ? (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
                                    <Store className="w-3 h-3" />
                                    SOLICITUD DIRECTA DE COMERCIO
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                    <Smartphone className="w-3 h-3" />
                                    PEDIDO DE CLIENTE (VIXY APP)
                                  </span>
                                )}

                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  order.estado === 'en_preparacion' 
                                    ? 'bg-amber-500/10 text-amber-600' 
                                    : 'bg-emerald-500/10 text-emerald-600'
                                }`}>
                                  {order.estado === 'en_preparacion' ? '🍳 En Preparación' : '📦 Listo p/ Retiro'}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-neutral-900 dark:text-white mt-1">
                                #{order.codigoSeguimiento} • Retiro en {order.comercio.nombre}
                              </h4>
                              <p className="text-[11px] text-neutral-500">{order.comercio.direccion}</p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-sm font-extrabold text-emerald-500 font-mono block">
                                +${tripCalculation.gananciaMotorizadoUsd.toFixed(2)} USD
                              </span>
                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono block">
                                Bs. {(tripCalculation.gananciaMotorizadoUsd * tasaBcv).toFixed(2)}
                              </span>
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                                Tu Ganancia Neta
                              </span>
                            </div>
                          </div>

                          {/* Route Destination and Address Breakdown */}
                          <div className="p-3 bg-neutral-50 dark:bg-neutral-900/90 rounded-xl space-y-2 text-xs border border-neutral-150 dark:border-neutral-800">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                Destino:{' '}
                                <strong>
                                  {order.detallesEntregaTienda?.contactoCliente || order.cliente.nombre}{' '}
                                  {!order.esPedidoTienda && order.cliente.apellido}
                                </strong>
                              </span>
                              <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                                {tripCalculation.distanciaKm.toFixed(1)} km aprox.
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-1">
                              <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-100 leading-snug">
                                📍 {order.detallesEntregaTienda?.ubicacionEscrita || order.cliente.direccion}
                              </p>
                              {(order.detallesEntregaTienda?.puntoReferencia || order.cliente.puntoReferencia) && (
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                  Ref: {order.detallesEntregaTienda?.puntoReferencia || order.cliente.puntoReferencia}
                                </p>
                              )}
                              {order.detallesEntregaTienda?.zonaMunicipio && (
                                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                  Municipio/Sector: {order.detallesEntregaTienda.zonaMunicipio}
                                </p>
                              )}
                              <p className="text-[10px] text-neutral-500">
                                Contacto: {order.detallesEntregaTienda?.telefonoCliente || order.cliente.telefono}
                              </p>
                            </div>

                            {/* Item Count and Economics breakdown */}
                            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-200 dark:border-neutral-800 text-[10px] font-mono">
                              <div>
                                <span className="text-neutral-400 block">Total Viaje</span>
                                <span className="font-bold text-neutral-900 dark:text-white">
                                  ${tripCalculation.totalViajeUsd.toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-neutral-400 block">Comisión Vixy</span>
                                <span className="text-amber-500">
                                  -${tripCalculation.comisionPlataformaUsd.toFixed(2)} ({deliveryRates.porcentajeComisionDelivery}%)
                                </span>
                              </div>
                              <div>
                                <span className="text-neutral-400 block">Productos</span>
                                <span className="text-neutral-700 dark:text-neutral-300 font-semibold truncate block">
                                  {order.items?.length ?? 0} ítem(s)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: ACEPTAR or RECHAZAR */}
                          {isBlocked ? (
                            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
                              <div className="text-[11px] text-red-600 dark:text-red-400 font-bold flex items-center gap-1.5">
                                <AlertOctagon className="w-4 h-4" />
                                <span>Bloqueado por saldo negativo (-$0.50)</span>
                              </div>
                              <button
                                onClick={() => {
                                  setActiveTab('cartera');
                                  setShowRechargeModal(true);
                                }}
                                className="px-3 py-1 bg-red-600 text-white font-bold text-[10px] rounded-lg shadow-xs cursor-pointer"
                              >
                                Recargar
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                onClick={() => setRejectModalOrderId(order.id)}
                                className="py-2.5 px-3 bg-neutral-100 hover:bg-red-50 dark:bg-neutral-800 dark:hover:bg-red-950/30 text-neutral-700 dark:text-neutral-300 hover:text-red-500 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-neutral-200 dark:border-neutral-700 hover:border-red-500/30"
                              >
                                <X className="w-4 h-4 text-red-500" />
                                Rechazar
                              </button>

                              {/* Prominent Accept Button specifically indicating client or store order */}
                              {order.esPedidoTienda ? (
                                <button
                                  onClick={() => {
                                    driverAcceptOrder(order.id);
                                    setViajesSubView('activo');
                                  }}
                                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
                                >
                                  <Bike className="w-4 h-4" />
                                  Aceptar Pedido de Comercio
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    driverAcceptOrder(order.id);
                                    setViajesSubView('activo');
                                  }}
                                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
                                >
                                  <Bike className="w-4 h-4" />
                                  Aceptar Pedido de Cliente
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 space-y-2">
                    <Bike className="w-10 h-10 mx-auto text-neutral-400" />
                    {pendingOffers.length > 0 ? (
                      <div>
                        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          No hay solicitudes con el filtro seleccionado
                        </p>
                        <button
                          onClick={() => setOfferOriginFilter('todos')}
                          className="mt-2 text-xs font-bold text-amber-500 hover:underline"
                        >
                          Ver todas las solicitudes ({pendingOffers.length})
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-medium">Buscando pedidos cercanos en tu zona...</p>
                        <p className="text-[10px] text-neutral-500 mt-1">
                          Ubicación actual: {driver.ubicacionActual}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* TAB: MAPA EN TIEMPO REAL & MAPA DE CALOR */}
        {activeTab === 'mapa' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  Mapa de Comercios Activos & Calor de Compras
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Monitorea los puntos calientes de Caracas para recibir pedidos con mayor frecuencia
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono font-bold">
                ● Radar Activo
              </span>
            </div>

            {/* Real-Time Caracas Radar & Heatmap Stage */}
            <DeliveryRadarMap />

            {/* Tactical Driver Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-orange-500 block">Zona Más Activa</span>
                <p className="font-bold text-neutral-900 dark:text-white">Las Mercedes Gourmet</p>
                <p className="text-[11px] text-neutral-500">
                  45 pedidos/hora promedio. Alta concentración de restaurantes con ticket promedio de $22.50 USD.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-500 block">Sugerencia Operativa</span>
                <p className="font-bold text-neutral-900 dark:text-white">Posicionamiento en Chacao</p>
                <p className="text-[11px] text-neutral-500">
                  Estar entre Av. Francisco de Miranda y El Rosal reduce el tiempo de búsqueda a menos de 4 minutos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CARTERA INDIVIDUAL (Requisito estricto: Límite negativo de 0.50$ y recargas) */}
        {activeTab === 'cartera' && (
          <div className="space-y-3 text-xs">
            {/* Bento Grid: Balance Card */}
            <div className={`p-4 rounded-2xl border transition shadow-xs space-y-3 ${
              isBlocked 
                ? 'bg-red-500/5 border-red-500/40 dark:bg-red-950/20' 
                : 'bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Mi Cartera Digital</span>
                    <h3 className="font-bold text-neutral-900 dark:text-white">Conductor #{driver.id} (Individual)</h3>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                  isBlocked
                    ? 'bg-red-500 text-white'
                    : driverWallet.saldoUsd < 0
                    ? 'bg-amber-500/20 text-amber-600'
                    : 'bg-emerald-500/20 text-emerald-600'
                }`}>
                  {isBlocked ? 'Bloqueado por Saldo' : driverWallet.saldoUsd < 0 ? 'Saldo Negativo' : 'Solvente'}
                </span>
              </div>

              {/* Saldo Display */}
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Saldo Actual</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-black font-mono ${
                      isBlocked ? 'text-red-600 dark:text-red-400' :
                      driverWallet.saldoUsd < 0 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      ${driverWallet.saldoUsd.toFixed(2)} USD
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      (Bs. {(driverWallet.saldoUsd * tasaBcv).toFixed(2)})
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowRechargeModal(true)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Recargar</span>
                </button>
              </div>

              {/* Strict Venezuelan Delivery Negative Limit Rule */}
              <div className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">
                    Límite Máximo de Saldo Negativo:
                  </span>
                  <span className="font-mono font-extrabold text-red-500">-$0.50 USD</span>
                </div>
                <p className="text-[10px] text-neutral-500 leading-tight">
                  Regla de la plataforma: El conductor puede acumular hasta un máximo de -$0.50 USD de comisiones pendientes. Si el saldo cae por debajo de este límite, el sistema bloquea automáticamente la asignación de viajes hasta que se registre una recarga.
                </p>
              </div>

              {/* Estado Operativo de la Billetera */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">Estado de Operación:</span>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg ${
                  isBlocked 
                    ? 'bg-red-500/15 text-red-500 border border-red-500/30' 
                    : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                }`}>
                  {isBlocked ? 'Inactivo por Saldo Deudor' : 'Activo para Nuevos Servicios'}
                </span>
              </div>
            </div>

            {/* Bento Grid: Statistics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Servicios Realizados</span>
                <span className="text-xl font-extrabold text-neutral-900 dark:text-white font-mono">
                  {driverWallet.serviciosRealizados}
                </span>
                <span className="text-[10px] text-emerald-500 block">Carreras completadas</span>
              </div>

              <div className="p-3 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Comisión por Carrera</span>
                <span className="text-xl font-extrabold text-amber-500 font-mono">$0.35 USD</span>
                <span className="text-[10px] text-neutral-400 block">Total pagado: ${(driverWallet.totalComisionesPagadasUsd ?? (driverWallet as any).totalComisionesPagadas ?? 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Métodos de Pago Habilitados para Recarga */}
            <div className="p-3 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                Métodos de Recarga Soportados en el Backend
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center gap-2">
                  <span className="text-amber-500 font-bold">🟡 Binance Pay</span>
                  <span className="text-[9px] text-neutral-400 ml-auto font-mono">USDT</span>
                </div>
                <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center gap-2">
                  <span className="text-purple-500 font-bold">🟣 Zinli</span>
                  <span className="text-[9px] text-neutral-400 ml-auto font-mono">USD</span>
                </div>
                <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">📱 Pago Móvil</span>
                  <span className="text-[9px] text-neutral-400 ml-auto font-mono">BCV</span>
                </div>
                <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center gap-2">
                  <span className="text-blue-500 font-bold">🔵 PayPal</span>
                  <span className="text-[9px] text-neutral-400 ml-auto font-mono">USD</span>
                </div>
              </div>
            </div>

            {/* Transacciones de Cartera (Tabla SQL) */}
            <div className="p-3 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Historial de Movimientos (SQL: transacciones_cartera_conductor)
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {(driverWallet.historialTransacciones || driverWallet.transacciones || []).length} registros
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(driverWallet.historialTransacciones || driverWallet.transacciones || []).map(tx => {
                  const isCredit = tx.monto > 0;
                  return (
                    <div
                      key={tx.id}
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isCredit ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-800 dark:text-neutral-200 leading-tight">
                            {tx.descripcion}
                          </p>
                          <span className="text-[10px] text-neutral-400">
                            {tx.fecha.slice(11, 16)} • {tx.metodoPago ? tx.metodoPago.replace('_', ' ') : 'Comisión'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono font-bold block ${
                          isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                        }`}>
                          {isCredit ? '+' : ''}${tx.monto.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-neutral-400 font-mono">
                          Saldo: ${tx.saldoResultante.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FICHA LEGAL VENEZOLANA */}
        {activeTab === 'ficha_legal' && (
          <div className="p-3.5 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3.5 text-xs">
            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h4 className="font-bold text-neutral-900 dark:text-white">
                Ficha Legal de Transporte Terrestre (Leyes VE)
              </h4>
            </div>

            {/* Driver Identity */}
            <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Identificación del Conductor</span>
              <p><strong>Nombres y Apellidos:</strong> {driver.nombre} {driver.apellido}</p>
              <p><strong>Cédula de Identidad:</strong> {driver.legal.cedula}</p>
              <p><strong>Teléfono Registrado:</strong> {driver.telefono}</p>
            </div>

            {/* Vehicle Details */}
            <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Datos de la Motocicleta</span>
              <p><strong>Marca y Modelo:</strong> {driver.moto.marca} {driver.moto.modelo} ({driver.moto.ano})</p>
              <p><strong>Color:</strong> {driver.moto.color}</p>
              <p className="text-amber-500 font-bold font-mono"><strong>Placa INTT:</strong> {driver.moto.placa}</p>
              <p className="font-mono text-[11px]"><strong>Serial Motor:</strong> {driver.moto.serialMotor}</p>
              <p className="font-mono text-[11px]"><strong>Serial Chasis:</strong> {driver.moto.serialChasis}</p>
            </div>

            {/* Venezuelan Traffic Law Documents */}
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] space-y-1 text-emerald-800 dark:text-emerald-300">
              <span className="font-bold block">Documentos Obligatorios al Día</span>
              <p>✓ Licencia Grado: {driver.legal.licenciaGrado} (Motos) - N° {driver.legal.licenciaNumero}</p>
              <p>✓ Vencimiento Licencia: {driver.legal.licenciaVencimiento}</p>
              <p>✓ Certificado Médico Vial: {driver.legal.certificadoMedicoNro} (Vence {driver.legal.certificadoMedicoVencimiento})</p>
              <p>✓ Póliza RCV: {driver.legal.rcvAseguradora} - Póliza N° {driver.legal.rcvPolizaNro} (Vence {driver.legal.rcvVencimiento})</p>
            </div>
          </div>
        )}

        {/* TAB 4: RESEÑAS */}
        {activeTab === 'resenas' && (
          <div className="space-y-2.5">
            <div className="p-3.5 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400">Calificación Promedio</span>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  {driver.rating} / 5.0
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 block">Total Entregas</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white font-mono">
                  {driver.totalEntregas} viajes
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {(driver.resenas || []).map((r: any, i: number) => {
                const ratingCount = Math.max(1, Math.min(5, r.calificacion || r.puntos || 5));
                const clientName = r.clienteNombre || r.cliente || 'Cliente Vixy';
                return (
                  <div
                    key={r.id || i}
                    className="p-3 bg-white dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">{clientName}</span>
                      <div className="flex items-center text-amber-500">
                        {[...Array(ratingCount)].map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-neutral-500 text-[11px]">"{r.comentario}"</p>
                    <span className="text-[9px] text-neutral-400 block">{r.fecha}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Recarga de Saldo para Conductor */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-5 max-w-sm w-full shadow-2xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  Recargar Cartera de Conductor
                </h4>
                <p className="text-[10px] text-neutral-400">
                  Saldo actual: <strong className="font-mono">${driverWallet.saldoUsd.toFixed(2)} USD</strong>
                </p>
              </div>
              <button
                onClick={() => setShowRechargeModal(false)}
                className="text-neutral-400 hover:text-white text-base font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleProcessRecharge} className="space-y-3">
              {/* Montos rápidos */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Monto a Recargar ($ USD)</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 3, 5, 10].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      className={`py-1.5 rounded-xl font-bold font-mono text-xs border transition ${
                        rechargeAmount === amt
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
                      }`}
                    >
                      ${amt}.00
                    </button>
                  ))}
                </div>
              </div>

              {/* Método de Pago */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Método de Recarga</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'binance', label: 'Binance Pay' },
                    { id: 'zinli', label: 'Zinli' },
                    { id: 'pago_movil', label: 'Pago Móvil BCV' },
                    { id: 'paypal', label: 'PayPal' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setRechargeMethod(m.id as MetodoPagoTipo)}
                      className={`p-2 rounded-xl text-left border font-semibold text-[11px] transition ${
                        rechargeMethod === m.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Datos de destino para transferir */}
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[11px] space-y-0.5 font-mono">
                {rechargeMethod === 'binance' && (
                  <>
                    <p className="font-bold text-amber-500">Binance Pay ID Vixy:</p>
                    <p className="text-neutral-700 dark:text-neutral-300">Pay ID: <strong>294810294</strong></p>
                    <p className="text-neutral-500 text-[10px]">Nickname: VixyLogisticsGlobal</p>
                  </>
                )}
                {rechargeMethod === 'zinli' && (
                  <>
                    <p className="font-bold text-purple-500">Zinli Wallet:</p>
                    <p className="text-neutral-700 dark:text-neutral-300">Email: <strong>recargas@vixy.com</strong></p>
                  </>
                )}
                {rechargeMethod === 'pago_movil' && (
                  <>
                    <p className="font-bold text-emerald-500">Pago Móvil Recargas:</p>
                    <p className="text-neutral-700 dark:text-neutral-300">Banco: 0102 (Venezuela) • Tel: 0412-9988112</p>
                    <p className="text-neutral-500 text-[10px]">Monto en Bs: Bs. {(rechargeAmount * tasaBcv).toFixed(2)}</p>
                  </>
                )}
                {rechargeMethod === 'paypal' && (
                  <>
                    <p className="font-bold text-blue-500">PayPal Recargas:</p>
                    <p className="text-neutral-700 dark:text-neutral-300">Email: <strong>pagos@vixy.com</strong></p>
                  </>
                )}
              </div>

              {/* Referencia */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">N° de Referencia / ID de Pago</label>
                <input
                  type="text"
                  required
                  value={rechargeReference}
                  onChange={(e) => setRechargeReference(e.target.value)}
                  placeholder="Ej: REF-98124021"
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Confirmar Recarga de ${rechargeAmount.toFixed(2)} USD
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tomar foto comprobante y finalizar entrega */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-5 max-w-sm w-full shadow-2xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <h4 className="font-bold text-neutral-900 dark:text-white">
                Comprobante Fotográfico de Entrega
              </h4>
              <button
                onClick={() => setShowDeliveryModal(null)}
                className="text-neutral-400 hover:text-white text-base font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="w-full h-44 rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-700 relative bg-neutral-900">
                <img
                  src={photoPreview}
                  alt="Comprobante de entrega"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 text-emerald-400 rounded text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>
                    GPS: {realGpsCoords ? `${realGpsCoords.lat.toFixed(5)}° N, ${Math.abs(realGpsCoords.lng).toFixed(5)}° W` : '10.4965° N, -66.8523° W'}
                  </span>
                </span>
              </div>

              {/* Botón de captura con cámara o archivo real */}
              <label className="w-full py-2 px-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 cursor-pointer text-xs flex items-center justify-center gap-2 transition">
                <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Tomar Foto con Cámara / Cargar Imagen</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handlePhotoCapture} 
                  className="hidden" 
                />
              </label>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Observaciones</label>
                <input
                  type="text"
                  value={photoComment}
                  onChange={(e) => setPhotoComment(e.target.value)}
                  placeholder="Detalles de recepción del paquete..."
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
                />
              </div>

              <p className="text-[10px] text-neutral-400">
                El comprobante se registra en <code className="text-amber-500 font-mono">/backend/php/uploads/entregas/</code> y se asocia al pedido en MySQL.
              </p>

              <button
                onClick={() => handleFinishDelivery(showDeliveryModal)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                Confirmar y Registrar Entrega en Base de Datos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reportar Incidencia */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateIncident} className="bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-5 max-w-sm w-full shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <h4 className="font-bold text-neutral-900 dark:text-white">
                Reportar Incidencia en Tiempo Real
              </h4>
              <button type="button" onClick={() => setShowIncidentModal(false)} className="text-neutral-400 text-base">×</button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-neutral-400">Tipo de Incidencia</label>
              <select
                value={incidentType}
                onChange={(e: any) => setIncidentType(e.target.value)}
                className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
              >
                <option value="retraso">Retraso por Tráfico / Lluvia Fuerte</option>
                <option value="accidente_moto">Falla Mecánica o Desperfecto de Moto</option>
                <option value="cliente_ausente">Cliente no contesta llamadas</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-neutral-400">Detalles</label>
              <textarea
                value={incidentDesc}
                onChange={(e) => setIncidentDesc(e.target.value)}
                placeholder="Describe brevemente el suceso..."
                rows={3}
                className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-500 text-white font-bold rounded-xl text-xs"
            >
              Enviar a Operaciones Web
            </button>
          </form>
        </div>
      )}

      {/* Modal: Rechazar Pedido */}
      {rejectModalOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-5 max-w-sm w-full shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-1.5 text-red-500 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Rechazar Solicitud de Pedido</span>
              </div>
              <button 
                type="button" 
                onClick={() => setRejectModalOrderId(null)} 
                className="text-neutral-400 hover:text-white text-base cursor-pointer"
              >
                ×
              </button>
            </div>

            <p className="text-[11px] text-neutral-600 dark:text-neutral-300">
              Indica el motivo del rechazo. El pedido volverá inmediatamente al radar general para que otro conductor cercano en Caracas pueda tomarlo.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-neutral-400">Motivo del Rechazo</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
              >
                <option value="Distancia no conveniente / zona congestionada">Distancia no conveniente / zona congestionada</option>
                <option value="Lluvia intensa en la ruta">Lluvia intensa en la ruta</option>
                <option value="Carga de combustible o falla mecánica">Carga de combustible o falla mecánica</option>
                <option value="Capacidad de baúl/caja insuficiente">Capacidad de baúl/caja insuficiente</option>
                <option value="Otro motivo personal">Otro motivo personal</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOrderId(null)}
                className="flex-1 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  driverRejectOrder(rejectModalOrderId, rejectReason);
                  setRejectModalOrderId(null);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Driver Navigation Bar (5 tabs) */}
      <div className="p-2 bg-white dark:bg-neutral-850 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-5 gap-1 shrink-0 text-center">
        <button
          onClick={() => {
            setActiveTab('viajes');
            if (!activeRide) setViajesSubView('disponibles');
          }}
          className={`py-1.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 transition cursor-pointer relative ${
            activeTab === 'viajes' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <div className="relative">
            <Bike className="w-4 h-4" />
            {pendingOffers.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1 min-w-3.5 h-3.5 bg-purple-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-bounce">
                {pendingOffers.length}
              </span>
            )}
          </div>
          <span className="text-[10px]">Viajes</span>
        </button>

        <button
          onClick={() => setActiveTab('mapa')}
          className={`py-1.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 transition cursor-pointer ${
            activeTab === 'mapa' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px]">Mapa & Calor</span>
        </button>

        <button
          onClick={() => setActiveTab('cartera')}
          className={`py-1.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 transition cursor-pointer relative ${
            activeTab === 'cartera' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span className="text-[10px]">Cartera</span>
          {isBlocked && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('ficha_legal')}
          className={`py-1.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 transition cursor-pointer ${
            activeTab === 'ficha_legal' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px]">Leyes VE</span>
        </button>

        <button
          onClick={() => setActiveTab('resenas')}
          className={`py-1.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 transition cursor-pointer ${
            activeTab === 'resenas' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Star className="w-4 h-4" />
          <span className="text-[10px]">Opiniones</span>
        </button>
      </div>
    </div>
  );
};
