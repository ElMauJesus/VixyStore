import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Star, 
  Plus, 
  Minus, 
  Clock, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  CreditCard,
  Send,
  LogOut,
  Wallet,
  User,
  Lock,
  ShieldCheck,
  FileText,
  FileImage,
  Eye,
  History,
  Database,
  Check,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeft,
  Store,
  XCircle,
  ChefHat
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { MetodoPagoTipo } from '../../types/delivery';
import { StoreInfoModal } from '../client/StoreInfoModal';
import { ClientClaimsView } from '../client/ClientClaimsView';
import { OrderDeliveryConfirmationCard } from '../client/OrderDeliveryConfirmationCard';
import { OrderTrackingMap } from '../common/OrderTrackingMap';

export const ClientApp: React.FC = () => {
  const { 
    client, 
    clientWallet,
    clientLoggedIn,
    loginClient,
    registerClient,
    logoutClient,
    rechargeClientWallet,
    solicitarRecargaCliente,
    rechargeRequests,
    claims,
    store,
    stores,
    switchStore,
    orders, 
    createOrder, 
    driver, 
    tasaBcv, 
    openCall, 
    openChat, 
    rateDriver,
    sendSupportMessage
  } = useDelivery();

  const [activeTab, setActiveTab] = useState<'menu' | 'cartera' | 'seguimiento' | 'reclamos' | 'perfil'>('menu');
  const [showStoreInfoModal, setShowStoreInfoModal] = useState(false);
  const [cart, setCart] = useState<{ [productId: string]: number }>({
    'prod-1': 1,
    'prod-3': 1
  });
  const [metodoPago, setMetodoPago] = useState<MetodoPagoTipo>('saldo_cartera');
  const [referencia, setReferencia] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [showSupportInput, setShowSupportInput] = useState(false);
  const [supportText, setSupportText] = useState('');

  // Authentication state for Vixy Pedidos (Login / Register with SQL unique validation)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginIdentifier, setLoginIdentifier] = useState('0414-1234567');
  const [loginPassword, setLoginPassword] = useState('cliente123');
  const [authError, setAuthError] = useState('');

  // Registration form fields
  const [regCedula, setRegCedula] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regUsuario, setRegUsuario] = useState('');
  const [regClave, setRegClave] = useState('');
  const [regDireccion, setRegDireccion] = useState('Chacao, Av. Francisco de Miranda, Edif. Parque Cristal');
  const [regPuntoRef, setRegPuntoRef] = useState('Piso 4, Ofic. 402');

  // Wallet Recharge Modal State
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmountUsd, setRechargeAmountUsd] = useState<number>(10);
  const [rechargePaymentMethod, setRechargePaymentMethod] = useState<'pago_movil' | 'zelle' | 'zinli' | 'binance'>('pago_movil');
  const [rechargeReference, setRechargeReference] = useState('');
  const [rechargeError, setRechargeError] = useState('');
  const [rechargeSuccess, setRechargeSuccess] = useState(false);

  // Driver Presentation Full Card Modal
  const [showDriverPresentationModal, setShowDriverPresentationModal] = useState(false);

  // Wallet Transaction Receipt Inspection Modal
  const [selectedWalletTx, setSelectedWalletTx] = useState<any | null>(null);

  // ¿Qué quieres comprar hoy? Categorías de Vixy Pedidos
  const [selectedBuyCategory, setSelectedBuyCategory] = useState<string>('todos');
  // Store navigation: null shows the store directory; a store id shows that store's available products
  const [selectedStoreForView, setSelectedStoreForView] = useState<string | null>(null);

  // Find latest order for this client
  const clientOrders = orders.filter(o => o.cliente.id === client.id);
  const latestOrder = clientOrders[0] || null;

  // Verificación en tiempo real de estatus y horarios de atención del comercio
  const isStoreAvailable = store.activo !== false && store.abierto !== false;

  const updateQuantity = (id: string, delta: number) => {
    if (delta > 0 && !isStoreAvailable) {
      alert(`⚠️ Lo sentimos: "${store.nombre}" se encuentra actualmente inactivo o fuera de horario de atención (${store.horaApertura || '08:00'} - ${store.horaCierre || '22:00'}). No se admiten compras mientras no haya servicio disponible.`);
      return;
    }
    setCart(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const cartItems = Object.entries(cart).map(([prodId, qty]) => {
    const prod = store.productos.find(p => p.id === prodId);
    return prod ? { product: prod, quantity: qty } : null;
  }).filter(Boolean) as { product: any; quantity: number }[];

  const subtotalUsd = cartItems.reduce((sum, item) => sum + (item.product.precioUsd * item.quantity), 0);
  const totalUsd = subtotalUsd > 0 ? subtotalUsd + store.costoEnvioUsd : 0;
  const totalBs = totalUsd * tasaBcv;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setAuthError('Por favor ingresa tu identificador (cédula o teléfono) y contraseña.');
      return;
    }
    const res = loginClient(loginIdentifier.trim(), loginPassword);
    if (!res?.success) {
      setAuthError(res?.error || 'Credenciales inválidas.');
    } else {
      setAuthError('');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regCedula.trim() || !regTelefono.trim() || !regNombre.trim() || !regClave.trim()) {
      setAuthError('Cédula, Teléfono, Nombre y Contraseña son campos obligatorios.');
      return;
    }

    const res = registerClient({
      cedula: regCedula.trim(),
      nombre: regNombre.trim(),
      apellido: regApellido.trim() || 'Cliente',
      telefono: regTelefono.trim(),
      username: regUsuario.trim() || ('user_' + regCedula.trim().replace(/[^a-zA-Z0-9]/g, '')),
      password: regClave,
      direccion: regDireccion.trim() || 'Caracas, Venezuela',
      puntoReferencia: regPuntoRef.trim() || 'En puerta'
    });

    if (!res?.success) {
      setAuthError(res?.error || 'Error al registrar cliente.');
    } else {
      setAuthError('');
      alert('¡Cuenta registrada exitosamente en la base de datos SQL! Tu cartera única ya está lista.');
    }
  };

  const handleLogout = () => {
    if (window.confirm('¿Seguro que deseas cerrar la sesión en Vixy Pedidos?')) {
      logoutClient();
    }
  };

  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rechargeAmountUsd <= 0) {
      setRechargeError('Ingresa un monto válido mayor a 0 USD.');
      return;
    }
    if (rechargePaymentMethod !== 'zinli' && !rechargeReference.trim()) {
      setRechargeError('Por favor ingresa el número de referencia del comprobante.');
      return;
    }

    const res = solicitarRecargaCliente(rechargeAmountUsd, rechargePaymentMethod, rechargeReference.trim());
    if (res?.success) {
      setRechargeSuccess(true);
      setRechargeError('');
      setRechargeReference('');
      setTimeout(() => {
        setRechargeSuccess(false);
        setShowRechargeModal(false);
      }, 2500);
    } else {
      setRechargeError(res?.error || 'Error al enviar solicitud de recarga al backend.');
    }
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;

    if (metodoPago === 'saldo_cartera') {
      if ((clientWallet?.saldoUsd ?? 0) < totalUsd) {
        alert(`Saldo insuficiente en tu Cartera Vixy. Tienes $${(clientWallet?.saldoUsd ?? 0).toFixed(2)} USD y el total es $${totalUsd.toFixed(2)} USD. Por favor recarga saldo o selecciona otro método.`);
        return;
      }
    }

    const items = cartItems.map(item => ({
      productoId: item.product.id,
      nombre: item.product.nombre,
      cantidad: item.quantity,
      precioUnitarioUsd: item.product.precioUsd
    }));

    createOrder({
      items,
      metodoPago,
      referenciaPago: referencia || undefined
    });

    setCart({});
    setShowCheckout(false);
    setActiveTab('seguimiento');
  };

  const formatCountdown = (totalSec: number) => {
    if (totalSec <= 0) return '00:00';
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getStatusStep = (estado: string) => {
    switch (estado) {
      case 'pendiente_pago': return 1;
      case 'pago_verificado': return 2;
      case 'en_preparacion': return 3;
      case 'esperando_repartidor': return 4;
      case 'en_camino_al_comercio': return 4;
      case 'en_camino_al_cliente': return 5;
      case 'entregado': return 6;
      default: return 1;
    }
  };

  // CLIENT LOGIN / REGISTER SCREEN (WHEN LOGGED OUT)
  if (!clientLoggedIn) {
    return (
      <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-4 items-center justify-center overflow-y-auto">
        <div className="w-full max-w-sm bg-white dark:bg-neutral-850 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4 my-auto">
          <div className="text-center space-y-1">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-500/20">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-neutral-900 dark:text-white">Vixy Pedidos</h2>
            <p className="text-xs text-neutral-500">Acceso a Clientes y Cartera Personal</p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              className={`py-2 rounded-lg transition cursor-pointer ${
                authMode === 'login' ? 'bg-white dark:bg-neutral-700 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-neutral-500'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
              className={`py-2 rounded-lg transition cursor-pointer ${
                authMode === 'register' ? 'bg-white dark:bg-neutral-700 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-neutral-500'
              }`}
            >
              Crear Cuenta (SQL)
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500">Cédula, Teléfono o Usuario</label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Ej. 0414-1234567 o V-25123456"
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500">Contraseña</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Ingresar a Vixy Pedidos</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">Cédula de Identidad *</label>
                  <input
                    type="text"
                    required
                    value={regCedula}
                    onChange={(e) => setRegCedula(e.target.value)}
                    placeholder="V-28192831"
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">Teléfono Móvil *</label>
                  <input
                    type="text"
                    required
                    value={regTelefono}
                    onChange={(e) => setRegTelefono(e.target.value)}
                    placeholder="0412-5551234"
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">Apellido</label>
                  <input
                    type="text"
                    value={regApellido}
                    onChange={(e) => setRegApellido(e.target.value)}
                    placeholder="Tu apellido"
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">Usuario Personalizado</label>
                  <input
                    type="text"
                    value={regUsuario}
                    onChange={(e) => setRegUsuario(e.target.value)}
                    placeholder="@usuario"
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={regClave}
                    onChange={(e) => setRegClave(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500">Dirección de Entrega</label>
                <input
                  type="text"
                  value={regDireccion}
                  onChange={(e) => setRegDireccion(e.target.value)}
                  placeholder="Av, Edificio, Casa, Sector..."
                  className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500">Punto de Referencia</label>
                <input
                  type="text"
                  value={regPuntoRef}
                  onChange={(e) => setRegPuntoRef(e.target.value)}
                  placeholder="Frente a la plaza, piso 2..."
                  className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Registrarme con Cartera Única SQL</span>
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <button
              type="button"
              onClick={() => {
                loginClient('0414-1234567', 'cliente123');
                setAuthError('');
              }}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              Ingreso Rápido con Cliente Demo (Carlos Mendoza)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* Top Client Bar */}
      <div className="p-3 bg-white dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <img
            src={client.avatarUrl}
            alt={client.nombre}
            className="w-8 h-8 rounded-full object-cover border border-amber-500"
          />
          <div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-800 dark:text-white">
              <span>{client.nombre} {client.apellido}</span>
              <span className="text-[9px] text-neutral-400 font-mono">({client.cedula})</span>
            </div>
            <p className="text-[10px] text-neutral-500 truncate max-w-[150px]">
              {client.direccion.split(',')[0]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Wallet Balance Pill */}
          <button
            onClick={() => setActiveTab('cartera')}
            className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1 border border-amber-500/30 transition cursor-pointer"
            title="Ver Mi Cartera Vixy"
          >
            <Wallet className="w-3 h-3" />
            <span>${(clientWallet?.saldoUsd ?? 0).toFixed(2)}</span>
          </button>

          <div className="text-right hidden sm:block">
            <span className="text-[9px] text-neutral-500 block font-mono">Tasa BCV</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              Bs. {tasaBcv.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => setShowSupportInput(!showSupportInput)}
            className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-amber-500 transition cursor-pointer border border-neutral-200 dark:border-neutral-700"
            title="Soporte en Vivo"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Botón de Cerrar Sesión requerido */}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-red-500/10 hover:text-red-500 text-neutral-500 transition cursor-pointer border border-neutral-200 dark:border-neutral-700 flex items-center gap-1 text-[10px] font-bold"
            title="Cerrar Sesión de Vixy Pedidos"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>

      {/* Quick Support drawer if toggled */}
      {showSupportInput && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-2.5 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-amber-600 dark:text-amber-400 text-[11px]">
              Asistencia Inmediata en Vivo Vixy
            </span>
            <button onClick={() => setShowSupportInput(false)} className="text-neutral-400 hover:text-neutral-600">×</button>
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={supportText}
              onChange={(e) => setSupportText(e.target.value)}
              placeholder="¿Necesitas ayuda con tu pedido o pago?"
              className="flex-1 text-[11px] bg-white dark:bg-neutral-800 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 outline-hidden"
            />
            <button
              onClick={() => {
                if (supportText.trim()) {
                  sendSupportMessage('cliente', client.nombre, supportText.trim());
                  setSupportText('');
                  alert('Tu mensaje ha sido enviado a Soporte en Vivo.');
                }
              }}
              className="px-2 py-1 bg-amber-500 text-white rounded text-[11px] font-medium"
            >
              Enviar
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'menu' && (
          <>
            {/* VIXY PEDIDOS - VISTA 1: DIRECTORIO DE TIENDAS (Cuando no se ha seleccionado tienda) */}
            {!selectedStoreForView && (
              <div className="space-y-3">
                {/* ¿Qué quieres comprar hoy? - Selector de Categorías en carrusel móvil */}
                <div className="p-3 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2 shadow-xs">
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <span className="text-purple-600">🛍️</span> ¿Qué quieres comprar hoy?
                    </h3>
                    <p className="text-[10px] text-neutral-500">
                      Explora por categoría y elige una tienda para ver su catálogo
                    </p>
                  </div>

                  {/* Categorías Principales en Scroll Horizontal Móvil */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: 'todos', label: 'Todos', icon: '🏪' },
                      { id: 'hogar', label: 'Hogar', icon: '🏠' },
                      { id: 'ferreteria', label: 'Ferretería', icon: '🔧' },
                      { id: 'restaurantes', label: 'Restaurantes', icon: '🍽️' },
                      { id: 'comida_rapida', label: 'Comida Rápida', icon: '⚡' },
                      { id: 'supermercados', label: 'Supermercados', icon: '🛒' }
                    ].map(cat => {
                      const isSelected = selectedBuyCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedBuyCategory(cat.id)}
                          className={`px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                            isSelected
                              ? 'border-purple-600 bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold shadow-2xs'
                              : 'border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                          }`}
                        >
                          <span className="text-sm leading-none">{cat.icon}</span>
                          <span className="text-[11px] font-semibold whitespace-nowrap">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Directorio Ordenado de Comercios - Lista Vertical Compacta */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Comercios Disponibles ({stores.filter(s => selectedBuyCategory === 'todos' || s.categoriaPrincipal === selectedBuyCategory).length})
                    </span>
                    <span className="text-[10px] text-neutral-400">Toca para abrir</span>
                  </div>

                  <div className="space-y-2">
                    {stores
                      .filter(s => selectedBuyCategory === 'todos' || s.categoriaPrincipal === selectedBuyCategory)
                      .map(s => {
                        const isStoreActive = s.activo !== false && s.abierto !== false;
                        const isSelected = s.id === store.id;

                        return (
                          <div
                            key={s.id}
                            onClick={() => {
                              switchStore(s.id);
                              setSelectedStoreForView(s.id);
                              setCart({});
                            }}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 bg-white dark:bg-neutral-850 hover:border-purple-500 shadow-2xs ${
                              isSelected
                                ? 'border-purple-600 ring-2 ring-purple-500/20'
                                : 'border-neutral-200 dark:border-neutral-800'
                            }`}
                          >
                            {/* Logo de la tienda */}
                            <img
                              src={s.logoUrl}
                              alt={s.nombre}
                              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                            />

                            {/* Información: Nombre, Horario y Estatus */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <h3 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                                  {s.nombre}
                                </h3>
                                {isStoreActive ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold inline-flex items-center gap-1 shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Abierto
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-750 text-neutral-500 dark:text-neutral-400 text-[9px] font-bold inline-flex items-center gap-1 shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                                    Cerrado
                                  </span>
                                )}
                              </div>

                              {/* Horario de Atención destacado */}
                              <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                                <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                <span className="truncate">Horario: {s.horaApertura || '08:00'} - {s.horaCierre || '22:00'}</span>
                              </div>

                              {/* Categoría, Calificación y Envío */}
                              <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-0.5 truncate">
                                <span className="truncate">{s.categoria}</span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 font-bold text-amber-500 shrink-0">
                                  <Star className="w-3 h-3 fill-amber-400" />
                                  {s.calificacion}
                                </span>
                                <span>•</span>
                                <span className="shrink-0 font-medium text-neutral-600 dark:text-neutral-400">
                                  ${(s.costoEnvioUsd ?? 2.5).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Flecha navegación */}
                            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* VIXY PEDIDOS - VISTA 2: CATÁLOGO Y ARTÍCULOS DE LA TIENDA SELECCIONADA */}
            {selectedStoreForView && (
              <div className="space-y-3">
                {/* Botón de Regreso al directorio */}
                <button
                  type="button"
                  onClick={() => setSelectedStoreForView(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:text-purple-600 bg-white dark:bg-neutral-850 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs cursor-pointer transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-purple-600" />
                  <span>Volver a todas las tiendas</span>
                </button>

                {/* Encabezado Principal de la Tienda: Portada, Logo, Nombre y Horario */}
                <div className="rounded-2xl overflow-hidden shadow-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850">
                  <div className="relative h-24 w-full bg-neutral-200 dark:bg-neutral-800">
                    <img
                      src={store.portadaUrl}
                      alt={store.nombre}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>

                  <div className="p-3 pt-0">
                    <div className="flex items-end justify-between gap-2 -mt-7 mb-1.5">
                      <img
                        src={store.logoUrl}
                        alt={store.nombre}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-white dark:border-neutral-800 shadow-md shrink-0 bg-white dark:bg-neutral-800"
                      />
                      <div className="flex items-center gap-1.5 pb-0.5">
                        {isStoreAvailable ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Abierto
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Cerrado
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setShowStoreInfoModal(true)}
                          className="flex items-center gap-1 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-0.5 rounded-full text-purple-600 dark:text-purple-400 text-[10px] font-bold transition cursor-pointer border border-purple-500/30"
                          title="Ver Horarios y Calificaciones"
                        >
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{store.calificacion}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-sm font-black text-neutral-900 dark:text-white leading-tight truncate">
                        {store.nombre}
                      </h2>

                      {/* Horario de Atención destacado */}
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mt-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">Horario de atención: {store.horaApertura || '08:00'} - {store.horaCierre || '22:00'}</span>
                      </div>

                      <p className="text-[10px] text-neutral-500 mt-0.5 truncate">
                        {store.categoria} • Dirección: {store.direccion || 'Caracas, Venezuela'}
                      </p>
                    </div>

                    {/* Banner de Advertencia si el local está inactivo */}
                    {!isStoreAvailable && (
                      <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-800 dark:text-amber-300 text-[10px] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>Comercio cerrado o inactivo en este momento.</span>
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500">
                      <span>Envío: ${(store.costoEnvioUsd ?? 2.5).toFixed(2)} USD</span>
                      <span className="font-mono font-medium">BCV: Bs. {tasaBcv.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Lista de Artículos Disponibles de la Tienda - Lista Vertical */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                      <span>Artículos Disponibles ({store.productos.length})</span>
                    </h3>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      USD / Bs
                    </span>
                  </div>

                  <div className="space-y-2">
                    {store.productos.map((prod) => {
                      const qty = cart[prod.id] || 0;
                      return (
                        <div
                          key={prod.id}
                          className="p-2.5 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex gap-3 shadow-2xs"
                        >
                          <img
                            src={prod.imagenUrl}
                            alt={prod.nombre}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded inline-block mb-0.5">
                                {prod.categoria || 'Menú'}
                              </span>
                              <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-tight truncate">
                                {prod.nombre}
                              </h4>
                              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mt-0.5">
                                {prod.descripcion}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                              <div>
                                <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                                  ${(prod.precioUsd ?? 0).toFixed(2)}
                                </span>
                                <span className="text-[10px] text-neutral-400 font-mono ml-1">
                                  (Bs. {(prod.precioBs ?? ((prod.precioUsd ?? 0) * tasaBcv) ?? 0).toFixed(2)})
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {qty > 0 ? (
                                  <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5 border border-neutral-200 dark:border-neutral-700">
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(prod.id, -1)}
                                      className="w-5 h-5 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white flex items-center justify-center text-xs font-bold hover:bg-neutral-200 transition cursor-pointer"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-bold px-1 min-w-[16px] text-center">{qty}</span>
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(prod.id, 1)}
                                      className="w-5 h-5 rounded bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center text-xs font-bold transition cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(prod.id, 1)}
                                    disabled={!isStoreAvailable}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition ${
                                      isStoreAvailable
                                        ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                                    }`}
                                    title={isStoreAvailable ? 'Agregar al pedido' : 'Comercio inactivo o fuera de horario'}
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>{isStoreAvailable ? 'Agregar' : 'Cerrado'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Cart Floating Bar */}
            {cartItems.length > 0 && !showCheckout && (
              <div className="sticky bottom-2 p-3 bg-neutral-900 text-white rounded-2xl shadow-2xl flex items-center justify-between border border-neutral-700 z-30">
                <div className="space-y-0.5">
                  <span className="text-xs text-neutral-300 block">
                    {cartItems.reduce((c, i) => c + i.quantity, 0)} {cartItems.reduce((c, i) => c + i.quantity, 0) === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                  </span>
                  <span className="text-sm font-black text-amber-400 font-mono">
                    ${totalUsd.toFixed(2)} USD <span className="text-xs text-neutral-300 font-normal">• Bs. {totalBs.toFixed(2)}</span>
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (!isStoreAvailable) {
                      alert('No es posible proceder al pago: el comercio se encuentra inactivo o fuera de su horario laboral.');
                      return;
                    }
                    setShowCheckout(true);
                  }}
                  disabled={!isStoreAvailable}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition ${
                    isStoreAvailable
                      ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer active:scale-95'
                      : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  <span>{isStoreAvailable ? 'Procesar Pedido' : 'Local Inactivo'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Direct Payment Checkout Modal */}
            {showCheckout && (
              <div className="bg-white dark:bg-neutral-850 p-4 rounded-2xl border border-amber-500/40 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    Pago Directo al Comercio
                  </h4>
                  <button onClick={() => setShowCheckout(false)} className="text-xs text-neutral-400">
                    Cancelar
                  </button>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span>${(subtotalUsd ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Delivery Motorizado</span>
                    <span>${(store.costoEnvioUsd ?? 2.5).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-neutral-900 dark:text-white pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <span>Total a Pagar</span>
                    <span className="text-amber-500 font-mono">${(totalUsd ?? 0).toFixed(2)} (Bs. {(totalBs ?? 0).toFixed(2)})</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase">
                    Selecciona Forma de Pago Directo
                  </label>
                  
                  {/* Saldo de Cartera Vixy button - Primary option */}
                  <button
                    type="button"
                    onClick={() => setMetodoPago('saldo_cartera')}
                    className={`w-full p-2.5 rounded-2xl text-left border transition cursor-pointer flex items-center justify-between ${
                      metodoPago === 'saldo_cartera'
                        ? 'border-amber-500 bg-amber-500/10 text-neutral-900 dark:text-white shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs block">Mi Cartera Vixy (Acreditación Inmediata)</span>
                        <span className="text-[10px] text-neutral-500">
                          Saldo actual: ${(clientWallet?.saldoUsd ?? 0).toFixed(2)} USD (Bs. {((clientWallet?.saldoUsd ?? 0) * tasaBcv).toFixed(2)})
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      (clientWallet?.saldoUsd ?? 0) >= totalUsd 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {(clientWallet?.saldoUsd ?? 0) >= totalUsd ? 'Disponible' : 'Insuficiente'}
                    </span>
                  </button>

                  <div className="grid grid-cols-3 gap-1.5 text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => setMetodoPago('pago_movil')}
                      className={`p-2 rounded-xl text-center border font-semibold transition cursor-pointer ${
                        metodoPago === 'pago_movil'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      Pago Móvil
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetodoPago('zinli')}
                      className={`p-2 rounded-xl text-center border font-semibold transition cursor-pointer ${
                        metodoPago === 'zinli'
                          ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      Zinli
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetodoPago('binance')}
                      className={`p-2 rounded-xl text-center border font-semibold transition cursor-pointer ${
                        metodoPago === 'binance'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      Binance Pay
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetodoPago('paypal')}
                      className={`p-2 rounded-xl text-center border font-semibold transition cursor-pointer ${
                        metodoPago === 'paypal'
                          ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      PayPal
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetodoPago('zelle')}
                      className={`p-2 rounded-xl text-center border font-semibold transition cursor-pointer ${
                        metodoPago === 'zelle'
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      Zelle
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetodoPago('efectivo_usd')}
                      className={`p-2 rounded-xl text-center border font-semibold transition cursor-pointer ${
                        metodoPago === 'efectivo_usd'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      Efectivo $
                    </button>
                  </div>
                </div>

                {/* Direct payment instructions */}
                {metodoPago === 'saldo_cartera' && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5" />
                        Abono con Saldo en Cartera
                      </span>
                      <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                        ${(clientWallet?.saldoUsd ?? 0).toFixed(2)} USD
                      </span>
                    </div>

                    {(clientWallet?.saldoUsd ?? 0) >= totalUsd ? (
                      <div className="p-2 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-xl text-[11px] flex items-start gap-2">
                        <Check className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                        <div>
                          <strong>¡Saldo disponible suficiente!</strong>
                          <p className="text-[10px] mt-0.5">
                            Al confirmar, se debitarán <strong>${totalUsd.toFixed(2)} USD</strong> (Bs. {totalBs.toFixed(2)}) de tu billetera y se acreditarán automáticamente a la cartera de <strong>{store.nombre}</strong>.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-red-500/15 text-red-700 dark:text-red-300 rounded-xl text-[11px] space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                          <div>
                            <strong>Saldo insuficiente</strong>
                            <p className="text-[10px] mt-0.5">
                              Te faltan ${(totalUsd - (clientWallet?.saldoUsd ?? 0)).toFixed(2)} USD para pagar este pedido con cartera.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowRechargeModal(true)}
                          className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Recargar Cartera Ahora</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {metodoPago === 'pago_movil' && (
                  <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[11px] space-y-1">
                    <p className="font-bold text-neutral-700 dark:text-neutral-200">Datos Pago Móvil ({store.nombre}):</p>
                    <p className="text-neutral-600 dark:text-neutral-400">Banco: {store.metodosPago.pagoMovil.banco}</p>
                    <p className="text-neutral-600 dark:text-neutral-400">Tel: {store.metodosPago.pagoMovil.telefono}</p>
                    <p className="text-neutral-600 dark:text-neutral-400">RIF: {store.metodosPago.pagoMovil.cedula}</p>
                    <p className="text-amber-600 dark:text-amber-400 font-mono font-bold">Monto Exacto: Bs. {totalBs.toFixed(2)}</p>
                    <input
                      type="text"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="Ingresa últimos 6 u 8 dígitos de referencia"
                      className="w-full mt-1.5 p-1.5 bg-white dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-700 text-xs"
                    />
                  </div>
                )}

                {metodoPago === 'zinli' && (
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] space-y-1">
                    <p className="font-bold text-purple-700 dark:text-purple-300">Cuenta Zinli del Comercio:</p>
                    <p className="text-neutral-600 dark:text-neutral-300 font-mono">Email: {store.metodosPago.zinli?.email || 'pagos@vixystore.com'}</p>
                    <p className="text-purple-600 dark:text-purple-400 font-mono font-bold">Monto a Enviar: ${totalUsd.toFixed(2)} USD</p>
                    <input
                      type="text"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="Ingresa número de comprobante o email remitente Zinli"
                      className="w-full mt-1.5 p-1.5 bg-white dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-700 text-xs"
                    />
                  </div>
                )}

                {metodoPago === 'binance' && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] space-y-1">
                    <p className="font-bold text-amber-700 dark:text-amber-300">Binance Pay (USDT):</p>
                    <p className="text-neutral-600 dark:text-neutral-300 font-mono">Pay ID: {store.metodosPago.binance?.payId || '839201948'}</p>
                    <p className="text-neutral-600 dark:text-neutral-300 font-mono">Nickname: {store.metodosPago.binance?.nickname || store.nombre}</p>
                    <p className="text-amber-600 dark:text-amber-400 font-mono font-bold">Monto: ${totalUsd.toFixed(2)} USDT</p>
                    <input
                      type="text"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="Ingresa Order ID o ID de transacción Binance"
                      className="w-full mt-1.5 p-1.5 bg-white dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-700 text-xs"
                    />
                  </div>
                )}

                {metodoPago === 'paypal' && (
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] space-y-1">
                    <p className="font-bold text-blue-700 dark:text-blue-300">Cuenta PayPal:</p>
                    <p className="text-neutral-600 dark:text-neutral-300 font-mono">Email: {store.metodosPago.paypal?.email || 'ventas@burgerhouse.com'}</p>
                    <p className="text-blue-600 dark:text-blue-400 font-mono font-bold">Monto: ${totalUsd.toFixed(2)} USD</p>
                    <input
                      type="text"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="ID de Transacción PayPal / Correo pagador"
                      className="w-full mt-1.5 p-1.5 bg-white dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-700 text-xs"
                    />
                  </div>
                )}

                {metodoPago === 'zelle' && (
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] space-y-1">
                    <p className="font-bold text-indigo-700 dark:text-indigo-300">Datos Zelle ({store.nombre}):</p>
                    <p className="text-neutral-600 dark:text-neutral-300">Email: {store.metodosPago.zelle.email}</p>
                    <p className="text-neutral-600 dark:text-neutral-300">Titular: {store.metodosPago.zelle.titular}</p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">Monto: ${totalUsd.toFixed(2)} USD</p>
                    <input
                      type="text"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="Nombre del titular o confirmación Zelle"
                      className="w-full mt-1.5 p-1.5 bg-white dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-700 text-xs"
                    />
                  </div>
                )}

                {metodoPago === 'efectivo_usd' && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] space-y-1">
                    <p className="font-bold text-emerald-700 dark:text-emerald-300">Pago en Efectivo Divisa ($ USD):</p>
                    <p className="text-neutral-600 dark:text-neutral-300">{store.metodosPago.efectivoUsd.instrucciones}</p>
                    <p className="text-amber-600 dark:text-amber-400 font-medium">
                      ⚠️ Entregar monto exacto o especificar con cuánto pagas para que el repartidor lleve cambio.
                    </p>
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar y Enviar Pedido
                </button>
              </div>
            )}
          </>
        )}

        {/* TAB: CARTERA PERSONAL DEL CLIENTE */}
        {activeTab === 'cartera' && (
          <div className="space-y-3.5 text-xs">
            {/* Wallet Balance Card */}
            <div className="p-4 bg-linear-to-br from-amber-500 to-amber-600 text-white rounded-3xl shadow-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    Mi Cartera Personal Vixy
                  </span>
                  <h3 className="text-2xl font-black font-mono mt-0.5">
                    ${(clientWallet?.saldoUsd ?? 0).toFixed(2)} <span className="text-sm font-normal text-amber-100">USD</span>
                  </h3>
                </div>
                <div className="text-right bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-xl">
                  <span className="text-[9px] uppercase tracking-wider text-amber-100 block font-mono">Tasa BCV</span>
                  <span className="text-xs font-bold font-mono">Bs. {tasaBcv.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-2.5 bg-black/15 rounded-2xl flex justify-between items-center text-[11px]">
                <span className="text-amber-100">Equivalente Oficial en Bolívares:</span>
                <span className="font-extrabold font-mono text-white text-xs">
                  Bs. {((clientWallet?.saldoUsd ?? 0) * tasaBcv).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/20">
                <div className="text-[11px]">
                  <span className="text-[10px] text-amber-200 block">Total Recargado</span>
                  <strong className="font-mono">${(clientWallet?.totalRecargadoUsd ?? 0).toFixed(2)} USD</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRechargeModal(true)}
                  className="px-3 py-1.5 bg-white text-amber-600 font-bold rounded-xl text-xs shadow-xs hover:bg-amber-50 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Recargar Saldo</span>
                </button>
              </div>
            </div>

            {/* SQL Sync Banner */}
            <div className="p-3 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                    Tabla SQL: <code className="text-amber-500 font-mono">cliente_billeteras</code>
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    Saldos vinculados al C.I. {client.cedula} con acreditación directa a comercios
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                Activa
              </span>
            </div>

            {/* Transaction History */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 text-xs">
                  <History className="w-3.5 h-3.5 text-amber-500" />
                  Movimientos y Recibos Digitales
                </h4>
                <span className="text-[10px] text-neutral-400">
                  {clientWallet?.historialTransacciones?.length ?? 0} registros
                </span>
              </div>

              {(!clientWallet?.historialTransacciones || clientWallet.historialTransacciones.length === 0) ? (
                <div className="p-6 text-center bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-400">
                  <Wallet className="w-8 h-8 mx-auto text-neutral-300 mb-1" />
                  <p className="text-xs">No hay movimientos registrados en tu cartera.</p>
                </div>
              ) : (
                clientWallet.historialTransacciones.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              tx.tipo === 'recarga' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span className="font-bold text-neutral-900 dark:text-white text-xs capitalize">
                            {tx.concepto || (tx.tipo === 'recarga' ? 'Recarga de Cartera' : 'Pago de Pedido')}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-mono pl-3.5">
                          {new Date(tx.fecha).toLocaleString('es-VE')} {tx.referencia ? `• Ref: ${tx.referencia}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-xs ${
                            tx.tipo === 'recarga'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-neutral-800 dark:text-neutral-200'
                          }`}
                        >
                          {tx.tipo === 'recarga' ? '+' : '-'}${tx.montoUsd.toFixed(2)} USD
                        </span>
                        <span className="text-[9px] text-neutral-400 font-mono block">
                          Bs. {tx.montoBs ? tx.montoBs.toFixed(2) : (tx.montoUsd * tasaBcv).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {tx.comprobanteRuta && (
                      <div className="pt-1.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[10px]">
                        <span className="text-neutral-500 truncate max-w-[200px] font-mono">
                          📁 {tx.comprobanteRuta}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedWalletTx(tx)}
                          className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold hover:bg-amber-500/20 cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver Recibo</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Real-time Order Tracking Tab */}
        {activeTab === 'seguimiento' && (
          <div className="space-y-3">
            {!latestOrder ? (
              <div className="p-8 text-center bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <ShoppingBag className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                <p className="text-xs text-neutral-500 font-medium">No tienes ningún pedido activo en este momento.</p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="mt-3 px-4 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold"
                >
                  Ver Menú
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Active Tracking Card */}
                <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-500">
                        Pedido #{latestOrder.codigoSeguimiento}
                      </span>
                      <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                        {store.nombre}
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 capitalize">
                      {latestOrder.estado.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Order Status Context Banner */}
                  {latestOrder.estado === 'cancelado' ? (
                    <div className="my-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl space-y-2.5">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>Solicitud Rechazada por el Comercio</span>
                      </div>
                      <div className="p-2.5 bg-white/70 dark:bg-neutral-800/80 rounded-xl border border-red-500/20 text-xs text-neutral-700 dark:text-neutral-300">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">Motivo del comercio:</span>
                        <p className="font-semibold text-red-700 dark:text-red-300">
                          {(() => {
                            const cancelLog = latestOrder.historialOperaciones?.slice().reverse().find(h => h.accion.toLowerCase().includes('canceló') || h.accion.toLowerCase().includes('rechazó'));
                            return cancelLog?.detalles || 'El comercio no pudo aceptar tu comanda en este momento por disponibilidad de cocina o inventario.';
                          })()}
                        </p>
                      </div>

                      {latestOrder.metodoPagoSeleccionado === 'saldo_cartera' && (
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Reembolso exitoso: ${(latestOrder.montoTotalUsd).toFixed(2)} USD devueltos a tu Cartera</span>
                          </div>
                          <button
                            onClick={() => setActiveTab('cartera')}
                            className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold shrink-0 cursor-pointer"
                          >
                            Ver Cartera
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => setActiveTab('menu')}
                        className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                      >
                        Ver Menú y Realizar Otro Pedido
                      </button>
                    </div>
                  ) : latestOrder.estado === 'pendiente_pago' || latestOrder.estado === 'pago_verificado' ? (
                    <div className="my-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                      <div className="min-w-0 text-xs">
                        <p className="font-bold text-amber-800 dark:text-amber-200">
                          Esperando aceptación de {store.nombre}
                        </p>
                        <p className="text-[10px] text-neutral-500">
                          El restaurante está revisando el pedido #{latestOrder.codigoSeguimiento} para aceptar o rechazar la solicitud.
                        </p>
                      </div>
                    </div>
                  ) : latestOrder.estado === 'en_preparacion' ? (
                    <div className="my-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                      <ChefHat className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 animate-bounce" />
                      <div className="min-w-0 text-xs">
                        <p className="font-bold text-emerald-800 dark:text-emerald-200">
                          ¡Comanda Aceptada por {store.nombre}!
                        </p>
                        <p className="text-[10px] text-neutral-500">
                          El comercio aceptó tu solicitud y está cocinando tu orden. La flota de delivery está notificada.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Real-Time Delivery Countdown */}
                  {latestOrder.estado === 'en_camino_al_cliente' && (
                    <div className="my-3 p-3 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 rounded-xl border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-500 animate-spin" />
                        <div>
                          <span className="text-[10px] text-neutral-500 font-medium block">
                            Tiempo estimado de entrega en vivo
                          </span>
                          <span className="text-base font-extrabold font-mono text-amber-600 dark:text-amber-400">
                            {formatCountdown(latestOrder.tiempoEstimadoRestanteSegundos)} restantes
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                        En Ruta
                      </span>
                    </div>
                  )}

                  {/* Step Progress Visualizer (only if not cancelled) */}
                  {latestOrder.estado !== 'cancelado' && (
                    <div className="my-3 py-2">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-500 mb-1.5">
                        <span>Recibido</span>
                        <span>Preparando</span>
                        <span>En Moto</span>
                        <span>Entregado</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                        <div
                          className="bg-amber-500 h-full transition-all duration-500"
                          style={{ width: `${(getStatusStep(latestOrder.estado) / 6) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Items summary */}
                  <div className="py-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] space-y-1">
                    {latestOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>{it.cantidad}x {it.nombre}</span>
                        <span>${(it.subtotalUsd ?? (it.precioUnitarioUsd * it.cantidad) ?? 0).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-1 border-t border-neutral-100 dark:border-neutral-800 text-neutral-900 dark:text-white">
                      <span>Total</span>
                      <span>${(latestOrder.montoTotalUsd ?? 0).toFixed(2)} (Bs. {(latestOrder.montoTotalBs ?? ((latestOrder.montoTotalUsd ?? 0) * tasaBcv) ?? 0).toFixed(2)})</span>
                    </div>
                  </div>
                </div>

                {/* Live CARTO OpenSource Route & Tracking Map */}
                {latestOrder.estado !== 'cancelado' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        Ruta Satelital (CARTO OpenSource)
                      </span>
                      <span className="text-[9px] font-mono text-emerald-500 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Monitoreo en Tiempo Real
                      </span>
                    </div>
                    <OrderTrackingMap
                      storeLat={store.lat || 10.4930}
                      storeLng={store.lng || -66.8520}
                      storeName={store.nombre}
                      driverLat={latestOrder.conductor?.lat}
                      driverLng={latestOrder.conductor?.lng}
                      driverName={latestOrder.conductor ? `${latestOrder.conductor.nombre} ${latestOrder.conductor.apellido}` : undefined}
                      driverPhoto={latestOrder.conductor?.fotoUrl}
                      clientLat={10.4890}
                      clientLng={-66.8560}
                      clientAddress={latestOrder.cliente?.direccion || 'Av. Francisco de Miranda, Chacao'}
                      orderStatus={latestOrder.estado}
                    />
                  </div>
                )}

                {/* Assigned Motorizado Card with Driver Presentation Modal Button */}
                {latestOrder.conductor && (
                  <div className="p-3.5 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                        Repartidor Asignado
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {latestOrder.conductor.rating} ({latestOrder.conductor.totalEntregas} viajes)
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={latestOrder.conductor.fotoUrl}
                        alt={latestOrder.conductor.nombre}
                        className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                            {latestOrder.conductor.nombre} {latestOrder.conductor.apellido}
                          </h4>
                          <span className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-600" title="Verificado SQL">
                            <ShieldCheck className="w-3 h-3" />
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          {latestOrder.conductor.moto.marca} {latestOrder.conductor.moto.modelo} ({latestOrder.conductor.moto.color})
                        </p>
                        <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                          Placa: {latestOrder.conductor.moto.placa}
                        </p>
                      </div>
                    </div>

                    {/* Button: Ver Ficha de Presentación Completa del Conductor */}
                    <button
                      type="button"
                      onClick={() => setShowDriverPresentationModal(true)}
                      className="w-full py-1.5 px-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-amber-500/30"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Ficha de Presentación Completa del Conductor</span>
                    </button>

                    {/* Communication buttons: Call & Chat */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => openCall('Cliente Carlos', `${driver.nombre} Ramírez (Repartidor)`, driver.telefono, 'Motorizado Asignado')}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Llamar Repartidor
                      </button>

                      <button
                        onClick={() => openChat(latestOrder.id)}
                        className="py-2 px-3 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-neutral-700 shadow-xs cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Chat en Vivo
                      </button>
                    </div>
                  </div>
                )}

                {/* Delivery Confirmation & Rating / Closing Petition when Delivered */}
                {latestOrder.estado === 'entregado' && (
                  <OrderDeliveryConfirmationCard 
                    order={latestOrder}
                    onOpenClaimModal={() => setActiveTab('reclamos')}
                    onOrderClosed={() => setActiveTab('menu')}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'perfil' && (
          <div className="p-3 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <img
                src={client.avatarUrl}
                alt={client.nombre}
                className="w-12 h-12 rounded-full object-cover border border-amber-500"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                  {client.nombre} {client.apellido}
                </h3>
                <p className="text-[11px] text-neutral-500 font-mono">C.I: {client.cedula}</p>
                <p className="text-[10px] text-neutral-400 truncate">{client.email}</p>
              </div>
            </div>

            <div className="text-xs space-y-2">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Teléfono Móvil</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono">{client.telefono}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Dirección de Entrega</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{client.direccion}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Punto de Referencia</span>
                <span className="text-neutral-600 dark:text-neutral-400">{client.puntoReferencia}</span>
              </div>
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Cartera Digital Asociada</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-neutral-700 dark:text-neutral-300 font-mono font-bold">
                    ${(clientWallet?.saldoUsd ?? 0).toFixed(2)} USD (Bs. {((clientWallet?.saldoUsd ?? 0) * tasaBcv).toFixed(2)})
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('cartera')}
                    className="text-[10px] text-amber-500 font-bold hover:underline cursor-pointer"
                  >
                    Ver Cartera →
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full mt-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión de Vixy Pedidos</span>
            </button>
          </div>
        )}

        {/* TAB RECLAMOS Y SEGUIMIENTO DE INCIDENTES */}
        {activeTab === 'reclamos' && (
          <ClientClaimsView onBackToMenu={() => setActiveTab('menu')} />
        )}
      </div>

      {/* Driver Presentation Card Modal */}
      {showDriverPresentationModal && latestOrder?.conductor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-2xl text-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Ficha de Presentación Oficial del Conductor</span>
              </div>
              <button
                onClick={() => setShowDriverPresentationModal(false)}
                className="text-neutral-400 hover:text-white text-base font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Profile Header */}
            <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 p-3 rounded-2xl">
              <img
                src={latestOrder.conductor.fotoUrl}
                alt={latestOrder.conductor.nombre}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    {latestOrder.conductor.nombre} {latestOrder.conductor.apellido}
                  </h3>
                  <span className="p-0.5 rounded-full bg-emerald-500 text-white" title="Conductor Verificado">
                    <Check className="w-3 h-3" />
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 font-mono">C.I: {latestOrder.conductor.cedula}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {latestOrder.conductor.rating}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    • {latestOrder.conductor.totalEntregas} carreras finalizadas
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-1.5 p-3 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Vehículo de Reparto Asignado</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-neutral-500 block text-[10px]">Moto / Modelo</span>
                  <strong className="text-neutral-900 dark:text-white">
                    {latestOrder.conductor.moto.marca} {latestOrder.conductor.moto.modelo}
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Color / Año</span>
                  <strong className="text-neutral-900 dark:text-white">
                    {latestOrder.conductor.moto.color} • {latestOrder.conductor.moto.ano}
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Placa Oficial</span>
                  <strong className="font-mono text-amber-600 dark:text-amber-400 text-xs">
                    {latestOrder.conductor.moto.placa}
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Estatus Verificación</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">
                    ✓ Aprobado por Tránsito
                  </span>
                </div>
              </div>
            </div>

            {/* Verification QR / Security Seal */}
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-[11px]">
              <div>
                <span className="text-emerald-700 dark:text-emerald-300 font-bold block">
                  Seguridad Vixy Delivery
                </span>
                <span className="text-[10px] text-neutral-500">ID Conductor: VIXY-REP-01 • Certificado SQL</span>
              </div>
              <span className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold font-mono">
                SEGURO
              </span>
            </div>

            {/* Direct contact buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowDriverPresentationModal(false);
                  openCall('Cliente Carlos', `${driver.nombre} Ramírez`, driver.telefono, 'Motorizado');
                }}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                Llamar Directo
              </button>
              <button
                onClick={() => {
                  setShowDriverPresentationModal(false);
                  openChat(latestOrder.id);
                }}
                className="py-2 px-3 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-750 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-neutral-700 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Abrir Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-2xl text-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                <Wallet className="w-4 h-4" />
                <span>Recargar Mi Cartera Vixy</span>
              </div>
              <button
                onClick={() => setShowRechargeModal(false)}
                className="text-neutral-400 hover:text-white text-base font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            {rechargeSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white">¡Recarga Acreditada!</h4>
                <p className="text-xs text-neutral-500">
                  Se han sumado ${rechargeAmountUsd.toFixed(2)} USD a tu billetera personal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRechargeSubmit} className="space-y-3">
                {rechargeError && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{rechargeError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400">Monto a Recargar (USD)</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5, 10, 20, 50].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRechargeAmountUsd(amt)}
                        className={`py-1.5 rounded-xl font-mono font-bold text-xs border transition cursor-pointer ${
                          rechargeAmountUsd === amt
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={rechargeAmountUsd}
                    onChange={(e) => setRechargeAmountUsd(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1.5 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-mono font-bold"
                  />
                  <span className="text-[10px] text-neutral-400 font-mono block">
                    = Bs. {(rechargeAmountUsd * tasaBcv).toFixed(2)} (Tasa BCV {tasaBcv.toFixed(2)})
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400">Canal de Pago</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRechargePaymentMethod('pago_movil')}
                      className={`p-2 rounded-xl text-left border text-[11px] font-semibold transition cursor-pointer ${
                        rechargePaymentMethod === 'pago_movil'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 font-bold'
                          : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      Pago Móvil (Bs)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRechargePaymentMethod('zinli')}
                      className={`p-2 rounded-xl text-left border text-[11px] font-semibold transition cursor-pointer ${
                        rechargePaymentMethod === 'zinli'
                          ? 'border-purple-500 bg-purple-500/10 text-purple-600 font-bold'
                          : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      Zinli ($ USD)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRechargePaymentMethod('binance')}
                      className={`p-2 rounded-xl text-left border text-[11px] font-semibold transition cursor-pointer ${
                        rechargePaymentMethod === 'binance'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 font-bold'
                          : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      Binance Pay
                    </button>
                    <button
                      type="button"
                      onClick={() => setRechargePaymentMethod('zelle')}
                      className={`p-2 rounded-xl text-left border text-[11px] font-semibold transition cursor-pointer ${
                        rechargePaymentMethod === 'zelle'
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 font-bold'
                          : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      Zelle
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400">N° de Referencia / Comprobante</label>
                  <input
                    type="text"
                    required
                    value={rechargeReference}
                    onChange={(e) => setRechargeReference(e.target.value)}
                    placeholder="Ej. 84920194 o correo remitente"
                    className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold"
                  />
                  <span className="text-[9px] text-neutral-400 block font-mono">
                    📁 Se guardará en: /uploads/comprobantes_pago/recargas/cli_{client.id}.jpg
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Recarga</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Digital Receipt / Comprobante Modal */}
      {selectedWalletTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-2xl text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                <FileText className="w-4 h-4" />
                <span>Comprobante de Cartera Digital</span>
              </div>
              <button
                onClick={() => setSelectedWalletTx(null)}
                className="text-neutral-400 hover:text-white text-base font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-bold uppercase text-[10px]">Concepto</span>
                <span className="font-bold text-neutral-900 dark:text-white capitalize">
                  {selectedWalletTx.concepto || selectedWalletTx.tipo}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-bold uppercase text-[10px]">Monto USD</span>
                <span className="font-mono font-bold text-emerald-500">${selectedWalletTx.montoUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-bold uppercase text-[10px]">Monto en Bs</span>
                <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">
                  Bs. {selectedWalletTx.montoBs ? selectedWalletTx.montoBs.toFixed(2) : (selectedWalletTx.montoUsd * tasaBcv).toFixed(2)}
                </span>
              </div>
              {selectedWalletTx.referencia && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-bold uppercase text-[10px]">N° Referencia</span>
                  <span className="font-mono font-bold">{selectedWalletTx.referencia}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-bold uppercase text-[10px]">Fecha de Registro</span>
                <span className="font-mono text-neutral-500">
                  {new Date(selectedWalletTx.fecha).toLocaleString('es-VE')}
                </span>
              </div>
            </div>

            {/* Simulated Receipt File */}
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-2 text-center">
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                Archivo Guardado en Sistema Interno
              </span>
              <div className="w-full h-28 rounded-xl bg-neutral-200 dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center p-3 text-neutral-500">
                <FileImage className="w-7 h-7 text-amber-500 mb-1" />
                <span className="font-mono text-[9px] break-all">
                  {selectedWalletTx.comprobanteRuta || `/uploads/comprobantes_pago/${selectedWalletTx.id}.jpg`}
                </span>
                <span className="text-[9px] text-emerald-500 font-bold mt-1">
                  ✓ Almacenado con ID único en tabla SQL
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedWalletTx(null)}
              className="w-full py-2 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-750 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Cerrar Comprobante
            </button>
          </div>
        </div>
      )}

      {/* Store Info and Reviews Modal */}
      <StoreInfoModal
        store={store}
        isOpen={showStoreInfoModal}
        onClose={() => setShowStoreInfoModal(false)}
      />

      {/* Bottom Client Navigation Bar (5 Tabs) */}
      <div className="p-2 bg-white dark:bg-neutral-850 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-5 gap-1 shrink-0 text-center">
        <button
          onClick={() => setActiveTab('menu')}
          className={`py-1.5 rounded-xl text-[10px] font-semibold flex flex-col items-center gap-0.5 transition cursor-pointer ${
            activeTab === 'menu' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Comercios</span>
        </button>

        <button
          onClick={() => setActiveTab('cartera')}
          className={`py-1.5 rounded-xl text-[10px] font-semibold flex flex-col items-center gap-0.5 transition cursor-pointer ${
            activeTab === 'cartera' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Cartera</span>
        </button>

        <button
          onClick={() => setActiveTab('seguimiento')}
          className={`py-1.5 rounded-xl text-[10px] font-semibold flex flex-col items-center gap-0.5 transition relative cursor-pointer ${
            activeTab === 'seguimiento' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Seguimiento</span>
          {latestOrder && latestOrder.estado !== 'entregado' && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-purple-600 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('reclamos')}
          className={`py-1.5 rounded-xl text-[10px] font-semibold flex flex-col items-center gap-0.5 transition relative cursor-pointer ${
            activeTab === 'reclamos' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Reclamos</span>
          {claims.filter(c => c.clienteId === client.id && c.estado !== 'solucionado').length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('perfil')}
          className={`py-1.5 rounded-xl text-[10px] font-semibold flex flex-col items-center gap-0.5 transition cursor-pointer ${
            activeTab === 'perfil' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Mi Perfil</span>
        </button>
      </div>
    </div>
  );
};
