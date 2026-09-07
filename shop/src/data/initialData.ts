import { 
  Cliente, 
  Comercio, 
  Conductor, 
  Pedido, 
  Incidencia, 
  UsuarioBackend, 
  NotificacionPush, 
  AdminUser, 
  ConductorBilletera, 
  ClienteBilletera, 
  ComercioBilletera, 
  LogActividad, 
  TarifasDeliveryConfig, 
  ZonaCalor, 
  SolicitudRecarga, 
  ReclamoCliente 
} from '../types/delivery';

export const RUBROS_COMERCIO_DISPONIBLES = [
  'Hamburguesas & Comida Rápida',
  'Pizzas & Comida Italiana',
  'Sushi & Comida Asiática',
  'Carnes, Parrillas & Grill',
  'Cafetería, Desayunos & Brunch',
  'Panadería, Pastelería & Dulces',
  'Farmacia, Salud & Medicinas',
  'Supermercado, Víveres & Minimarket',
  'Ferretería, Hogar & Pinturas',
  'Tecnología, Teléfonos & Computación',
  'Repuestos & Accesorios de Moto y Auto',
  'Ropa, Calzado & Moda',
  'Cosméticos, Belleza & Cuidado Personal',
  'Mascotas, Alimentos & Veterinaria',
  'Licores, Vinos & Cervezas',
  'Librería, Papelería & Oficina',
  'Floristería, Regalos & Novedades',
  'Otro (Personalizado)'
];

export const TASA_BCV_ACTUAL = 78.50; // Tasa de contingencia si no responde API

export const INITIAL_TARIFAS_CONFIG: TarifasDeliveryConfig = {
  tasaBcvBs: TASA_BCV_ACTUAL,
  porcentajeComisionDelivery: 15, // 15% Comisión de servicio
  tarifaBaseMinimaUsd: 2.00, // Tarifa de viaje mínimo hasta 3 km ($2.00 USD)
  distanciaBaseKm: 3.0, // 3.0 km base
  fraccionCalculoKm: 1.0,
  costoPorFraccionUsd: 0.50, // $0.50 USD por km adicional
  comisionMotorizadoPorcentaje: 85, // 85% neto para el conductor
  fechaActualizacion: new Date().toISOString()
};

// Zonas y Comercios en Radar (vacíos, poblados dinámicamente)
export const ZONAS_CALOR_CARACAS: ZonaCalor[] = [];
export const COMERCIOS_ACTIVOS_CARACAS: any[] = [];

// Billeteras vacías por defecto
export const DEMO_CLIENTE_BILLETERA: ClienteBilletera = {
  saldoUsd: 0.00,
  saldoBs: 0.00,
  totalRecargadoUsd: 0.00,
  totalGastadoUsd: 0.00,
  historialTransacciones: []
};

export const DEMO_COMERCIO_BILLETERA: ComercioBilletera = {
  saldoUsd: 0.00,
  saldoBs: 0.00,
  totalVentasUsd: 0.00,
  totalRetiradoUsd: 0.00,
  historialTransacciones: []
};

export const DEMO_CONDUCTOR_BILLETERA: ConductorBilletera = {
  saldoUsd: 0.00,
  limiteSaldoNegativo: -0.50,
  bloqueadoPorSaldo: false,
  totalGanadoUsd: 0.00,
  totalComisionesPagadasUsd: 0.00,
  historialTransacciones: []
};

// Modelos limpios por defecto para estados no autenticados
export const DEMO_CLIENTE: Cliente = {
  id: '',
  nombre: 'Invitado',
  apellido: '',
  cedula: '',
  telefono: '',
  username: '',
  direccion: '',
  puntoReferencia: '',
  email: '',
  avatarUrl: '/banners/banner_comercios.jpg',
  billetera: DEMO_CLIENTE_BILLETERA
};

export const DEMO_COMERCIO: Comercio = {
  id: '',
  codigoComercio: '',
  nombre: 'Mi Comercio',
  nombreComercial: 'Mi Comercio',
  rif: '',
  categoria: 'Comercio General',
  categoriaPrincipal: 'comida_rapida',
  rubroPersonalizado: '',
  direccion: '',
  telefono: '',
  email: '',
  logoUrl: '/banners/banner_comercios.jpg',
  bannerUrl: '/banners/banner_comercios.jpg',
  calificacion: 5.0,
  totalCalificaciones: 0,
  tiempoEstimadoMin: 20,
  tiempoEstimadoMax: 45,
  costoEnvioUsd: 2.00,
  horarioApertura: '08:00 AM - 10:00 PM',
  horaApertura: '08:00:00',
  horaCierre: '22:00:00',
  diasOperacion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  activo: true,
  abierto: true,
  abiertoManual: true,
  lat: 10.4910,
  lng: -66.8530,
  productos: [],
  categoriasCatalogo: [],
  metodosPagoAceptados: {
    pagoMovil: { activo: true, telefono: '', banco: '', cedulaRif: '', titular: '' },
    carteraVixy: { activo: true },
    efectivoUsd: { activo: true },
    zelle: { activo: false },
    binancePay: { activo: false },
    zinli: { activo: false }
  },
  billetera: DEMO_COMERCIO_BILLETERA
};

export const DEMO_CONDUCTOR: Conductor = {
  id: '',
  nombre: 'Conductor',
  apellido: '',
  cedula: '',
  telefono: '',
  email: '',
  fotoUrl: '/banners/banner_comercios.jpg',
  disponible: false,
  activo: true,
  moto: {
    marca: 'Bera',
    modelo: 'SBR 150',
    color: 'Negro',
    placa: '',
    ano: 2024,
    serialMotor: '',
    serialChasis: ''
  },
  legal: {
    cedula: '',
    licenciaGrado: '2da',
    licenciaNumero: '',
    licenciaVencimiento: '2026-12-31',
    licenciaValida: true,
    certificadoMedicoNumero: '',
    certificadoMedicoVencimiento: '2026-12-31',
    certificadoMedicoValido: true,
    rcvAseguradora: 'Seguros Caracas',
    rcvPolizaNumero: '',
    rcvVencimiento: '2026-12-31'
  },
  rating: 5.0,
  totalEntregas: 0,
  calificacion: 5.0,
  totalViajes: 0,
  ubicacionActual: 'Caracas',
  lat: 10.4910,
  lng: -66.8620,
  resenas: [],
  billetera: DEMO_CONDUCTOR_BILLETERA
};

// Arreglos vacíos para producción (los datos reales vendrán de MySQL / cPanel)
export const ALL_DEMO_COMERCIOS: Comercio[] = [];
export const ALL_DEMO_CLIENTES: Cliente[] = [];
export const ALL_DEMO_CONDUCTORES: Conductor[] = [];
export const INITIAL_ORDERS: Pedido[] = [];
export const INITIAL_INCIDENTS: Incidencia[] = [];
export const INITIAL_RECHARGE_REQUESTS: SolicitudRecarga[] = [];
export const INITIAL_CLIENT_CLAIMS: ReclamoCliente[] = [];
export const INITIAL_NOTIFICATIONS: NotificacionPush[] = [];
export const INITIAL_ACTIVITY_LOGS: LogActividad[] = [];
export const INITIAL_BACKEND_USERS: UsuarioBackend[] = [];

// Superusuario Oficial de Administración (vixydely / 123456)
export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-root-vixydely',
    username: 'vixydely',
    password: '123456',
    nombre: 'Superusuario Central Vixy',
    email: 'vixydely@vixy.com',
    nivelAcceso: 'super_admin',
    departamento: 'Dirección General Vixy Express',
    activo: true,
    ultimoAcceso: new Date().toISOString().replace('T', ' ').slice(0, 19),
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    debeCambiarClave: false,
    fechaCambioClave: '2026-09-05',
    fechaVencimientoClave: '2026-12-05',
    diasVigenciaClave: 90,
    pestanasPermitidas: [
      'dashboard', 'mapa_conductores', 'mapa_flota', 'recargas', 
      'custodia', 'reclamos', 'pedidos', 'conductores', 'comercios', 
      'incidencias', 'soporte', 'verificaciones', 'pagos', 
      'usuarios_web', 'logs', 'backend'
    ]
  }
];
