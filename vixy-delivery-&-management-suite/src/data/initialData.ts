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

export const TASA_BCV_ACTUAL = 78.50; // Bs por USD referencial

export const INITIAL_TARIFAS_CONFIG: TarifasDeliveryConfig = {
  tasaBcvBs: TASA_BCV_ACTUAL,
  porcentajeComisionDelivery: 12, // 12% Comisión de servicio para la plataforma (no toca precios de comercios)
  tarifaBaseMinimaUsd: 2.00, // Tarifa de viaje mínimo hasta 3 km ($2.00 USD)
  distanciaBaseKm: 3.0, // 3.0 km fijos de viaje mínimo
  fraccionCalculoKm: 1.0, // Cálculo por kilómetro
  costoPorFraccionUsd: 0.50, // $0.50 USD por cada km después de los 3 km de recorrido
  comisionMotorizadoPorcentaje: 88, // 88% neto para el conductor
  fechaActualizacion: '2026-09-04 18:00:00'
};

export const ZONAS_CALOR_CARACAS: ZonaCalor[] = [
  {
    id: 'zona-1',
    nombreZona: 'Las Mercedes (Calle París / Calle Madrid)',
    municipio: 'Baruta',
    pedidosPorHora: 42,
    nivelDemanda: 'muy_alta',
    lat: 10.4812,
    lng: -66.8624,
    ticketPromedioUsd: 22.50,
    radioMetros: 900,
    comerciosActivos: 18
  },
  {
    id: 'zona-2',
    nombreZona: 'Chacao & El Rosal Corporativo',
    municipio: 'Chacao',
    pedidosPorHora: 38,
    nivelDemanda: 'muy_alta',
    lat: 10.4920,
    lng: -66.8570,
    ticketPromedioUsd: 17.80,
    radioMetros: 850,
    comerciosActivos: 24
  },
  {
    id: 'zona-3',
    nombreZona: 'Altamira & Los Palos Grandes',
    municipio: 'Chacao',
    pedidosPorHora: 31,
    nivelDemanda: 'alta',
    lat: 10.4985,
    lng: -66.8450,
    ticketPromedioUsd: 19.40,
    radioMetros: 1000,
    comerciosActivos: 16
  },
  {
    id: 'zona-4',
    nombreZona: 'La Castellana & San Ignacio',
    municipio: 'Chacao',
    pedidosPorHora: 22,
    nivelDemanda: 'alta',
    lat: 10.5015,
    lng: -66.8530,
    ticketPromedioUsd: 26.00,
    radioMetros: 750,
    comerciosActivos: 11
  },
  {
    id: 'zona-5',
    nombreZona: 'Colinas de Bello Monte & Las Delicias',
    municipio: 'Baruta',
    pedidosPorHora: 16,
    nivelDemanda: 'media',
    lat: 10.4850,
    lng: -66.8780,
    ticketPromedioUsd: 15.20,
    radioMetros: 800,
    comerciosActivos: 9
  }
];

export const COMERCIOS_ACTIVOS_CARACAS = [
  {
    id: 'com-001',
    nombre: 'Burger House Caracas',
    categoria: 'Hamburguesas & Grill',
    zona: 'Los Palos Grandes',
    direccion: 'Calle Los Palos Grandes con 2da Transversal',
    lat: 10.4950,
    lng: -66.8480,
    pedidosEnCola: 3,
    tiempoPromedioDespachoMin: 14,
    abierto: true,
    rating: 4.8
  },
  {
    id: 'com-002',
    nombre: 'Pizzería Bella Vista',
    categoria: 'Pizzas & Pasta',
    zona: 'Las Mercedes',
    direccion: 'Calle París, Edif. Bella Vista, Las Mercedes',
    lat: 10.4815,
    lng: -66.8610,
    pedidosEnCola: 5,
    tiempoPromedioDespachoMin: 18,
    abierto: true,
    rating: 4.9
  },
  {
    id: 'com-003',
    nombre: 'Sushi Ávila Altamira',
    categoria: 'Japonesa & Fusión',
    zona: 'Altamira',
    direccion: 'Av. San Juan Bosco con 3ra Transversal',
    lat: 10.5002,
    lng: -66.8490,
    pedidosEnCola: 2,
    tiempoPromedioDespachoMin: 22,
    abierto: true,
    rating: 4.7
  },
  {
    id: 'com-004',
    nombre: 'Farmacia Express 24H',
    categoria: 'Salud & Medicinas',
    zona: 'El Rosal',
    direccion: 'Av. Francisco de Miranda frente a Torre Europa',
    lat: 10.4910,
    lng: -66.8600,
    pedidosEnCola: 1,
    tiempoPromedioDespachoMin: 8,
    abierto: true,
    rating: 4.9
  },
  {
    id: 'com-005',
    nombre: 'Bodegón Gourmet San Ignacio',
    categoria: 'Delicatessen & Bebidas',
    zona: 'La Castellana',
    direccion: 'Centro Comercial San Ignacio, Nivel Jardín',
    lat: 10.5020,
    lng: -66.8540,
    pedidosEnCola: 4,
    tiempoPromedioDespachoMin: 10,
    abierto: true,
    rating: 4.8
  }
];

export const DEMO_CLIENTE_BILLETERA: ClienteBilletera = {
  clienteId: 'cli-001',
  saldoUsd: 25.00,
  saldoBs: Math.round(25.00 * TASA_BCV_ACTUAL * 100) / 100,
  totalGastadoUsd: 14.20,
  totalRecargadoUsd: 39.20,
  historialTransacciones: [
    {
      id: 'tx-cli-001',
      clienteId: 'cli-001',
      tipo: 'recarga',
      montoUsd: 25.00,
      montoBs: Math.round(25.00 * TASA_BCV_ACTUAL),
      saldoResultanteUsd: 25.00,
      metodoPago: 'pago_movil',
      referencia: 'PAGOMOVIL-0102-882193',
      comprobanteUrl: '/uploads/comprobantes_pago/recarga_cli_001.jpg',
      comprobanteArchivoId: 'arch-comp-cli-001',
      descripcion: 'Recarga de saldo por Pago Móvil Banco de Venezuela',
      fecha: '2026-09-02 10:15:00',
      estado: 'completado'
    },
    {
      id: 'tx-cli-002',
      clienteId: 'cli-001',
      tipo: 'pago_pedido',
      montoUsd: -14.20,
      montoBs: Math.round(-14.20 * TASA_BCV_ACTUAL),
      saldoResultanteUsd: 0.00,
      metodoPago: 'saldo_cartera',
      descripcion: 'Pago de pedido #VIX-8040 en Burger House Caracas',
      fecha: '2026-09-01 19:40:12',
      pedidoId: 'ped-8040',
      estado: 'completado'
    }
  ]
};

export const DEMO_CLIENTE: Cliente = {
  id: 'cli-001',
  username: 'carlos_mendoza',
  passwordHash: 'carlos123',
  nombre: 'Carlos',
  apellido: 'Mendoza',
  cedula: 'V-26.415.892',
  telefono: '+58 412 998 1234',
  email: 'carlos.mendoza@email.com',
  direccion: 'Av. Francisco de Miranda, Edif. Parque Cristal, Torre Este, Piso 7, Apto 72, Chacao',
  puntoReferencia: 'Frente a la estación de metro Parque del Este',
  lat: 10.4965,
  lng: -66.8523,
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  billetera: DEMO_CLIENTE_BILLETERA
};

export const DEMO_CONDUCTOR_BILLETERA: ConductorBilletera = {
  conductorId: 'cond-001',
  saldoUsd: 4.80,
  limiteSaldoNegativo: -0.50, // Límite estricto venezolano
  serviciosRealizados: 184,
  totalComisionesPagadasUsd: 64.40,
  totalComisionesPagadas: 64.40,
  bloqueadoPorSaldo: false,
  historialTransacciones: [
    {
      id: 'tx-001',
      conductorId: 'cond-001',
      tipo: 'recarga',
      monto: 5.00,
      saldoResultante: 4.80,
      metodoPago: 'binance',
      referencia: 'BINANCE-PAY-9812903',
      descripcion: 'Recarga de saldo por Binance Pay (USDT)',
      fecha: '2026-09-02 14:30:10',
      estado: 'completado'
    },
    {
      id: 'tx-002',
      conductorId: 'cond-001',
      tipo: 'comision_carrera',
      monto: -0.35,
      saldoResultante: -0.20,
      descripcion: 'Comisión por servicio de entrega pedido #VIX-8041',
      fecha: '2026-09-02 15:35:40',
      estado: 'completado'
    },
    {
      id: 'tx-003',
      conductorId: 'cond-001',
      tipo: 'comision_carrera',
      monto: -0.35,
      saldoResultante: 0.15,
      descripcion: 'Comisión por servicio de entrega pedido #VIX-8038',
      fecha: '2026-09-02 13:10:20',
      estado: 'completado'
    },
    {
      id: 'tx-004',
      conductorId: 'cond-001',
      tipo: 'recarga',
      monto: 3.00,
      saldoResultante: 0.50,
      metodoPago: 'zinli',
      referencia: 'ZINLI-TR-448102',
      descripcion: 'Recarga de billetera móvil Zinli',
      fecha: '2026-09-01 18:20:00',
      estado: 'completado'
    }
  ],
  transacciones: [
    {
      id: 'tx-001',
      conductorId: 'cond-001',
      tipo: 'recarga',
      monto: 5.00,
      saldoResultante: 4.80,
      metodoPago: 'binance',
      referencia: 'BINANCE-PAY-9812903',
      descripcion: 'Recarga de saldo por Binance Pay (USDT)',
      fecha: '2026-09-02 14:30:10',
      estado: 'completado'
    },
    {
      id: 'tx-002',
      conductorId: 'cond-001',
      tipo: 'comision_carrera',
      monto: -0.35,
      saldoResultante: -0.20,
      descripcion: 'Comisión por servicio de entrega pedido #VIX-8041',
      fecha: '2026-09-02 15:35:40',
      estado: 'completado'
    },
    {
      id: 'tx-003',
      conductorId: 'cond-001',
      tipo: 'comision_carrera',
      monto: -0.35,
      saldoResultante: 0.15,
      descripcion: 'Comisión por servicio de entrega pedido #VIX-8038',
      fecha: '2026-09-02 11:12:00',
      estado: 'completado'
    },
    {
      id: 'tx-004',
      conductorId: 'cond-001',
      tipo: 'recarga',
      monto: 3.00,
      saldoResultante: 0.50,
      metodoPago: 'zinli',
      referencia: 'ZINLI-TR-448102',
      descripcion: 'Recarga de billetera móvil Zinli',
      fecha: '2026-09-01 18:20:00',
      estado: 'completado'
    }
  ]
};

export const DEMO_CONDUCTOR: Conductor = {
  id: 'cond-001',
  nombre: 'Yeferson',
  apellido: 'Ramírez',
  telefono: '+58 414 332 9081',
  email: 'yeferson.delivery@vixy.com',
  fotoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  disponible: true,
  activo: true,
  moto: {
    marca: 'Empire Keeway',
    modelo: 'Horse 150cc',
    ano: 2023,
    color: 'Rojo Carmesí',
    placa: 'AA1B23C',
    serialMotor: 'EK162FMJ-982109',
    serialChasis: '8X3B4109823190283'
  },
  legal: {
    cedula: 'V-24.892.110',
    licenciaGrado: '2da',
    licenciaNumero: 'LIC-2da-24892110',
    licenciaVencimiento: '2027-08-15',
    licenciaValida: true,
    certificadoMedicoNumero: 'CMV-MPPS-481902-MIRANDA',
    certificadoMedicoVencimiento: '2027-03-20',
    certificadoMedicoValido: true,
    rcvAseguradora: 'Seguros Pirámide C.A.',
    rcvPolizaNumero: 'RCV-MOTO-99210-2026',
    rcvVencimiento: '2027-01-10'
  },
  rating: 4.9,
  totalEntregas: 184,
  billetera: DEMO_CONDUCTOR_BILLETERA,
  lat: 10.4912,
  lng: -66.8580,
  ubicacionActual: 'Plaza Altamira, Municipio Chacao',
  resenas: [
    {
      id: 'res-1',
      clienteNombre: 'Valentina Silva',
      calificacion: 5,
      comentario: 'Súper rápido y muy educado, la comida llegó intacta y caliente.',
      fecha: '2026-08-30'
    },
    {
      id: 'res-2',
      clienteNombre: 'Andrés Gómez',
      calificacion: 5,
      comentario: 'Excelente servicio. Maneja con mucho cuidado y llegó antes de tiempo.',
      fecha: '2026-08-27'
    },
    {
      id: 'res-3',
      clienteNombre: 'María Corina Soto',
      calificacion: 4,
      comentario: 'Buen trato, llamó con anticipación para confirmar la dirección.',
      fecha: '2026-08-20'
    }
  ]
};

export const DEMO_COMERCIO_BILLETERA: ComercioBilletera = {
  comercioId: 'com-001',
  saldoUsd: 68.50,
  saldoBs: Math.round(68.50 * TASA_BCV_ACTUAL * 100) / 100,
  totalVentasUsd: 142.50,
  totalRetiradoUsd: 74.00,
  historialTransacciones: [
    {
      id: 'tx-com-001',
      comercioId: 'com-001',
      tipo: 'pago_pedido_cartera',
      montoUsd: 14.20,
      montoBs: Math.round(14.20 * TASA_BCV_ACTUAL),
      saldoResultanteUsd: 68.50,
      pedidoId: 'ped-8040',
      codigoSeguimiento: 'VIX-8040',
      metodoPago: 'saldo_cartera',
      descripcion: 'Acreditación instantánea por pedido pagado con Saldo Cartera Vixy',
      comprobanteUrl: '/uploads/comprobantes_pago/pago_vixy_ped-8040.jpg',
      comprobanteArchivoId: 'arch-pago-8040',
      fecha: '2026-09-01 19:40:15',
      estado: 'acreditado'
    },
    {
      id: 'tx-com-002',
      comercioId: 'com-001',
      tipo: 'pago_pedido_directo',
      montoUsd: 22.50,
      montoBs: Math.round(22.50 * TASA_BCV_ACTUAL),
      saldoResultanteUsd: 54.30,
      pedidoId: 'ped-8039',
      codigoSeguimiento: 'VIX-8039',
      metodoPago: 'pago_movil',
      referencia: 'PM-BANESCO-772183',
      descripcion: 'Pago directo verificado por Pago Móvil Banesco',
      comprobanteUrl: '/uploads/comprobantes_pago/pm_ped-8039.jpg',
      comprobanteArchivoId: 'arch-pago-8039',
      fecha: '2026-09-01 15:10:00',
      estado: 'acreditado'
    }
  ]
};

export const DEMO_COMERCIO: Comercio = {
  id: 'com-001',
  nombre: 'Burger House Caracas',
  categoria: 'Hamburguesas & Comida Rápida',
  categoriaPrincipal: 'comida_rapida',
  rubroPersonalizado: '',
  categoriasCatalogo: ['Hamburguesas', 'Acompañantes', 'Entradas', 'Bebidas', 'Postres & Combos'],
  rif: 'J-40192837-1',
  direccion: 'Calle Los Palos Grandes con 2da Transversal, Qta. La Gracia, Caracas',
  telefono: '+58 212 285 4410',
  email: 'pedidos@burgerhouseccs.com',
  logoUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=150&auto=format&fit=crop&q=80',
  portadaUrl: 'https://images.unsplash.com/photo-1460306855393-0410f61241c7?w=800&auto=format&fit=crop&q=80',
  calificacion: 4.8,
  totalCalificaciones: 142,
  horarios: 'Lunes a Domingo: 11:30 AM - 11:00 PM',
  diasApertura: 'Todos los días',
  horaApertura: '11:30',
  horaCierre: '23:00',
  diasOperacion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  activo: true,
  resenasComercio: [
    {
      id: 'res-com-1',
      clienteNombre: 'Pedro Navas',
      calificacion: 5,
      comentario: 'Las mejores hamburguesas de Caracas, carne jugosa y pan suavecito.',
      fecha: '2026-09-01'
    },
    {
      id: 'res-com-2',
      clienteNombre: 'Carla Rondón',
      calificacion: 5,
      comentario: 'Empaque térmico impecable, papas crocantes y salsas generosas.',
      fecha: '2026-08-28'
    },
    {
      id: 'res-com-3',
      clienteNombre: 'Jesús Blanco',
      calificacion: 4,
      comentario: 'Muy buen sabor, recomendada la burger doble con tocineta.',
      fecha: '2026-08-25'
    }
  ],
  tiempoEstimadoMin: 20,
  tiempoEstimadoMax: 35,
  costoEnvioUsd: 2.50,
  abierto: true,
  lat: 10.4950,
  lng: -66.8480,
  metodosPago: {
    pagoMovil: {
      activo: true,
      banco: 'Banco de Venezuela (0102)',
      telefono: '0412-9988112',
      cedula: 'J-40192837-1'
    },
    zelle: {
      activo: true,
      email: 'pagos@burgerhouseccs.com',
      titular: 'Burger House Gourmet LLC'
    },
    zinli: {
      activo: true,
      email: 'zinli.pedidos@burgerhouseccs.com',
      titular: 'Burger House Caracas'
    },
    binance: {
      activo: true,
      payId: '298491823',
      nickname: 'BurgerHouse_CCS',
      qrUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=400&auto=format&fit=crop&q=80'
    },
    paypal: {
      activo: true,
      email: 'facturacion@burgerhouseccs.com',
      instrucciones: 'Enviar como pago de bienes/servicios indicando tu código de pedido VIX-XXXX.'
    },
    efectivo: {
      activo: true,
      aceptaBs: true,
      aceptaUsd: true,
      instrucciones: 'Paga en efectivo directamente al motorizado (USD exacto sin tachaduras o Bolívares a tasa oficial BCV).'
    },
    efectivoUsd: {
      activo: true,
      instrucciones: 'Tener monto exacto en billetes limpios sin roturas ni marcas.'
    },
    puntoVenta: {
      activo: false
    }
  },
  productos: [
    {
      id: 'prod-1',
      nombre: 'Vixy Burger Doble Carne',
      descripcion: 'Doble carne angus 150g, queso cheddar fundido, tocineta crujiente, cebolla caramelizada y salsa especial de la casa.',
      precioUsd: 8.50,
      precioBs: Math.round(8.50 * TASA_BCV_ACTUAL),
      categoria: 'Hamburguesas',
      imagenUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-001/articulos/vixy-burger-doble.jpg',
      disponible: true
    },
    {
      id: 'prod-2',
      nombre: 'Crispy Chicken Supreme',
      descripcion: 'Pechuga empanizada super crujiente, ensalada coleslaw fresca, pepinillos dulces y mayonesa chipotle.',
      precioUsd: 7.00,
      precioBs: Math.round(7.00 * TASA_BCV_ACTUAL),
      categoria: 'Hamburguesas',
      imagenUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-001/articulos/crispy-chicken-supreme.jpg',
      disponible: true
    },
    {
      id: 'prod-3',
      nombre: 'Papas Rústicas con Trufa & Parmesano',
      descripcion: 'Porción generosa de papas naturales corte grueso con aceite de trufa blanca y queso parmesano gratinado.',
      precioUsd: 3.50,
      precioBs: Math.round(3.50 * TASA_BCV_ACTUAL),
      categoria: 'Acompañantes',
      imagenUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-001/articulos/papas-rusticas-trufa.jpg',
      disponible: true
    },
    {
      id: 'prod-4',
      nombre: 'Tequeños Tradicionales (6 unidades)',
      descripcion: 'Clásicos tequeños de queso blanco llanero artesanal con salsa de papelón con limón.',
      precioUsd: 4.00,
      precioBs: Math.round(4.00 * TASA_BCV_ACTUAL),
      categoria: 'Entradas',
      imagenUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-001/articulos/tequenos-tradicionales.jpg',
      disponible: true
    },
    {
      id: 'prod-5',
      nombre: 'Refresco Coca-Cola 355ml',
      descripcion: 'Lata bien fría.',
      precioUsd: 1.50,
      precioBs: Math.round(1.50 * TASA_BCV_ACTUAL),
      categoria: 'Bebidas',
      imagenUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-001/articulos/coca-cola-355ml.jpg',
      disponible: true
    }
  ],
  billetera: DEMO_COMERCIO_BILLETERA
};

export const DEMO_COMERCIO_FERRETERIA_BILLETERA: ComercioBilletera = {
  comercioId: 'com-002',
  saldoUsd: 185.00,
  saldoBs: Math.round(185.00 * TASA_BCV_ACTUAL * 100) / 100,
  totalVentasUsd: 490.00,
  totalRetiradoUsd: 305.00,
  historialTransacciones: [
    {
      id: 'tx-com-ferr-001',
      comercioId: 'com-002',
      tipo: 'pago_pedido_cartera',
      montoUsd: 48.00,
      montoBs: Math.round(48.00 * TASA_BCV_ACTUAL * 100) / 100,
      saldoResultanteUsd: 185.00,
      pedidoId: 'ped-7911',
      codigoSeguimiento: 'VIX-7911',
      descripcion: 'Venta taladro percutor - Pagado con Cartera Vixy',
      metodoPago: 'saldo_cartera',
      fecha: '2026-09-02 15:40:00',
      estado: 'acreditado'
    }
  ]
};

export const DEMO_COMERCIO_FERRETERIA: Comercio = {
  id: 'com-002',
  nombre: 'Ferretería El Tornillo Fuerte',
  categoria: 'Ferretería, Hogar & Pinturas',
  categoriaPrincipal: 'ferreteria',
  rubroPersonalizado: '',
  categoriasCatalogo: ['Herramientas Eléctricas', 'Herramientas Manuales', 'Pinturas & Selladores', 'Cerrajería', 'Iluminación & Electricidad'],
  rif: 'J-31892014-8',
  direccion: 'Av. Sucre con Calle Bolívar, Local 4, Chacao / Caracas',
  telefono: '+58 212 862 3344',
  email: 'ventas@tornillofuerte.com',
  logoUrl: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=150&auto=format&fit=crop&q=80',
  portadaUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80',
  calificacion: 4.9,
  totalCalificaciones: 88,
  horarios: 'Lunes a Sábado: 8:00 AM - 6:00 PM | Domingos: 8:30 AM - 1:00 PM',
  diasApertura: 'Lun - Dom',
  horaApertura: '08:00',
  horaCierre: '18:00',
  diasOperacion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  activo: true,
  resenasComercio: [
    {
      id: 'res-ferr-1',
      clienteNombre: 'Manuel Briceño',
      calificacion: 5,
      comentario: 'Excelente surtido de tornillos y herramientas de calidad con garantía.',
      fecha: '2026-09-02'
    },
    {
      id: 'res-ferr-2',
      clienteNombre: 'Roberto Sanz',
      calificacion: 5,
      comentario: 'Despacho rápido y empaquetado seguro para delivery en moto.',
      fecha: '2026-08-31'
    }
  ],
  tiempoEstimadoMin: 25,
  tiempoEstimadoMax: 45,
  costoEnvioUsd: 3.00,
  abierto: true,
  lat: 10.4910,
  lng: -66.8520,
  metodosPago: {
    pagoMovil: {
      activo: true,
      banco: 'Banesco (0134)',
      telefono: '0414-2233445',
      cedula: 'J-31892014-8'
    },
    zelle: {
      activo: true,
      email: 'pagos@tornillofuerte.com',
      titular: 'Ferretería El Tornillo Fuerte C.A.'
    },
    zinli: {
      activo: true,
      email: 'zinli@tornillofuerte.com',
      titular: 'Tornillo Fuerte'
    },
    binance: {
      activo: true,
      payId: '88219034',
      nickname: 'TornilloFuerte_CCS'
    },
    paypal: {
      activo: false,
      email: '',
      instrucciones: ''
    },
    efectivo: {
      activo: true,
      aceptaBs: true,
      aceptaUsd: true,
      instrucciones: 'Efectivo en mano al motorizado.'
    },
    efectivoUsd: {
      activo: true,
      instrucciones: 'Billetes en buen estado.'
    }
  },
  productos: [
    {
      id: 'ferr-1',
      nombre: 'Taladro Percutor Inalámbrico 20V + Accesorios',
      descripcion: 'Taladro percutor reversible 2 velocidades, 2 baterías de litio y maletín con brocas.',
      precioUsd: 48.00,
      precioBs: Math.round(48.00 * TASA_BCV_ACTUAL),
      categoria: 'Herramientas Eléctricas',
      imagenUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-002/articulos/taladro-percutor-20v.jpg',
      disponible: true
    },
    {
      id: 'ferr-2',
      nombre: 'Galón Pintura Caucho Blanca Interior/Exterior',
      descripcion: 'Pintura mate de alto cubrimiento y secado rápido, lavable y antimoho.',
      precioUsd: 19.50,
      precioBs: Math.round(19.50 * TASA_BCV_ACTUAL),
      categoria: 'Pinturas & Selladores',
      imagenUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-002/articulos/galon-pintura-blanca.jpg',
      disponible: true
    },
    {
      id: 'ferr-3',
      nombre: 'Juego de Destornilladores Pro 6 en 1',
      descripcion: 'Mangos ergonómicos antichoque, puntas magnéticas phillips y planas.',
      precioUsd: 11.00,
      precioBs: Math.round(11.00 * TASA_BCV_ACTUAL),
      categoria: 'Herramientas Manuales',
      imagenUrl: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-002/articulos/destornilladores-pro-6en1.jpg',
      disponible: true
    },
    {
      id: 'ferr-4',
      nombre: 'Cerradura de Pomo Acero Inox para Puerta Principal',
      descripcion: 'Mecanismo cilíndrico de alta seguridad con 3 llaves computarizadas.',
      precioUsd: 14.50,
      precioBs: Math.round(14.50 * TASA_BCV_ACTUAL),
      categoria: 'Cerrajería',
      imagenUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-002/articulos/cerradura-pomo-acero.jpg',
      disponible: true
    },
    {
      id: 'ferr-5',
      nombre: 'Cinta Métrica 5 Metros con Freno Anticaídas',
      descripcion: 'Carcasa engomada de alto impacto con cinta milimetrada de acero.',
      precioUsd: 3.50,
      precioBs: Math.round(3.50 * TASA_BCV_ACTUAL),
      categoria: 'Herramientas Manuales',
      imagenUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-002/articulos/cinta-metrica-5m.jpg',
      disponible: true
    },
    {
      id: 'ferr-6',
      nombre: 'Bombillos LED 12W Luz Blanca E27 (Pack 3 unidades)',
      descripcion: 'Ahorradores 85% energía, 6500K luz fría de larga vida útil.',
      precioUsd: 4.50,
      precioBs: Math.round(4.50 * TASA_BCV_ACTUAL),
      categoria: 'Iluminación & Electricidad',
      imagenUrl: 'https://images.unsplash.com/photo-1550524514-96855146c10b?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-002/articulos/bombillos-led-12w-pack3.jpg',
      disponible: true
    }
  ],
  billetera: DEMO_COMERCIO_FERRETERIA_BILLETERA
};

export const DEMO_COMERCIO_SUPERMERCADO_BILLETERA: ComercioBilletera = {
  comercioId: 'com-003',
  saldoUsd: 312.00,
  saldoBs: Math.round(312.00 * TASA_BCV_ACTUAL * 100) / 100,
  totalVentasUsd: 820.00,
  totalRetiradoUsd: 508.00,
  historialTransacciones: [
    {
      id: 'tx-com-sup-001',
      comercioId: 'com-003',
      tipo: 'pago_pedido_cartera',
      montoUsd: 32.50,
      montoBs: Math.round(32.50 * TASA_BCV_ACTUAL * 100) / 100,
      saldoResultanteUsd: 312.00,
      pedidoId: 'ped-7890',
      codigoSeguimiento: 'VIX-7890',
      descripcion: 'Compra víveres canasta básica - Pagado con Cartera',
      metodoPago: 'saldo_cartera',
      fecha: '2026-09-02 12:10:00',
      estado: 'acreditado'
    }
  ]
};

export const DEMO_COMERCIO_SUPERMERCADO: Comercio = {
  id: 'com-003',
  nombre: 'Supermercado San Agustín Express',
  categoria: 'Supermercado, Víveres & Minimarket',
  categoriaPrincipal: 'supermercados',
  rubroPersonalizado: '',
  categoriasCatalogo: ['Víveres & Granos', 'Lácteos & Quesos', 'Aceites & Condimentos', 'Café & Desayuno', 'Limpieza del Hogar'],
  rif: 'J-29841029-3',
  direccion: 'Av. Libertador, Edif. Galerías del Ávila, Local PB, Caracas',
  telefono: '+58 212 761 9900',
  email: 'pedidos@sanagustinexpress.com',
  logoUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=150&auto=format&fit=crop&q=80',
  portadaUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
  calificacion: 4.7,
  totalCalificaciones: 215,
  horarios: 'Lunes a Domingo: 7:30 AM - 9:00 PM',
  diasApertura: 'Todos los días',
  horaApertura: '07:30',
  horaCierre: '21:00',
  diasOperacion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  activo: true,
  resenasComercio: [
    {
      id: 'res-sup-1',
      clienteNombre: 'Gladys Romero',
      calificacion: 5,
      comentario: 'Llegan siempre todos los productos sellados y frescos. El queso paisa excelente.',
      fecha: '2026-09-01'
    },
    {
      id: 'res-sup-2',
      clienteNombre: 'Armando Díaz',
      calificacion: 4,
      comentario: 'Buenos precios a tasa oficial BCV sin sorpresas en el total.',
      fecha: '2026-08-29'
    }
  ],
  tiempoEstimadoMin: 20,
  tiempoEstimadoMax: 40,
  costoEnvioUsd: 2.00,
  abierto: true,
  lat: 10.4980,
  lng: -66.8650,
  metodosPago: {
    pagoMovil: {
      activo: true,
      banco: 'Mercantil (0105)',
      telefono: '0412-5566778',
      cedula: 'J-29841029-3'
    },
    zelle: {
      activo: true,
      email: 'sanagustin.zelle@express.com',
      titular: 'San Agustín Express Supermarket'
    },
    zinli: {
      activo: true,
      email: 'zinli@sanagustinexpress.com',
      titular: 'San Agustín Express'
    },
    binance: {
      activo: true,
      payId: '31892011',
      nickname: 'SanAgustin_Super'
    },
    paypal: {
      activo: false,
      email: '',
      instrucciones: ''
    },
    efectivo: {
      activo: true,
      aceptaBs: true,
      aceptaUsd: true,
      instrucciones: 'Efectivo en mano al motorizado.'
    },
    efectivoUsd: {
      activo: true,
      instrucciones: 'Billetes limpios sin enmiendas.'
    }
  },
  productos: [
    {
      id: 'sup-1',
      nombre: 'Harina de Maíz Blanco P.A.N. 1kg',
      descripcion: 'La tradicional harina precocida de maíz blanco para arepas venezolanas.',
      precioUsd: 1.35,
      precioBs: Math.round(1.35 * TASA_BCV_ACTUAL),
      categoria: 'Víveres & Granos',
      imagenUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-003/articulos/harina-pan-1kg.jpg',
      disponible: true
    },
    {
      id: 'sup-2',
      nombre: 'Arroz Blanco Primor Clásico Grano Entero 1kg',
      descripcion: 'Arroz blanco seleccionado enriquecido con vitaminas y minerales.',
      precioUsd: 1.45,
      precioBs: Math.round(1.45 * TASA_BCV_ACTUAL),
      categoria: 'Víveres & Granos',
      imagenUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-003/articulos/arroz-primor-1kg.jpg',
      disponible: true
    },
    {
      id: 'sup-3',
      nombre: 'Aceite Vegetal Comestible Mazeite 1 Litro',
      descripcion: 'Puro aceite vegetal de maíz refinado, libre de grasas trans.',
      precioUsd: 3.60,
      precioBs: Math.round(3.60 * TASA_BCV_ACTUAL),
      categoria: 'Aceites & Condimentos',
      imagenUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-003/articulos/aceite-mazeite-1l.jpg',
      disponible: true
    },
    {
      id: 'sup-4',
      nombre: 'Queso Paisa Rebanado Pasteurizado 400g',
      descripcion: 'El auténtico queso pasteurizado blanco rebanado, textura cremosa.',
      precioUsd: 4.20,
      precioBs: Math.round(4.20 * TASA_BCV_ACTUAL),
      categoria: 'Lácteos & Quesos',
      imagenUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-003/articulos/queso-paisa-400g.jpg',
      disponible: true
    },
    {
      id: 'sup-5',
      nombre: 'Café Molido San Antonio Tradicional 250g',
      descripcion: 'Café tostado y molido 100% arábica venezolano aroma intenso.',
      precioUsd: 2.80,
      precioBs: Math.round(2.80 * TASA_BCV_ACTUAL),
      categoria: 'Café & Desayuno',
      imagenUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-003/articulos/cafe-san-antonio-250g.jpg',
      disponible: true
    },
    {
      id: 'sup-6',
      nombre: 'Pasta Larga Spaghetti Primor 1kg',
      descripcion: 'Elaborada con sémola de trigo durum de alta consistencia al dente.',
      precioUsd: 1.60,
      precioBs: Math.round(1.60 * TASA_BCV_ACTUAL),
      categoria: 'Víveres & Granos',
      imagenUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80',
      imagenPath: '/uploads/comercios/com-003/articulos/spaghetti-primor-1kg.jpg',
      disponible: true
    }
  ],
  billetera: DEMO_COMERCIO_SUPERMERCADO_BILLETERA
};

export const DEMO_COMERCIO_HOGAR: Comercio = {
  id: 'com-004',
  nombre: 'Hogar Decora & Confort Caracas',
  categoria: 'Hogar, Decoración & Muebles',
  categoriaPrincipal: 'hogar',
  rubroPersonalizado: 'Decoración, Blancos y Hogar',
  categoriasCatalogo: ['Dormitorio & Blancos', 'Iluminación & Lámparas', 'Aromas & Confort', 'Cocina & Organización'],
  rif: 'J-41209384-2',
  direccion: 'Centro Comercial Tolón Fashion Mall, Piso 2, Las Mercedes, Caracas',
  telefono: '+58 212 993 1122',
  email: 'atencion@hogardecora.com.ve',
  logoUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=150&auto=format&fit=crop&q=80',
  portadaUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
  calificacion: 4.9,
  totalCalificaciones: 64,
  horarios: 'Lunes a Sábado: 9:00 AM - 7:00 PM',
  diasApertura: 'Lun - Sáb',
  horaApertura: '09:00',
  horaCierre: '19:00',
  diasOperacion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  activo: true,
  tiempoEstimadoMin: 35,
  tiempoEstimadoMax: 55,
  costoEnvioUsd: 3.50,
  abierto: true,
  lat: 10.4780,
  lng: -66.8620,
  metodosPago: {
    pagoMovil: {
      activo: true,
      banco: 'Banco Mercantil (0105)',
      telefono: '0414-9920199',
      cedula: 'J-41209384-2',
      instrucciones: 'Enviar comprobante digital para despacho inmediato.'
    },
    zelle: {
      activo: true,
      email: 'pagos@hogardecora.com.ve',
      titular: 'Hogar Decora & Confort C.A.',
      instrucciones: 'Indicar nombre de quien envía y número de pedido.'
    },
    zinli: { activo: false, email: '', titular: '', instrucciones: '' },
    binancePay: { activo: false, payId: '', nickname: '', instrucciones: '' },
    wally: { activo: false, email: '', instrucciones: '' },
    efectivo: {
      activo: true,
      aceptaBs: true,
      aceptaUsd: true,
      instrucciones: 'Efectivo en mano al momento de la entrega.'
    },
    efectivoUsd: {
      activo: true,
      instrucciones: 'Billetes en buen estado sin tachaduras.'
    }
  },
  productos: [
    {
      id: 'hog-1',
      nombre: 'Juego de Sábanas 400 Hilos Algodón Queen',
      descripcion: 'Suavidad premium, incluye sábana bajera ajustable, encimera y 2 fundas.',
      precioUsd: 24.00,
      precioBs: Math.round(24.00 * TASA_BCV_ACTUAL),
      categoria: 'Dormitorio & Blancos',
      imagenUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&auto=format&fit=crop&q=80',
      disponible: true
    },
    {
      id: 'hog-2',
      nombre: 'Lámpara de Mesa Nórdica LED Regulable',
      descripcion: 'Base de madera natural con pantalla textil y 3 intensidades de luz cálida.',
      precioUsd: 18.50,
      precioBs: Math.round(18.50 * TASA_BCV_ACTUAL),
      categoria: 'Iluminación & Lámparas',
      imagenUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&auto=format&fit=crop&q=80',
      disponible: true
    },
    {
      id: 'hog-3',
      nombre: 'Difusor Ultrasónico de Aromas con Luces LED',
      descripcion: 'Capacidad 300ml, silencioso, incluye temporizador y apagado automático.',
      precioUsd: 14.00,
      precioBs: Math.round(14.00 * TASA_BCV_ACTUAL),
      categoria: 'Aromas & Confort',
      imagenUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&auto=format&fit=crop&q=80',
      disponible: true
    },
    {
      id: 'hog-4',
      nombre: 'Set de 2 Cojines Decorativos Terciopelo',
      descripcion: 'Textura suave al tacto con relleno antialérgico, 45x45 cm.',
      precioUsd: 16.00,
      precioBs: Math.round(16.00 * TASA_BCV_ACTUAL),
      categoria: 'Dormitorio & Blancos',
      imagenUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&auto=format&fit=crop&q=80',
      disponible: true
    },
    {
      id: 'hog-5',
      nombre: 'Organizador Giratorio Multiuso de Cocina',
      descripcion: 'Bandeja giratoria 360° antideslizante para especias y alacena.',
      precioUsd: 9.50,
      precioBs: Math.round(9.50 * TASA_BCV_ACTUAL),
      categoria: 'Cocina & Organización',
      imagenUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&auto=format&fit=crop&q=80',
      disponible: true
    }
  ]
};

export const DEMO_COMERCIO_RESTAURANTE: Comercio = {
  id: 'com-005',
  nombre: 'Restaurante Doña Bárbara Criollo & Grill',
  categoria: 'Restaurante Típico, Carnes & Asados',
  categoriaPrincipal: 'restaurantes',
  rubroPersonalizado: 'Comida Criolla y Carnes',
  categoriasCatalogo: ['Platos Tradicionales', 'Carnes al Carbón', 'Cachapas & Arepas', 'Sopas & Entradas'],
  rif: 'J-30948572-6',
  direccion: 'Av. Principal de Las Mercedes, Qta. Doña Bárbara, Caracas',
  telefono: '+58 212 991 5566',
  email: 'reservas@donabarbararest.com',
  logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
  portadaUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
  calificacion: 4.9,
  totalCalificaciones: 310,
  horarios: 'Martes a Domingo: 12:00 PM - 10:30 PM',
  diasApertura: 'Mar - Dom',
  horaApertura: '12:00',
  horaCierre: '22:30',
  diasOperacion: ['Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  activo: true,
  tiempoEstimadoMin: 30,
  tiempoEstimadoMax: 50,
  costoEnvioUsd: 2.80,
  abierto: true,
  lat: 10.4795,
  lng: -66.8645,
  metodosPago: {
    pagoMovil: {
      activo: true,
      banco: 'Banco Banesco (0134)',
      telefono: '0424-2219900',
      cedula: 'J-30948572-6',
      instrucciones: 'Anotar código de confirmación del pedido.'
    },
    zelle: {
      activo: true,
      email: 'donabarbara.ccs@gmail.com',
      titular: 'Restaurante Doña Bárbara Grill LLC',
      instrucciones: 'Zelle en dólares sin cargo adicional.'
    },
    zinli: { activo: false, email: '', titular: '', instrucciones: '' },
    binancePay: { activo: false, payId: '', nickname: '', instrucciones: '' },
    wally: { activo: false, email: '', instrucciones: '' },
    efectivo: {
      activo: true,
      aceptaBs: true,
      aceptaUsd: true,
      instrucciones: 'Pago en mano al motorizado con vuelto garantizado.'
    },
    efectivoUsd: {
      activo: true,
      instrucciones: 'Billetes limpios sin tachaduras.'
    }
  },
  productos: [
    {
      id: 'res-1',
      nombre: 'Pabellón Criollo Especial Doña Bárbara',
      descripcion: 'Carne mechada jugosa, caraotas negras refritas, arroz blanco, tajadas maduras y queso blanco rallado.',
      precioUsd: 11.50,
      precioBs: Math.round(11.50 * TASA_BCV_ACTUAL),
      categoria: 'Platos Tradicionales',
      imagenUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
      disponible: true
    },
    {
      id: 'res-2',
      nombre: 'Punta Trasera Angus al Carbón 350g',
      descripcion: 'Corte madurado a la brasa con guasacaca criolla, yuca al vapor y hallaquitas de maíz.',
      precioUsd: 16.00,
      precioBs: Math.round(16.00 * TASA_BCV_ACTUAL),
      categoria: 'Carnes al Carbón',
      imagenUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&auto=format&fit=crop&q=80',
      disponible: true
    },
    {
      id: 'res-3',
      nombre: 'Asado Negro Caraqueño con Puré de Papas',
      descripcion: 'Muchacho redondo caramelizado en papelón especiado y vino tinto de receta familiar.',
      precioUsd: 13.00,
      precioBs: Math.round(13.00 * TASA_BCV_ACTUAL),
      categoria: 'Platos Tradicionales',
      imagenUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
      disponible: true
    },
    {
      id: 'res-4',
      nombre: 'Cachapa con Doble Queso Telita y Pernil',
      descripcion: 'Masa 100% de jojoto tierno con queso telita guayanés y pernil horneado jugoso.',
      precioUsd: 9.50,
      precioBs: Math.round(9.50 * TASA_BCV_ACTUAL),
      categoria: 'Cachapas & Arepas',
      imagenUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&auto=format&fit=crop&q=80',
      disponible: true
    },
    {
      id: 'res-5',
      nombre: 'Hervido de Res Criollo en Olla de Barro',
      descripcion: 'Sopa reconstituyente con costilla de res tierna, verduras del campo, jojoto y cilantro.',
      precioUsd: 8.50,
      precioBs: Math.round(8.50 * TASA_BCV_ACTUAL),
      categoria: 'Sopas & Entradas',
      imagenUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&auto=format&fit=crop&q=80',
      disponible: true
    }
  ]
};

export const ALL_DEMO_COMERCIOS: Comercio[] = [
  DEMO_COMERCIO,
  DEMO_COMERCIO_FERRETERIA,
  DEMO_COMERCIO_SUPERMERCADO,
  DEMO_COMERCIO_HOGAR,
  DEMO_COMERCIO_RESTAURANTE
];

export const INITIAL_ORDERS: Pedido[] = [
  {
    id: 'ped-8043',
    codigoSeguimiento: 'VIX-8043',
    cliente: {
      id: 'cli-003',
      nombre: 'Elena',
      apellido: 'Gómez',
      cedula: 'V-24.891.204',
      telefono: '+58 414 332 9918',
      email: 'elena.gomez@gmail.com',
      direccion: 'Av. Luis Roche, Res. Altamira Suites, Apto 5-B, Chacao',
      puntoReferencia: 'A 50 metros de la Plaza Francia de Altamira',
      lat: 10.4990,
      lng: -66.8480,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    },
    comercio: DEMO_COMERCIO,
    conductor: undefined,
    items: [
      {
        productoId: 'prod-2',
        nombre: 'Crispy Chicken Supreme',
        cantidad: 1,
        precioUnitarioUsd: 7.00,
        subtotalUsd: 7.00
      },
      {
        productoId: 'prod-4',
        nombre: 'Tequeños Tradicionales (6 unidades)',
        cantidad: 1,
        precioUnitarioUsd: 4.00,
        subtotalUsd: 4.00
      },
      {
        productoId: 'prod-5',
        nombre: 'Refresco Coca-Cola 355ml',
        cantidad: 2,
        precioUnitarioUsd: 1.50,
        subtotalUsd: 3.00
      }
    ],
    montoSubtotalUsd: 14.00,
    costoEnvioUsd: 2.50,
    montoTotalUsd: 16.50,
    tasaBcvBs: TASA_BCV_ACTUAL,
    montoTotalBs: 16.50 * TASA_BCV_ACTUAL,
    metodoPagoSeleccionado: 'saldo_cartera',
    referenciaPago: 'WALLET-VIXY-8043',
    comprobantePagoUrl: '/uploads/comprobantes_pago/recibos/debito_cli_003_VIX-8043.jpg',
    notificacionMetodoPago: {
      tipo: 'wallet',
      metodo: 'saldo_cartera',
      descripcion: 'Cartera Vixy prepagada',
      referencia: 'WALLET-VIXY-8043',
      instruccionMotorizado: '✅ Cartera Vixy YA PAGADO - NO COBRAR en puerta al cliente.',
      instruccionComercio: '💳 Saldo de $14.00 USD acreditado automáticamente en tu Cartera Comercial.'
    },
    estado: 'pendiente_pago',
    creadoEn: '2026-09-03 11:48:00',
    actualizadoEn: '2026-09-03 11:48:00',
    tiempoEstimadoRestanteSegundos: 1800,
    historialOperaciones: [
      {
        id: 'hist-8043-1',
        estado: 'pendiente_pago',
        descripcion: 'Cliente Elena Gómez envió la solicitud de pedido con Cartera Vixy. En espera de aceptación por el comercio.',
        actor: 'cliente',
        timestamp: '11:48:00'
      }
    ]
  },
  {
    id: 'ped-8042',
    codigoSeguimiento: 'VIX-8042',
    cliente: DEMO_CLIENTE,
    comercio: DEMO_COMERCIO,
    conductor: DEMO_CONDUCTOR,
    items: [
      {
        productoId: 'prod-1',
        nombre: 'Vixy Burger Doble Carne',
        cantidad: 1,
        precioUnitarioUsd: 8.50,
        subtotalUsd: 8.50
      },
      {
        productoId: 'prod-3',
        nombre: 'Papas Rústicas con Trufa & Parmesano',
        cantidad: 1,
        precioUnitarioUsd: 3.50,
        subtotalUsd: 3.50
      },
      {
        productoId: 'prod-5',
        nombre: 'Refresco Coca-Cola 355ml',
        cantidad: 1,
        precioUnitarioUsd: 1.50,
        subtotalUsd: 1.50
      }
    ],
    montoSubtotalUsd: 13.50,
    costoEnvioUsd: 2.50,
    montoTotalUsd: 16.00,
    tasaBcvBs: TASA_BCV_ACTUAL,
    montoTotalBs: 16.00 * TASA_BCV_ACTUAL,
    metodoPagoSeleccionado: 'pago_movil',
    referenciaPago: 'REF-0102-8839201',
    comprobantePagoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
    estado: 'en_camino_al_cliente',
    creadoEn: '2026-09-02 16:15:20',
    actualizadoEn: '2026-09-02 16:32:00',
    tiempoEstimadoRestanteSegundos: 540, // 9 minutos restantes
    metricasTiempo: {
      tiempoDespachoComercioMin: 14, // Tomó 14 min empaquetar y verificar
      tiempoEntregaMotorizadoMin: 9,  // 9 min en trayecto actual
      distanciaKm: 4.2, // Distancia desde Burger House (Los Palos Grandes) hasta Chacao
      estimadoDespachoMin: 15,
      estimadoEntregaMin: 12
    },
    historialOperaciones: [
      {
        id: 'hist-1',
        estado: 'pendiente_pago',
        descripcion: 'Cliente Carlos Mendoza realizó el pedido y adjuntó referencia Pago Móvil #8839201.',
        actor: 'cliente',
        timestamp: '16:15:20'
      },
      {
        id: 'hist-2',
        estado: 'pago_verificado',
        descripcion: 'Comercio Burger House verificó la acreditación en Banco de Venezuela.',
        actor: 'comercio',
        timestamp: '16:17:05'
      },
      {
        id: 'hist-3',
        estado: 'en_preparacion',
        descripcion: 'Comercio inició preparación de los alimentos en cocina.',
        actor: 'comercio',
        timestamp: '16:17:40'
      },
      {
        id: 'hist-4',
        estado: 'esperando_repartidor',
        descripcion: 'Sistema asignó al motorizado Yeferson Ramírez (Empire Keeway Horse 150, Placa AA1B23C).',
        actor: 'sistema',
        timestamp: '16:22:15'
      },
      {
        id: 'hist-5',
        estado: 'en_camino_al_comercio',
        descripcion: 'Motorizado Yeferson Ramírez aceptó el viaje y se trasladó al local comercial.',
        actor: 'conductor',
        timestamp: '16:23:00'
      },
      {
        id: 'hist-6',
        estado: 'en_camino_al_cliente',
        descripcion: 'Comercio entregó el paquete sellado al motorizado Yeferson Ramírez. Motorizado en ruta al cliente.',
        actor: 'conductor',
        timestamp: '16:32:00'
      }
    ],
    fotoVerificacion: undefined
  },
  {
    id: 'ped-8041',
    codigoSeguimiento: 'VIX-8041',
    cliente: {
      ...DEMO_CLIENTE,
      id: 'cli-002',
      nombre: 'Mariana',
      apellido: 'Pérez',
      direccion: 'Urb. Los Palos Grandes, 4ta Av., Res. Ávila, Apto 3B'
    },
    comercio: DEMO_COMERCIO,
    conductor: DEMO_CONDUCTOR,
    items: [
      {
        productoId: 'prod-2',
        nombre: 'Crispy Chicken Supreme',
        cantidad: 2,
        precioUnitarioUsd: 7.00,
        subtotalUsd: 14.00
      }
    ],
    montoSubtotalUsd: 14.00,
    costoEnvioUsd: 2.50,
    montoTotalUsd: 16.50,
    tasaBcvBs: TASA_BCV_ACTUAL,
    montoTotalBs: 16.50 * TASA_BCV_ACTUAL,
    metodoPagoSeleccionado: 'zelle',
    referenciaPago: 'ZELLE-MARIANA-P-992',
    estado: 'entregado',
    creadoEn: '2026-09-02 15:02:10',
    actualizadoEn: '2026-09-02 15:35:40',
    tiempoEstimadoRestanteSegundos: 0,
    metricasTiempo: {
      tiempoDespachoComercioMin: 18, // Despacho en cocina y empaque térmico: 18 min
      tiempoEntregaMotorizadoMin: 13, // Traslado motorizado hasta Los Palos Grandes: 13 min
      distanciaKm: 2.8, // 2.8 km (dentro de los 3 km base)
      estimadoDespachoMin: 20,
      estimadoEntregaMin: 15
    },
    historialOperaciones: [
      {
        id: 'hist-8041-1',
        estado: 'pendiente_pago',
        descripcion: 'Pedido ingresado por Mariana Pérez.',
        actor: 'cliente',
        timestamp: '15:02:10'
      },
      {
        id: 'hist-8041-2',
        estado: 'pago_verificado',
        descripcion: 'Pago por Zelle conciliado correctamente.',
        actor: 'comercio',
        timestamp: '15:04:30'
      },
      {
        id: 'hist-8041-3',
        estado: 'en_camino_al_cliente',
        descripcion: 'Motorizado en trayecto de entrega.',
        actor: 'conductor',
        timestamp: '15:22:00'
      },
      {
        id: 'hist-8041-4',
        estado: 'entregado',
        descripcion: 'Pedido entregado en puerta del edificio con comprobante fotográfico subido a la galería.',
        actor: 'conductor',
        timestamp: '15:35:40'
      }
    ],
    fotoVerificacion: {
      id: 'foto-8041',
      pedidoId: 'ped-8041',
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
      fecha: '2026-09-02 15:35:38',
      conductorId: 'cond-001',
      conductorNombre: 'Yeferson Ramírez',
      clienteNombre: 'Mariana Pérez',
      coordenadas: '10.4981° N, 66.8445° W (Los Palos Grandes)',
      comentario: 'Entregado a la cliente en mano en lobby de Res. Ávila.'
    },
    calificacionCliente: {
      estrellas: 5,
      comentario: 'Súper rápido y muy atento con el empaque.'
    }
  },
  {
    id: 'ped-8043',
    codigoSeguimiento: 'VIX-8043',
    cliente: {
      ...DEMO_CLIENTE,
      id: 'cli-003',
      nombre: 'Valentina',
      apellido: 'Silva',
      telefono: '0414-2983112',
      direccion: 'Av. Francisco de Miranda, Edif. Parque Cristal, Torre Este, Piso 7, Ofic. 7-B',
      puntoReferencia: 'Frente a Parque del Este / Estación Metro Miranda'
    },
    comercio: DEMO_COMERCIO,
    conductor: undefined,
    items: [
      {
        productoId: 'prod-1',
        nombre: 'Vixy Burger Doble Carne',
        cantidad: 1,
        precioUnitarioUsd: 8.50,
        subtotalUsd: 8.50
      },
      {
        productoId: 'prod-3',
        nombre: 'Papas Rústicas con Trufa & Parmesano',
        cantidad: 1,
        precioUnitarioUsd: 3.50,
        subtotalUsd: 3.50
      }
    ],
    montoSubtotalUsd: 12.00,
    costoEnvioUsd: 2.35,
    montoTotalUsd: 14.35,
    tasaBcvBs: TASA_BCV_ACTUAL,
    montoTotalBs: 14.35 * TASA_BCV_ACTUAL,
    metodoPagoSeleccionado: 'pago_movil',
    referenciaPago: 'REF-BCO-994821',
    comprobantePagoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
    estado: 'esperando_repartidor',
    creadoEn: '2026-09-02 16:45:10',
    actualizadoEn: '2026-09-02 16:55:00',
    tiempoEstimadoRestanteSegundos: 1200,
    esPedidoTienda: false,
    metricasTiempo: {
      tiempoDespachoComercioMin: 10,
      tiempoEntregaMotorizadoMin: 12,
      distanciaKm: 3.2,
      estimadoDespachoMin: 10,
      estimadoEntregaMin: 12
    },
    historialOperaciones: [
      {
        id: 'hist-8043-1',
        estado: 'pendiente_pago',
        descripcion: 'Cliente Valentina Silva realizó pedido por Vixy App.',
        actor: 'cliente',
        timestamp: '16:45:10'
      },
      {
        id: 'hist-8043-2',
        estado: 'en_preparacion',
        descripcion: 'Burger House verificó pago móvil y preparó la orden en cocina.',
        actor: 'comercio',
        timestamp: '16:47:00'
      },
      {
        id: 'hist-8043-3',
        estado: 'esperando_repartidor',
        descripcion: 'Comercio empaquetó el pedido. Disponible para aceptación de motorizado en zona Los Palos Grandes.',
        actor: 'comercio',
        timestamp: '16:55:00'
      }
    ]
  },
  {
    id: 'ped-8044',
    codigoSeguimiento: 'TIEN-4910',
    cliente: {
      ...DEMO_CLIENTE,
      id: 'cli-tienda-4910',
      nombre: 'Ignacio Delgado',
      apellido: '(Cliente Directo Tienda)',
      telefono: '0412-9841203',
      direccion: 'Calle París con Av. Principal de Las Mercedes, Qta. Mónaco, Apto 2-A',
      puntoReferencia: 'Frente a Pastelería Danubio, portón negro'
    },
    comercio: DEMO_COMERCIO,
    conductor: undefined,
    items: [
      {
        productoId: 'prod-1',
        nombre: 'Vixy Burger Doble Carne',
        cantidad: 2,
        precioUnitarioUsd: 8.50,
        subtotalUsd: 17.00
      },
      {
        productoId: 'prod-4',
        nombre: 'Tequeños Tradicionales (6 unidades)',
        cantidad: 1,
        precioUnitarioUsd: 4.00,
        subtotalUsd: 4.00
      }
    ],
    montoSubtotalUsd: 21.00,
    costoEnvioUsd: 2.70,
    montoTotalUsd: 23.70,
    tasaBcvBs: TASA_BCV_ACTUAL,
    montoTotalBs: 23.70 * TASA_BCV_ACTUAL,
    metodoPagoSeleccionado: 'efectivo_usd',
    referenciaPago: 'COBRO-DIRECTO-TIENDA-EFECTIVO',
    comprobantePagoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
    estado: 'esperando_repartidor',
    creadoEn: '2026-09-02 17:00:25',
    actualizadoEn: '2026-09-02 17:05:00',
    tiempoEstimadoRestanteSegundos: 1400,
    esPedidoTienda: true,
    origenPedido: 'tienda_independiente',
    detallesEntregaTienda: {
      ubicacionEscrita: 'Calle París con Av. Principal de Las Mercedes, Qta. Mónaco, Apto 2-A',
      puntoReferencia: 'Frente a Pastelería Danubio, portón negro',
      zonaMunicipio: 'Baruta / Las Mercedes',
      contactoCliente: 'Ignacio Delgado',
      telefonoCliente: '0412-9841203',
      notasComercio: 'Pedido solicitado por teléfono en tienda. Cliente paga $25 en efectivo divisa (llevar $1.30 de cambio).'
    },
    metricasTiempo: {
      tiempoDespachoComercioMin: 5,
      tiempoEntregaMotorizadoMin: 15,
      distanciaKm: 4.2,
      estimadoDespachoMin: 8,
      estimadoEntregaMin: 18
    },
    historialOperaciones: [
      {
        id: 'hist-8044-1',
        estado: 'esperando_repartidor',
        descripcion: 'Burger House registró pedido directo de tienda y solicitó motorizado a Vixy Delivery.',
        actor: 'comercio',
        timestamp: '17:05:00'
      }
    ],
    solicitadoPor: 'comercio'
  },
  {
    id: 'ped-8045',
    codigoSeguimiento: 'TIEN-5201',
    cliente: {
      id: 'cli-tienda-5201',
      nombre: 'Mauricio',
      apellido: 'Vallenilla (Arq.)',
      cedula: 'V-16.482.901',
      telefono: '+58 414 901 8822',
      email: 'm.vallenilla@estudioarq.ve',
      direccion: 'Av. Eugenio Mendoza, Res. La Floresta, Torre B, Piso 4, Chacao',
      puntoReferencia: 'A media cuadra de la Plaza La Floresta',
      lat: 10.4950,
      lng: -66.8430,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    comercio: DEMO_COMERCIO_FERRETERIA,
    conductor: DEMO_CONDUCTOR,
    items: [
      {
        productoId: 'ferr-1',
        nombre: 'Taladro Percutor Inalámbrico 20V Brushless',
        cantidad: 1,
        precioUnitarioUsd: 85.00,
        subtotalUsd: 85.00
      },
      {
        productoId: 'ferr-5',
        nombre: 'Set de Brocas para Concreto y Metal (10 piezas)',
        cantidad: 1,
        precioUnitarioUsd: 14.50,
        subtotalUsd: 14.50
      }
    ],
    montoSubtotalUsd: 99.50,
    costoEnvioUsd: 3.80,
    montoTotalUsd: 103.30,
    tasaBcvBs: TASA_BCV_ACTUAL,
    montoTotalBs: 103.30 * TASA_BCV_ACTUAL,
    metodoPagoSeleccionado: 'transferencia_bancaria',
    referenciaPago: 'PAGO-BANESCO-FERRE-00982',
    comprobantePagoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
    estado: 'en_camino_al_cliente',
    creadoEn: '2026-09-02 16:10:00',
    actualizadoEn: '2026-09-02 16:35:00',
    tiempoEstimadoRestanteSegundos: 480,
    esPedidoTienda: true,
    origenPedido: 'tienda_independiente',
    solicitadoPor: 'comercio',
    detallesEntregaTienda: {
      ubicacionEscrita: 'Av. Eugenio Mendoza, Res. La Floresta, Torre B, Piso 4, Chacao',
      puntoReferencia: 'A media cuadra de la Plaza La Floresta',
      zonaMunicipio: 'Chacao',
      contactoCliente: 'Arq. Mauricio Vallenilla',
      telefonoCliente: '+58 414 901 8822',
      notasComercio: 'Mercancía en caja sellada con precinto de seguridad FerreCaracas. Factura comercial dentro del sobre transparente frontal.',
      modalidadCobro: 'ya_pagado_al_comercio',
      contactoRetiroComercio: 'Ángel Gómez (Despacho Mostrador)',
      telefonoRetiroComercio: '+58 212 263 8811'
    },
    metricasTiempo: {
      tiempoDespachoComercioMin: 12,
      tiempoEntregaMotorizadoMin: 11,
      distanciaKm: 3.8,
      estimadoDespachoMin: 15,
      estimadoEntregaMin: 14
    },
    historialOperaciones: [
      {
        id: 'hist-5201-1',
        estado: 'esperando_repartidor',
        descripcion: 'Ferretería Industrial FerreCaracas registró orden B2B y solicitó motorizado de carga segura.',
        actor: 'comercio',
        timestamp: '16:10:00'
      },
      {
        id: 'hist-5201-2',
        estado: 'en_camino_al_comercio',
        descripcion: 'Motorizado Yeferson Ramírez aceptó el despacho ferretero y acudió al mostrador.',
        actor: 'conductor',
        timestamp: '16:15:30'
      },
      {
        id: 'hist-5201-3',
        estado: 'en_camino_al_cliente',
        descripcion: 'Paquete de herramientas verificado y sellado. Motorizado en trayecto hacia La Floresta, Chacao.',
        actor: 'conductor',
        timestamp: '16:30:00'
      }
    ]
  },
  {
    id: 'ped-8046',
    codigoSeguimiento: 'TIEN-6340',
    cliente: {
      id: 'cli-tienda-6340',
      nombre: 'Carmen',
      apellido: 'Zambrano (Dra.)',
      cedula: 'V-12.983.401',
      telefono: '+58 412 882 1099',
      email: 'carmen.zambrano@salud.ve',
      direccion: 'Av. Venezuela con Calle Mohedano, Torre Rosal Plaza, Apto 8-C, El Rosal',
      puntoReferencia: 'Torre frente a Banco Banesco, timbre 8-C',
      lat: 10.4910,
      lng: -66.8650,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    comercio: DEMO_COMERCIO_SUPERMERCADO,
    conductor: DEMO_CONDUCTOR,
    items: [
      {
        productoId: 'sup-1',
        nombre: 'Harina de Maíz Blanco Precocida P.A.N. 1kg',
        cantidad: 3,
        precioUnitarioUsd: 1.40,
        subtotalUsd: 4.20
      },
      {
        productoId: 'sup-4',
        nombre: 'Queso Paisa Rebanado Pasteurizado 400g',
        cantidad: 2,
        precioUnitarioUsd: 4.20,
        subtotalUsd: 8.40
      },
      {
        productoId: 'sup-5',
        nombre: 'Café Molido San Antonio Tradicional 250g',
        cantidad: 2,
        precioUnitarioUsd: 2.80,
        subtotalUsd: 5.60
      },
      {
        productoId: 'sup-3',
        nombre: 'Aceite Vegetal Comestible Mazeite 1 Litro',
        cantidad: 1,
        precioUnitarioUsd: 3.60,
        subtotalUsd: 3.60
      }
    ],
    montoSubtotalUsd: 21.80,
    costoEnvioUsd: 2.90,
    montoTotalUsd: 24.70,
    tasaBcvBs: TASA_BCV_ACTUAL,
    montoTotalBs: 24.70 * TASA_BCV_ACTUAL,
    metodoPagoSeleccionado: 'pago_movil',
    referenciaPago: 'PAGOMOVIL-MERCANTIL-77821',
    comprobantePagoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
    estado: 'entregado',
    creadoEn: '2026-09-02 14:20:00',
    actualizadoEn: '2026-09-02 15:05:00',
    tiempoEstimadoRestanteSegundos: 0,
    esPedidoTienda: true,
    origenPedido: 'tienda_independiente',
    solicitadoPor: 'comercio',
    detallesEntregaTienda: {
      ubicacionEscrita: 'Av. Venezuela con Calle Mohedano, Torre Rosal Plaza, Apto 8-C, El Rosal',
      puntoReferencia: 'Torre frente a Banco Banesco, timbre 8-C',
      zonaMunicipio: 'Chacao / El Rosal',
      contactoCliente: 'Dra. Carmen Zambrano',
      telefonoCliente: '+58 412 882 1099',
      notasComercio: 'Víveres empacados en bolsas biodegradables rotuladas. Artículos lácteos refrigerados en bolsa térmica.',
      modalidadCobro: 'ya_pagado_al_comercio',
      contactoRetiroComercio: 'Caja Rápida Despacho Gourmet',
      telefonoRetiroComercio: '+58 212 951 0022'
    },
    metricasTiempo: {
      tiempoDespachoComercioMin: 15,
      tiempoEntregaMotorizadoMin: 14,
      distanciaKm: 3.1,
      estimadoDespachoMin: 15,
      estimadoEntregaMin: 15
    },
    historialOperaciones: [
      {
        id: 'hist-6340-1',
        estado: 'esperando_repartidor',
        descripcion: 'Supermercado Central Gourmet solicitó delivery de víveres a domicilio.',
        actor: 'comercio',
        timestamp: '14:20:00'
      },
      {
        id: 'hist-6340-2',
        estado: 'en_camino_al_comercio',
        descripcion: 'Conductor Luis García (Yamaha DT, AG-5511) aceptó el viaje y llegó al supermercado.',
        actor: 'conductor',
        timestamp: '14:25:00'
      },
      {
        id: 'hist-6340-3',
        estado: 'en_camino_al_cliente',
        descripcion: 'Víveres retirados en mostrador. En trayecto hacia Torre Rosal Plaza.',
        actor: 'conductor',
        timestamp: '14:42:00'
      },
      {
        id: 'hist-6340-4',
        estado: 'entregado',
        descripcion: 'Entrega finalizada en puerta 8-C. Cliente recibió y firmó conformidad.',
        actor: 'conductor',
        timestamp: '15:05:00'
      }
    ],
    fotoVerificacion: {
      id: 'foto-6340',
      pedidoId: 'ped-8046',
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
      fecha: '2026-09-02 15:04:55',
      conductorId: 'cond-002',
      conductorNombre: 'Luis García',
      clienteNombre: 'Carmen Zambrano',
      coordenadas: '10.4912° N, 66.8649° W (El Rosal, Torre Rosal Plaza)',
      comentario: 'Bolsas selladas de víveres entregadas en mano en puerta del Apto 8-C.'
    }
  }
];

export const INITIAL_INCIDENTS: Incidencia[] = [
  {
    id: 'inc-101',
    codigoIncidencia: 'INC-2026-004',
    pedidoId: 'ped-8042',
    reportadoPor: 'conductor',
    reportanteNombre: 'Yeferson Ramírez (Motorizado)',
    tipo: 'retraso',
    prioridad: 'media',
    descripcion: 'Lluvia repentina y tráfico lento en la autopista Francisco Fajardo altura Altamira. Se sumaron 5 minutos al tiempo estimado.',
    estado: 'en_revision',
    fechaCreacion: '2026-09-02 16:28:10'
  },
  {
    id: 'inc-100',
    codigoIncidencia: 'INC-2026-003',
    reportadoPor: 'cliente',
    reportanteNombre: 'Génesis Rodríguez',
    tipo: 'problema_pago',
    prioridad: 'baja',
    descripcion: 'Demora en reporte de Pago Móvil por intermitencia en el banco receptor.',
    estado: 'resuelta',
    resolucion: 'Se validó el número de referencia directamente con el extracto bancario del comercio.',
    fechaCreacion: '2026-09-02 14:10:00'
  }
];

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-vixydely',
    username: 'vixydely',
    password: '123456',
    nombre: 'Superusuario VixyDely',
    email: 'vixydely@vixy.com',
    nivelAcceso: 'super_admin',
    departamento: 'Dirección General & Root Admin',
    activo: true,
    ultimoAcceso: '2026-09-03 12:00:00',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    debeCambiarClave: false,
    fechaCambioClave: '2026-09-03',
    fechaVencimientoClave: '2026-12-02',
    diasVigenciaClave: 90,
    pestanasPermitidas: ['dashboard', 'mapa_conductores', 'mapa_flota', 'recargas', 'custodia', 'reclamos', 'pedidos', 'conductores', 'comercios', 'incidencias', 'soporte', 'verificaciones', 'pagos', 'usuarios_web', 'logs', 'backend']
  },
  {
    id: 'admin-01',
    username: 'valery.rivas',
    password: '123456',
    nombre: 'Valery Rivas',
    email: 'admin.valery@vixy.com',
    nivelAcceso: 'super_admin',
    departamento: 'Dirección General & Tecnología',
    activo: true,
    ultimoAcceso: '2026-09-02 16:38:15',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    debeCambiarClave: false,
    fechaCambioClave: '2026-09-01',
    fechaVencimientoClave: '2026-11-30',
    diasVigenciaClave: 90,
    pestanasPermitidas: ['dashboard', 'mapa_conductores', 'mapa_flota', 'recargas', 'custodia', 'reclamos', 'pedidos', 'conductores', 'comercios', 'incidencias', 'soporte', 'verificaciones', 'pagos', 'usuarios_web', 'logs', 'backend']
  },
  {
    id: 'admin-02',
    username: 'gabriel.torres',
    password: '123456',
    nombre: 'Gabriel Torres',
    email: 'operaciones@vixy.com',
    nivelAcceso: 'operador',
    departamento: 'Centro de Control y Monitoreo Logístico',
    activo: true,
    ultimoAcceso: '2026-09-02 16:34:22',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    debeCambiarClave: false,
    fechaCambioClave: '2026-09-01',
    fechaVencimientoClave: '2026-11-30',
    diasVigenciaClave: 90,
    pestanasPermitidas: ['dashboard', 'mapa_conductores', 'mapa_flota', 'recargas', 'custodia', 'reclamos', 'pedidos', 'conductores', 'comercios', 'incidencias', 'verificaciones', 'logs']
  },
  {
    id: 'admin-03',
    username: 'daniela.salazar',
    password: '123456',
    nombre: 'Daniela Salazar',
    email: 'soporte.daniela@vixy.com',
    nivelAcceso: 'soporte',
    departamento: 'Atención al Cliente y Conductor',
    activo: true,
    ultimoAcceso: '2026-09-02 16:20:05',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    debeCambiarClave: false,
    fechaCambioClave: '2026-09-01',
    fechaVencimientoClave: '2026-11-30',
    diasVigenciaClave: 90,
    pestanasPermitidas: ['dashboard', 'reclamos', 'soporte', 'incidencias', 'pedidos', 'verificaciones', 'logs']
  },
  {
    id: 'admin-04',
    username: 'marcos.benitez',
    password: '123456',
    nombre: 'Marcos Benítez',
    email: 'finanzas@vixy.com',
    nivelAcceso: 'finanzas',
    departamento: 'Tesorería y Liquidación Cambiaria',
    activo: true,
    ultimoAcceso: '2026-09-02 15:45:00',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    debeCambiarClave: false,
    fechaCambioClave: '2026-09-01',
    fechaVencimientoClave: '2026-11-30',
    diasVigenciaClave: 90,
    pestanasPermitidas: ['dashboard', 'recargas', 'custodia', 'pedidos', 'pagos', 'verificaciones', 'logs']
  }
];

export const INITIAL_BACKEND_USERS: UsuarioBackend[] = [
  {
    id: 'user-vixydely',
    username: 'vixydely',
    password: '123456',
    nombre: 'Superusuario VixyDely',
    email: 'vixydely@vixy.com',
    rol: 'super_admin',
    departamento: 'Dirección General & Root Admin',
    activo: true,
    ultimoAcceso: '2026-09-03 12:00:00',
    debeCambiarClave: false,
    fechaVencimientoClave: '2026-12-02',
    diasVigenciaClave: 90
  },
  {
    id: 'user-01',
    username: 'valery.rivas',
    password: '123456',
    nombre: 'Valery Rivas',
    email: 'admin.valery@vixy.com',
    rol: 'super_admin',
    departamento: 'Dirección General & Tecnología',
    activo: true,
    ultimoAcceso: '2026-09-02 16:38:15',
    debeCambiarClave: false,
    fechaVencimientoClave: '2026-11-30',
    diasVigenciaClave: 90
  },
  {
    id: 'user-02',
    nombre: 'Gabriel Torres',
    email: 'operaciones@vixy.com',
    rol: 'operador',
    departamento: 'Centro de Control y Monitoreo Logístico',
    activo: true,
    ultimoAcceso: '2026-09-02 16:34:22'
  },
  {
    id: 'user-03',
    nombre: 'Daniela Salazar',
    email: 'soporte.daniela@vixy.com',
    rol: 'soporte',
    departamento: 'Atención al Cliente y Conductor',
    activo: true,
    ultimoAcceso: '2026-09-02 16:20:05'
  }
];

export const INITIAL_NOTIFICATIONS: NotificacionPush[] = [
  {
    id: 'notif-1',
    destinatario: 'cliente',
    titulo: '🛵 Tu pedido está en camino',
    cuerpo: 'Yeferson Ramírez en su Empire Horse 150 (AA1B23C) ya retiró tu pedido de Burger House.',
    timestamp: '16:32',
    leida: false
  },
  {
    id: 'notif-2',
    destinatario: 'conductor',
    titulo: '📦 Nuevo viaje asignado',
    cuerpo: 'Pedido VIX-8042 asignado. Retiro en Burger House Caracas.',
    timestamp: '16:22',
    leida: true
  },
  {
    id: 'notif-3',
    destinatario: 'comercio',
    titulo: '💰 Pago Verificado',
    cuerpo: 'Cliente Carlos Mendoza realizó Pago Móvil REF-0102-8839201 por $16.00.',
    timestamp: '16:17',
    leida: true
  }
];

export const INITIAL_ACTIVITY_LOGS: LogActividad[] = [
  {
    id: 'log-001',
    usuarioId: 'admin-01',
    usuarioNombre: 'Valery Rivas',
    usuarioRol: 'super_admin',
    modulo: 'seguridad',
    accion: 'Inicio de Sesión Exitoso',
    detalles: 'Autenticación en panel web Vixy con credenciales de Super Administrador.',
    ip: '190.202.88.14 (Caracas, CANTV)',
    fecha: '2026-09-02 16:38:15',
    severidad: 'info'
  },
  {
    id: 'log-002',
    usuarioId: 'admin-01',
    usuarioNombre: 'Valery Rivas',
    usuarioRol: 'super_admin',
    modulo: 'tarifas',
    accion: 'Actualización Parámetros de Tarifas & Comisiones BCV',
    detalles: 'Comisión de delivery establecida en 12% (no aplica a productos de comercio). Tarifa base de viaje mínimo $2.00 hasta 3 km y tramo de $0.35 por cada 0.5 km adicional.',
    ip: '190.202.88.14 (Caracas, CANTV)',
    fecha: '2026-09-02 16:30:00',
    severidad: 'exito'
  },
  {
    id: 'log-003',
    usuarioId: 'user-02',
    usuarioNombre: 'Gabriel Torres',
    usuarioRol: 'operador',
    modulo: 'pedidos',
    accion: 'Asignación de Motorizado a Pedido',
    detalles: 'Asignó motorizado Yeferson Ramírez (Empire Horse AA1B23C) a orden #VIX-8042 de Burger House.',
    ip: '201.248.91.42 (Chacao, Inter)',
    fecha: '2026-09-02 16:22:15',
    severidad: 'info'
  },
  {
    id: 'log-004',
    usuarioId: 'com-001',
    usuarioNombre: 'Burger House Caracas',
    usuarioRol: 'comercio',
    modulo: 'pedidos',
    accion: 'Despacho de Pedido Completado',
    detalles: 'Orden #VIX-8042 empacada con sello térmico y entregada a motorizado. Tiempo de despacho: 14 min.',
    ip: '186.24.19.102 (Los Palos Grandes)',
    fecha: '2026-09-02 16:32:00',
    severidad: 'info'
  },
  {
    id: 'log-005',
    usuarioId: 'admin-01',
    usuarioNombre: 'Valery Rivas',
    usuarioRol: 'super_admin',
    modulo: 'seguridad',
    accion: 'Creación de Usuario Backend con Permisos RBAC',
    detalles: 'Creó usuario operativo "Gabriel Torres" con acceso a pestañas [dashboard, pedidos, conductores, comercios, incidencias].',
    ip: '190.202.88.14 (Caracas, CANTV)',
    fecha: '2026-09-02 16:05:40',
    severidad: 'exito'
  },
  {
    id: 'log-006',
    usuarioId: 'cond-001',
    usuarioNombre: 'Yeferson Ramírez',
    usuarioRol: 'conductor',
    modulo: 'conductores',
    accion: 'Recarga de Cartera Digital Multi-Método',
    detalles: 'Recarga aprobada de $5.00 USD vía Pago Móvil Banco de Venezuela (Ref: REC-0102-4412). Saldo solvente.',
    ip: '190.74.150.88 (Móvil Digitel 4G)',
    fecha: '2026-09-02 15:45:10',
    severidad: 'exito'
  },
  {
    id: 'log-007',
    usuarioId: 'cond-001',
    usuarioNombre: 'Yeferson Ramírez',
    usuarioRol: 'conductor',
    modulo: 'pedidos',
    accion: 'Entrega Exitosa con Comprobante Fotográfico',
    detalles: 'Pedido #VIX-8041 entregado a Mariana Pérez en Los Palos Grandes. Tiempo de entrega: 13 min. Foto guardada en /uploads/verificaciones/foto-8041.jpg.',
    ip: '190.74.150.88 (Móvil Digitel 4G)',
    fecha: '2026-09-02 15:35:40',
    severidad: 'info'
  },
  {
    id: 'log-008',
    usuarioId: 'user-03',
    usuarioNombre: 'Daniela Salazar',
    usuarioRol: 'soporte',
    modulo: 'soporte',
    accion: 'Resolución de Incidencia de Pago Móvil',
    detalles: 'Incidencia INC-2026-003 marcada como resuelta tras validación bancaria.',
    ip: '201.248.91.42 (Chacao, Inter)',
    fecha: '2026-09-02 14:15:00',
    severidad: 'exito'
  },
  {
    id: 'log-009',
    usuarioId: 'admin-01',
    usuarioNombre: 'Valery Rivas',
    usuarioRol: 'super_admin',
    modulo: 'tarifas',
    accion: 'Sincronización Tasa Oficial BCV',
    detalles: 'Tasa BCV actualizada a 78.50 Bs/USD en base de datos MySQL y propagada a aplicaciones cliente y conductor.',
    ip: '190.202.88.14 (Caracas, CANTV)',
    fecha: '2026-09-02 09:00:00',
    severidad: 'info'
  },
  {
    id: 'log-010',
    usuarioId: 'sistema',
    usuarioNombre: 'Vixy Kernel Daemon',
    usuarioRol: 'sistema',
    modulo: 'sistema',
    accion: 'Monitoreo de Límite Saldo Negativo Conductor (-$0.50 USD)',
    detalles: 'Verificación periódica ejecutada. 18 motorizados activos solventes. 0 cuentas suspendidas por límite deudor.',
    ip: '127.0.0.1 (Localhost / Cron Job)',
    fecha: '2026-09-02 16:30:00',
    severidad: 'info'
  }
];

// CLIENTES DEMO CON WALLETS INDEPENDIENTES
export const DEMO_CLIENTE_2: Cliente = {
  id: 'cli-002',
  username: 'maria_delgado',
  passwordHash: 'maria123',
  nombre: 'María',
  apellido: 'Delgado',
  cedula: 'V-21.904.312',
  telefono: '+58 414 112 3344',
  email: 'maria.delgado@email.com',
  direccion: 'Urb. Los Palos Grandes, 3ra Avenida, Res. Ávila Real, Apto 4B',
  puntoReferencia: 'A media cuadra de la Plaza Los Palos Grandes',
  lat: 10.4985,
  lng: -66.8450,
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  billetera: {
    clienteId: 'cli-002',
    saldoUsd: 60.00,
    saldoBs: Math.round(60.00 * TASA_BCV_ACTUAL * 100) / 100,
    totalGastadoUsd: 45.00,
    totalRecargadoUsd: 105.00,
    historialTransacciones: [
      {
        id: 'tx-cli-002-1',
        clienteId: 'cli-002',
        tipo: 'recarga',
        montoUsd: 60.00,
        montoBs: Math.round(60.00 * TASA_BCV_ACTUAL),
        saldoResultanteUsd: 60.00,
        metodoPago: 'pago_movil',
        referencia: 'PM-0102-991204',
        comprobanteUrl: '/uploads/clientes/cli-002/comprobantes/recarga_20260901_pm.jpg',
        comprobanteArchivoId: 'arch-comp-cli-002',
        descripcion: 'Recarga aprobada por Backend Central',
        fecha: '2026-09-01 11:20:00',
        estado: 'completado'
      }
    ]
  }
};

export const DEMO_CLIENTE_3: Cliente = {
  id: 'cli-003',
  username: 'alejandro_c',
  passwordHash: 'ale123',
  nombre: 'Alejandro',
  apellido: 'Castillo',
  cedula: 'V-28.114.750',
  telefono: '+58 424 555 8899',
  email: 'ale.castillo@email.com',
  direccion: 'Calle París, Las Mercedes, Residencias Madrid, PH-1',
  puntoReferencia: 'Detrás del Tolón Fashion Mall',
  lat: 10.4820,
  lng: -66.8610,
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  billetera: {
    clienteId: 'cli-003',
    saldoUsd: 12.50,
    saldoBs: Math.round(12.50 * TASA_BCV_ACTUAL * 100) / 100,
    totalGastadoUsd: 28.00,
    totalRecargadoUsd: 40.50,
    historialTransacciones: [
      {
        id: 'tx-cli-003-1',
        clienteId: 'cli-003',
        tipo: 'recarga',
        montoUsd: 12.50,
        montoBs: Math.round(12.50 * TASA_BCV_ACTUAL),
        saldoResultanteUsd: 12.50,
        metodoPago: 'zinli',
        referencia: 'ZINLI-TR-991823',
        comprobanteUrl: '/uploads/clientes/cli-003/comprobantes/recarga_zinli.jpg',
        comprobanteArchivoId: 'arch-comp-cli-003',
        descripcion: 'Recarga Zinli autorizada por Tesorería',
        fecha: '2026-09-02 14:00:00',
        estado: 'completado'
      }
    ]
  }
};

export const ALL_DEMO_CLIENTES: Cliente[] = [
  DEMO_CLIENTE,
  DEMO_CLIENTE_2,
  DEMO_CLIENTE_3
];

// CONDUCTORES DEMO CON WALLETS INDEPENDIENTES
export const DEMO_CONDUCTOR_2: Conductor = {
  id: 'cond-002',
  nombre: 'Pedro',
  apellido: 'Morales',
  telefono: '+58 412 884 1920',
  email: 'pedro.morales@vixy.com',
  fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  disponible: true,
  activo: true,
  moto: {
    marca: 'Bera',
    modelo: 'SBR 150cc',
    ano: 2024,
    color: 'Azul Eléctrico',
    placa: 'AB9X44D',
    serialMotor: 'BR162FMJ-448102',
    serialChasis: '8X3B8819201928374'
  },
  legal: {
    cedula: 'V-25.109.832',
    licenciaGrado: '2da',
    licenciaNumero: 'LIC-2da-25109832',
    licenciaVencimiento: '2027-11-20',
    licenciaValida: true,
    certificadoMedicoNumero: 'CMV-MPPS-99210-MIRANDA',
    certificadoMedicoVencimiento: '2027-05-15',
    certificadoMedicoValido: true,
    rcvAseguradora: 'Mercantil Seguros C.A.',
    rcvPolizaNumero: 'RCV-BERA-88410-2026',
    rcvVencimiento: '2027-02-28'
  },
  rating: 4.85,
  totalEntregas: 142,
  billetera: {
    conductorId: 'cond-002',
    saldoUsd: 14.50,
    limiteSaldoNegativo: -0.50,
    serviciosRealizados: 142,
    totalComisionesPagadasUsd: 49.70,
    totalComisionesPagadas: 49.70,
    bloqueadoPorSaldo: false,
    historialTransacciones: [
      {
        id: 'tx-dr-2-1',
        conductorId: 'cond-002',
        tipo: 'recarga',
        monto: 15.00,
        saldoResultante: 14.50,
        metodoPago: 'pago_movil',
        referencia: 'PM-0105-778899',
        comprobanteUrl: '/uploads/conductores/cond-002/comprobantes/recarga_pm.jpg',
        descripcion: 'Recarga saldo de comisiones aprobada por Central',
        fecha: '2026-09-02 08:30:00',
        estado: 'completado'
      }
    ]
  },
  lat: 10.4850,
  lng: -66.8500,
  ubicacionActual: 'Las Mercedes, Municipio Baruta',
  resenas: [
    {
      id: 'res-cond-2-1',
      clienteNombre: 'Carolina Méndez',
      calificacion: 5,
      comentario: 'Puntual y muy cuidadoso con los paquetes frágiles.',
      fecha: '2026-09-01'
    }
  ]
};

export const DEMO_CONDUCTOR_3: Conductor = {
  id: 'cond-003',
  nombre: 'José',
  apellido: 'González',
  telefono: '+58 416 772 1092',
  email: 'jose.gonzalez@vixy.com',
  fotoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  disponible: false,
  activo: true,
  moto: {
    marca: 'Empire Keeway',
    modelo: 'Express 150cc',
    ano: 2022,
    color: 'Negro Brillante',
    placa: 'AC4B88K',
    serialMotor: 'EK162FMJ-339912',
    serialChasis: '8X3B9918239019234'
  },
  legal: {
    cedula: 'V-23.774.901',
    licenciaGrado: '2da',
    licenciaNumero: 'LIC-2da-23774901',
    licenciaVencimiento: '2026-12-10',
    licenciaValida: true,
    certificadoMedicoNumero: 'CMV-MPPS-33410-CCS',
    certificadoMedicoVencimiento: '2026-10-05',
    certificadoMedicoValido: true,
    rcvAseguradora: 'Seguros Caracas',
    rcvPolizaNumero: 'RCV-EK-3310-2026',
    rcvVencimiento: '2026-11-30'
  },
  rating: 4.70,
  totalEntregas: 98,
  billetera: {
    conductorId: 'cond-003',
    saldoUsd: -0.40,
    limiteSaldoNegativo: -0.50,
    serviciosRealizados: 98,
    totalComisionesPagadasUsd: 34.30,
    totalComisionesPagadas: 34.30,
    bloqueadoPorSaldo: false,
    historialTransacciones: []
  },
  lat: 10.4900,
  lng: -66.8620,
  ubicacionActual: 'Chacaíto, Municipio Libertador / Chacao',
  resenas: []
};

export const ALL_DEMO_CONDUCTORES: Conductor[] = [
  DEMO_CONDUCTOR,
  DEMO_CONDUCTOR_2,
  DEMO_CONDUCTOR_3
];

// SOLICITUDES DE RECARGA PENDIENTES DE AUTORIZACIÓN POR EL BACKEND
export const INITIAL_RECHARGE_REQUESTS: SolicitudRecarga[] = [
  {
    id: 'sol-rec-001',
    codigoSolicitud: 'REC-W-8812',
    usuarioTipo: 'cliente',
    usuarioId: 'cli-002',
    usuarioNombre: 'María Delgado',
    usuarioCedula: 'V-21.904.312',
    montoUsd: 20.00,
    montoBs: 1570.00,
    metodoPago: 'pago_movil',
    referencia: 'PM-0102-884920',
    comprobanteUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
    directorioAlmacenamiento: '/uploads/clientes/cli-002/comprobantes/recarga_20260903_101.jpg',
    fecha: '2026-09-03 10:15:22',
    estado: 'pendiente'
  },
  {
    id: 'sol-rec-002',
    codigoSolicitud: 'REC-W-8813',
    usuarioTipo: 'conductor',
    usuarioId: 'cond-002',
    usuarioNombre: 'Pedro Morales (Motorizado)',
    usuarioCedula: 'V-25.109.832',
    montoUsd: 10.00,
    montoBs: 785.00,
    metodoPago: 'zinli',
    referencia: 'ZINLI-TR-994182',
    comprobanteUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=80',
    directorioAlmacenamiento: '/uploads/conductores/cond-002/comprobantes/recarga_20260903_202.jpg',
    fecha: '2026-09-03 10:24:45',
    estado: 'pendiente'
  }
];

// RECLAMOS Y SEGUIMIENTO DE QUEJAS DE CLIENTES
export const INITIAL_CLIENT_CLAIMS: ReclamoCliente[] = [
  {
    id: 'rec-001',
    codigoReclamo: 'REC-2041',
    pedidoId: 'ped-8042',
    codigoSeguimiento: 'VIX-8042',
    clienteId: 'cli-001',
    clienteNombre: 'Carlos Mendoza',
    clienteTelefono: '+58 412 998 1234',
    comercioId: 'com-001',
    comercioNombre: 'Burger House Caracas',
    conductorId: 'cond-001',
    conductorNombre: 'Yeferson Ramírez',
    motivo: 'Bebida derramada y falta una ración de papas',
    descripcion: 'El pedido llegó con la lata de Coca-Cola golpeada y derramada mojando la bolsa térmica, y faltaron las papas rústicas trufadas.',
    imagenes: [
      'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=600&auto=format&fit=crop&q=80'
    ],
    carpetaAlmacenamiento: '/uploads/clientes/cli-001/reclamos/',
    estado: 'en_espera_de_respuesta',
    fechaCreacion: '2026-09-03 09:30:00',
    respuestaComercio: 'Estamos revisando las cámaras de empaque en cocina. Nos comunicaremos de inmediato.',
    solucionPropuesta: 'Ofrecemos reposición inmediata de las papas y bebida sin costo de envío.'
  }
];


