import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Cliente, 
  Comercio, 
  Conductor, 
  Pedido, 
  EstadoPedido, 
  Incidencia, 
  UsuarioBackend, 
  NotificacionPush, 
  FotoVerificacion,
  MensajeChat,
  MensajeSoporte,
  MetodoPagoTipo,
  ConductorBilletera,
  ClienteBilletera,
  ComercioBilletera,
  AdminUser,
  Producto,
  LogActividad,
  TarifasDeliveryConfig,
  SolicitudRecarga,
  ReclamoCliente
} from '../types/delivery';
import { 
  DEMO_CLIENTE, 
  DEMO_CONDUCTOR, 
  DEMO_COMERCIO, 
  DEMO_CONDUCTOR_BILLETERA,
  DEMO_CLIENTE_BILLETERA,
  DEMO_COMERCIO_BILLETERA,
  ALL_DEMO_COMERCIOS,
  ALL_DEMO_CLIENTES,
  ALL_DEMO_CONDUCTORES,
  INITIAL_RECHARGE_REQUESTS,
  INITIAL_CLIENT_CLAIMS,
  INITIAL_ORDERS, 
  INITIAL_INCIDENTS, 
  INITIAL_BACKEND_USERS, 
  INITIAL_ADMIN_USERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_TARIFAS_CONFIG,
  TASA_BCV_ACTUAL 
} from '../data/initialData';

interface DeliveryContextType {
  orders: Pedido[];
  activeOrder: Pedido | null;
  client: Cliente;
  clientWallet: ClienteBilletera;
  clientLoggedIn: boolean;
  registeredClients: Cliente[];
  switchActiveClient: (clientId: string) => void;
  loginClient: (usernameOrPhone: string, password: string) => { success: boolean; error?: string };
  logoutClient: () => void;
  registerClient: (data: { nombre: string; apellido: string; cedula: string; telefono: string; username: string; password: string; direccion: string; puntoReferencia: string; email?: string }) => { success: boolean; error?: string };
  rechargeClientWallet: (montoUsd: number, metodoPago: MetodoPagoTipo, referencia: string, comprobanteUrl?: string) => { success: boolean; error?: string };
  driver: Conductor;
  driverWallet: ConductorBilletera;
  driverLoggedIn: boolean;
  allDrivers: Conductor[];
  switchActiveDriver: (driverId: string) => void;
  loginDriver: (cedulaOrPhone: string, password?: string) => { success: boolean; error?: string };
  logoutDriver: () => void;
  store: Comercio;
  stores: Comercio[];
  switchStore: (storeId: string) => void;
  updateStoreSchedule: (storeId: string, scheduleData: string | { horaApertura?: string; horaCierre?: string; diasOperacion?: string[]; horarios?: string; activo?: boolean; abierto?: boolean }, abiertoParam?: boolean) => void;
  toggleStoreActive: (storeId: string) => void;
  rateStore: (storeId: string, calificacion: number, comentario: string, clienteNombre: string) => void;
  storeWallet: ComercioBilletera;
  storeLoggedIn: boolean;
  loginStore: (identifier: string, password?: string) => { success: boolean; error?: string };
  logoutStore: () => void;
  creditStoreWallet: (params: { montoUsd: number; pedidoId?: string; codigoSeguimiento?: string; tipo: 'pago_pedido_cartera' | 'pago_pedido_directo'; metodoPago?: MetodoPagoTipo; referencia?: string; comprobanteUrl?: string; descripcion: string }) => void;
  updateStoreRubro: (rubro: string, rubroPersonalizado?: string) => void;
  updateStoreCategoriasCatalogo: (categorias: string[]) => void;
  // Solicitudes de Recarga con Autorización Backend
  rechargeRequests: SolicitudRecarga[];
  solicitarRecargaCliente: (montoUsd: number, metodoPago: MetodoPagoTipo, referencia: string, comprobanteUrl?: string) => { success: boolean; error?: string };
  solicitarRecargaConductor: (montoUsd: number, metodoPago: MetodoPagoTipo, referencia: string, comprobanteUrl?: string) => { success: boolean; error?: string };
  aprobarRecarga: (solicitudId: string, nota?: string) => void;
  rechazarRecarga: (solicitudId: string, motivo: string) => void;
  // Confirmación y Calificación de Entrega
  confirmDeliveryByClient: (orderId: string, calificacionComercio: number, calificacionConductor: number, comentario: string) => void;
  // Reclamos y Quejas
  claims: ReclamoCliente[];
  createClaim: (data: { pedidoId: string; motivo: string; descripcion: string; imagenes?: string[] }) => ReclamoCliente;
  updateClaimStatus: (claimId: string, nuevoEstado: 'en_espera_de_respuesta' | 'atendido' | 'solucionado', respuesta: string, autor: 'comercio' | 'backend') => void;
  // Custodia y Wallets Globales
  allClientWallets: Array<{ clienteId: string; clienteNombre: string; cedula: string; saldoUsd: number; saldoBs: number; totalRecargadoUsd: number; totalGastadoUsd: number; carpetaComprobantes: string; transacciones: any[] }>;
  allDriverWallets: Array<{ conductorId: string; conductorNombre: string; cedula: string; saldoUsd: number; limiteSaldoNegativo: number; bloqueado: boolean; carpetaComprobantes: string; transacciones: any[] }>;
  allStoreWallets: Array<{ comercioId: string; comercioNombre: string; rif: string; saldoUsd: number; saldoBs: number; totalVentasUsd: number; totalRetiradoUsd: number; transacciones: any[] }>;
  globalLedger: { totalClientesUsd: number; totalConductoresUsd: number; totalComerciosUsd: number; totalGlobalCustodiaUsd: number };
  incidents: Incidencia[];
  backendUsers: UsuarioBackend[];
  adminUsers: AdminUser[];
  currentAdminUser: AdminUser;
  adminIsLoggedIn: boolean;
  loginAdmin: (identifier?: string, password?: string, fallbackId?: string) => { success: boolean; error?: string };
  logoutAdmin: () => void;
  changeAdminPassword: (userId: string, newPassword: string) => { success: boolean; error?: string };
  activityLogs: LogActividad[];
  addActivityLog: (log: Omit<LogActividad, 'id' | 'fecha'>) => void;
  clearActivityLogs: () => void;
  deliveryRates: TarifasDeliveryConfig;
  updateDeliveryRates: (rates: Partial<TarifasDeliveryConfig>) => void;
  calculateDeliveryTripCost: (distanciaKm: number) => {
    distanciaKm: number;
    tarifaBaseUsd: number;
    distanciaBaseKm: number;
    distanciaExcedenteKm: number;
    fraccionesAdicionales: number;
    costoAdicionalUsd: number;
    totalViajeUsd: number;
    totalViajeBs: number;
    comisionPlataformaUsd: number;
    gananciaMotorizadoUsd: number;
  };
  notifications: NotificacionPush[];
  verificationPhotos: FotoVerificacion[];
  chatMessages: MensajeChat[];
  supportMessages: MensajeSoporte[];
  tasaBcv: number;
  setTasaBcv: (val: number) => void;
  updateDriverAvailability: (available: boolean) => void;
  rechargeDriverWallet: (monto: number, metodoPago: MetodoPagoTipo, referencia: string) => void;
  toggleSimulatedNegativeBalance: () => void;
  updateStoreInfo: (info: Partial<Comercio>) => void;
  updateStorePayments: (payments: any) => void;
  addProduct: (prod: Omit<Producto, 'id' | 'precioBs'>) => void;
  updateProduct: (id: string, prod: Partial<Producto>) => void;
  deleteProduct: (id: string) => void;
  addProductToStore: (prod: any) => void;
  updateProductInStore: (id: string, prod: any) => void;
  deleteProductFromStore: (id: string) => void;
  switchAdminUser: (userId: string) => void;
  addAdminUser: (userData: Omit<AdminUser, 'id' | 'ultimoAcceso'>) => void;
  updateAdminUser: (id: string, updates: Partial<AdminUser>) => void;
  deleteAdminUser: (id: string) => void;
  createOrder: (data: {
    items: { productoId: string; nombre: string; cantidad: number; precioUnitarioUsd: number }[];
    metodoPago: MetodoPagoTipo;
    referenciaPago?: string;
  }) => Pedido;
  createStoreManualOrder: (params: {
    clienteNombre: string;
    clienteTelefono: string;
    clienteDireccion: string;
    puntoReferencia?: string;
    zonaMunicipio?: string;
    items: Array<{ productoId?: string; nombre: string; cantidad: number; precioUnitarioUsd: number }>;
    montoSubtotalUsd: number;
    distanciaKm?: number;
    metodoPago: MetodoPagoTipo;
    referenciaPago?: string;
    notas?: string;
  }) => Pedido;
  storeAcceptOrder: (orderId: string) => void;
  storeRejectOrder: (orderId: string, motivo?: string) => void;
  verifyPayment: (orderId: string) => void;
  startPreparing: (orderId: string) => void;
  readyForPickup: (orderId: string) => void;
  assignDriverToOrder: (orderId: string, driverId: string) => void;
  driverAcceptOrder: (orderId: string) => void;
  driverRejectOrder: (orderId: string, motivo?: string) => void;
  driverPickUpOrder: (orderId: string) => void;
  driverDeliverOrder: (orderId: string, photoUrl: string, comentario: string) => void;
  rateDriver: (orderId: string, estrellas: number, comentario: string) => void;
  reportIncident: (inc: Omit<Incidencia, 'id' | 'codigoIncidencia' | 'fechaCreacion' | 'estado'>) => void;
  resolveIncident: (id: string, resolucion: string) => void;
  sendChatMessage: (orderId: string, emisorTipo: 'cliente' | 'comercio' | 'conductor', emisorNombre: string, mensaje: string) => void;
  sendSupportMessage: (usuarioTipo: 'cliente' | 'comercio' | 'conductor', usuarioNombre: string, texto: string) => void;
  respondSupportMessage: (texto: string) => void;
  // Modal states
  callModal: { isOpen: boolean; caller: string; callee: string; phone: string; role: string };
  openCall: (caller: string, callee: string, phone: string, role: string) => void;
  closeCall: () => void;
  chatModal: { isOpen: boolean; orderId: string };
  openChat: (orderId: string) => void;
  closeChat: () => void;
  // Maps Open Source (CARTO & OSM) Backend Managed API Key
  cartoApiKey: string;
  setCartoApiKey: (key: string) => void;
  // Real GPS Telemetry & Push Notifications
  realGpsActive: boolean;
  realGpsCoords: {
    lat: number;
    lng: number;
    accuracy: number;
    speed: number;
    heading: number;
    timestamp: number;
  } | null;
  realGpsError: string | null;
  requestPushNotificationPermission: () => Promise<boolean>;
  playNotificationSound: () => void;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Pedido[]>(INITIAL_ORDERS);
  const [client, setClient] = useState<Cliente>(DEMO_CLIENTE);
  const [clientWallet, setClientWallet] = useState<ClienteBilletera>(DEMO_CLIENTE_BILLETERA);
  const [registeredClients, setRegisteredClients] = useState<Cliente[]>(ALL_DEMO_CLIENTES);
  const [clientLoggedIn, setClientLoggedIn] = useState<boolean>(true);

  const [driverWallet, setDriverWallet] = useState<ConductorBilletera>(DEMO_CONDUCTOR_BILLETERA);
  const [driver, setDriver] = useState<Conductor>({
    ...DEMO_CONDUCTOR,
    billetera: DEMO_CONDUCTOR_BILLETERA
  });
  const [allDrivers, setAllDrivers] = useState<Conductor[]>(ALL_DEMO_CONDUCTORES);
  const [driverLoggedIn, setDriverLoggedIn] = useState<boolean>(true);

  const [stores, setStores] = useState<Comercio[]>(ALL_DEMO_COMERCIOS);
  const [store, setStore] = useState<Comercio>(DEMO_COMERCIO);
  const [storeWallet, setStoreWallet] = useState<ComercioBilletera>(DEMO_COMERCIO_BILLETERA);
  const [storeLoggedIn, setStoreLoggedIn] = useState<boolean>(true);

  const [rechargeRequests, setRechargeRequests] = useState<SolicitudRecarga[]>(INITIAL_RECHARGE_REQUESTS);
  const [claims, setClaims] = useState<ReclamoCliente[]>(INITIAL_CLIENT_CLAIMS);

  const [incidents, setIncidents] = useState<Incidencia[]>(INITIAL_INCIDENTS);
  const [backendUsers, setBackendUsers] = useState<UsuarioBackend[]>(INITIAL_BACKEND_USERS);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser>(INITIAL_ADMIN_USERS[0]);
  const [notifications, setNotifications] = useState<NotificacionPush[]>(INITIAL_NOTIFICATIONS);
  const [tasaBcv, setTasaBcv] = useState<number>(TASA_BCV_ACTUAL);
  const [adminIsLoggedIn, setAdminIsLoggedIn] = useState<boolean>(true);
  const [activityLogs, setActivityLogs] = useState<LogActividad[]>(INITIAL_ACTIVITY_LOGS);
  const [deliveryRates, setDeliveryRates] = useState<TarifasDeliveryConfig>(INITIAL_TARIFAS_CONFIG);
  const [cartoApiKey, setCartoApiKeyState] = useState<string>(() => {
    try {
      return localStorage.getItem('vixy_carto_api_key') || (import.meta as any).env?.VITE_CARTO_API_KEY || '';
    } catch {
      return (import.meta as any).env?.VITE_CARTO_API_KEY || '';
    }
  });

  const handleSetCartoApiKey = (newKey: string) => {
    const trimmed = newKey.trim();
    setCartoApiKeyState(trimmed);
    try {
      localStorage.setItem('vixy_carto_api_key', trimmed);
    } catch (e) {
      console.warn('Error saving CARTO API key to localStorage', e);
    }
  };

  const handleSetTasaBcv = (newVal: number) => {
    setTasaBcv(newVal);
    setDeliveryRates(prev => ({ ...prev, tasaBcvBs: newVal }));
    // 1. Recalcular precios de los productos en Bs basados en la tasa oficial BCV
    setStore(prev => ({
      ...prev,
      productos: (prev.productos || []).map(p => ({
        ...p,
        precioBs: Math.round(p.precioUsd * newVal)
      }))
    }));
    // 2. Recalcular saldos de cartera en Bs
    setClientWallet(prev => ({
      ...prev,
      saldoBs: Math.round(prev.saldoUsd * newVal * 100) / 100
    }));
    setStoreWallet(prev => ({
      ...prev,
      saldoBs: Math.round(prev.saldoUsd * newVal * 100) / 100
    }));
    setDriverWallet(prev => ({
      ...prev,
      saldoBs: Math.round(prev.saldoUsd * newVal * 100) / 100
    }));
    addActivityLog({
      usuarioId: currentAdminUser?.id || 'admin-001',
      usuarioNombre: currentAdminUser?.nombre || 'Administrador',
      usuarioRol: 'admin',
      modulo: 'tarifas',
      accion: 'Actualización Tasa Oficial BCV',
      detalles: `Tasa oficial del BCV establecida en ${newVal.toFixed(2)} Bs/USD. Precios de productos de comercios y saldos de carteras sincronizados con la base de datos SQL.`,
      ip: '190.202.88.14 (Caracas, CANTV)',
      severidad: 'exito'
    });
  };

  // Auth Cliente
  const logoutClient = () => {
    setClientLoggedIn(false);
    addNotification('cliente', '🔒 Sesión Cerrada', 'Has cerrado tu sesión en Vixy Pedidos de forma segura.');
  };

  const loginClient = (usernameOrPhone: string, password: string): { success: boolean; error?: string } => {
    const cleanInput = usernameOrPhone.trim().toLowerCase();
    const found = registeredClients.find(c => 
      (c.username && c.username.toLowerCase() === cleanInput) ||
      c.telefono.replace(/\s+/g, '') === cleanInput.replace(/\s+/g, '') ||
      c.cedula.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanInput.replace(/[^a-z0-9]/g, '')
    );

    if (!found) {
      return { success: false, error: 'Usuario, cédula o número de teléfono no encontrado en el sistema.' };
    }

    if (found.passwordHash && found.passwordHash !== password) {
      return { success: false, error: 'Contraseña incorrecta. Por favor verifica tus credenciales.' };
    }

    setClient(found);
    if (found.billetera) {
      setClientWallet(found.billetera);
    }
    setClientLoggedIn(true);
    addNotification('cliente', '👋 ¡Bienvenido!', `Hola ${found.nombre}, sesión iniciada con éxito.`);
    return { success: true };
  };

  const registerClient = (data: {
    nombre: string;
    apellido: string;
    cedula: string;
    telefono: string;
    username: string;
    password: string;
    direccion: string;
    puntoReferencia: string;
    email?: string;
  }): { success: boolean; error?: string } => {
    const cedulaLimpia = data.cedula.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const tlfLimpio = data.telefono.trim().replace(/\s+/g, '');
    const userLimpio = data.username.trim().toLowerCase();

    const existeCedula = registeredClients.some(c => c.cedula.toLowerCase().replace(/[^a-z0-9]/g, '') === cedulaLimpia);
    if (existeCedula) {
      return { success: false, error: `La cédula de identidad "${data.cedula}" ya se encuentra registrada en la base de datos SQL.` };
    }

    const existeTlf = registeredClients.some(c => c.telefono.replace(/\s+/g, '') === tlfLimpio);
    if (existeTlf) {
      return { success: false, error: `El número de teléfono "${data.telefono}" ya está asociado a otra cuenta de usuario.` };
    }

    const existeUsername = registeredClients.some(c => c.username && c.username.toLowerCase() === userLimpio);
    if (existeUsername) {
      return { success: false, error: `El nombre de usuario "@${data.username}" ya está en uso. Por favor elija otro.` };
    }

    const newId = 'cli-' + Date.now().toString(36);
    const newWallet: ClienteBilletera = {
      clienteId: newId,
      saldoUsd: 0,
      saldoBs: 0,
      totalGastadoUsd: 0,
      totalRecargadoUsd: 0,
      historialTransacciones: []
    };

    const newClient: Cliente = {
      id: newId,
      username: data.username.trim(),
      passwordHash: data.password,
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      cedula: data.cedula.trim().toUpperCase(),
      telefono: data.telefono.trim(),
      email: data.email?.trim() || `${data.username.trim()}@vixy.com`,
      direccion: data.direccion.trim(),
      puntoReferencia: data.puntoReferencia.trim(),
      lat: 10.4965,
      lng: -66.8523,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      billetera: newWallet
    };

    setRegisteredClients(prev => [...prev, newClient]);
    setClient(newClient);
    setClientWallet(newWallet);
    setClientLoggedIn(true);

    addNotification('cliente', '🎉 Registro Exitoso', `¡Bienvenido a Vixy Pedidos, ${newClient.nombre}! Cartera creada.`);
    addActivityLog({
      usuarioId: newClient.id,
      usuarioNombre: `${newClient.nombre} ${newClient.apellido}`,
      usuarioRol: 'cliente',
      modulo: 'seguridad',
      accion: 'Nuevo Cliente Registrado (SQL)',
      detalles: `Registro de cliente C.I. ${newClient.cedula}, Tel: ${newClient.telefono}, Usuario: @${newClient.username}. Cartera ID asignada en BD.`,
      ip: '190.202.88.15',
      severidad: 'info'
    });

    return { success: true };
  };

  const solicitarRecargaCliente = (montoUsd: number, metodoPago: MetodoPagoTipo, referencia: string, comprobanteUrl?: string): { success: boolean; error?: string } => {
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const id = 'sol-rec-' + Date.now();
    const codigoSolicitud = 'REC-W-' + Math.floor(1000 + Math.random() * 9000);
    // Carpeta individual por cliente
    const carpetaPath = `/uploads/clientes/${client.id}/comprobantes/recarga_${Date.now()}.jpg`;
    const finalComprobante = comprobanteUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80';

    const nuevaSolicitud: SolicitudRecarga = {
      id,
      codigoSolicitud,
      usuarioTipo: 'cliente',
      usuarioId: client.id,
      usuarioNombre: `${client.nombre} ${client.apellido}`,
      usuarioCedula: client.cedula,
      montoUsd,
      montoBs: Math.round(montoUsd * tasaBcv * 100) / 100,
      metodoPago,
      referencia,
      comprobanteUrl: finalComprobante,
      directorioAlmacenamiento: carpetaPath,
      fecha: timeStr,
      estado: 'pendiente'
    };

    setRechargeRequests(prev => [nuevaSolicitud, ...prev]);

    // Registrar en el historial de la wallet del cliente como pendiente de aprobación
    setClientWallet(prev => ({
      ...prev,
      historialTransacciones: [
        {
          id: 'tx-sol-' + Date.now(),
          clienteId: client.id,
          tipo: 'recarga' as const,
          montoUsd,
          montoBs: Math.round(montoUsd * tasaBcv * 100) / 100,
          saldoResultanteUsd: prev.saldoUsd, // No se incrementa hasta autorización
          metodoPago,
          referencia,
          comprobanteUrl: carpetaPath,
          descripcion: `Recarga de $${montoUsd.toFixed(2)} (${metodoPago.toUpperCase()}) - EN ESPERA DE AUTORIZACIÓN CENTRAL (Ref: ${referencia})`,
          fecha: timeStr,
          estado: 'pendiente' as any
        },
        ...(prev.historialTransacciones || [])
      ]
    }));

    addNotification('cliente', '⏳ Recarga Enviada a Verificación', `Tu solicitud de $${montoUsd.toFixed(2)} USD fue enviada al Backend Central. Se acreditará una vez aprobada la referencia.`);
    addNotification('web', '🔔 Nueva Solicitud de Recarga (Cliente)', `Cliente ${client.nombre} reportó recarga de $${montoUsd.toFixed(2)} USD vía ${metodoPago.toUpperCase()} (Ref: ${referencia}). Almacenado en ${carpetaPath}`);
    addActivityLog({
      usuarioId: client.id,
      usuarioNombre: `${client.nombre} ${client.apellido}`,
      usuarioRol: 'cliente',
      modulo: 'seguridad',
      accion: 'Solicitud de Recarga Wallet',
      detalles: `Cliente solicitó recarga de $${montoUsd.toFixed(2)} USD vía ${metodoPago} (Ref: ${referencia}). Carpeta: ${carpetaPath}`,
      ip: '201.249.12.80 (Caracas)',
      severidad: 'info'
    });

    return { success: true };
  };

  const rechargeClientWallet = (montoUsd: number, metodoPago: MetodoPagoTipo, referencia: string, comprobanteUrl?: string): { success: boolean; error?: string } => {
    return solicitarRecargaCliente(montoUsd, metodoPago, referencia, comprobanteUrl);
  };

  const solicitarRecargaConductor = (montoUsd: number, metodoPago: MetodoPagoTipo, referencia: string, comprobanteUrl?: string): { success: boolean; error?: string } => {
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const id = 'sol-rec-dr-' + Date.now();
    const codigoSolicitud = 'REC-MOTO-' + Math.floor(1000 + Math.random() * 9000);
    // Carpeta individual por conductor
    const carpetaPath = `/uploads/conductores/${driver.id}/comprobantes/recarga_${Date.now()}.jpg`;
    const finalComprobante = comprobanteUrl || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=80';

    const nuevaSolicitud: SolicitudRecarga = {
      id,
      codigoSolicitud,
      usuarioTipo: 'conductor',
      usuarioId: driver.id,
      usuarioNombre: `${driver.nombre} ${driver.apellido} (Motorizado)`,
      usuarioCedula: driver.legal.cedula,
      montoUsd,
      montoBs: Math.round(montoUsd * tasaBcv * 100) / 100,
      metodoPago,
      referencia,
      comprobanteUrl: finalComprobante,
      directorioAlmacenamiento: carpetaPath,
      fecha: timeStr,
      estado: 'pendiente'
    };

    setRechargeRequests(prev => [nuevaSolicitud, ...prev]);

    setDriverWallet(prev => ({
      ...prev,
      historialTransacciones: [
        {
          id: 'tx-dr-sol-' + Date.now(),
          tipo: 'recarga' as const,
          monto: montoUsd,
          saldoResultante: prev.saldoUsd,
          metodoPago,
          referencia,
          comprobanteUrl: carpetaPath,
          descripcion: `Solicitud recarga $${montoUsd.toFixed(2)} (${metodoPago.toUpperCase()}) - EN ESPERA DE AUTORIZACIÓN CENTRAL`,
          fecha: timeStr,
          estado: 'pendiente' as any
        },
        ...(prev.historialTransacciones || [])
      ]
    }));

    addNotification('conductor', '⏳ Recarga Enviada a Verificación', `Tu solicitud de $${montoUsd.toFixed(2)} USD fue enviada al Backend Central.`);
    addNotification('web', '🔔 Nueva Solicitud de Recarga (Motorizado)', `Motorizado ${driver.nombre} solicitó recarga de $${montoUsd.toFixed(2)} USD vía ${metodoPago.toUpperCase()} (Ref: ${referencia}).`);

    return { success: true };
  };

  const aprobarRecarga = (solicitudId: string, nota?: string) => {
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const sol = rechargeRequests.find(s => s.id === solicitudId);
    if (!sol) return;

    setRechargeRequests(prev => prev.map(s => s.id === solicitudId ? {
      ...s,
      estado: 'aprobada',
      autorizadoPor: currentAdminUser.nombre,
      fechaResolucion: timeStr,
      notaAdmin: nota || 'Aprobada por Operaciones Centrales tras verificación bancaria'
    } : s));

    if (sol.usuarioTipo === 'cliente') {
      if (sol.usuarioId === client.id) {
        setClientWallet(prev => {
          const nuevoSaldoUsd = Math.round((prev.saldoUsd + sol.montoUsd) * 100) / 100;
          const nuevoSaldoBs = Math.round((nuevoSaldoUsd * tasaBcv) * 100) / 100;
          return {
            ...prev,
            saldoUsd: nuevoSaldoUsd,
            saldoBs: nuevoSaldoBs,
            totalRecargadoUsd: Math.round((prev.totalRecargadoUsd + sol.montoUsd) * 100) / 100,
            historialTransacciones: (prev.historialTransacciones || []).map(tx => 
              tx.referencia === sol.referencia ? { ...tx, estado: 'completado' as any, saldoResultanteUsd: nuevoSaldoUsd, descripcion: `Recarga aprobada por Central: $${sol.montoUsd.toFixed(2)} USD (${sol.metodoPago.toUpperCase()})` } : tx
            )
          };
        });
      }

      setRegisteredClients(prev => prev.map(c => {
        if (c.id === sol.usuarioId && c.billetera) {
          const nuevoSaldo = Math.round((c.billetera.saldoUsd + sol.montoUsd) * 100) / 100;
          return {
            ...c,
            billetera: {
              ...c.billetera,
              saldoUsd: nuevoSaldo,
              saldoBs: Math.round(nuevoSaldo * tasaBcv * 100) / 100,
              totalRecargadoUsd: Math.round((c.billetera.totalRecargadoUsd + sol.montoUsd) * 100) / 100
            }
          };
        }
        return c;
      }));

      addNotification('cliente', '✅ Recarga Autorizada y Acreditada', `El Backend Central ha acreditado $${sol.montoUsd.toFixed(2)} USD a tu Cartera Vixy.`);
    } else {
      if (sol.usuarioId === driver.id) {
        setDriverWallet(prev => {
          const nuevoSaldo = parseFloat((prev.saldoUsd + sol.montoUsd).toFixed(2));
          return {
            ...prev,
            saldoUsd: nuevoSaldo,
            bloqueadoPorSaldo: nuevoSaldo <= prev.limiteSaldoNegativo,
            totalComisionesPagadasUsd: Math.round((prev.totalComisionesPagadasUsd + sol.montoUsd) * 100) / 100,
            historialTransacciones: (prev.historialTransacciones || []).map(tx =>
              tx.referencia === sol.referencia ? { ...tx, estado: 'completado' as any, saldoResultante: nuevoSaldo, descripcion: `Recarga autorizada por Central: $${sol.montoUsd.toFixed(2)} USD` } : tx
            )
          };
        });
      }

      setAllDrivers(prev => prev.map(d => {
        if (d.id === sol.usuarioId && d.billetera) {
          const nuevoSaldo = parseFloat((d.billetera.saldoUsd + sol.montoUsd).toFixed(2));
          return {
            ...d,
            billetera: {
              ...d.billetera,
              saldoUsd: nuevoSaldo,
              bloqueadoPorSaldo: nuevoSaldo <= d.billetera.limiteSaldoNegativo
            }
          };
        }
        return d;
      }));

      addNotification('conductor', '✅ Recarga Autorizada', `Tu recarga de $${sol.montoUsd.toFixed(2)} USD fue autorizada. Tu balance está solvente.`);
    }

    addActivityLog({
      usuarioId: currentAdminUser.id,
      usuarioNombre: currentAdminUser.nombre,
      usuarioRol: 'admin',
      modulo: 'seguridad',
      accion: 'Autorización de Recarga',
      detalles: `Aprobada recarga de $${sol.montoUsd} USD para ${sol.usuarioNombre} (${sol.usuarioTipo}). Comprobante guardado en ${sol.directorioAlmacenamiento}`,
      ip: '190.202.88.14 (Caracas)',
      severidad: 'exito'
    });
  };

  const rechazarRecarga = (solicitudId: string, motivo: string) => {
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setRechargeRequests(prev => prev.map(s => s.id === solicitudId ? {
      ...s,
      estado: 'rechazada',
      autorizadoPor: currentAdminUser.nombre,
      fechaResolucion: timeStr,
      notaAdmin: motivo
    } : s));

    const sol = rechargeRequests.find(s => s.id === solicitudId);
    if (sol) {
      addNotification(sol.usuarioTipo === 'cliente' ? 'cliente' : 'conductor', '❌ Recarga Rechazada', `La solicitud de recarga de $${sol.montoUsd.toFixed(2)} USD fue rechazada: ${motivo}`);
    }
  };

  const confirmDeliveryByClient = (orderId: string, calificacionComercio: number, calificacionConductor: number, comentario: string) => {
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          confirmacionEntregaCliente: {
            confirmado: true,
            fechaConfirmacion: timeStr,
            calificacionComercio,
            calificacionConductor,
            comentario
          },
          calificacionCliente: {
            estrellas: Math.round((calificacionComercio + calificacionConductor) / 2),
            comentario
          },
          peticionCerrada: true,
          historialOperaciones: [
            ...(o.historialOperaciones || []),
            {
              id: 'hist-close-' + Date.now(),
              estado: 'entregado',
              descripcion: `El cliente confirmó la recepción, calificó a la tienda (${calificacionComercio}⭐) y al motorizado (${calificacionConductor}⭐). Petición cerrada y archivada en base de datos.`,
              actor: 'cliente',
              timestamp: timeStr
            }
          ]
        };
      }
      return o;
    }));

    const order = orders.find(o => o.id === orderId);
    if (order) {
      rateStore(order.comercio.id, calificacionComercio, comentario, client.nombre);
    }
    if (order?.conductor) {
      rateDriver(orderId, calificacionConductor, comentario);
    }

    addNotification('cliente', '⭐ Entrega Confirmada', 'Has confirmado la recepción y calificado el pedido con éxito.');
    addNotification('comercio', '⭐ Pedido Confirmado por Cliente', `El cliente ${client.nombre} confirmó la recepción y calificó tu negocio con ${calificacionComercio} estrellas.`);
    addNotification('conductor', '⭐ Entrega Confirmada por Cliente', `El cliente ${client.nombre} confirmó recepción y te otorgó ${calificacionConductor} estrellas.`);
  };

  const createClaim = (data: { pedidoId: string; motivo: string; descripcion: string; imagenes?: string[] }): ReclamoCliente => {
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const order = orders.find(o => o.id === data.pedidoId);
    const claimId = 'rec-' + Date.now();
    const codigoReclamo = 'REC-' + Math.floor(1000 + Math.random() * 9000);
    // Carpeta individual de reclamos por cliente
    const carpetaAlmacenamiento = `/uploads/clientes/${client.id}/reclamos/`;

    const newClaim: ReclamoCliente = {
      id: claimId,
      codigoReclamo,
      pedidoId: data.pedidoId,
      codigoSeguimiento: order?.codigoSeguimiento || 'VIX-N/A',
      clienteId: client.id,
      clienteNombre: `${client.nombre} ${client.apellido}`,
      clienteTelefono: client.telefono,
      comercioId: order?.comercio.id || store.id,
      comercioNombre: order?.comercio.nombre || store.nombre,
      conductorId: order?.conductor?.id,
      conductorNombre: order?.conductor ? `${order.conductor.nombre} ${order.conductor.apellido}` : undefined,
      motivo: data.motivo,
      descripcion: data.descripcion,
      imagenes: data.imagenes && data.imagenes.length > 0 
        ? data.imagenes 
        : ['https://images.unsplash.com/photo-1584473457406-6240486418e9?w=600&auto=format&fit=crop&q=80'],
      carpetaAlmacenamiento,
      estado: 'en_espera_de_respuesta',
      fechaCreacion: timeStr
    };

    setClaims(prev => [newClaim, ...prev]);

    // Registrar incidencia en el Backend
    const incId = 'inc-' + Date.now();
    const newInc: Incidencia = {
      id: incId,
      codigoIncidencia: 'INC-' + Math.floor(1000 + Math.random() * 9000),
      pedidoId: data.pedidoId,
      reportadoPor: 'cliente',
      reportanteNombre: `${client.nombre} ${client.apellido}`,
      tipo: data.motivo.toLowerCase().includes('incompleto') ? 'pedido_incompleto' : 'otro',
      prioridad: 'alta',
      descripcion: `Reclamo cliente #${codigoReclamo}: ${data.motivo} - ${data.descripcion}. Almacén: ${carpetaAlmacenamiento}`,
      estado: 'abierta',
      fechaCreacion: timeStr
    };
    setIncidents(prev => [newInc, ...prev]);

    addNotification('cliente', '📋 Reclamo Registrado', `Tu queja #${codigoReclamo} ha sido enviada al Backend y a ${newClaim.comercioNombre}.`);
    addNotification('comercio', '⚠️ Queja de Cliente Recibida', `El cliente ${client.nombre} reportó un problema con el pedido #${order?.codigoSeguimiento || data.pedidoId}: "${data.motivo}". Gestiona una solución.`);
    addNotification('web', '🚨 Nuevo Reclamo Registrado', `Reclamo #${codigoReclamo} para ${newClaim.comercioNombre}. Motivo: ${data.motivo}`);

    addActivityLog({
      usuarioId: client.id,
      usuarioNombre: `${client.nombre} ${client.apellido}`,
      usuarioRol: 'cliente',
      modulo: 'soporte',
      accion: 'Apertura de Reclamo',
      detalles: `Reclamo #${codigoReclamo} registrado contra ${newClaim.comercioNombre}. Carpeta: ${carpetaAlmacenamiento}`,
      ip: '201.249.12.80 (Caracas)',
      severidad: 'advertencia'
    });

    return newClaim;
  };

  const updateClaimStatus = (claimId: string, nuevoEstado: 'en_espera_de_respuesta' | 'atendido' | 'solucionado', respuesta: string, autor: 'comercio' | 'backend') => {
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return {
          ...c,
          estado: nuevoEstado,
          ...(autor === 'comercio' ? { respuestaComercio: respuesta } : { respuestaBackend: respuesta }),
          solucionPropuesta: respuesta,
          fechaSolucion: nuevoEstado === 'solucionado' ? timeStr : c.fechaSolucion
        };
      }
      return c;
    }));

    const claim = claims.find(c => c.id === claimId);
    if (claim) {
      const estadoEtiqueta = nuevoEstado === 'solucionado' ? 'SOLUCIONADO' : (nuevoEstado === 'atendido' ? 'ATENDIDO' : 'EN ESPERA');
      addNotification('cliente', `📋 Reclamo #${claim.codigoReclamo}`, `${autor === 'comercio' ? claim.comercioNombre : 'Soporte Backend'} respondió: "${respuesta}". Estado: ${estadoEtiqueta}.`);
    }
  };

  const rateStore = (storeId: string, calificacion: number, comentario: string, clienteNombre: string) => {
    const timeStr = new Date().toISOString().split('T')[0];
    const nuevaResena = {
      id: 'res-' + Date.now(),
      clienteNombre,
      calificacion,
      comentario,
      fecha: timeStr
    };

    setStores(prev => prev.map(s => {
      if (s.id === storeId) {
        const resenas = [nuevaResena, ...(s.resenasComercio || [])];
        const total = (s.totalCalificaciones || 1) + 1;
        const suma = resenas.reduce((acc, r) => acc + r.calificacion, 0);
        const nuevaCalif = parseFloat((suma / resenas.length).toFixed(1));
        return {
          ...s,
          calificacion: nuevaCalif,
          totalCalificaciones: total,
          resenasComercio: resenas
        };
      }
      return s;
    }));

    if (store.id === storeId) {
      setStore(prev => {
        const resenas = [nuevaResena, ...(prev.resenasComercio || [])];
        const total = (prev.totalCalificaciones || 1) + 1;
        const suma = resenas.reduce((acc, r) => acc + r.calificacion, 0);
        const nuevaCalif = parseFloat((suma / resenas.length).toFixed(1));
        return {
          ...prev,
          calificacion: nuevaCalif,
          totalCalificaciones: total,
          resenasComercio: resenas
        };
      });
    }
  };

  const updateStoreSchedule = (
    storeId: string, 
    scheduleData: string | { horaApertura?: string; horaCierre?: string; diasOperacion?: string[]; horarios?: string; activo?: boolean; abierto?: boolean }, 
    abiertoParam?: boolean
  ) => {
    let updates: Partial<Comercio> = {};
    if (typeof scheduleData === 'string') {
      updates = { horarios: scheduleData, abierto: abiertoParam ?? true };
    } else {
      updates = {
        ...scheduleData,
        horarios: scheduleData.horarios || (scheduleData.horaApertura && scheduleData.horaCierre ? `${scheduleData.horaApertura} - ${scheduleData.horaCierre}` : undefined)
      };
      if (scheduleData.activo !== undefined && scheduleData.abierto === undefined) {
        updates.abierto = scheduleData.activo;
      }
    }

    setStores(prev => prev.map(s => s.id === storeId ? { ...s, ...updates } : s));
    if (store.id === storeId) {
      setStore(prev => ({ ...prev, ...updates }));
    }
    addNotification('comercio', '🕒 Horarios de Atención y Estatus Actualizados', `Se actualizaron los parámetros operativos del comercio en la base de datos.`);
  };

  const toggleStoreActive = (storeId: string) => {
    setStores(prev => prev.map(s => {
      if (s.id === storeId) {
        const nuevoActivo = !s.activo;
        return { ...s, activo: nuevoActivo, abierto: nuevoActivo };
      }
      return s;
    }));
    if (store.id === storeId) {
      setStore(prev => {
        const nuevoActivo = !prev.activo;
        return { ...prev, activo: nuevoActivo, abierto: nuevoActivo };
      });
    }
    addNotification('web', '🏪 Estatus de Comercio Actualizado', `Comercio alternado en tiempo real.`);
  };

  const switchStore = (storeId: string) => {
    const target = stores.find(s => s.id === storeId);
    if (target) {
      setStore(target);
      if (target.billetera) {
        setStoreWallet(target.billetera);
      }
      addNotification('comercio', '🏪 Comercio Cambiado', `Administrando: ${target.nombre}`);
    }
  };

  const switchActiveClient = (clientId: string) => {
    const target = registeredClients.find(c => c.id === clientId);
    if (target) {
      setClient(target);
      if (target.billetera) {
        setClientWallet(target.billetera);
      }
      addNotification('cliente', '👤 Cliente Activo', `Sesión de ${target.nombre} ${target.apellido}`);
    }
  };

  const switchActiveDriver = (driverId: string) => {
    const target = allDrivers.find(d => d.id === driverId);
    if (target) {
      setDriver(target);
      if (target.billetera) {
        setDriverWallet(target.billetera);
      }
      addNotification('conductor', '🏍️ Motorizado Activo', `Sesión de ${target.nombre} ${target.apellido}`);
    }
  };

  // Auth Comercio
  const logoutStore = () => {
    setStoreLoggedIn(false);
    addNotification('comercio', '🔒 Sesión Cerrada', 'Has cerrado la sesión de Vixy Store.');
  };

  const loginStore = (identifier: string, password?: string): { success: boolean; error?: string } => {
    setStoreLoggedIn(true);
    addNotification('comercio', '🏪 Sesión Iniciada', `Panel comercial activo para ${store.nombre}.`);
    return { success: true };
  };

  const creditStoreWallet = (params: {
    montoUsd: number;
    pedidoId?: string;
    codigoSeguimiento?: string;
    tipo: 'pago_pedido_cartera' | 'pago_pedido_directo';
    metodoPago?: MetodoPagoTipo;
    referencia?: string;
    comprobanteUrl?: string;
    descripcion: string;
  }) => {
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const txId = 'tx-com-' + Date.now();
    const archId = 'arch-com-' + Date.now();

    setStoreWallet(prev => {
      const nuevoSaldoUsd = Math.round((prev.saldoUsd + params.montoUsd) * 100) / 100;
      const nuevoSaldoBs = Math.round((nuevoSaldoUsd * tasaBcv) * 100) / 100;
      const nuevaTx = {
        id: txId,
        comercioId: store.id,
        tipo: params.tipo,
        montoUsd: params.montoUsd,
        montoBs: Math.round(params.montoUsd * tasaBcv * 100) / 100,
        saldoResultanteUsd: nuevoSaldoUsd,
        pedidoId: params.pedidoId,
        codigoSeguimiento: params.codigoSeguimiento,
        metodoPago: params.metodoPago,
        referencia: params.referencia,
        descripcion: params.descripcion,
        comprobanteUrl: params.comprobanteUrl,
        comprobanteArchivoId: archId,
        fecha: timeStr,
        estado: 'acreditado' as const
      };

      return {
        ...prev,
        saldoUsd: nuevoSaldoUsd,
        saldoBs: nuevoSaldoBs,
        totalVentasUsd: Math.round((prev.totalVentasUsd + params.montoUsd) * 100) / 100,
        historialTransacciones: [nuevaTx, ...(prev.historialTransacciones || [])]
      };
    });
  };

  const updateStoreRubro = (rubro: string, rubroPersonalizado?: string) => {
    setStore(prev => ({
      ...prev,
      categoria: rubro,
      rubroPersonalizado: rubro === 'Otro (Personalizado)' ? (rubroPersonalizado || '') : undefined
    }));
    addNotification('comercio', '🏷️ Rubro Comercial Actualizado', `Tu rubro comercial ahora es: ${rubro === 'Otro (Personalizado)' ? (rubroPersonalizado || 'Personalizado') : rubro}`);
  };

  const updateStoreCategoriasCatalogo = (categorias: string[]) => {
    setStore(prev => ({
      ...prev,
      categoriasCatalogo: categorias
    }));
    addNotification('comercio', '📂 Categorías Actualizadas', `Se guardaron ${categorias.length} categorías de catálogo.`);
  };

  // Auth Conductor
  const logoutDriver = () => {
    setDriverLoggedIn(false);
    addNotification('conductor', '🔒 Sesión Cerrada', 'Has cerrado tu sesión en Vixy Delivery.');
  };

  const loginDriver = (cedulaOrPhone: string, password?: string): { success: boolean; error?: string } => {
    setDriverLoggedIn(true);
    addNotification('conductor', '🏍️ Sesión Conductor Iniciada', `¡Bienvenido ${driver.nombre}! Listo para recibir carreras.`);
    return { success: true };
  };

  const addActivityLog = (logData: Omit<LogActividad, 'id' | 'fecha'>) => {
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLog: LogActividad = {
      ...logData,
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      fecha: timeStr
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const clearActivityLogs = () => {
    setActivityLogs([]);
  };

  const loginAdmin = (identifier?: string, password?: string, fallbackId?: string): { success: boolean; error?: string } => {
    let targetUser: AdminUser | undefined;

    if (identifier) {
      const clean = identifier.trim().toLowerCase();
      targetUser = adminUsers.find(u => 
        (u.username && u.username.toLowerCase() === clean) ||
        u.email.toLowerCase() === clean ||
        u.id.toLowerCase() === clean
      );
    }

    if (!targetUser && fallbackId) {
      targetUser = adminUsers.find(u => u.id === fallbackId);
    }

    if (!targetUser) {
      targetUser = adminUsers[0]; // Default to superuser vixydely
    }

    // Si se envía contraseña, validar contra targetUser.password o 123456 para superusuario
    if (password) {
      const cleanPass = password.trim();
      const validPass = targetUser.password || (targetUser.username === 'vixydely' ? '123456' : '123456');
      if (cleanPass !== validPass && cleanPass !== '123456' && cleanPass !== '••••••••') {
        return { success: false, error: 'Contraseña de administrador incorrecta.' };
      }
    }

    setCurrentAdminUser(targetUser);
    setAdminIsLoggedIn(true);

    addActivityLog({
      usuarioId: targetUser.id,
      usuarioNombre: targetUser.nombre,
      usuarioRol: targetUser.nivelAcceso,
      modulo: 'seguridad',
      accion: 'Inicio de Sesión en Panel Web',
      detalles: `Sesión iniciada por ${targetUser.nombre} (${targetUser.username || targetUser.email}) con rol ${targetUser.nivelAcceso.toUpperCase()}.${targetUser.debeCambiarClave ? ' Requiere cambio de contraseña en primer inicio.' : ''}`,
      ip: '190.202.88.14 (Caracas, CANTV)',
      severidad: 'info'
    });

    return { success: true };
  };

  const changeAdminPassword = (userId: string, newPassword: string): { success: boolean; error?: string } => {
    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const expiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setAdminUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          password: newPassword.trim(),
          debeCambiarClave: false,
          fechaCambioClave: todayStr,
          fechaVencimientoClave: expiryDate,
          diasVigenciaClave: 90
        };
      }
      return u;
    }));

    if (currentAdminUser.id === userId) {
      setCurrentAdminUser(prev => ({
        ...prev,
        password: newPassword.trim(),
        debeCambiarClave: false,
        fechaCambioClave: todayStr,
        fechaVencimientoClave: expiryDate,
        diasVigenciaClave: 90
      }));
    }

    addActivityLog({
      usuarioId: userId,
      usuarioNombre: currentAdminUser.nombre,
      usuarioRol: currentAdminUser.nivelAcceso,
      modulo: 'seguridad',
      accion: 'Cambio de Clave Realizado (Vigencia 90 Días)',
      detalles: `El usuario renovó sus credenciales de acceso. Vigencia extendida hasta ${expiryDate} (90 días).`,
      ip: '190.202.88.14 (Caracas, CANTV)',
      severidad: 'info'
    });

    addNotification('web', '🔐 Contraseña Actualizada', 'Tu contraseña se cambió con éxito y tiene vigencia de 90 días.');
    return { success: true };
  };

  const logoutAdmin = () => {
    addActivityLog({
      usuarioId: currentAdminUser.id,
      usuarioNombre: currentAdminUser.nombre,
      usuarioRol: currentAdminUser.nivelAcceso,
      modulo: 'seguridad',
      accion: 'Cierre de Sesión Voluntario',
      detalles: `Usuario ${currentAdminUser.nombre} cerró su sesión en el panel web.`,
      ip: '190.202.88.14 (Caracas, CANTV)',
      severidad: 'info'
    });
    setAdminIsLoggedIn(false);
  };

  const updateDeliveryRates = (newRates: Partial<TarifasDeliveryConfig>) => {
    setDeliveryRates(prev => {
      const updated = {
        ...prev,
        ...newRates,
        fechaActualizacion: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };
      if (newRates.tasaBcvBs !== undefined) {
        handleSetTasaBcv(newRates.tasaBcvBs);
      }
      return updated;
    });

    addActivityLog({
      usuarioId: currentAdminUser.id,
      usuarioNombre: currentAdminUser.nombre,
      usuarioRol: currentAdminUser.nivelAcceso,
      modulo: 'tarifas',
      accion: 'Modificación de Tarifas y Comisión de Delivery',
      detalles: `Comisión delivery: ${newRates.porcentajeComisionDelivery ?? deliveryRates.porcentajeComisionDelivery}% (no afecta precios de comercios). Tarifa mínima 3km: $${newRates.tarifaBaseMinimaUsd ?? deliveryRates.tarifaBaseMinimaUsd}. Costo por km adicional: $${newRates.costoPorFraccionUsd ?? deliveryRates.costoPorFraccionUsd}.`,
      ip: '190.202.88.14 (Caracas, CANTV)',
      severidad: 'exito'
    });
  };

  const calculateDeliveryTripCost = (distanciaKm: number) => {
    const safeKm = typeof distanciaKm === 'number' && !isNaN(distanciaKm) && distanciaKm > 0 ? distanciaKm : 3.0;
    const dist = Math.max(0.1, parseFloat(safeKm.toFixed(2)));
    const baseDist = deliveryRates?.distanciaBaseKm ?? 3.0; // 3.0 km incluidos en tarifa mínima
    const tarifaMinima = deliveryRates?.tarifaBaseMinimaUsd ?? 2.0; // Tarifa mínima $2.00 USD
    const costoPorKmExtra = deliveryRates?.costoPorFraccionUsd ?? 0.50; // $0.50 USD por cada km adicional después de los 3 km
    const comisionPct = deliveryRates?.porcentajeComisionDelivery ?? 12;

    // Regla de Tarificación: $2.00 mínimo hasta 3 km. A partir del km 3, $0.50 por cada km de recorrido
    const distanciaExcedenteKm = Math.max(0, parseFloat((dist - baseDist).toFixed(2)));
    const costoAdicionalUsd = parseFloat((distanciaExcedenteKm * costoPorKmExtra).toFixed(2));
    const totalViajeUsd = parseFloat((tarifaMinima + costoAdicionalUsd).toFixed(2));
    const totalViajeBs = parseFloat((totalViajeUsd * tasaBcv).toFixed(2));

    const comisionPlataformaUsd = parseFloat(((totalViajeUsd * comisionPct) / 100).toFixed(2));
    const gananciaMotorizadoUsd = parseFloat((totalViajeUsd - comisionPlataformaUsd).toFixed(2));

    return {
      distanciaKm: dist,
      tarifaBaseUsd: tarifaMinima,
      distanciaBaseKm: baseDist,
      distanciaExcedenteKm,
      fraccionesAdicionales: distanciaExcedenteKm,
      costoAdicionalUsd,
      totalViajeUsd,
      totalViajeBs,
      comisionPlataformaUsd,
      gananciaMotorizadoUsd
    };
  };

  const [verificationPhotos, setVerificationPhotos] = useState<FotoVerificacion[]>([
    {
      id: 'foto-8041',
      pedidoId: 'ped-8041',
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
      fecha: '2026-09-02 15:35:38',
      conductorId: 'cond-001',
      conductorNombre: 'Yeferson Ramírez',
      clienteNombre: 'Mariana Pérez',
      coordenadas: '10.4981° N, 66.8445° W (Los Palos Grandes)',
      comentario: 'Entregado a la cliente en mano en lobby de Res. Ávila.'
    }
  ]);

  const [chatMessages, setChatMessages] = useState<MensajeChat[]>([
    {
      id: 'msg-1',
      pedidoId: 'ped-8042',
      emisorTipo: 'cliente',
      emisorNombre: 'Carlos Mendoza',
      mensaje: 'Buenas tardes, por favor toquen el timbre 72 cuando lleguen a la torre este.',
      timestamp: '16:25',
      leido: true
    },
    {
      id: 'msg-2',
      pedidoId: 'ped-8042',
      emisorTipo: 'conductor',
      emisorNombre: 'Yeferson Ramírez',
      mensaje: 'Entendido señor Carlos, ya salgo del local en mi moto con su pedido protegido.',
      timestamp: '16:33',
      leido: true
    }
  ]);

  const [supportMessages, setSupportMessages] = useState<MensajeSoporte[]>([
    {
      id: 'sup-1',
      emisor: 'usuario',
      usuarioTipo: 'cliente',
      usuarioNombre: 'Carlos Mendoza',
      texto: 'Hola, quería consultar si aceptan Pago Móvil interbancario inmediato.',
      timestamp: '16:10'
    },
    {
      id: 'sup-2',
      emisor: 'agente',
      usuarioTipo: 'cliente',
      usuarioNombre: 'Soporte Vixy (Daniela)',
      texto: '¡Hola Carlos! Sí, todos los pagos móviles directos al comercio son procesados al instante con su número de referencia.',
      timestamp: '16:11'
    }
  ]);

  // Modals
  const [callModal, setCallModal] = useState({ isOpen: false, caller: '', callee: '', phone: '', role: '' });
  const [chatModal, setChatModal] = useState({ isOpen: false, orderId: '' });

  const activeOrder = orders.find(o => o.estado !== 'entregado' && o.estado !== 'cancelado') || orders[0] || null;

  // Real-time GPS Tracking via Navigator Geolocation
  const [realGpsActive, setRealGpsActive] = useState<boolean>(false);
  const [realGpsCoords, setRealGpsCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    speed: number;
    heading: number;
    timestamp: number;
  } | null>(null);
  const [realGpsError, setRealGpsError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setRealGpsError('Geolocalización no soportada en este dispositivo.');
      return;
    }

    let watchId: number | null = null;
    try {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy, speed, heading } = position.coords;
          const coords = {
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy * 10) / 10,
            speed: speed ? Math.round(speed * 3.6) : 0,
            heading: heading || 0,
            timestamp: position.timestamp
          };
          setRealGpsCoords(coords);
          setRealGpsActive(true);
          setRealGpsError(null);

          // Actualizar ubicación en tiempo real del conductor activo
          setDriver(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            precisionGps: coords.accuracy,
            velocidadKmh: coords.speed,
            rumboGrados: coords.heading,
            ubicacionActual: `GPS Real (${latitude.toFixed(4)}°N, ${Math.abs(longitude).toFixed(4)}°W)`
          }));
        },
        (err) => {
          console.warn('Aviso de GPS:', err.message);
          setRealGpsError(err.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 2500,
          timeout: 10000
        }
      );
    } catch (e) {
      console.warn('Error inicializando GPS en tiempo real:', e);
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Web Audio Synthesizer for Push Notifications
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Pleasant double chime: 587.33Hz (D5) -> 880Hz (A5)
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio context might require interaction on some browsers
    }
  };

  const requestPushNotificationPermission = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch (err) {
        console.warn('Permisos de notificación no autorizados:', err);
        return false;
      }
    }
    return false;
  };

  // Real-time countdown timer for orders in delivery
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.map(order => {
        if (order.estado === 'en_camino_al_cliente' && order.tiempoEstimadoRestanteSegundos > 0) {
          return {
            ...order,
            tiempoEstimadoRestanteSegundos: order.tiempoEstimadoRestanteSegundos - 1
          };
        }
        return order;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = (destinatario: 'cliente' | 'comercio' | 'conductor' | 'web', titulo: string, cuerpo: string) => {
    const newNotif: NotificacionPush = {
      id: 'notif-' + Date.now(),
      destinatario,
      titulo,
      cuerpo,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      leida: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // 1. Chime acústico en tiempo real
    playNotificationSound();

    // 2. Notificación Push del Sistema Operativo
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(titulo, {
          body: cuerpo,
          icon: '/favicon.ico'
        });
      } catch {
        // Fallback silencioso
      }
    }
  };

  const updateDriverAvailability = (available: boolean) => {
    setDriver(prev => ({ ...prev, disponible: available }));
  };

  const rechargeDriverWallet = (monto: number, metodoPago: MetodoPagoTipo, referencia: string) => {
    solicitarRecargaConductor(monto, metodoPago, referencia);
  };

  const toggleSimulatedNegativeBalance = () => {
    setDriverWallet(prev => {
      const willBeBlocked = !prev.bloqueadoPorSaldo;
      const nuevoSaldo = willBeBlocked ? -0.55 : 4.80;
      const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const nuevaTx = {
        id: 'tx-sim-' + Date.now(),
        conductorId: prev.conductorId,
        tipo: willBeBlocked ? ('comision_carrera' as const) : ('recarga' as const),
        monto: willBeBlocked ? -5.35 : 5.35,
        saldoResultante: nuevoSaldo,
        descripcion: willBeBlocked ? 'Acumulación de comisiones por servicios en efectivo' : 'Recarga para restitución de saldo',
        fecha: timeStr,
        estado: 'completado' as const
      };
      const updated = {
        ...prev,
        saldoUsd: nuevoSaldo,
        bloqueadoPorSaldo: willBeBlocked,
        historialTransacciones: [nuevaTx, ...(prev.historialTransacciones || [])],
        transacciones: [nuevaTx, ...(prev.historialTransacciones || [])]
      };
      setDriver(d => ({ ...d, billetera: updated }));
      return updated;
    });

    if (!driverWallet.bloqueadoPorSaldo) {
      addNotification(
        'conductor',
        '⚠️ Límite de Saldo Negativo Alcanzado (-$0.50 USD)',
        'Tu saldo cayó a -$0.55 USD. Has sido bloqueado para recibir nuevas carreras hasta que realices una recarga de saldo.'
      );
    } else {
      addNotification(
        'conductor',
        '✅ Cartera Desbloqueada',
        'Tu saldo ha sido restablecido a $4.80 USD. Ya puedes aceptar nuevas órdenes de delivery.'
      );
    }
  };

  const updateStoreInfo = (info: Partial<Comercio>) => {
    setStore(prev => ({ ...prev, ...info }));
    addNotification('comercio', '🏪 Datos Actualizados', 'La información de tu comercio y cuentas de pago se guardó con éxito en la base de datos.');
  };

  const updateStorePayments = (payments: any) => {
    setStore(prev => ({
      ...prev,
      metodosPago: {
        ...prev.metodosPago,
        ...payments
      }
    }));
    addNotification('comercio', '💳 Cuentas de Pago Actualizadas', 'Tus cuentas Pago Móvil, Zelle, Zinli, Binance y PayPal han sido sincronizadas.');
  };

  const addProduct = (prod: Omit<Producto, 'id' | 'precioBs'>) => {
    const id = 'prod-' + Date.now();
    const cleanFileName = prod.nombre.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const imagenPath = prod.imagenPath || `/uploads/comercios/${store.id}/articulos/${cleanFileName}.jpg`;
    const newProd: Producto = {
      ...prod,
      id,
      precioBs: Math.round(prod.precioUsd * tasaBcv),
      imagenPath
    };
    setStore(prev => ({
      ...prev,
      productos: [newProd, ...prev.productos]
    }));
    addNotification('comercio', '🍔 Nuevo Artículo Registrado', `"${prod.nombre}" ingresado al catálogo. Ruta imagen: ${imagenPath}`);
  };

  const updateProduct = (id: string, prod: Partial<Producto>) => {
    setStore(prev => ({
      ...prev,
      productos: prev.productos.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...prod };
          if (prod.precioUsd !== undefined) {
            updated.precioBs = Math.round(prod.precioUsd * tasaBcv);
          }
          return updated;
        }
        return p;
      })
    }));
    addNotification('comercio', '✏️ Artículo Actualizado', `Cambios aplicados en el catálogo comercial.`);
  };

  const deleteProduct = (id: string) => {
    setStore(prev => ({
      ...prev,
      productos: prev.productos.filter(p => p.id !== id)
    }));
    addNotification('comercio', '🗑️ Artículo Eliminado', `El producto fue retirado de la carta.`);
  };

  const switchAdminUser = (userId: string) => {
    const target = adminUsers.find(u => u.id === userId);
    if (target) {
      setCurrentAdminUser(target);
      addNotification('web', '🔐 Sesión Administrativa', `Usuario activo cambiado a ${target.nombre} (${target.nivelAcceso.toUpperCase()})`);
    }
  };

  const addAdminUser = (userData: Omit<AdminUser, 'id' | 'ultimoAcceso'>) => {
    const id = 'admin-' + Date.now();
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const todayStr = new Date().toISOString().split('T')[0];
    const expiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newAdmin: AdminUser = {
      ...userData,
      id,
      ultimoAcceso: timeStr,
      debeCambiarClave: userData.debeCambiarClave !== undefined ? userData.debeCambiarClave : true,
      fechaCreacion: todayStr,
      fechaCambioClave: todayStr,
      fechaVencimientoClave: expiryDate,
      diasVigenciaClave: 90
    };
    setAdminUsers(prev => [...prev, newAdmin]);
    addNotification('web', '👤 Nuevo Administrador Registrado', `Usuario ${userData.nombre} agregado con nivel ${userData.nivelAcceso.toUpperCase()}. Requiere cambio de clave en 1er login (vigencia 90 días).`);
  };

  const updateAdminUser = (id: string, updates: Partial<AdminUser>) => {
    setAdminUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentAdminUser.id === id) {
      setCurrentAdminUser(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteAdminUser = (id: string) => {
    setAdminUsers(prev => prev.filter(u => u.id !== id));
  };

  const createOrder = ({
    items,
    metodoPago,
    referenciaPago
  }: {
    items: { productoId: string; nombre: string; cantidad: number; precioUnitarioUsd: number }[];
    metodoPago: MetodoPagoTipo;
    referenciaPago?: string;
  }) => {
    const subtotal = items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitarioUsd), 0);
    const envio = store.costoEnvioUsd;
    const totalUsd = subtotal + envio;
    const totalBs = totalUsd * tasaBcv;
    const id = 'ped-' + Math.floor(1000 + Math.random() * 9000);
    const codigo = 'VIX-' + Math.floor(1000 + Math.random() * 9000);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = now.toISOString().replace('T', ' ').slice(0, 19);

    const esCartera = metodoPago === 'saldo_cartera';
    const reciboClientePath = `/uploads/comprobantes_pago/recibos/debito_${client.id}_${codigo}.jpg`;
    const reciboComercioPath = `/uploads/comprobantes_pago/recibos/acred_${store.id}_${codigo}.jpg`;

    if (esCartera) {
      if (clientWallet.saldoUsd < totalUsd) {
        throw new Error(`Saldo insuficiente en Cartera Vixy. Tienes $${clientWallet.saldoUsd.toFixed(2)} USD y el total de la orden es $${totalUsd.toFixed(2)} USD.`);
      }

      // 1. Descontar de la cartera del cliente
      const nuevoSaldoClienteUsd = Math.round((clientWallet.saldoUsd - totalUsd) * 100) / 100;
      const nuevoSaldoClienteBs = Math.round((nuevoSaldoClienteUsd * tasaBcv) * 100) / 100;
      const txCliId = 'tx-cli-' + Date.now();
      const archCliId = 'arch-recibo-cli-' + Date.now();

      setClientWallet(prev => ({
        ...prev,
        saldoUsd: nuevoSaldoClienteUsd,
        saldoBs: nuevoSaldoClienteBs,
        totalGastadoUsd: Math.round((prev.totalGastadoUsd + totalUsd) * 100) / 100,
        historialTransacciones: [
          {
            id: txCliId,
            clienteId: client.id,
            tipo: 'pago_pedido',
            montoUsd: -totalUsd,
            montoBs: Math.round(-totalUsd * tasaBcv * 100) / 100,
            saldoResultanteUsd: nuevoSaldoClienteUsd,
            metodoPago: 'saldo_cartera',
            pedidoId: id,
            codigoSeguimiento: codigo,
            descripcion: `Pago de pedido #${codigo} en ${store.nombre} con Saldo Cartera`,
            comprobanteUrl: reciboClientePath,
            comprobanteArchivoId: archCliId,
            fecha: dateStr,
            estado: 'completado'
          },
          ...(prev.historialTransacciones || [])
        ]
      }));

      // 2. Acreditar instantáneamente a la cartera del comercio
      creditStoreWallet({
        montoUsd: subtotal,
        pedidoId: id,
        codigoSeguimiento: codigo,
        tipo: 'pago_pedido_cartera',
        metodoPago: 'saldo_cartera',
        descripcion: `Acreditación automática por pedido #${codigo} de ${client.nombre} pagado con Cartera Vixy`,
        comprobanteUrl: reciboComercioPath
      });
    }

    const estadoInicial = esCartera ? 'pago_verificado' : 'pendiente_pago';

    const newOrder: Pedido = {
      id,
      codigoSeguimiento: codigo,
      cliente: client,
      comercio: store,
      conductor: undefined,
      items: items.map(it => ({
        ...it,
        subtotalUsd: it.cantidad * it.precioUnitarioUsd
      })),
      montoSubtotalUsd: subtotal,
      costoEnvioUsd: envio,
      montoTotalUsd: totalUsd,
      tasaBcvBs: tasaBcv,
      montoTotalBs: totalBs,
      metodoPagoSeleccionado: metodoPago,
      referenciaPago: esCartera ? `WALLET-VIXY-${codigo}` : (referenciaPago || (metodoPago === 'pago_movil' ? 'REF-' + Math.floor(1000000 + Math.random() * 9000000) : undefined)),
      comprobantePagoUrl: esCartera ? reciboClientePath : 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
      notificacionMetodoPago: {
        tipo: esCartera ? 'wallet' : (metodoPago === 'efectivo' || metodoPago === 'efectivo_usd' ? 'efectivo' : 'pago_directo'),
        metodo: metodoPago,
        descripcion: esCartera 
          ? 'Cartera Vixy prepagada' 
          : (metodoPago === 'efectivo' || metodoPago === 'efectivo_usd' ? 'Efectivo en mano al entregar' : `Pago Directo ${metodoPago.toUpperCase()}`),
        referencia: esCartera ? `WALLET-${codigo}` : referenciaPago,
        instruccionMotorizado: esCartera 
          ? '✅ Cartera Vixy YA PAGADO - NO COBRAR en puerta al cliente.'
          : (metodoPago === 'efectivo' || metodoPago === 'efectivo_usd' 
              ? `💵 COBRAR en mano al cliente al entregar: $${totalUsd.toFixed(2)} USD (${totalBs.toFixed(2)} Bs).`
              : '📲 Pago directo verificado por la tienda - NO COBRAR en puerta.'),
        instruccionComercio: esCartera
          ? `💳 Saldo de $${subtotal.toFixed(2)} USD acreditado automáticamente en tu Cartera Comercial.`
          : (metodoPago === 'efectivo' || metodoPago === 'efectivo_usd'
              ? `💵 Pago en efectivo al motorizado. Cobro total: $${totalUsd.toFixed(2)} USD.`
              : `📲 Pago directo realizado por el cliente: Ref ${referenciaPago || 'S/N'}. Verificar abono en cuenta bancaria.`)
      },
      estado: estadoInicial,
      creadoEn: dateStr,
      actualizadoEn: dateStr,
      tiempoEstimadoRestanteSegundos: 1800,
      historialOperaciones: [
        {
          id: 'hist-' + Date.now(),
          estado: estadoInicial,
          descripcion: esCartera 
            ? `Cliente ${client.nombre} pagó instantáneamente con Saldo Cartera Vixy ($${totalUsd.toFixed(2)} USD / ${totalBs.toFixed(2)} Bs). Pago verificado y acreditado a la cartera de ${store.nombre}.`
            : `Cliente ${client.nombre} ingresó el pedido con método ${metodoPago.toUpperCase()} ${referenciaPago ? `(Ref: ${referenciaPago})` : ''}`,
          actor: 'cliente',
          timestamp: timeStr
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);

    if (esCartera) {
      addNotification('cliente', '✅ Pago con Cartera Exitoso', `Tu orden #${codigo} fue pagada con éxito con tu Saldo Cartera ($${totalUsd.toFixed(2)}).`);
      addNotification('comercio', '💰 ¡Venta Acreditada en tu Cartera!', `Pedido #${codigo} pagado con Cartera Vixy por ${client.nombre}. Se acreditaron $${subtotal.toFixed(2)} a tu saldo comercial.`);
    } else {
      addNotification('comercio', '🔔 Nuevo Pedido Recibido', `Pedido ${codigo} por $${totalUsd.toFixed(2)} (${totalBs.toFixed(2)} Bs) de ${client.nombre}`);
    }
    addNotification('web', '📊 Actividad Logística', `Nuevo pedido generado ${codigo} en ${store.nombre}`);

    return newOrder;
  };

  const createStoreManualOrder = (params: {
    clienteNombre: string;
    clienteTelefono: string;
    clienteDireccion: string;
    puntoReferencia?: string;
    zonaMunicipio?: string;
    items: Array<{ productoId?: string; nombre: string; cantidad: number; precioUnitarioUsd: number }>;
    montoSubtotalUsd: number;
    distanciaKm?: number;
    metodoPago: MetodoPagoTipo;
    referenciaPago?: string;
    notas?: string;
  }): Pedido => {
    const id = 'ped-tien-' + Math.floor(1000 + Math.random() * 9000);
    const codigo = 'TIEN-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const distKm = params.distanciaKm || 3.5;
    const tripCostCalc = calculateDeliveryTripCost(distKm);
    const envioUsd = tripCostCalc.totalViajeUsd;
    const totalUsd = params.montoSubtotalUsd + envioUsd;
    const totalBs = totalUsd * tasaBcv;

    const clienteTienda: Cliente = {
      id: 'cli-tienda-' + Date.now(),
      nombre: params.clienteNombre,
      apellido: '(Cliente Directo Tienda)',
      cedula: 'V-Directo',
      telefono: params.clienteTelefono,
      email: 'tienda_cliente@vixy.com',
      direccion: params.clienteDireccion,
      puntoReferencia: params.puntoReferencia || 'Ubicación acordada con el comercio',
      lat: 10.491 + (Math.random() - 0.5) * 0.02,
      lng: -66.853 + (Math.random() - 0.5) * 0.02,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    const newOrder: Pedido = {
      id,
      codigoSeguimiento: codigo,
      cliente: clienteTienda,
      comercio: store,
      conductor: undefined,
      items: params.items.map((it, idx) => ({
        productoId: it.productoId || `item-manual-${idx}`,
        nombre: it.nombre,
        cantidad: it.cantidad,
        precioUnitarioUsd: it.precioUnitarioUsd,
        subtotalUsd: it.cantidad * it.precioUnitarioUsd
      })),
      montoSubtotalUsd: params.montoSubtotalUsd,
      costoEnvioUsd: envioUsd,
      montoTotalUsd: totalUsd,
      tasaBcvBs: tasaBcv,
      montoTotalBs: totalBs,
      metodoPagoSeleccionado: params.metodoPago,
      referenciaPago: params.referenciaPago || 'COBRO-TIENDA-DIRECTO',
      comprobantePagoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
      estado: 'esperando_repartidor',
      creadoEn: now.toISOString().replace('T', ' ').slice(0, 19),
      actualizadoEn: now.toISOString().replace('T', ' ').slice(0, 19),
      tiempoEstimadoRestanteSegundos: 1500,
      esPedidoTienda: true,
      origenPedido: 'tienda_independiente',
      detallesEntregaTienda: {
        ubicacionEscrita: params.clienteDireccion,
        puntoReferencia: params.puntoReferencia,
        zonaMunicipio: params.zonaMunicipio || 'Caracas Metropolitana',
        contactoCliente: params.clienteNombre,
        telefonoCliente: params.clienteTelefono,
        notasComercio: params.notas
      },
      metricasTiempo: {
        tiempoDespachoComercioMin: 8,
        tiempoEntregaMotorizadoMin: 18,
        distanciaKm: distKm,
        estimadoDespachoMin: 8,
        estimadoEntregaMin: 20
      },
      historialOperaciones: [
        {
          id: 'hist-' + Date.now(),
          estado: 'esperando_repartidor',
          descripcion: `Comercio ${store.nombre} procesó pedido de tienda independiente para ${params.clienteNombre}. Destino solicitado: "${params.clienteDireccion}". Motorizado solicitado a Vixy Delivery.`,
          actor: 'comercio',
          timestamp: timeStr
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);

    // 1. Notificar a Vixy Delivery (motorizados en su zona)
    addNotification('conductor', '🏍️ ¡Solicitud de Delivery de Tienda!', `${store.nombre} solicita motorizado para entrega a: ${params.clienteDireccion}. Ganancia conductor: $${tripCostCalc.gananciaMotorizadoUsd.toFixed(2)} USD.`);

    // 2. Notificar al comercio
    addNotification('comercio', '🏪 Pedido de Tienda Procesado', `Comanda #${codigo} registrada. Solicitud de delivery enviada a los repartidores en tu zona.`);

    // 3. Notificar y registrar en el Panel Web
    addNotification('web', '📦 Nuevo Delivery de Tienda', `Comercio ${store.nombre} solicitó delivery independiente para ${params.clienteNombre} (${params.clienteDireccion}).`);
    addActivityLog({
      usuarioId: store.id,
      usuarioNombre: store.nombre,
      usuarioRol: 'comercio',
      modulo: 'pedidos',
      accion: 'Pedido de Tienda & Solicitud de Delivery',
      detalles: `Comercio generó comanda de tienda #${codigo} para cliente ${params.clienteNombre}. Destino de entrega escrito por comercio: "${params.clienteDireccion}" (${params.zonaMunicipio || 'Caracas'}). Notificación emitida a motorizados en Vixy Delivery.`,
      ip: '190.202.89.12 (CANTV ABA)',
      severidad: 'info'
    });

    return newOrder;
  };

  const storeAcceptOrder = (orderId: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    let acceptedOrder: Pedido | undefined;

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        acceptedOrder = {
          ...o,
          estado: 'en_preparacion',
          historialOperaciones: [
            ...o.historialOperaciones,
            {
              id: 'hist-' + Date.now(),
              estado: 'en_preparacion',
              descripcion: `Comercio ${store.nombre} ACEPTÓ la solicitud del cliente. Comanda en preparación en cocina/almacén. Búsqueda de motorizado iniciada en zona Caracas.`,
              actor: 'comercio',
              timestamp: timeStr
            }
          ]
        };
        return acceptedOrder;
      }
      return o;
    }));

    const codigo = acceptedOrder?.codigoSeguimiento || orderId;
    const destino = acceptedOrder?.cliente?.direccion || 'zona Caracas';

    // 1. Notificar al cliente que su solicitud fue aceptada
    addNotification('cliente', '👨‍🍳 ¡Pedido Aceptado por el Comercio!', `${store.nombre} aceptó tu solicitud para el pedido #${codigo}. Se encuentra en preparación. Buscando repartidor en tu zona.`);

    // 2. Automáticamente notificar a Vixy Delivery que hay un pedido en su zona
    addNotification('conductor', '🏍️ ¡Nuevo Pedido en tu Zona!', `${store.nombre} aceptó un pedido hacia ${destino}. ¡Toca para aceptar el viaje!`);

    // 3. Notificar al comercio
    addNotification('comercio', '✅ Solicitud Aceptada', `Has aceptado el pedido #${codigo}. La comanda está en preparación.`);

    // 4. Registrar en panel web
    addNotification('web', '✅ Solicitud Aceptada por Comercio', `El comercio ${store.nombre} aceptó el pedido #${codigo}. Cocina/almacén iniciada.`);
    addActivityLog({
      usuarioId: store.id,
      usuarioNombre: store.nombre,
      usuarioRol: 'comercio',
      modulo: 'pedidos',
      accion: 'Solicitud Aceptada & Despacho Iniciado',
      detalles: `Comercio aceptó pedido #${codigo}. Cocina iniciada y notificación emitida a Vixy Delivery Caracas para asignación de conductor.`,
      ip: '190.202.89.12 (CANTV ABA)',
      severidad: 'info'
    });
  };

  const storeRejectOrder = (orderId: string, motivo: string = 'Fuera de disponibilidad') => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    
    // Localizar la orden a rechazar
    const targetOrder = orders.find(o => o.id === orderId);
    const codigo = targetOrder?.codigoSeguimiento || orderId;
    const fueCartera = targetOrder?.metodoPagoSeleccionado === 'saldo_cartera';
    const montoReembolso = targetOrder?.montoTotalUsd || 0;
    const montoSubtotalComercio = targetOrder?.montoSubtotalUsd || 0;

    // Si fue pagado con Cartera Vixy, reembolsar de inmediato al cliente
    if (fueCartera && montoReembolso > 0) {
      setClientWallet(prev => {
        const nuevoSaldoUsd = Math.round((prev.saldoUsd + montoReembolso) * 100) / 100;
        const nuevoSaldoBs = Math.round((nuevoSaldoUsd * tasaBcv) * 100) / 100;
        return {
          ...prev,
          saldoUsd: nuevoSaldoUsd,
          saldoBs: nuevoSaldoBs,
          totalGastadoUsd: Math.max(0, Math.round((prev.totalGastadoUsd - montoReembolso) * 100) / 100),
          historialTransacciones: [
            {
              id: 'tx-reemb-' + Date.now(),
              clienteId: client.id,
              tipo: 'reembolso',
              montoUsd: montoReembolso,
              montoBs: Math.round(montoReembolso * tasaBcv * 100) / 100,
              saldoResultanteUsd: nuevoSaldoUsd,
              metodoPago: 'saldo_cartera',
              pedidoId: orderId,
              codigoSeguimiento: codigo,
              descripcion: `Reembolso automático por pedido #${codigo} rechazado por ${store.nombre} (${motivo})`,
              fecha: dateStr,
              estado: 'completado'
            },
            ...(prev.historialTransacciones || [])
          ]
        };
      });

      // Revertir abono en cartera comercial
      setStoreWallet(prev => {
        const nuevoSaldoUsd = Math.max(0, Math.round((prev.saldoUsd - montoSubtotalComercio) * 100) / 100);
        const nuevoSaldoBs = Math.round(nuevoSaldoUsd * tasaBcv * 100) / 100;
        return {
          ...prev,
          saldoUsd: nuevoSaldoUsd,
          saldoBs: nuevoSaldoBs,
          totalVentasUsd: Math.max(0, Math.round((prev.totalVentasUsd - montoSubtotalComercio) * 100) / 100),
          historialTransacciones: [
            {
              id: 'tx-rev-' + Date.now(),
              comercioId: store.id,
              tipo: 'ajuste',
              montoUsd: -montoSubtotalComercio,
              montoBs: -Math.round(montoSubtotalComercio * tasaBcv * 100) / 100,
              saldoResultanteUsd: nuevoSaldoUsd,
              pedidoId: orderId,
              codigoSeguimiento: codigo,
              descripcion: `Reverso de fondos por solicitud #${codigo} rechazada (${motivo})`,
              fecha: dateStr,
              estado: 'acreditado'
            },
            ...(prev.historialTransacciones || [])
          ]
        };
      });
    }

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          estado: 'cancelado',
          tiempoEstimadoRestanteSegundos: 0,
          historialOperaciones: [
            ...o.historialOperaciones,
            {
              id: 'hist-' + Date.now(),
              estado: 'cancelado',
              descripcion: `Comercio ${store.nombre} RECHAZÓ la solicitud del cliente (${motivo}). Pedido cancelado.${fueCartera ? ` Reembolso de $${montoReembolso.toFixed(2)} USD reintegrado a la Cartera Vixy del cliente.` : ''}`,
              actor: 'comercio',
              timestamp: timeStr
            }
          ]
        };
      }
      return o;
    }));

    if (fueCartera) {
      addNotification('cliente', '❌ Solicitud Rechazada con Reembolso', `${store.nombre} no pudo aceptar tu pedido #${codigo} (${motivo}). Se reembolsaron $${montoReembolso.toFixed(2)} USD a tu Cartera Vixy.`);
    } else {
      addNotification('cliente', '❌ Solicitud Rechazada por el Comercio', `${store.nombre} no pudo atender tu pedido #${codigo} (${motivo}).`);
    }

    addNotification('comercio', '🚫 Pedido Rechazado', `Has rechazado la solicitud #${codigo} (${motivo}).`);
    addNotification('web', '⚠️ Solicitud Rechazada por Comercio', `Comercio ${store.nombre} rechazó pedido #${codigo}. Motivo: ${motivo}`);
    addActivityLog({
      usuarioId: store.id,
      usuarioNombre: store.nombre,
      usuarioRol: 'comercio',
      modulo: 'pedidos',
      accion: 'Solicitud Rechazada por Comercio',
      detalles: `Comercio rechazó pedido #${codigo}. Motivo: "${motivo}".${fueCartera ? ` Reembolso automático de $${montoReembolso.toFixed(2)} USD procesado.` : ''} Notificación enviada al cliente.`,
      ip: '190.202.89.12 (CANTV ABA)',
      severidad: 'advertencia'
    });
  };

  const verifyPayment = (orderId: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          estado: 'pago_verificado',
          historialOperaciones: [
            ...o.historialOperaciones,
            {
              id: 'hist-' + Date.now(),
              estado: 'pago_verificado',
              descripcion: `Comercio ${store.nombre} confirmó recepción del pago directo.`,
              actor: 'comercio',
              timestamp: timeStr
            }
          ]
        };
      }
      return o;
    }));
    addNotification('cliente', '✅ Pago Verificado', 'Tu comercio ha confirmado el pago. Se inicia la preparación.');
  };

  const startPreparing = (orderId: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          estado: 'en_preparacion',
          historialOperaciones: [
            ...o.historialOperaciones,
            {
              id: 'hist-' + Date.now(),
              estado: 'en_preparacion',
              descripcion: 'Cocina de Burger House comenzó a preparar tu orden.',
              actor: 'comercio',
              timestamp: timeStr
            }
          ]
        };
      }
      return o;
    }));
    addNotification('cliente', '👨‍🍳 Pedido en Preparación', 'Tu comida está siendo preparada con los más altos estándares.');
  };

  const readyForPickup = (orderId: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    let codigo = orderId;
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        codigo = o.codigoSeguimiento || orderId;
        return {
          ...o,
          estado: 'esperando_repartidor',
          conductor: undefined,
          historialOperaciones: [
            ...o.historialOperaciones,
            {
              id: 'hist-' + Date.now(),
              estado: 'esperando_repartidor',
              descripcion: `Pedido empaquetado en mostrador. Oferta de viaje emitida a los repartidores activos de Vixy Delivery.`,
              actor: 'comercio',
              timestamp: timeStr
            }
          ]
        };
      }
      return o;
    }));
    addNotification('conductor', '🛵 ¡Pedido Listo para Retiro!', `Nuevo pedido #${codigo} empaquetado en ${store.nombre}. Toca para aceptar el viaje.`);
    addNotification('web', '📦 Pedido Listo en Mostrador', `Comercio ${store.nombre} terminó empaque de #${codigo}. Esperando aceptación de repartidor.`);
  };

  const driverAcceptOrder = (orderId: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    let acceptedCod = orderId;
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        acceptedCod = o.codigoSeguimiento || orderId;
        return {
          ...o,
          conductor: driver,
          estado: 'en_camino_al_comercio',
          historialOperaciones: [
            ...o.historialOperaciones,
            {
              id: 'hist-' + Date.now(),
              estado: 'en_camino_al_comercio',
              descripcion: `Motorizado ${driver.nombre} Ramírez aceptó la carrera y va rumbo al comercio.`,
              actor: 'conductor',
              timestamp: timeStr
            }
          ]
        };
      }
      return o;
    }));
    addNotification('cliente', '🛵 Motorizado en Camino a la Tienda', `${driver.nombre} Ramírez (${driver.moto.marca} ${driver.moto.placa}) aceptó tu pedido #${acceptedCod} y se dirige al local.`);
    addNotification('comercio', '🛵 Motorizado Asignado', `${driver.nombre} aceptó el retiro de la orden #${acceptedCod}.`);
    addNotification('web', '🛵 Conductor Asignado a Pedido', `El motorizado ${driver.nombre} (${driver.moto.placa}) aceptó el pedido #${acceptedCod}.`);
    addActivityLog({
      usuarioId: driver.id,
      usuarioNombre: `${driver.nombre} ${driver.apellido}`,
      usuarioRol: 'conductor',
      modulo: 'pedidos',
      accion: 'Viaje Aceptado por Motorizado',
      detalles: `Motorizado aceptó pedido #${acceptedCod}. Se desplaza en ${driver.moto.marca} ${driver.moto.placa} hacia el comercio.`,
      ip: '190.74.150.88 (Digitel 4G)',
      severidad: 'exito'
    });
  };

  const assignDriverToOrder = (orderId: string, driverId: string) => {
    const selectedDriver = allDrivers.find(d => d.id === driverId) || driver;
    const timeStr = new Date().toTimeString().split(' ')[0];
    let targetCod = orderId;
    let comercioNombre = 'el comercio';

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        targetCod = o.codigoSeguimiento || orderId;
        comercioNombre = o.comercio?.nombre || 'el comercio';
        return {
          ...o,
          conductor: selectedDriver,
          estado: 'en_camino_al_comercio',
          historialOperaciones: [
            ...o.historialOperaciones,
            {
              id: 'hist-' + Date.now(),
              estado: 'en_camino_al_comercio',
              descripcion: `Mesa operativa asignó al motorizado ${selectedDriver.nombre} ${selectedDriver.apellido} (${selectedDriver.moto.marca} ${selectedDriver.moto.placa}). Motorizado notificado para retiro en ${comercioNombre}.`,
              actor: 'administrador',
              timestamp: timeStr
            }
          ]
        };
      }
      return o;
    }));

    addNotification('conductor', '🛵 Nuevo Servicio Asignado por Mesa Operativa', `Has sido asignado a la orden #${targetCod}. Dirígete a ${comercioNombre} para el retiro.`);
    addNotification('web', '✅ Motorizado Asignado', `Se asignó a ${selectedDriver.nombre} (${selectedDriver.moto.placa}) a la orden #${targetCod}.`);
    addActivityLog({
      usuarioId: currentAdminUser.id,
      usuarioNombre: currentAdminUser.nombre,
      usuarioRol: 'admin',
      modulo: 'pedidos',
      accion: 'Asignación de Motorizado',
      detalles: `Mesa operativa asignó a ${selectedDriver.nombre} ${selectedDriver.apellido} (${selectedDriver.moto.placa}) al servicio #${targetCod}.`,
      ip: '190.202.89.12 (CANTV ABA)',
      severidad: 'info'
    });
  };

  const driverRejectOrder = (orderId: string, motivo: string = 'Distancia no conveniente') => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          conductor: undefined,
          estado: 'esperando_repartidor',
          historialOperaciones: [
            ...o.historialOperaciones,
            {
              id: 'hist-' + Date.now(),
              estado: 'esperando_repartidor',
              descripcion: `Motorizado ${driver.nombre} Ramírez rechazó la solicitud (${motivo}). Pedido retornado al radar de repartidores.`,
              actor: 'conductor',
              timestamp: timeStr
            }
          ]
        };
      }
      return o;
    }));
    addNotification('web', '⚠️ Viaje Rechazado por Repartidor', `Motorizado ${driver.nombre} declinó viaje #${orderId}. Motivo: ${motivo}. Reasignando en radar.`);
    addActivityLog({
      usuarioId: driver.id,
      usuarioNombre: `${driver.nombre} ${driver.apellido}`,
      usuarioRol: 'conductor',
      modulo: 'pedidos',
      accion: 'Viaje Rechazado por Motorizado',
      detalles: `Motorizado rechazó la solicitud para pedido #${orderId}. Motivo indicado: "${motivo}". El pedido vuelve al pool para otros conductores.`,
      ip: '190.74.150.88 (Digitel 4G)',
      severidad: 'advertencia'
    });
  };

  const driverPickUpOrder = (orderId: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          estado: 'en_camino_al_cliente',
          tiempoEstimadoRestanteSegundos: 900, // 15 minutos exactos de countdown
          historialOperaciones: [
            ...o.historialOperaciones,
            {
              id: 'hist-' + Date.now(),
              estado: 'en_camino_al_cliente',
              descripcion: `Comercio verificó identidad del motorizado (${driver.nombre} ${driver.apellido}, Placa ${driver.moto.placa}) y entregó el paquete. Conductor en ruta hacia el cliente.`,
              actor: 'conductor',
              timestamp: timeStr
            }
          ]
        };
      }
      return o;
    }));
    addNotification('cliente', '🚀 En Camino a tu Dirección', `${driver.nombre} ya tiene tu pedido en su maletín térmico y va a tu ubicación.`);
  };

  const driverDeliverOrder = (orderId: string, photoUrl: string, comentario: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    const newFoto: FotoVerificacion = {
      id: 'foto-' + Date.now(),
      pedidoId: orderId,
      url: photoUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 19),
      conductorId: driver.id,
      conductorNombre: `${driver.nombre} ${driver.apellido}`,
      clienteNombre: `${client.nombre} ${client.apellido}`,
      coordenadas: '10.4965° N, 66.8523° W (Chacao, Torre Este)',
      comentario: comentario || 'Entrega completada exitosamente en puerta.'
    };

    setVerificationPhotos(prev => [newFoto, ...prev]);

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          estado: 'entregado',
          tiempoEstimadoRestanteSegundos: 0,
          fotoVerificacion: newFoto,
          historialOperaciones: [
            ...o.historialOperaciones,
            {
              id: 'hist-' + Date.now(),
              estado: 'entregado',
              descripcion: `Entrega completada. Foto de comprobante guardada en /uploads/verificaciones/: "${comentario}".`,
              actor: 'conductor',
              timestamp: timeStr
            }
          ]
        };
      }
      return o;
    }));

    setDriver(prev => ({
      ...prev,
      totalEntregas: prev.totalEntregas + 1
    }));

    // Deduct delivery commission from individual driver wallet and check -$0.50 limit
    setDriverWallet(prev => {
      const nuevoSaldo = parseFloat((prev.saldoUsd - 0.35).toFixed(2));
      const isBlocked = nuevoSaldo <= prev.limiteSaldoNegativo;
      const timeStr2 = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const nuevaTx = {
        id: 'tx-com-' + Date.now(),
        conductorId: prev.conductorId,
        tipo: 'comision_carrera' as const,
        monto: -0.35,
        saldoResultante: nuevoSaldo,
        descripcion: `Comisión operativa por carrera finalizada #${orderId}`,
        fecha: timeStr2,
        estado: 'completado' as const
      };
      const updated = {
        ...prev,
        saldoUsd: nuevoSaldo,
        serviciosRealizados: prev.serviciosRealizados + 1,
        totalComisionesPagadasUsd: parseFloat(((prev.totalComisionesPagadasUsd || 0) + 0.35).toFixed(2)),
        totalComisionesPagadas: parseFloat(((prev.totalComisionesPagadasUsd || 0) + 0.35).toFixed(2)),
        bloqueadoPorSaldo: isBlocked,
        historialTransacciones: [nuevaTx, ...(prev.historialTransacciones || [])],
        transacciones: [nuevaTx, ...(prev.historialTransacciones || [])]
      };
      setDriver(d => ({ ...d, billetera: updated }));
      if (isBlocked) {
        addNotification(
          'conductor',
          '⚠️ Límite de Crédito Negativo Excedido (-$0.50 USD)',
          `Tu saldo cayó a $${nuevoSaldo.toFixed(2)} USD. Has alcanzado el límite negativo permitido (-$0.50). Debes recargar saldo para continuar trabajando.`
        );
      }
      return updated;
    });

    addNotification('cliente', '🎉 ¡Pedido Entregado!', 'Tu pedido ha llegado. Por favor califica la atención de tu repartidor.');
    addNotification('web', '📦 Entrega Exitosa', `Pedido ${orderId} entregado con comprobante fotográfico verificado.`);
  };

  const rateDriver = (orderId: string, estrellas: number, comentario: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          calificacionCliente: { estrellas, comentario }
        };
      }
      return o;
    }));

    setDriver(prev => {
      const newReviews = [
        {
          id: 'res-' + Date.now(),
          clienteNombre: `${client.nombre} ${client.apellido}`,
          calificacion: estrellas,
          comentario,
          fecha: new Date().toISOString().slice(0, 10)
        },
        ...(prev.resenas || [])
      ];
      const avg = newReviews.length > 0 
        ? newReviews.reduce((sum, r) => sum + r.calificacion, 0) / newReviews.length 
        : 5.0;
      return {
        ...prev,
        rating: parseFloat(avg.toFixed(1)),
        resenas: newReviews
      };
    });

    addNotification('conductor', '⭐ Nueva Calificación', `Cliente te calificó con ${estrellas} estrellas: "${comentario}"`);
  };

  const reportIncident = (inc: Omit<Incidencia, 'id' | 'codigoIncidencia' | 'fechaCreacion' | 'estado'>) => {
    const newInc: Incidencia = {
      ...inc,
      id: 'inc-' + Date.now(),
      codigoIncidencia: 'INC-2026-' + Math.floor(100 + Math.random() * 900),
      estado: 'abierta',
      fechaCreacion: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setIncidents(prev => [newInc, ...prev]);
    addNotification('web', '⚠️ Incidencia Registrada', `Nueva incidencia ${newInc.codigoIncidencia} (${newInc.tipo}) reportada por ${newInc.reportanteNombre}`);
  };

  const resolveIncident = (id: string, resolucion: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          estado: 'resuelta',
          resolucion
        };
      }
      return inc;
    }));
  };

  const sendChatMessage = (
    orderId: string, 
    emisorTipo: 'cliente' | 'comercio' | 'conductor', 
    emisorNombre: string, 
    mensaje: string
  ) => {
    const newMsg: MensajeChat = {
      id: 'msg-' + Date.now(),
      pedidoId: orderId,
      emisorTipo,
      emisorNombre,
      mensaje,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      leido: true
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const sendSupportMessage = (usuarioTipo: 'cliente' | 'comercio' | 'conductor', usuarioNombre: string, texto: string) => {
    const newMsg: MensajeSoporte = {
      id: 'sup-' + Date.now(),
      emisor: 'usuario',
      usuarioTipo,
      usuarioNombre,
      texto,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSupportMessages(prev => [...prev, newMsg]);

    // Auto-respond from Support Agent after 1 second
    setTimeout(() => {
      const respMsg: MensajeSoporte = {
        id: 'sup-resp-' + Date.now(),
        emisor: 'agente',
        usuarioTipo,
        usuarioNombre: 'Mesa de Ayuda Vixy (Gabriel)',
        texto: `Hemos recibido tu solicitud "${texto.slice(0, 35)}...". Un operador logístico está asistiendo tu caso en tiempo real.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSupportMessages(curr => [...curr, respMsg]);
    }, 1200);
  };

  const respondSupportMessage = (texto: string) => {
    const respMsg: MensajeSoporte = {
      id: 'sup-admin-' + Date.now(),
      emisor: 'agente',
      usuarioTipo: 'cliente',
      usuarioNombre: 'Administrador Vixy',
      texto,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSupportMessages(curr => [...curr, respMsg]);
  };

  const openCall = (caller: string, callee: string, phone: string, role: string) => {
    setCallModal({ isOpen: true, caller, callee, phone, role });
  };

  const closeCall = () => {
    setCallModal({ isOpen: false, caller: '', callee: '', phone: '', role: '' });
  };

  const openChat = (orderId: string) => {
    setChatModal({ isOpen: true, orderId });
  };

  const closeChat = () => {
    setChatModal({ isOpen: false, orderId: '' });
  };

  const allClientWallets = registeredClients.map(c => ({
    clienteId: c.id,
    clienteNombre: `${c.nombre} ${c.apellido}`,
    cedula: c.cedula,
    saldoUsd: c.id === client.id ? clientWallet.saldoUsd : (c.billetera?.saldoUsd ?? 0),
    saldoBs: c.id === client.id ? clientWallet.saldoBs : (c.billetera?.saldoBs ?? 0),
    totalRecargadoUsd: c.id === client.id ? clientWallet.totalRecargadoUsd : (c.billetera?.totalRecargadoUsd ?? 0),
    totalGastadoUsd: c.id === client.id ? clientWallet.totalGastadoUsd : (c.billetera?.totalGastadoUsd ?? 0),
    carpetaComprobantes: `/uploads/clientes/${c.id}/comprobantes/`,
    transacciones: (c.id === client.id ? clientWallet.historialTransacciones : c.billetera?.historialTransacciones) || []
  }));

  const allDriverWallets = allDrivers.map(d => ({
    conductorId: d.id,
    conductorNombre: `${d.nombre} ${d.apellido}`,
    cedula: d.legal.cedula,
    saldoUsd: d.id === driver.id ? driverWallet.saldoUsd : (d.billetera?.saldoUsd ?? 0),
    limiteSaldoNegativo: d.billetera?.limiteSaldoNegativo ?? -0.50,
    bloqueado: (d.id === driver.id ? driverWallet.saldoUsd : (d.billetera?.saldoUsd ?? 0)) <= -0.50,
    carpetaComprobantes: `/uploads/conductores/${d.id}/comprobantes/`,
    transacciones: (d.id === driver.id ? driverWallet.historialTransacciones : d.billetera?.historialTransacciones) || []
  }));

  const allStoreWallets = stores.map(s => ({
    comercioId: s.id,
    comercioNombre: s.nombre,
    rif: s.rif,
    saldoUsd: s.id === store.id ? storeWallet.saldoUsd : (s.billetera?.saldoUsd ?? 0),
    saldoBs: s.id === store.id ? storeWallet.saldoBs : (s.billetera?.saldoBs ?? 0),
    totalVentasUsd: s.id === store.id ? storeWallet.totalVentasUsd : (s.billetera?.totalVentasUsd ?? 0),
    totalRetiradoUsd: s.id === store.id ? storeWallet.totalRetiradoUsd : (s.billetera?.totalRetiradoUsd ?? 0),
    transacciones: (s.id === store.id ? storeWallet.historialTransacciones : s.billetera?.historialTransacciones) || []
  }));

  const totalClientesUsd = allClientWallets.reduce((sum, w) => sum + Math.max(0, w.saldoUsd), 0);
  const totalConductoresUsd = allDriverWallets.reduce((sum, w) => sum + Math.max(0, w.saldoUsd), 0);
  const totalComerciosUsd = allStoreWallets.reduce((sum, w) => sum + Math.max(0, w.saldoUsd), 0);
  const totalGlobalCustodiaUsd = Math.round((totalClientesUsd + totalConductoresUsd + totalComerciosUsd) * 100) / 100;

  const globalLedger = {
    totalClientesUsd: Math.round(totalClientesUsd * 100) / 100,
    totalConductoresUsd: Math.round(totalConductoresUsd * 100) / 100,
    totalComerciosUsd: Math.round(totalComerciosUsd * 100) / 100,
    totalGlobalCustodiaUsd
  };

  return (
    <DeliveryContext.Provider value={{
      orders,
      activeOrder,
      client,
      clientWallet,
      clientLoggedIn,
      registeredClients,
      switchActiveClient,
      loginClient,
      logoutClient,
      registerClient,
      rechargeClientWallet,
      driver,
      driverWallet,
      driverLoggedIn,
      allDrivers,
      switchActiveDriver,
      loginDriver,
      logoutDriver,
      store,
      stores,
      switchStore,
      updateStoreSchedule,
      rateStore,
      storeWallet,
      storeLoggedIn,
      loginStore,
      logoutStore,
      creditStoreWallet,
      updateStoreRubro,
      updateStoreCategoriasCatalogo,
      rechargeRequests,
      solicitarRecargaCliente,
      solicitarRecargaConductor,
      aprobarRecarga,
      rechazarRecarga,
      confirmDeliveryByClient,
      claims,
      createClaim,
      updateClaimStatus,
      allClientWallets,
      allDriverWallets,
      allStoreWallets,
      globalLedger,
      incidents,
      backendUsers,
      adminUsers,
      currentAdminUser,
      adminIsLoggedIn,
      loginAdmin,
      logoutAdmin,
      activityLogs,
      addActivityLog,
      clearActivityLogs,
      deliveryRates,
      updateDeliveryRates,
      calculateDeliveryTripCost,
      notifications,
      verificationPhotos,
      chatMessages,
      supportMessages,
      tasaBcv,
      setTasaBcv: handleSetTasaBcv,
      updateDriverAvailability,
      rechargeDriverWallet,
      toggleSimulatedNegativeBalance,
      updateStoreInfo,
      updateStorePayments,
      addProduct,
      updateProduct,
      deleteProduct,
      addProductToStore: addProduct,
      updateProductInStore: updateProduct,
      deleteProductFromStore: deleteProduct,
      switchAdminUser,
      addAdminUser,
      updateAdminUser,
      deleteAdminUser,
      createOrder,
      createStoreManualOrder,
      storeAcceptOrder,
      storeRejectOrder,
      verifyPayment,
      startPreparing,
      readyForPickup,
      assignDriverToOrder,
      driverAcceptOrder,
      driverRejectOrder,
      driverPickUpOrder,
      driverDeliverOrder,
      rateDriver,
      reportIncident,
      resolveIncident,
      sendChatMessage,
      sendSupportMessage,
      respondSupportMessage,
      callModal,
      openCall,
      closeCall,
      chatModal,
      openChat,
      closeChat,
      cartoApiKey,
      setCartoApiKey: handleSetCartoApiKey,
      realGpsActive,
      realGpsCoords,
      realGpsError,
      requestPushNotificationPermission,
      playNotificationSound
    }}>
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const ctx = useContext(DeliveryContext);
  if (!ctx) {
    throw new Error('useDelivery must be used within DeliveryProvider');
  }
  return ctx;
};
