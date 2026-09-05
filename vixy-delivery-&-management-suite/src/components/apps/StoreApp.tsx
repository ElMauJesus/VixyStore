import React, { useState } from 'react';
import { 
  Store, 
  CheckCircle, 
  Clock, 
  ChefHat, 
  Bike, 
  DollarSign, 
  MessageSquare, 
  Phone, 
  ShieldCheck, 
  AlertTriangle,
  Receipt,
  Eye,
  Star,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  CreditCard,
  Building,
  Save,
  Tag,
  ShoppingBag,
  ExternalLink,
  X,
  XCircle,
  MapPin,
  Navigation,
  LogOut,
  Wallet,
  FolderTree,
  Layers,
  Lock,
  User,
  Sparkles,
  RefreshCw,
  FileCheck,
  Database,
  FileText,
  FileImage,
  History,
  BellRing,
  Inbox,
  Search,
  FileCode
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { Producto, MetodoPagoTipo } from '../../types/delivery';
import { RUBROS_COMERCIO_DISPONIBLES } from '../../data/initialData';
import { StoreClaimsManager } from '../store/StoreClaimsManager';

export const StoreApp: React.FC = () => {
  const { 
    store, 
    stores,
    switchStore,
    claims,
    storeWallet,
    storeLoggedIn,
    loginStore,
    logoutStore,
    updateStoreRubro,
    updateStoreCategoriasCatalogo,
    orders, 
    storeAcceptOrder,
    storeRejectOrder,
    createStoreManualOrder,
    calculateDeliveryTripCost,
    deliveryRates,
    verifyPayment, 
    startPreparing, 
    readyForPickup, 
    openCall, 
    openChat,
    tasaBcv,
    updateStoreInfo,
    updateStorePayments,
    addProductToStore,
    updateProductInStore,
    deleteProductFromStore
  } = useDelivery();

  const [activeTab, setActiveTab] = useState<'cuenta' | 'articulos' | 'pedidos' | 'reclamos' | 'cartera' | 'historial'>('articulos');
  const [selectedOrderForDriverModal, setSelectedOrderForDriverModal] = useState<any | null>(null);

  // Store Reject Order Modal State
  const [rejectModalOrderId, setRejectModalOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Ingredientes no disponibles');
  const [rejectCustomNote, setRejectCustomNote] = useState<string>('');

  // Store Info Form State
  const [storeName, setStoreName] = useState(store.nombre);
  const [storeCategoria, setStoreCategoria] = useState(store.categoria);
  const [storeCustomRubro, setStoreCustomRubro] = useState(store.rubroPersonalizado || '');
  const [storeRif, setStoreRif] = useState(store.rif);
  const [storeDireccion, setStoreDireccion] = useState(store.direccion);
  const [storeTelefono, setStoreTelefono] = useState(store.telefono);
  const [storeEmail, setStoreEmail] = useState(store.email);
  const [storeCostoEnvio, setStoreCostoEnvio] = useState(store.costoEnvioUsd);
  const [storeHorario, setStoreHorario] = useState(store.horarioApertura);
  const [storeInfoSavedMsg, setStoreInfoSavedMsg] = useState(false);

  // Store Custom Catalog Categories
  const [customCatalogCategories, setCustomCatalogCategories] = useState<string[]>(
    store.categoriasCatalogo && store.categoriasCatalogo.length > 0 
      ? store.categoriasCatalogo 
      : ['Hamburguesas', 'Combos', 'Bebidas', 'Postres', 'Acompañantes']
  );
  const [newCategoryName, setNewCategoryName] = useState('');

  // Store Login State when logged out
  const [storeLoginId, setStoreLoginId] = useState('J-40918230-1');
  const [storeLoginPass, setStoreLoginPass] = useState('vixy123');
  const [storeLoginError, setStoreLoginError] = useState('');

  // Wallet Receipt Inspection Modal
  const [selectedWalletTx, setSelectedWalletTx] = useState<any | null>(null);

  // Catalog search and sorting state
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productSortOrder, setProductSortOrder] = useState<'disponibles' | 'nombre' | 'precio_asc' | 'precio_desc'>('disponibles');

  // Store Payments Form State
  const [pmBanco, setPmBanco] = useState(store.metodosPago.pagoMovil.banco);
  const [pmTelefono, setPmTelefono] = useState(store.metodosPago.pagoMovil.telefono);
  const [pmCedula, setPmCedula] = useState(store.metodosPago.pagoMovil.cedula);
  const [zelleEmail, setZelleEmail] = useState(store.metodosPago.zelle.email);
  const [zelleTitular, setZelleTitular] = useState(store.metodosPago.zelle.titular);
  const [zinliEmail, setZinliEmail] = useState(store.metodosPago.zinli?.email || 'pagos@vixystore.com');
  const [binancePayId, setBinancePayId] = useState(store.metodosPago.binance?.payId || '839201948');
  const [binanceNick, setBinanceNick] = useState(store.metodosPago.binance?.nickname || 'BurgerHouseVzla');
  const [paypalEmail, setPaypalEmail] = useState(store.metodosPago.paypal?.email || 'ventas@burgerhouse.com');

  // Product CRUD State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [prodNombre, setProdNombre] = useState('');
  const [prodDescripcion, setProdDescripcion] = useState('');
  const [prodPrecioUsd, setProdPrecioUsd] = useState<number>(5.5);
  const [prodCategoria, setProdCategoria] = useState('Hamburguesas');
  const [prodDisponible, setProdDisponible] = useState(true);
  const [prodImagenUrl, setProdImagenUrl] = useState('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80');
  const [productCategoryFilter, setProductCategoryFilter] = useState('todas');

  // Manual / In-Store Delivery Request Modal State
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);
  const [manualClientName, setManualClientName] = useState('');
  const [manualClientPhone, setManualClientPhone] = useState('');
  const [manualClientAddress, setManualClientAddress] = useState('');
  const [manualReference, setManualReference] = useState('');
  const [manualZone, setManualZone] = useState('Chacao');
  const [manualDistanceKm, setManualDistanceKm] = useState<number>(3.5);
  const [manualPaymentMethod, setManualPaymentMethod] = useState<MetodoPagoTipo>('efectivo_usd');
  const [manualPaymentRef, setManualPaymentRef] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualSelectedItems, setManualSelectedItems] = useState<{ [productId: string]: number }>({});
  const [manualCustomItemName, setManualCustomItemName] = useState('');
  const [manualCustomItemPrice, setManualCustomItemPrice] = useState<number>(0);
  const [manualFormError, setManualFormError] = useState('');

  const storeOrders = orders.filter(o => o.comercio.id === store.id);
  const pendingApprovalOrders = storeOrders.filter(o => o.estado === 'pendiente_pago' || o.estado === 'pago_verificado');
  const activeOrders = storeOrders.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado');
  const finishedOrders = storeOrders.filter(o => o.estado === 'entregado');

  const selectedItemsSubtotal = Object.entries(manualSelectedItems).reduce((sum, [pId, rawQty]) => {
    const qty = Number(rawQty) || 0;
    const prod = store.productos.find(p => p.id === pId);
    return sum + (prod && qty > 0 ? prod.precioUsd * qty : 0);
  }, 0) + (manualCustomItemName.trim() && manualCustomItemPrice > 0 ? Number(manualCustomItemPrice) : 0);

  const manualTripCalculation = calculateDeliveryTripCost(manualDistanceKm);
  const manualTotalOrderUsd = selectedItemsSubtotal + manualTripCalculation.totalViajeUsd;
  const manualTotalOrderBs = manualTotalOrderUsd * tasaBcv;

  const totalVentasUsd = storeOrders
    .filter(o => o.estado === 'entregado' || o.estado === 'en_camino_al_cliente' || o.estado === 'en_preparacion')
    .reduce((sum, o) => sum + o.montoSubtotalUsd, 0);

  const handleSaveStoreProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreInfo({
      nombre: storeName,
      categoria: storeCategoria,
      rif: storeRif,
      direccion: storeDireccion,
      telefono: storeTelefono,
      email: storeEmail,
      costoEnvioUsd: Number(storeCostoEnvio),
      horarioApertura: storeHorario
    });

    updateStoreRubro(storeCategoria, storeCustomRubro);
    updateStoreCategoriasCatalogo(customCatalogCategories);

    updateStorePayments({
      pagoMovil: {
        banco: pmBanco,
        telefono: pmTelefono,
        cedula: pmCedula
      },
      zelle: {
        email: zelleEmail,
        titular: zelleTitular
      },
      zinli: {
        email: zinliEmail
      },
      binance: {
        payId: binancePayId,
        nickname: binanceNick
      },
      paypal: {
        email: paypalEmail
      }
    });

    setStoreInfoSavedMsg(true);
    setTimeout(() => setStoreInfoSavedMsg(false), 3000);
  };

  const handleAddCatalogCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (customCatalogCategories.includes(trimmed)) return;
    const updated = [...customCatalogCategories, trimmed];
    setCustomCatalogCategories(updated);
    updateStoreCategoriasCatalogo(updated);
    setNewCategoryName('');
  };

  const handleRemoveCatalogCategory = (catToRemove: string) => {
    const updated = customCatalogCategories.filter(c => c !== catToRemove);
    setCustomCatalogCategories(updated);
    updateStoreCategoriasCatalogo(updated);
  };

  const handleStoreLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeLoginId.trim() || !storeLoginPass.trim()) {
      setStoreLoginError('Por favor introduce tu identificador y contraseña comercial.');
      return;
    }
    const res = loginStore(storeLoginId.trim(), storeLoginPass);
    if (!res?.success) {
      setStoreLoginError(res?.error || 'Error al iniciar sesión.');
    } else {
      setStoreLoginError('');
    }
  };

  const handleStoreLogout = () => {
    if (window.confirm('¿Seguro que deseas cerrar la sesión del comercio en Vixy Store?')) {
      logoutStore();
    }
  };

  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProdNombre('');
    setProdDescripcion('');
    setProdPrecioUsd(6.0);
    setProdCategoria('Hamburguesas');
    setProdDisponible(true);
    setProdImagenUrl('https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80');
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Producto) => {
    setEditingProduct(prod);
    setProdNombre(prod.nombre);
    setProdDescripcion(prod.descripcion);
    setProdPrecioUsd(prod.precioUsd);
    setProdCategoria(prod.categoria);
    setProdDisponible(prod.disponible);
    setProdImagenUrl(prod.imagenUrl);
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNombre.trim()) return;

    // Build specific SQL folder path for storing image as requested:
    // "las imagenes iran en una carpeta individual que se llamara a traves del codigo sql"
    const slugName = prodNombre.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const imagenRuta = `/uploads/comercios/${store.id}/articulos/${slugName}.jpg`;

    if (editingProduct) {
      updateProductInStore(editingProduct.id, {
        nombre: prodNombre,
        descripcion: prodDescripcion,
        precioUsd: Number(prodPrecioUsd),
        categoria: prodCategoria,
        disponible: prodDisponible,
        imagenUrl: prodImagenUrl,
        imagenRuta
      });
    } else {
      addProductToStore({
        nombre: prodNombre,
        descripcion: prodDescripcion,
        precioUsd: Number(prodPrecioUsd),
        categoria: prodCategoria,
        disponible: prodDisponible,
        imagenUrl: prodImagenUrl,
        imagenRuta
      });
    }

    setShowProductModal(false);
  };

  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualClientName.trim()) {
      setManualFormError('Por favor ingresa el nombre del cliente');
      return;
    }
    if (!manualClientAddress.trim()) {
      setManualFormError('Debes escribir la ubicación exacta de entrega según la solicitud del cliente');
      return;
    }

    const itemsToSubmit: Array<{ productoId?: string; nombre: string; cantidad: number; precioUnitarioUsd: number }> = [];
    Object.entries(manualSelectedItems).forEach(([pId, rawQty]) => {
      const qty = Number(rawQty) || 0;
      if (qty > 0) {
        const prod = store.productos.find(p => p.id === pId);
        if (prod) {
          itemsToSubmit.push({
            productoId: prod.id,
            nombre: prod.nombre,
            cantidad: qty,
            precioUnitarioUsd: prod.precioUsd
          });
        }
      }
    });

    if (manualCustomItemName.trim() && manualCustomItemPrice > 0) {
      itemsToSubmit.push({
        nombre: manualCustomItemName.trim(),
        cantidad: 1,
        precioUnitarioUsd: Number(manualCustomItemPrice)
      });
    }

    if (itemsToSubmit.length === 0) {
      itemsToSubmit.push({
        nombre: 'Comanda General de Tienda',
        cantidad: 1,
        precioUnitarioUsd: 5.0
      });
    }

    const subtotal = itemsToSubmit.reduce((acc, it) => acc + it.cantidad * it.precioUnitarioUsd, 0);

    createStoreManualOrder({
      clienteNombre: manualClientName.trim(),
      clienteTelefono: manualClientPhone.trim() || '0412-0000000',
      clienteDireccion: manualClientAddress.trim(),
      puntoReferencia: manualReference.trim(),
      zonaMunicipio: manualZone,
      items: itemsToSubmit,
      montoSubtotalUsd: subtotal,
      distanciaKm: manualDistanceKm,
      metodoPago: manualPaymentMethod,
      referenciaPago: manualPaymentRef.trim(),
      notas: manualNotes.trim()
    });

    // Reset form state
    setManualClientName('');
    setManualClientPhone('');
    setManualClientAddress('');
    setManualReference('');
    setManualNotes('');
    setManualSelectedItems({});
    setManualCustomItemName('');
    setManualCustomItemPrice(0);
    setManualFormError('');
    setShowManualOrderModal(false);

    // Switch to pedidos tab to see order live
    setActiveTab('pedidos');
  };

  const allCategories = ['todas', ...Array.from(new Set(store.productos.map(p => p.categoria)))];
  const filteredProducts = store.productos
    .filter(p => {
      const matchCat = productCategoryFilter === 'todas' || p.categoria === productCategoryFilter;
      const matchSearch = productSearchTerm.trim() === '' || 
        p.nombre.toLowerCase().includes(productSearchTerm.toLowerCase()) || 
        p.descripcion.toLowerCase().includes(productSearchTerm.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (productSortOrder === 'disponibles') {
        if (a.disponible === b.disponible) return a.nombre.localeCompare(b.nombre);
        return a.disponible ? -1 : 1;
      }
      if (productSortOrder === 'nombre') {
        return a.nombre.localeCompare(b.nombre);
      }
      if (productSortOrder === 'precio_asc') {
        return a.precioUsd - b.precioUsd;
      }
      if (productSortOrder === 'precio_desc') {
        return b.precioUsd - a.precioUsd;
      }
      return 0;
    });

  if (!storeLoggedIn) {
    return (
      <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-4 items-center justify-center">
        <div className="w-full max-w-sm bg-white dark:bg-neutral-850 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4">
          <div className="text-center space-y-1">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-500/20">
              <Store className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-neutral-900 dark:text-white">Vixy Store</h2>
            <p className="text-xs text-neutral-500">Panel Comercial y Despacho de Pedidos</p>
          </div>

          {storeLoginError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{storeLoginError}</span>
            </div>
          )}

          <form onSubmit={handleStoreLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-neutral-500">RIF o Usuario Comercial (SQL)</label>
              <input
                type="text"
                required
                value={storeLoginId}
                onChange={(e) => setStoreLoginId(e.target.value)}
                placeholder="Ej. J-40918230-1"
                className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-neutral-500">Contraseña</label>
              <input
                type="password"
                required
                value={storeLoginPass}
                onChange={(e) => setStoreLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Ingresar a mi Comercio</span>
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <button
              type="button"
              onClick={() => {
                loginStore('demo');
                setStoreLoginError('');
              }}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              Ingreso Rápido con Comercio Demo ({store.nombre})
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* Top Header */}
      <div className="px-3 py-2.5 bg-white dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={store.logoUrl}
            alt={store.nombre}
            className="w-8 h-8 rounded-xl object-cover border border-amber-500 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white leading-tight truncate">
                {store.nombre}
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            </div>
            <p className="text-[10px] text-neutral-400 font-mono truncate">
              {store.categoria === 'Otro (Personalizado)' ? (store.rubroPersonalizado || 'Rubro Libre') : store.categoria} • RIF: {store.rif}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[9px] text-neutral-400 block font-mono leading-none">BCV</span>
            <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 font-mono">
              Bs. {tasaBcv.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => setActiveTab('cartera')}
            className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1 border border-amber-500/30 transition cursor-pointer"
            title="Ver Cartera Comercial"
          >
            <Wallet className="w-3 h-3" />
            <span>${(storeWallet?.saldoUsd ?? 0).toFixed(2)}</span>
          </button>

          {/* Botón de Cerrar Sesión requerido */}
          <button
            onClick={handleStoreLogout}
            className="p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-red-500/10 hover:text-red-500 text-neutral-500 transition cursor-pointer border border-neutral-200 dark:border-neutral-700 flex items-center gap-1 text-[10px] font-bold"
            title="Cerrar Sesión de Vixy Store"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>

      {/* Demo Store Selector Bar */}
      <div className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-2 text-xs shrink-0">
        <div className="flex items-center gap-1 shrink-0 text-purple-600 dark:text-purple-400">
          <Store className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Local:
          </span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {stores.map(s => (
            <button
              key={s.id}
              onClick={() => switchStore(s.id)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer shrink-0 ${
                s.id === store.id 
                  ? 'bg-purple-600 text-white shadow-2xs' 
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-700'
              }`}
            >
              {s.nombre.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Global Incoming Orders Alert Banner across all tabs */}
        {pendingApprovalOrders.length > 0 && (
          <div className="p-3 bg-gradient-to-r from-amber-500 via-purple-600 to-amber-600 text-white rounded-2xl shadow-md space-y-2 shrink-0 border border-white/20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
                  <BellRing className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 bg-white text-purple-700 font-black text-[9px] rounded uppercase tracking-wider">
                      ¡Nuevo Pedido!
                    </span>
                    <span className="text-[11px] font-mono font-bold text-amber-100">
                      #{pendingApprovalOrders[0].codigoSeguimiento}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold truncate text-white">
                    {pendingApprovalOrders[0].cliente.nombre} • {pendingApprovalOrders[0].items.length} items • ${(pendingApprovalOrders[0].montoTotalUsd).toFixed(2)} USD
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-lg shrink-0">
                {pendingApprovalOrders[0].metodoPagoSeleccionado === 'saldo_cartera' ? 'Cartera' : pendingApprovalOrders[0].metodoPagoSeleccionado.replace('_', ' ')}
              </span>
            </div>

            {/* Symmetrical, proportional button row designed for mobile screen */}
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <button
                onClick={() => storeAcceptOrder(pendingApprovalOrders[0].id)}
                className="py-1.5 px-2 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-white rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer transition flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Aceptar</span>
              </button>
              <button
                onClick={() => setRejectModalOrderId(pendingApprovalOrders[0].id)}
                className="py-1.5 px-2 bg-red-600/90 hover:bg-red-600 active:scale-98 text-white rounded-lg text-[11px] font-bold cursor-pointer transition flex items-center justify-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Rechazar</span>
              </button>
              <button
                onClick={() => setActiveTab('pedidos')}
                className="py-1.5 px-2 bg-white/95 hover:bg-white text-purple-700 active:scale-98 rounded-lg text-[11px] font-bold cursor-pointer transition flex items-center justify-center gap-1 shadow-2xs"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Comanda</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: PANTALLA PRINCIPAL DE CUENTA */}
        {activeTab === 'cuenta' && (
          <div className="space-y-4 text-xs">
            {/* Bento Banner */}
            <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-500 block">Vixy Store - Mi Cuenta</span>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Datos del Comercio y Configuración
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                  SQL Conectado
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Registra o actualiza la información fiscal, rubro y categorías de tu negocio. Precios actualizados en Bs según la tasa oficial BCV de {tasaBcv.toFixed(2)} Bs/$.
              </p>
            </div>

            {storeInfoSavedMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>¡Datos del comercio y rubros actualizados exitosamente en la base de datos SQL!</span>
              </div>
            )}

            <form onSubmit={handleSaveStoreProfile} className="space-y-4">
              {/* Información General */}
              <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-500" />
                  Información Legal y Comercial (Venezuela)
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-400">Nombre del Local</label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-400">RIF Venezolano (SENIAT)</label>
                    <input
                      type="text"
                      required
                      value={storeRif}
                      onChange={(e) => setStoreRif(e.target.value)}
                      className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                </div>

                {/* Rubro Comercial Amplio (No solo comida) y Personalización */}
                <div className="space-y-2 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <FolderTree className="w-3.5 h-3.5" />
                      Rubro Comercial (No solo comida: Farmacia, Ferretería, etc.)
                    </label>
                    <span className="text-[9px] text-neutral-400">Opciones ampliadas</span>
                  </div>

                  <select
                    value={storeCategoria}
                    onChange={(e) => setStoreCategoria(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 font-semibold text-xs"
                  >
                    {RUBROS_COMERCIO_DISPONIBLES.map((rub) => (
                      <option key={rub} value={rub}>
                        {rub}
                      </option>
                    ))}
                  </select>

                  {/* Si el comercio no encuentra su rubro, puede personalizar su propio rubro libremente */}
                  {storeCategoria === 'Otro (Personalizado)' && (
                    <div className="space-y-1 pt-1.5 border-t border-neutral-200 dark:border-neutral-700">
                      <label className="text-[10px] font-bold uppercase text-neutral-500">
                        Escribe el Rubro Personalizado de tu Negocio:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Joyería y Relojería, Óptica, Vivero y Plantas, etc."
                        value={storeCustomRubro}
                        onChange={(e) => setStoreCustomRubro(e.target.value)}
                        className="w-full p-2 bg-amber-500/10 border border-amber-500/40 rounded-xl text-xs font-bold text-neutral-900 dark:text-white"
                      />
                      <p className="text-[10px] text-neutral-400">
                        Este rubro personalizado se guardará en la base de datos SQL para identificar tu negocio en toda la plataforma.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-400">Costo de Envío Base ($ USD)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={storeCostoEnvio}
                      onChange={(e) => setStoreCostoEnvio(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-400">Equivalente en Bs (BCV Oficial)</label>
                    <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-600 dark:text-neutral-300 font-bold">
                      Bs. {(storeCostoEnvio * tasaBcv).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Dirección Física del Local</label>
                  <input
                    type="text"
                    required
                    value={storeDireccion}
                    onChange={(e) => setStoreDireccion(e.target.value)}
                    className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-400">Teléfono Local / WhatsApp</label>
                    <input
                      type="text"
                      value={storeTelefono}
                      onChange={(e) => setStoreTelefono(e.target.value)}
                      className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-400">Horario de Atención</label>
                    <input
                      type="text"
                      value={storeHorario}
                      onChange={(e) => setStoreHorario(e.target.value)}
                      className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>

              {/* Configuración de Métodos de Cobro (Zinli, Binance, PayPal, Pago Móvil, Zelle) */}
              <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  Métodos de Pago Directos (Requisito del Sistema)
                </h4>

                {/* Pago Móvil */}
                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl space-y-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-xs">
                    📱 Datos para Pago Móvil (a Tasa BCV Oficial: {tasaBcv.toFixed(2)} Bs/$)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Banco (ej: 0102 Venezuela)"
                      value={pmBanco}
                      onChange={(e) => setPmBanco(e.target.value)}
                      className="p-1.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Teléfono (0414-XXXXXXX)"
                      value={pmTelefono}
                      onChange={(e) => setPmTelefono(e.target.value)}
                      className="p-1.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-mono"
                    />
                    <input
                      type="text"
                      placeholder="RIF / C.I (J-12345678)"
                      value={pmCedula}
                      onChange={(e) => setPmCedula(e.target.value)}
                      className="p-1.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Zinli & Binance */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl space-y-1.5">
                    <span className="font-bold text-purple-600 dark:text-purple-400 block text-xs">
                      🟣 Zinli (Billetera Digital USD)
                    </span>
                    <input
                      type="email"
                      placeholder="Email registrado en Zinli"
                      value={zinliEmail}
                      onChange={(e) => setZinliEmail(e.target.value)}
                      className="w-full p-1.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs"
                    />
                  </div>

                  <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl space-y-1.5">
                    <span className="font-bold text-amber-600 dark:text-amber-400 block text-xs">
                      🟡 Binance Pay (USDT)
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="Pay ID"
                        value={binancePayId}
                        onChange={(e) => setBinancePayId(e.target.value)}
                        className="p-1.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Nickname"
                        value={binanceNick}
                        onChange={(e) => setBinanceNick(e.target.value)}
                        className="p-1.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* PayPal & Zelle */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl space-y-1.5">
                    <span className="font-bold text-blue-600 dark:text-blue-400 block text-xs">
                      🔵 PayPal (USD)
                    </span>
                    <input
                      type="email"
                      placeholder="Correo electrónico PayPal"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      className="w-full p-1.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs"
                    />
                  </div>

                  <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl space-y-1.5">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-xs">
                      ⚡ Zelle
                    </span>
                    <input
                      type="email"
                      placeholder="Correo o teléfono Zelle"
                      value={zelleEmail}
                      onChange={(e) => setZelleEmail(e.target.value)}
                      className="w-full p-1.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Personalización de Opciones e Ítems: Categorías de Catálogo para cualquier rubro */}
              <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-500" />
                    Opciones y Categorías de Catálogo Personalizadas
                  </h4>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {customCatalogCategories.length} categorías
                  </span>
                </div>

                <p className="text-[11px] text-neutral-500">
                  Adapta tu catálogo a tu rubro comercial (Farmacia, Repuestos, Ferretería, etc.). Agrega las categorías donde clasificarás tus artículos e ítems.
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {customCatalogCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-[11px] border border-neutral-200 dark:border-neutral-700"
                    >
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCatalogCategory(cat)}
                        className="text-neutral-400 hover:text-red-500 transition cursor-pointer"
                        title="Eliminar categoría"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Nueva categoría (ej. Analgésicos, Herramientas, Baterías...)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCatalogCategory();
                      }
                    }}
                    className="flex-1 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCatalogCategory}
                    className="px-2.5 py-1.5 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1 border border-neutral-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Cambios del Comercio</span>
              </button>

              {/* Botón de Cerrar Sesión requerido en Vixy Store */}
              <div className="p-3.5 bg-red-500/5 rounded-2xl border border-red-500/20 space-y-2">
                <h4 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <LogOut className="w-3.5 h-3.5" />
                  Sesión del Comercio
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Cierra la sesión de este terminal para proteger los pedidos y el acceso al panel comercial de {store.nombre}.
                </p>
                <button
                  type="button"
                  onClick={handleStoreLogout}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión del Local</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: ARTÍCULOS QUE OFRECEN (Catálogo variado, registrar productos, imágenes en carpeta individual llamada por SQL) */}
        {activeTab === 'articulos' && (
          <div className="space-y-3 text-xs">
            {/* Header & Add Button */}
            <div className="p-3.5 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-amber-500 block">Gestión de Catálogo</span>
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  Artículos del Menú ({filteredProducts.length} de {store.productos?.length ?? 0})
                </h3>
                <p className="text-[10px] text-neutral-400 truncate font-mono">
                  SQL: /uploads/comercios/{store.id}/articulos/
                </p>
              </div>

              <button
                onClick={handleOpenNewProduct}
                className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Artículo</span>
              </button>
            </div>

            {/* Search and Sort Filter Bar */}
            <div className="p-3 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    placeholder="Buscar artículo por nombre o ingredientes..."
                    className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:border-amber-500"
                  />
                  {productSearchTerm && (
                    <button
                      onClick={() => setProductSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <select
                    value={productSortOrder}
                    onChange={(e) => setProductSortOrder(e.target.value as any)}
                    className="py-1.5 px-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                    title="Ordenar artículos"
                  >
                    <option value="disponibles">Disponibles 1°</option>
                    <option value="nombre">Nombre (A-Z)</option>
                    <option value="precio_asc">Precio: Menor a Mayor</option>
                    <option value="precio_desc">Precio: Mayor a Menor</option>
                  </select>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                {allCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setProductCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize whitespace-nowrap transition cursor-pointer ${
                      productCategoryFilter === cat
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products List (Single column mobile layout with proportional dimensions) */}
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 text-xs space-y-2">
                <Store className="w-8 h-8 mx-auto text-neutral-400 opacity-50" />
                <p>No se encontraron artículos con ese filtro de búsqueda.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    className="p-3 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-2"
                  >
                    {/* Top Section: Image & Details */}
                    <div className="flex items-start gap-2.5">
                      {/* Product Image */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900">
                        <img
                          src={prod.imagenUrl}
                          alt={prod.nombre}
                          className="w-full h-full object-cover"
                        />
                        {!prod.disponible && (
                          <span className="absolute inset-0 bg-neutral-950/70 text-white text-[9px] font-bold flex items-center justify-center text-center p-0.5 uppercase tracking-wider">
                            Agotado
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider truncate">
                            {prod.categoria}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                            prod.disponible 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {prod.disponible ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>

                        <h4 className="font-bold text-neutral-900 dark:text-white text-xs leading-tight truncate">
                          {prod.nombre}
                        </h4>

                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {prod.descripcion}
                        </p>

                        {/* Price Display */}
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                            ${prod.precioUsd.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            (Bs. {(prod.precioUsd * tasaBcv).toFixed(2)})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SQL Image Path Reference */}
                    <div className="px-2 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-900 text-[9px] text-neutral-500 dark:text-neutral-400 font-mono border border-neutral-100 dark:border-neutral-800 flex items-center gap-1.5">
                      <FileCode className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="truncate">
                        SQL imagen_ruta: {prod.imagenRuta || `/uploads/comercios/${store.id}/articulos/${prod.id}.jpg`}
                      </span>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100 dark:border-neutral-800 gap-2">
                      <button
                        type="button"
                        onClick={() => updateProductInStore(prod.id, { disponible: !prod.disponible })}
                        className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                          prod.disponible
                            ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                        }`}
                      >
                        <span>{prod.disponible ? '✓ Disponible' : '✕ Agotado'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-500 hover:bg-amber-500/10 transition cursor-pointer border border-neutral-200 dark:border-neutral-700"
                          title="Editar artículo"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar ${prod.nombre}?`)) {
                              deleteProductFromStore(prod.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer border border-neutral-200 dark:border-neutral-700"
                          title="Eliminar artículo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PEDIDOS EN VIVO (Cocina, Despacho, Verificación de Pagos) */}
        {activeTab === 'pedidos' && (
          <div className="space-y-3">
            {/* Banner for In-Store Orders / Independent Delivery Request */}
            <div className="p-3 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/25 rounded-2xl flex items-center justify-between gap-2 shadow-2xs">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 shrink-0" />
                  Ventas Tienda / WhatsApp
                </span>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  ¿Tienes un pedido independiente?
                </h4>
                <p className="text-[10px] text-neutral-500 leading-tight">
                  Escribe la dirección y solicita un motorizado Vixy.
                </p>
              </div>
              <button
                onClick={() => setShowManualOrderModal(true)}
                className="py-1.5 px-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 shrink-0 shadow-xs cursor-pointer transition whitespace-nowrap"
              >
                <Plus className="w-3 h-3" />
                <span>Solicitar Motorizado</span>
              </button>
            </div>

            {/* Orders Summary Status */}
            <div className="grid grid-cols-3 gap-2">
              <div className={`p-2.5 rounded-2xl border text-center shadow-2xs transition ${
                pendingApprovalOrders.length > 0 
                  ? 'bg-amber-500/10 border-amber-500/40 dark:bg-amber-500/15' 
                  : 'bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-800'
              }`}>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Por Aceptar</span>
                <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                  {pendingApprovalOrders.length}
                </span>
              </div>
              <div className="p-2.5 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center shadow-2xs">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">En Cocina</span>
                <span className="text-sm font-bold text-blue-500">
                  {storeOrders.filter(o => o.estado === 'en_preparacion').length}
                </span>
              </div>
              <div className="p-2.5 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center shadow-2xs">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">En Despacho</span>
                <span className="text-sm font-bold text-emerald-500">
                  {storeOrders.filter(o => o.estado === 'esperando_repartidor' || o.estado === 'en_camino_al_comercio' || o.estado === 'en_camino_al_cliente').length}
                </span>
              </div>
            </div>

            {/* Dedicated Section: Solicitudes Entrantes del Cliente por Aceptar o Rechazar */}
            {pendingApprovalOrders.length > 0 && (
              <div className="space-y-2.5 p-3.5 bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent rounded-3xl border-2 border-amber-500/30 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Inbox className="w-4 h-4" />
                      Solicitudes Entrantes por Responder ({pendingApprovalOrders.length})
                    </h4>
                  </div>
                  <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">
                    Acción Requerida
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  Revisa la comanda y la disponibilidad de cocina. Acepta para notificar a los repartidores de la red Vixy o rechaza si no tienes inventario.
                </p>

                <div className="space-y-3 pt-1">
                  {pendingApprovalOrders.map(order => (
                    <div
                      key={order.id}
                      className="p-3.5 bg-white dark:bg-neutral-850 rounded-2xl border border-amber-500/40 shadow-md space-y-3"
                    >
                      {/* Order Code & Header */}
                      <div className="flex justify-between items-start border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white font-mono font-black text-xs">
                              #{order.codigoSeguimiento}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300">
                              {order.esPedidoTienda ? '🏪 Venta Directa' : '📱 Pedido App Cliente'}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-neutral-900 dark:text-white mt-1">
                            {order.cliente.nombre} {order.cliente.apellido}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono block">
                            ${order.montoTotalUsd.toFixed(2)} USD
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono block">
                            Bs. {(order.montoTotalBs ?? (order.montoTotalUsd * tasaBcv)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Payment Method Badge */}
                      <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {order.metodoPagoSeleccionado === 'saldo_cartera' ? (
                            <>
                              <Wallet className="w-4 h-4 text-emerald-500 shrink-0" />
                              <div>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                                  Cartera Vixy (Pago Garantizado)
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                  Fondos ya descontados del cliente y listos para acreditar
                                </span>
                              </div>
                            </>
                          ) : order.metodoPagoSeleccionado === 'pago_movil' ? (
                            <>
                              <CreditCard className="w-4 h-4 text-purple-500 shrink-0" />
                              <div>
                                <span className="font-bold text-purple-600 dark:text-purple-400 block">
                                  Pago Móvil ({store.metodosPago.pagoMovil.banco})
                                </span>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  Ref: {order.referenciaPago || 'Sin Referencia'}
                                </span>
                              </div>
                            </>
                          ) : order.metodoPagoSeleccionado === 'efectivo_usd' || order.metodoPagoSeleccionado === 'efectivo' ? (
                            <>
                              <DollarSign className="w-4 h-4 text-amber-500 shrink-0" />
                              <div>
                                <span className="font-bold text-amber-600 dark:text-amber-400 block">
                                  Efectivo en Entrega
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                  Cobro directo al cliente por parte del conductor
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 text-blue-500 shrink-0" />
                              <div>
                                <span className="font-bold text-blue-600 dark:text-blue-400 block capitalize">
                                  {order.metodoPagoSeleccionado.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  Ref: {order.referenciaPago || 'Sin Referencia'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        {order.referenciaPago && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                            Ref: {order.referenciaPago}
                          </span>
                        )}
                      </div>

                      {/* Delivery Address & Contact */}
                      <div className="space-y-1 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-1.5 text-neutral-600 dark:text-neutral-300 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[11px] font-semibold leading-tight">{order.cliente.direccion}</p>
                              {order.cliente.puntoReferencia && (
                                <p className="text-[10px] text-neutral-400 font-medium">
                                  Ref: {order.cliente.puntoReferencia}
                                </p>
                              )}
                            </div>
                          </div>
                          {order.cliente.telefono && (
                            <button
                              onClick={() => openCall(store.nombre, order.cliente.nombre, order.cliente.telefono, 'cliente')}
                              className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Llamar</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl space-y-1 text-xs">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">Comanda:</span>
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px]">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                              {it.cantidad}x {it.nombre}
                            </span>
                            <span className="font-mono text-neutral-500">
                              ${(it.subtotalUsd ?? (it.precioUnitarioUsd * it.cantidad) ?? 0).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons: Aceptar vs Rechazar */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => storeAcceptOrder(order.id)}
                          className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Aceptar Pedido</span>
                        </button>
                        <button
                          onClick={() => setRejectModalOrderId(order.id)}
                          className="py-2 px-2.5 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white dark:text-red-400 border border-red-500/25 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rechazar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Feed */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center px-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Cola de Pedidos en Vivo ({activeOrders.length})
                </h4>
                <button
                  onClick={() => setShowManualOrderModal(true)}
                  className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nuevo Pedido de Tienda
                </button>
              </div>

              {activeOrders.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 space-y-2">
                  <ChefHat className="w-10 h-10 mx-auto text-neutral-400" />
                  <p className="text-xs font-medium">No hay pedidos pendientes en preparación.</p>
                  <button
                    onClick={() => setShowManualOrderModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-500/20 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Crear comanda de tienda y pedir conductor
                  </button>
                </div>
              ) : (
                activeOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-3.5 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3"
                  >
                    <div className="flex justify-between items-start border-b border-neutral-100 dark:border-neutral-800 pb-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-amber-500 font-mono">
                            #{order.codigoSeguimiento}
                          </span>
                          {order.esPedidoTienda ? (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              🏪 Pedido Tienda (Directo)
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                              📱 Pedido Vixy App
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5">
                          {order.cliente.nombre} {order.cliente.apellido}
                        </h4>
                        {order.cliente.telefono && (
                          <p className="text-[10px] text-neutral-400 font-mono">
                            Tel: {order.cliente.telefono}
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 capitalize">
                        {order.estado.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Customer Delivery Location Card (Crucial for store manual orders) */}
                    <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60 text-xs space-y-1">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-neutral-400 font-semibold block uppercase">
                            {order.esPedidoTienda ? 'Ubicación Solicitada por el Cliente:' : 'Dirección de Entrega:'}
                          </span>
                          <p className="font-bold text-neutral-800 dark:text-neutral-100 leading-snug">
                            {order.cliente.direccion}
                          </p>
                        </div>
                      </div>
                      {order.cliente.puntoReferencia && (
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 pl-5">
                          <strong>Punto de Ref:</strong> {order.cliente.puntoReferencia}
                        </p>
                      )}
                      {order.detallesEntregaTienda?.zonaMunicipio && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 pl-5 font-semibold">
                          Municipio / Zona: {order.detallesEntregaTienda.zonaMunicipio}
                        </p>
                      )}
                    </div>

                    {/* Order items */}
                    <div className="space-y-1">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span>{it.cantidad}x {it.nombre}</span>
                          <span className="font-mono text-neutral-500">${(it.precioUnitarioUsd * it.cantidad).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex justify-between items-center text-xs font-bold">
                      <span>Total Productos</span>
                      <span className="text-amber-500 font-mono">${order.montoSubtotalUsd.toFixed(2)} USD</span>
                    </div>

                    {/* Payment verification & Order Accept/Reject */}
                    {(order.estado === 'pendiente_pago' || order.estado === 'pago_verificado') && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-700 dark:text-amber-300">
                            Confirmar Pedido ({order.metodoPagoSeleccionado === 'saldo_cartera' ? 'Cartera Vixy' : order.metodoPagoSeleccionado.replace('_', ' ')})
                          </span>
                          <span className="font-mono text-[10px]">Ref: {order.referenciaPago || (order.metodoPagoSeleccionado === 'saldo_cartera' ? 'Auto-Billetera' : 'Sin Ref')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => storeAcceptOrder(order.id)}
                            className="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Aceptar y Cocinar
                          </button>
                          <button
                            onClick={() => setRejectModalOrderId(order.id)}
                            className="py-2 px-2 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white dark:text-red-400 border border-red-500/25 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rechazar
                          </button>
                        </div>
                      </div>
                    )}

                    {order.estado === 'en_preparacion' && (
                      <div className="space-y-1.5">
                        <button
                          onClick={() => readyForPickup(order.id)}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-500 active:scale-98 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition"
                        >
                          <ChefHat className="w-3.5 h-3.5" />
                          Pedido Listo en Mostrador • Despachar
                        </button>
                        <button
                          onClick={() => setRejectModalOrderId(order.id)}
                          className="w-full py-1 text-[11px] text-neutral-400 hover:text-red-500 font-medium transition cursor-pointer text-center"
                        >
                          Cancelar comanda por imprevisto
                        </button>
                      </div>
                    )}

                    {/* Conductor status: Live search pulse if not assigned yet */}
                    {!order.conductor && (order.estado === 'en_preparacion' || order.estado === 'esperando_repartidor') && (
                      <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping shrink-0" />
                          <div>
                            <p className="font-bold text-blue-700 dark:text-blue-300 leading-tight">
                              Buscando motorizado en tu zona...
                            </p>
                            <p className="text-[10px] text-blue-600/80">
                              Notificación enviada a Vixy Delivery (Caracas)
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300">
                          Búsqueda Activa
                        </span>
                      </div>
                    )}

                    {/* Conductor assigned card */}
                    {order.conductor && (
                      <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={order.conductor.fotoUrl}
                            alt="Conductor"
                            className="w-7 h-7 rounded-lg object-cover border border-amber-500 shrink-0"
                          />
                          <div className="text-[11px] min-w-0">
                            <p className="font-bold leading-tight truncate">{order.conductor.nombre}</p>
                            <p className="text-[10px] text-neutral-400 font-mono truncate">Placa: {order.conductor.moto.placa}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openCall(order.conductor?.nombre || 'Motorizado', order.conductor?.fotoUrl)}
                            className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition cursor-pointer"
                            title="Llamar conductor"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openChat(order.id)}
                            className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition cursor-pointer"
                            title="Chatear con conductor"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedOrderForDriverModal(order)}
                            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
                          >
                            Ficha Legal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: HISTORIAL DE VENTAS */}
        {activeTab === 'historial' && (
          <div className="space-y-3 text-xs">
            <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Recaudado</span>
                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  ${totalVentasUsd.toFixed(2)} USD
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 block">Pedidos Entregados</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white font-mono">
                  {finishedOrders.length} pedidos
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {finishedOrders.map(o => (
                <div
                  key={o.id}
                  className="p-3 bg-white dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      Pedido #{o.codigoSeguimiento}
                    </span>
                    <p className="text-[11px] text-neutral-400">{o.cliente?.nombre || 'Cliente'} • {o.items?.length ?? 0} items</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-500 font-mono block">
                      ${o.montoTotalUsd.toFixed(2)} USD
                    </span>
                    <span className="text-[10px] text-neutral-400 capitalize">
                      {o.metodoPago.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CARTERA COMERCIAL (Billetera Única del Comercio con Acreditaciones Automáticas) */}
        {activeTab === 'cartera' && (
          <div className="space-y-3.5 text-xs">
            {/* Wallet Balance Card */}
            <div className="p-4 bg-linear-to-br from-amber-500 to-amber-600 text-white rounded-3xl shadow-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    Cartera Comercial Vixy
                  </span>
                  <h3 className="text-2xl font-black font-mono mt-0.5">
                    ${(storeWallet?.saldoUsd ?? 0).toFixed(2)} <span className="text-sm font-normal text-amber-100">USD</span>
                  </h3>
                </div>
                <div className="text-right bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-xl">
                  <span className="text-[9px] uppercase tracking-wider text-amber-100 block">Tasa BCV Oficial</span>
                  <span className="text-xs font-bold font-mono">Bs. {tasaBcv.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-2.5 bg-black/15 rounded-2xl flex justify-between items-center text-[11px]">
                <span className="text-amber-100">Equivalente Oficial en Bolívares:</span>
                <span className="font-extrabold font-mono text-white text-xs">
                  Bs. {((storeWallet?.saldoUsd ?? 0) * tasaBcv).toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/20 text-[11px]">
                <div>
                  <span className="text-[10px] text-amber-200 block">Total Acreditado</span>
                  <strong className="font-mono">${(storeWallet?.totalAcreditadoUsd ?? 0).toFixed(2)} USD</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-amber-200 block">Total Retirado</span>
                  <strong className="font-mono">${(storeWallet?.totalRetiradoUsd ?? 0).toFixed(2)} USD</strong>
                </div>
              </div>
            </div>

            {/* Banner de Sincronización SQL */}
            <div className="p-3 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold text-neutral-800 dark:text-neutral-200">Tabla SQL: <code className="text-amber-500 font-mono">comercio_billeteras</code></p>
                  <p className="text-[10px] text-neutral-400">Acreditaciones directas de pedidos abonados con Cartera de Cliente</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                Activa
              </span>
            </div>

            {/* Historial de Movimientos de Cartera */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-500" />
                  Movimientos y Comprobantes de Cartera
                </h4>
                <span className="text-[10px] text-neutral-400">
                  {storeWallet?.historialTransacciones?.length ?? 0} registros
                </span>
              </div>

              {(!storeWallet?.historialTransacciones || storeWallet.historialTransacciones.length === 0) ? (
                <div className="p-6 text-center bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-400">
                  <Wallet className="w-8 h-8 mx-auto text-neutral-300 mb-1" />
                  <p className="text-xs">Aún no hay transacciones en la cartera comercial.</p>
                </div>
              ) : (
                storeWallet.historialTransacciones.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-white dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              tx.tipo === 'credito' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          <span className="font-bold text-neutral-900 dark:text-white text-xs">
                            {tx.concepto}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-mono pl-3.5">
                          {new Date(tx.fecha).toLocaleString('es-VE')} {tx.referencia ? `• Ref: ${tx.referencia}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-xs ${
                            tx.tipo === 'credito'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-500'
                          }`}
                        >
                          {tx.tipo === 'credito' ? '+' : '-'}${tx.montoUsd.toFixed(2)} USD
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
      </div>

      {/* Modal: Crear o Editar Artículo con Carpeta Individual de Fotos en SQL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-5 max-w-sm w-full shadow-2xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  {editingProduct ? 'Editar Artículo' : 'Nuevo Artículo en el Menú'}
                </h4>
                <p className="text-[10px] text-neutral-400">
                  Comercio: <strong>{store.nombre}</strong> (ID: {store.id})
                </p>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-neutral-400 hover:text-white text-base font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Nombre del Artículo</label>
                <input
                  type="text"
                  required
                  value={prodNombre}
                  onChange={(e) => setProdNombre(e.target.value)}
                  placeholder="Ej: Hamburguesa Doble Queso BBQ"
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Precio ($ USD)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={prodPrecioUsd}
                    onChange={(e) => setProdPrecioUsd(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-mono font-bold"
                  />
                  <span className="text-[9px] text-neutral-400 font-mono block">
                    = Bs. {(prodPrecioUsd * tasaBcv).toFixed(2)} (BCV)
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Categoría del Catálogo</label>
                  <select
                    value={prodCategoria}
                    onChange={(e) => setProdCategoria(e.target.value)}
                    className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-semibold"
                  >
                    {customCatalogCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Descripción de Ingredientes / Detalles</label>
                <textarea
                  rows={2}
                  value={prodDescripcion}
                  onChange={(e) => setProdDescripcion(e.target.value)}
                  placeholder="Pan brioche artesanal, doble carne de res 150g, queso cheddar fundido..."
                  className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              {/* Imagen del Artículo y Carpeta Individual */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">URL / Previsualización de Imagen</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={prodImagenUrl}
                    onChange={(e) => setProdImagenUrl(e.target.value)}
                    className="flex-1 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-[11px]"
                  />
                  <img
                    src={prodImagenUrl}
                    alt="Preview"
                    className="w-9 h-9 rounded-xl object-cover border border-amber-500 shrink-0"
                  />
                </div>
              </div>

              {/* Server Folder Path indicator */}
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-800 dark:text-amber-300 space-y-0.5">
                <span className="font-bold block">Destino de Archivo en Servidor Namecheap:</span>
                <code className="font-mono text-[9px] block">
                  /uploads/comercios/{store.id}/articulos/{prodNombre ? prodNombre.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'articulo'}.jpg
                </code>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editingProduct ? 'Actualizar Artículo' : 'Guardar Artículo'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Driver Legal Inspection Modal for Store */}
      {selectedOrderForDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-4 border border-neutral-700 shadow-2xl text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <ShieldCheck className="w-4 h-4" />
                Ficha de Verificación del Repartidor
              </div>
              <button
                onClick={() => setSelectedOrderForDriverModal(null)}
                className="text-neutral-400 hover:text-white text-base font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={selectedOrderForDriverModal.conductor.fotoUrl}
                alt="Conductor"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500"
              />
              <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                  {selectedOrderForDriverModal.conductor.nombre} {selectedOrderForDriverModal.conductor.apellido}
                </h4>
                <p className="text-neutral-500 font-mono">C.I: {selectedOrderForDriverModal.conductor.legal.cedula}</p>
                <div className="flex items-center gap-1 text-amber-500 font-bold mt-0.5">
                  <Star className="w-3 h-3 fill-amber-500" />
                  {selectedOrderForDriverModal.conductor.rating} ({selectedOrderForDriverModal.conductor.totalEntregas} viajes exitosos)
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 space-y-1.5 text-[11px]">
              <span className="font-bold uppercase tracking-wider text-neutral-400 text-[10px] block">
                Datos de la Motocicleta
              </span>
              <p><strong>Marca y Modelo:</strong> {selectedOrderForDriverModal.conductor.moto.marca} {selectedOrderForDriverModal.conductor.moto.modelo} ({selectedOrderForDriverModal.conductor.moto.ano})</p>
              <p><strong>Color:</strong> {selectedOrderForDriverModal.conductor.moto.color}</p>
              <p className="text-amber-500 font-bold font-mono"><strong>Placa INTT:</strong> {selectedOrderForDriverModal.conductor.moto.placa}</p>
              <p><strong>Serial Motor:</strong> {selectedOrderForDriverModal.conductor.moto.serialMotor}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] space-y-1 text-emerald-800 dark:text-emerald-300">
              <span className="font-bold block">Documentos Legales Venezolanos Válidos</span>
              <p>✓ Licencia Grado 2da (Motos): {selectedOrderForDriverModal.conductor.legal.licenciaNumero}</p>
              <p>✓ Certificado Médico Vial MPPS: Vence {selectedOrderForDriverModal.conductor.legal.certificadoMedicoVencimiento}</p>
              <p>✓ RCV: {selectedOrderForDriverModal.conductor.legal.rcvAseguradora}</p>
            </div>

            <button
              onClick={() => setSelectedOrderForDriverModal(null)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Identidad Verificada • Cerrar</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Rechazo de Pedido Comercio */}
      {rejectModalOrderId && (() => {
        const targetOrder = orders.find(o => o.id === rejectModalOrderId);
        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-2.5 text-red-500">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Rechazar Comanda</h3>
                  <span className="text-[10px] text-neutral-400 font-mono">Pedido #{targetOrder?.codigoSeguimiento}</span>
                </div>
              </div>

              {targetOrder && (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/70 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-neutral-900 dark:text-white">
                      {targetOrder.cliente.nombre} {targetOrder.cliente.apellido}
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-mono">
                      ${targetOrder.montoTotalUsd.toFixed(2)} USD
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {targetOrder.items.map(i => `${i.cantidad}x ${i.nombre}`).join(', ')}
                  </p>
                  {targetOrder.metodoPagoSeleccionado === 'saldo_cartera' && (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        Reembolso Automático Garantizado: Los ${targetOrder.montoTotalUsd.toFixed(2)} USD serán acreditados de vuelta en la Cartera Vixy del cliente al instante.
                      </span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Indica el motivo por el cual la tienda no puede despachar esta comanda. Se notificará al cliente y se registrará en auditoría:
              </p>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-neutral-400">Motivo Operativo:</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 outline-none"
                >
                  <option value="Ingredientes no disponibles">Ingredientes / Artículos agotados</option>
                  <option value="Cocina saturada de pedidos">Cocina saturada / Espera excesiva</option>
                  <option value="Fuera de horario comercial">Fuera de horario de servicio</option>
                  <option value="Comprobante de pago inválido">Comprobante de pago no válido</option>
                  <option value="Dirección fuera de cobertura">Dirección fuera de cobertura</option>
                  <option value="Otro imprevisto en cocina">Otro imprevisto en cocina</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-400">Mensaje para el cliente (opcional):</label>
                <textarea
                  rows={2}
                  value={rejectCustomNote}
                  onChange={(e) => setRejectCustomNote(e.target.value)}
                  placeholder="Ej: Nos quedamos sin existencias de este menú hoy..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setRejectModalOrderId(null);
                    setRejectCustomNote('');
                  }}
                  className="py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const finalReason = rejectCustomNote.trim()
                      ? `${rejectReason} - ${rejectCustomNote.trim()}`
                      : rejectReason;
                    storeRejectOrder(rejectModalOrderId, finalReason);
                    setRejectModalOrderId(null);
                    setRejectCustomNote('');
                  }}
                  className="py-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-98 text-xs font-bold text-white shadow-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Confirmar Rechazo</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Manual / In-Store Delivery Request Modal */}
      {showManualOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-5 border border-neutral-200 dark:border-neutral-800 shadow-2xl text-xs space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-amber-500 font-extrabold text-sm">
                  <Store className="w-4 h-4" />
                  <span>Procesar Pedido de Tienda & Solicitar Delivery</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Registra un pedido telefónico, WhatsApp o de mostrador e indica la dirección solicitada por el cliente para enviar a Vixy Delivery.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowManualOrderModal(false);
                  setManualFormError('');
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-lg font-bold leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {manualFormError && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-2 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{manualFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateManualOrder} className="space-y-4">
              {/* Section 1: Customer Details */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider block">
                  1. Datos del Cliente (Venta Directa)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Carlos Mendoza"
                      value={manualClientName}
                      onChange={(e) => setManualClientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                      Teléfono / WhatsApp de Contacto
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 0414-1234567"
                      value={manualClientPhone}
                      onChange={(e) => setManualClientPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Destination requested by customer */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    2. Ubicación de Entrega Indicada por el Cliente
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">Obligatorio</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                    Dirección exacta solicitada por el cliente *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Ej: Av. Francisco de Miranda, Res. Centro Plaza, Torre B, Piso 5, Apto 5-B"
                    value={manualClientAddress}
                    onChange={(e) => setManualClientAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                      Punto de Referencia
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Al lado de Farmatodo, portón azul"
                      value={manualReference}
                      onChange={(e) => setManualReference(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                      Municipio / Sector
                    </label>
                    <select
                      value={manualZone}
                      onChange={(e) => setManualZone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Chacao">Chacao</option>
                      <option value="Baruta">Baruta</option>
                      <option value="Sucre">Sucre (Los Dos Caminos, Sebucán, La California)</option>
                      <option value="El Hatillo">El Hatillo</option>
                      <option value="Libertador">Libertador (Sabana Grande, Plaza Vzla, Centro)</option>
                    </select>
                  </div>
                </div>

                {/* Distance and delivery rate estimation */}
                <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-amber-500" />
                      Distancia Estimada desde tu Tienda:
                    </span>
                    <span className="font-mono font-bold text-amber-500 text-xs">
                      {manualDistanceKm} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="18"
                    step="0.5"
                    value={manualDistanceKm}
                    onChange={(e) => setManualDistanceKm(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between items-center p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px]">
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Costo Delivery Vixy</span>
                      <strong className="text-amber-600 dark:text-amber-400 font-mono text-xs">
                        ${manualTripCalculation.totalViajeUsd.toFixed(2)} USD
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-500 block text-[10px]">Ganancia Repartidor</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                        ${manualTripCalculation.gananciaMotorizadoUsd.toFixed(2)} USD
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Select Products / Order Items */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                    3. Comanda de Artículos
                  </span>
                  <span className="font-mono font-bold text-xs text-amber-500">
                    Subtotal: ${selectedItemsSubtotal.toFixed(2)} USD
                  </span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {store.productos.map(prod => {
                    const count = manualSelectedItems[prod.id] || 0;
                    return (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-neutral-800 dark:text-neutral-100 text-xs truncate">
                            {prod.nombre}
                          </p>
                          <p className="text-[10px] font-mono text-neutral-400">
                            ${prod.precioUsd.toFixed(2)} USD
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setManualSelectedItems(prev => ({
                                ...prev,
                                [prod.id]: Math.max(0, (prev[prod.id] || 0) - 1)
                              }));
                            }}
                            className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-200 font-bold flex items-center justify-center hover:bg-neutral-200 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold font-mono text-xs">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setManualSelectedItems(prev => ({
                                ...prev,
                                [prod.id]: (prev[prod.id] || 0) + 1
                              }));
                            }}
                            className="w-6 h-6 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center hover:bg-amber-600 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Item optional input */}
                <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60 space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-500 block">
                    ¿Otro artículo fuera del catálogo? (Opcional):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Ej: Refresco 2L o Combo Especial"
                      value={manualCustomItemName}
                      onChange={(e) => setManualCustomItemName(e.target.value)}
                      className="col-span-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="Precio $"
                      value={manualCustomItemPrice || ''}
                      onChange={(e) => setManualCustomItemPrice(parseFloat(e.target.value) || 0)}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Payment & Notes */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider block">
                  4. Cobro en Tienda & Instrucciones
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                      Método acordado con el cliente
                    </label>
                    <select
                      value={manualPaymentMethod}
                      onChange={(e) => setManualPaymentMethod(e.target.value as MetodoPagoTipo)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="efectivo_usd">Efectivo Divisas ($)</option>
                      <option value="pago_movil">Pago Móvil Comercio (Bs)</option>
                      <option value="tarjeta_debito">Punto de Venta / Débito</option>
                      <option value="zelle">Zelle</option>
                      <option value="zinli">Zinli</option>
                      <option value="binance_pay">Binance Pay</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                      Referencia o Recibo (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Ref 849201"
                      value={manualPaymentRef}
                      onChange={(e) => setManualPaymentRef(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                    Notas o instrucciones para la entrega (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Empacar salsa tártara extra, cliente espera en la garita"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Economic Summary and Submit Button */}
              <div className="p-3 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-300">
                  <span>Productos del Comercio:</span>
                  <span className="font-mono font-semibold">${selectedItemsSubtotal.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-300">
                  <span>Tarifa de Delivery ({manualDistanceKm} km):</span>
                  <span className="font-mono font-semibold">${manualTripCalculation.totalViajeUsd.toFixed(2)} USD</span>
                </div>
                <div className="border-t border-amber-500/20 pt-2 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold block text-neutral-900 dark:text-white">
                      Total Pedido
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Tasa BCV: {tasaBcv.toFixed(2)} Bs/$
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 font-mono block">
                      ${manualTotalOrderUsd.toFixed(2)} USD
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Bs. {manualTotalOrderBs.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowManualOrderModal(false);
                    setManualFormError('');
                  }}
                  className="py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Pedir Conductor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wallet Receipt / File Storage Inspection Modal */}
      {selectedWalletTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-2xl text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                <FileText className="w-4 h-4" />
                <span>Comprobante de Pago Digital (SQL)</span>
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
                <span className="font-bold text-neutral-900 dark:text-white">{selectedWalletTx.concepto}</span>
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
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-bold uppercase text-[10px]">Tasa Oficial BCV</span>
                <span className="font-mono">{tasaBcv.toFixed(2)} Bs/$</span>
              </div>
              {selectedWalletTx.referencia && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-bold uppercase text-[10px]">N° Referencia</span>
                  <span className="font-mono font-bold">{selectedWalletTx.referencia}</span>
                </div>
              )}
            </div>

            {/* Simulated Receipt Image from Storage */}
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-2 text-center">
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                Archivo Guardado en Sistema Interno
              </span>
              <div className="w-full h-32 rounded-xl bg-neutral-200 dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center p-3 text-neutral-500">
                <FileImage className="w-8 h-8 text-amber-500 mb-1" />
                <span className="font-mono text-[9px] break-all">
                  {selectedWalletTx.comprobanteRuta || `/uploads/comprobantes_pago/${selectedWalletTx.id}.png`}
                </span>
                <span className="text-[9px] text-emerald-500 font-bold mt-1">
                  ✓ Almacenado con ID único en tabla SQL
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedWalletTx(null)}
              className="w-full py-2 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-850 active:scale-98 text-white font-bold rounded-xl text-xs cursor-pointer transition"
            >
              Cerrar Comprobante
            </button>
          </div>
        </div>
      )}

      {/* TAB RECLAMOS GESTIONADOS DESDE BACKEND */}
      {activeTab === 'reclamos' && (
        <StoreClaimsManager />
      )}

      {/* Bottom Store Tabs */}
      <div className="p-1.5 bg-white dark:bg-neutral-850 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-6 gap-0.5 shrink-0 text-center">
        <button
          onClick={() => setActiveTab('cuenta')}
          className={`py-1 rounded-xl text-[10px] flex flex-col items-center gap-0.5 transition cursor-pointer ${
            activeTab === 'cuenta' 
              ? 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold' 
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 font-medium'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span className="truncate">Cuenta</span>
        </button>

        <button
          onClick={() => setActiveTab('articulos')}
          className={`py-1 rounded-xl text-[10px] flex flex-col items-center gap-0.5 transition cursor-pointer ${
            activeTab === 'articulos' 
              ? 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold' 
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 font-medium'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span className="truncate">Menú</span>
        </button>

        <button
          onClick={() => setActiveTab('pedidos')}
          className={`py-1 rounded-xl text-[10px] flex flex-col items-center gap-0.5 transition cursor-pointer relative ${
            activeTab === 'pedidos' 
              ? 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold' 
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 font-medium'
          }`}
        >
          <div className="relative">
            <ChefHat className="w-3.5 h-3.5" />
            {pendingApprovalOrders.length > 0 ? (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-amber-500 text-white font-black text-[8px] rounded-full animate-bounce shadow-2xs leading-none">
                {pendingApprovalOrders.length}
              </span>
            ) : activeOrders.length > 0 ? (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-purple-600 text-white font-bold text-[8px] rounded-full leading-none">
                {activeOrders.length}
              </span>
            ) : null}
          </div>
          <span className="truncate">Pedidos</span>
        </button>

        <button
          onClick={() => setActiveTab('reclamos')}
          className={`py-1 rounded-xl text-[10px] flex flex-col items-center gap-0.5 transition cursor-pointer relative ${
            activeTab === 'reclamos' 
              ? 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold' 
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 font-medium'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-3.5 h-3.5" />
            {claims.filter(c => c.comercioId === store.id && c.estado === 'en_espera').length > 0 && (
              <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
            )}
          </div>
          <span className="truncate">Reclamos</span>
        </button>

        <button
          onClick={() => setActiveTab('cartera')}
          className={`py-1 rounded-xl text-[10px] flex flex-col items-center gap-0.5 transition cursor-pointer ${
            activeTab === 'cartera' 
              ? 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold' 
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 font-medium'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span className="truncate">Cartera</span>
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`py-1 rounded-xl text-[10px] flex flex-col items-center gap-0.5 transition cursor-pointer ${
            activeTab === 'historial' 
              ? 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold' 
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 font-medium'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span className="truncate">Historial</span>
        </button>
      </div>
    </div>
  );
};
