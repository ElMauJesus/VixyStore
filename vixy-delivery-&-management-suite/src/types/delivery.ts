// Types for Vixy Delivery & Management Suite

export type UserRole = 'super_admin' | 'operador' | 'soporte' | 'comercio' | 'conductor' | 'cliente' | 'finanzas' | 'auditor';

export type MetodoPagoTipo = 'pago_movil' | 'zelle' | 'zinli' | 'binance' | 'paypal' | 'efectivo' | 'efectivo_usd' | 'punto_venta' | 'saldo_cartera' | 'transferencia_bancaria';

export interface VenezuelanLegalDocs {
  cedula: string; // Ej: V-24.892.110
  licenciaGrado: '2da' | '3ra' | '4ta' | '5ta'; // Motos es 2da
  licenciaNumero: string;
  licenciaVencimiento: string; // YYYY-MM-DD
  licenciaValida: boolean;
  certificadoMedicoNumero: string; // M.P.P.S / Colegio de Médicos
  certificadoMedicoVencimiento: string; // YYYY-MM-DD
  certificadoMedicoValido: boolean;
  rcvAseguradora: string; // Responsabilidad Civil Vehicular
  rcvPolizaNumero: string;
  rcvVencimiento: string;
}

export interface MotorbikeDetails {
  marca: string; // Ej: Empire Keeway, Bera, Suzuki, Honda
  modelo: string; // Ej: Horse 150, SBR 150, GN 125
  ano: number;
  color: string;
  placa: string; // Ej: AA1B23C
  serialMotor: string;
  serialChasis: string;
}

export interface TransaccionBilletera {
  id: string;
  conductorId: string;
  tipo: 'recarga' | 'comision_carrera' | 'ajuste' | 'bono';
  monto: number; // Positivo para recargas, negativo para comisiones
  saldoResultante: number;
  metodoPago?: MetodoPagoTipo;
  referencia?: string;
  comprobanteUrl?: string;
  comprobanteArchivoId?: string;
  descripcion: string;
  fecha: string;
  estado: 'completado' | 'pendiente_aprobacion';
}

export interface ConductorBilletera {
  conductorId: string;
  saldoUsd: number;
  limiteSaldoNegativo: number; // Límite estricto de -0.50$
  serviciosRealizados: number;
  totalComisionesPagadasUsd: number;
  totalComisionesPagadas?: number; // Alias compatible para evitar desajustes de propiedades
  bloqueadoPorSaldo: boolean; // Verdadero si saldoUsd <= -0.50$
  historialTransacciones: TransaccionBilletera[];
  transacciones?: TransaccionBilletera[]; // Alias compatible
}

export interface Conductor {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fotoUrl: string;
  disponible: boolean;
  activo: boolean;
  moto: MotorbikeDetails;
  legal: VenezuelanLegalDocs;
  rating: number;
  totalEntregas: number;
  billetera: ConductorBilletera;
  lat: number;
  lng: number;
  precisionGps?: number;
  velocidadKmh?: number;
  rumboGrados?: number;
  ubicacionActual: string;
  resenas: {
    id: string;
    clienteNombre: string;
    calificacion: number;
    comentario: string;
    fecha: string;
  }[];
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precioUsd: number;
  precioBs: number;
  categoria: string;
  imagenUrl: string;
  imagenPath?: string; // Ruta individual en servidor: /uploads/comercios/{comercio_id}/articulos/{nombre_archivo}
  disponible: boolean;
}

export interface MetodosPagoDirecto {
  pagoMovil: {
    activo: boolean;
    banco: string;
    telefono: string;
    cedula: string;
    instrucciones?: string;
  };
  zelle: {
    activo: boolean;
    email: string;
    titular: string;
    instrucciones?: string;
  };
  zinli: {
    activo: boolean;
    email: string;
    titular: string;
    instrucciones?: string;
  };
  binance?: {
    activo: boolean;
    payId: string;
    nickname: string;
    qrUrl?: string;
  };
  binancePay?: {
    activo: boolean;
    payId: string;
    nickname?: string;
    instrucciones?: string;
  };
  wally?: {
    activo: boolean;
    email: string;
    instrucciones?: string;
  };
  paypal?: {
    activo: boolean;
    email: string;
    instrucciones: string;
  };
  efectivo: {
    activo: boolean;
    aceptaBs: boolean;
    aceptaUsd: boolean;
    instrucciones: string;
  };
  efectivoUsd?: {
    activo: boolean;
    instrucciones: string;
  };
  puntoVenta?: {
    activo: boolean;
  };
}

export interface TransaccionClienteBilletera {
  id: string;
  clienteId: string;
  tipo: 'recarga' | 'pago_pedido' | 'reembolso';
  montoUsd: number;
  montoBs: number;
  saldoResultanteUsd: number;
  metodoPago?: MetodoPagoTipo;
  referencia?: string;
  comprobanteUrl?: string; // /uploads/comprobantes_pago/comp_{id}.jpg
  comprobanteArchivoId?: string;
  descripcion: string;
  fecha: string;
  pedidoId?: string;
  estado: 'completado' | 'pendiente_aprobacion';
}

export interface ClienteBilletera {
  clienteId: string;
  saldoUsd: number;
  saldoBs: number;
  totalGastadoUsd: number;
  totalRecargadoUsd: number;
  historialTransacciones: TransaccionClienteBilletera[];
}

export interface TransaccionComercioBilletera {
  id: string;
  comercioId: string;
  tipo: 'pago_pedido_cartera' | 'pago_pedido_directo' | 'retiro' | 'ajuste';
  montoUsd: number;
  montoBs: number;
  saldoResultanteUsd: number;
  pedidoId?: string;
  codigoSeguimiento?: string;
  descripcion: string;
  metodoPago?: MetodoPagoTipo;
  referencia?: string;
  comprobanteUrl?: string; // /uploads/comprobantes_pago/comp_{id}.jpg
  comprobanteArchivoId?: string;
  fecha: string;
  estado: 'acreditado' | 'en_proceso';
}

export interface ComercioBilletera {
  comercioId: string;
  saldoUsd: number;
  saldoBs: number;
  totalVentasUsd: number;
  totalRetiradoUsd: number;
  historialTransacciones: TransaccionComercioBilletera[];
}

export interface ArchivoMultimedia {
  id: string;
  moduloOrigen: 'comprobantes_pago' | 'articulos_comercio' | 'entregas_pedidos' | 'avatares';
  rutaInterna: string; // ej: /uploads/comprobantes_pago/comp-981240.jpg
  nombreOriginal: string;
  tamanoBytes: number;
  mimeType: string;
  urlPublica: string;
  fechaSubida: string;
  referenciaId?: string; // id de transaccion, producto o pedido
}

export type CategoriaPrincipalComercio = 'hogar' | 'ferreteria' | 'restaurantes' | 'comida_rapida' | 'supermercados';

export interface Comercio {
  id: string;
  nombre: string;
  categoria: string;
  categoriaPrincipal?: CategoriaPrincipalComercio;
  rubroPersonalizado?: string; // Rubro a la medida si no está en la lista predefinida
  categoriasCatalogo?: string[]; // Categorías de ítems personalizadas por el comercio
  rif: string; // Ej: J-40192837-1
  direccion: string;
  telefono: string;
  email: string;
  logoUrl: string;
  portadaUrl: string;
  calificacion: number;
  totalCalificaciones?: number;
  horarios?: string; // Horario comercial (ej: "Lun - Sáb: 8:00 AM - 7:00 PM | Dom: 8:30 AM - 2:00 PM")
  diasApertura?: string;
  horaApertura?: string; // Ej: "08:00"
  horaCierre?: string; // Ej: "22:00"
  diasOperacion?: string[]; // ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
  activo?: boolean; // Estado activo/inactivo controlado por el sistema y el horario
  resenasComercio?: {
    id: string;
    clienteNombre: string;
    calificacion: number;
    comentario: string;
    fecha: string;
  }[];
  tiempoEstimadoMin: number;
  tiempoEstimadoMax: number;
  costoEnvioUsd: number;
  abierto: boolean;
  lat: number;
  lng: number;
  metodosPago: MetodosPagoDirecto;
  productos: Producto[];
  billetera?: ComercioBilletera;
}

export interface Cliente {
  id: string;
  username?: string; // Usuario personalizado para login
  passwordHash?: string;
  nombre: string;
  apellido: string;
  cedula: string; // Único en base de datos SQL
  telefono: string; // Único en base de datos SQL
  email: string;
  direccion: string;
  puntoReferencia: string;
  lat: number;
  lng: number;
  avatarUrl: string;
  billetera?: ClienteBilletera;
}

export type EstadoPedido = 
  | 'pendiente_pago'
  | 'pago_verificado'
  | 'en_preparacion'
  | 'esperando_repartidor'
  | 'en_camino_al_comercio'
  | 'en_camino_al_cliente'
  | 'entregado'
  | 'cancelado';

export interface ItemPedido {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitarioUsd: number;
  subtotalUsd: number;
}

export interface HistorialOperacion {
  id: string;
  estado: EstadoPedido;
  descripcion: string;
  actor: 'cliente' | 'comercio' | 'conductor' | 'sistema' | 'administrador';
  timestamp: string;
}

export interface MetricasTiempoPedido {
  tiempoDespachoComercioMin: number; // Tiempo desde pedido hasta empaque/despacho en local
  tiempoEntregaMotorizadoMin: number; // Tiempo desde retiro motorizado hasta entrega en puerta
  distanciaKm: number; // Distancia comercio -> cliente
  estimadoDespachoMin: number;
  estimadoEntregaMin: number;
}

export interface FotoVerificacion {
  id: string;
  pedidoId: string;
  url: string;
  fecha: string;
  conductorId: string;
  conductorNombre: string;
  clienteNombre: string;
  coordenadas: string;
  comentario: string;
}

export interface Pedido {
  id: string;
  codigoSeguimiento: string; // Ej: VIX-8042
  cliente: Cliente;
  comercio: Comercio;
  conductor?: Conductor;
  items: ItemPedido[];
  montoSubtotalUsd: number;
  costoEnvioUsd: number;
  montoTotalUsd: number;
  tasaBcvBs: number;
  montoTotalBs: number;
  metodoPagoSeleccionado: MetodoPagoTipo;
  referenciaPago?: string;
  comprobantePagoUrl?: string;
  estado: EstadoPedido;
  creadoEn: string;
  actualizadoEn: string;
  tiempoEstimadoRestanteSegundos: number; // Para contador en tiempo real
  historialOperaciones: HistorialOperacion[];
  metricasTiempo?: MetricasTiempoPedido;
  fotoVerificacion?: FotoVerificacion;
  esPedidoTienda?: boolean;
  origenPedido?: 'app_cliente' | 'tienda_independiente';
  solicitadoPor?: 'comercio' | 'cliente';
  detallesEntregaTienda?: {
    ubicacionEscrita: string;
    puntoReferencia?: string;
    zonaMunicipio?: string;
    contactoCliente?: string;
    telefonoCliente?: string;
    notasComercio?: string;
    modalidadCobro?: 'cobro_efectivo_en_puerta' | 'ya_pagado_al_comercio' | 'transferencia_pendiente';
    montoACobrarClienteUsd?: number;
    cambioParaClienteUsd?: number;
    contactoRetiroComercio?: string;
    telefonoRetiroComercio?: string;
  };
  calificacionCliente?: {
    estrellas: number;
    comentario: string;
  };
  confirmacionEntregaCliente?: {
    confirmado: boolean;
    fechaConfirmacion: string;
    calificacionComercio: number;
    calificacionConductor: number;
    comentario: string;
  };
  peticionCerrada?: boolean;
  notificacionMetodoPago?: {
    tipo: 'wallet' | 'pago_directo' | 'efectivo';
    metodo: MetodoPagoTipo;
    descripcion: string;
    referencia?: string;
    instruccionMotorizado: string; // ej: "Cobrar al cliente $15" o "Ya pagado por Cartera Vixy - NO cobrar"
    instruccionComercio: string; // ej: "Acreditado a Cartera Comercial" o "Pago Directo Móvil recibido"
  };
}

export interface SolicitudRecarga {
  id: string;
  codigoSolicitud: string; // ej: REC-W-9812
  usuarioTipo: 'cliente' | 'conductor';
  usuarioId: string;
  usuarioNombre: string;
  usuarioCedula?: string;
  montoUsd: number;
  montoBs: number;
  metodoPago: MetodoPagoTipo;
  referencia: string;
  comprobanteUrl: string; // /uploads/clientes/{id}/comprobantes/... o /uploads/conductores/{id}/comprobantes/...
  directorioAlmacenamiento: string; // Carpeta individual por cliente/conductor
  fecha: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  autorizadoPor?: string;
  fechaResolucion?: string;
  notaAdmin?: string;
}

export interface ReclamoCliente {
  id: string;
  codigoReclamo: string; // ej: REC-4091
  pedidoId: string;
  codigoSeguimiento: string;
  clienteId: string;
  clienteNombre: string;
  clienteTelefono?: string;
  comercioId: string;
  comercioNombre: string;
  conductorId?: string;
  conductorNombre?: string;
  motivo: string; // ej: 'Pedido incompleto', 'Comida en mal estado', 'Cobro erróneo', etc.
  descripcion: string;
  imagenes: string[]; // Rutas en /uploads/clientes/{clienteId}/reclamos/
  carpetaAlmacenamiento: string;
  estado: 'en_espera_de_respuesta' | 'atendido' | 'solucionado';
  fechaCreacion: string;
  respuestaComercio?: string;
  respuestaBackend?: string;
  solucionPropuesta?: string;
  fechaSolucion?: string;
}

export interface LogActividad {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioRol: string;
  modulo: 'seguridad' | 'pedidos' | 'conductores' | 'comercios' | 'tarifas' | 'soporte' | 'sistema';
  accion: string;
  detalles: string;
  ip: string;
  fecha: string;
  severidad: 'info' | 'advertencia' | 'critico' | 'exito';
}

export interface TarifasDeliveryConfig {
  tasaBcvBs: number;
  porcentajeComisionDelivery: number; // Ej: 12% (No altera precios de productos)
  tarifaBaseMinimaUsd: number; // Ej: $2.00 USD
  distanciaBaseKm: number; // 3.0 km fijos
  fraccionCalculoKm: number; // 0.5 km
  costoPorFraccionUsd: number; // Ej: $0.35 por cada 0.5 km adicional
  comisionMotorizadoPorcentaje: number; // 88% para el motorizado
  fechaActualizacion: string;
}

export interface ZonaCalor {
  id: string;
  nombreZona: string;
  municipio: string;
  pedidosPorHora: number;
  nivelDemanda: 'muy_alta' | 'alta' | 'media';
  lat: number;
  lng: number;
  ticketPromedioUsd: number;
  radioMetros: number;
  comerciosActivos: number;
}

export interface MensajeChat {
  id: string;
  pedidoId: string;
  emisorTipo: 'cliente' | 'comercio' | 'conductor' | 'soporte';
  emisorNombre: string;
  mensaje: string;
  timestamp: string;
  leido: boolean;
}

export interface Incidencia {
  id: string;
  codigoIncidencia: string;
  pedidoId?: string;
  reportadoPor: 'cliente' | 'comercio' | 'conductor' | 'operador';
  reportanteNombre: string;
  tipo: 'retraso' | 'pedido_incompleto' | 'accidente_moto' | 'problema_pago' | 'cliente_ausente' | 'otro';
  prioridad: 'alta' | 'media' | 'baja';
  descripcion: string;
  estado: 'abierta' | 'en_revision' | 'resuelta';
  resolucion?: string;
  fechaCreacion: string;
}

export interface MensajeSoporte {
  id: string;
  emisor: 'usuario' | 'agente';
  usuarioTipo: 'cliente' | 'comercio' | 'conductor';
  usuarioNombre: string;
  texto: string;
  timestamp: string;
}

export interface NotificacionPush {
  id: string;
  destinatario: 'cliente' | 'comercio' | 'conductor' | 'web';
  titulo: string;
  cuerpo: string;
  timestamp: string;
  leida: boolean;
}

export type AdminNivelAcceso = 'super_admin' | 'operador' | 'finanzas' | 'soporte' | 'auditor';

export interface AdminUser {
  id: string;
  username?: string; // Ej: 'vixydely'
  password?: string; // Clave de acceso
  nombre: string;
  email: string;
  nivelAcceso: AdminNivelAcceso;
  departamento: string;
  activo: boolean;
  ultimoAcceso: string;
  pestanasPermitidas: string[];
  avatarUrl?: string;
  debeCambiarClave?: boolean; // Obliga al cambio en el primer inicio de sesión
  fechaCreacion?: string;
  fechaCambioClave?: string;
  fechaVencimientoClave?: string; // Vigencia de máximo 90 días
  diasVigenciaClave?: number;
}

export interface UsuarioBackend {
  id: string;
  username?: string;
  password?: string;
  nombre: string;
  email: string;
  rol: UserRole;
  departamento: string;
  activo: boolean;
  ultimoAcceso: string;
  pestanasPermitidas?: string[];
  debeCambiarClave?: boolean;
  fechaVencimientoClave?: string;
  diasVigenciaClave?: number;
}
