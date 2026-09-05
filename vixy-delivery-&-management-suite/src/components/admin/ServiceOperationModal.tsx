import React, { useState } from 'react';
import { 
  X, 
  Store, 
  User, 
  Bike, 
  MapPin, 
  Phone, 
  MessageSquare, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Package, 
  Navigation, 
  ExternalLink, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  Camera, 
  ArrowRight,
  Info,
  Receipt
} from 'lucide-react';
import { Pedido, Conductor } from '../../types/delivery';
import { useDelivery } from '../../context/DeliveryContext';

interface ServiceOperationModalProps {
  order: Pedido | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceOperationModal: React.FC<ServiceOperationModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  const { 
    allDrivers, 
    assignDriverToOrder, 
    driverPickUpOrder, 
    driverDeliverOrder, 
    tasaBcv, 
    openCall, 
    openChat 
  } = useDelivery();

  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const isStoreRequest = order.esPedidoTienda || order.origenPedido === 'tienda_independiente' || order.solicitadoPor === 'comercio';
  const detallesTienda = order.detallesEntregaTienda;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleAssignDriver = () => {
    if (!selectedDriverId) return;
    assignDriverToOrder(order.id, selectedDriverId);
    setIsAssigning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'entregado':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'en_camino_al_cliente':
      case 'en_camino_al_comercio':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'esperando_repartidor':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'en_preparacion':
      case 'pago_verificado':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header / Guía de Servicio Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
              isStoreRequest ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
            }`}>
              {isStoreRequest ? <Store className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-base sm:text-lg tracking-wide text-amber-400">
                  #{order.codigoSeguimiento}
                </span>
                {isStoreRequest ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    🏪 Servicio Solicitado por Comercio (B2B Express)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    👤 Pedido Solicitado por Cliente (App Vixy)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Guía de Operación Integral de Despacho • Registrado: {order.creadoEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 cursor-pointer"
              title="Imprimir Guía de Despacho"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Imprimir Ficha</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Cerrar Ficha"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Operational Status Highlight Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px]">
              Estatus de Operación:
            </span>
            <span className={`px-2.5 py-1 rounded-lg font-bold border text-xs flex items-center gap-1.5 ${getStatusColor(order.estado)}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              {formatStatus(order.estado)}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300 text-xs">
            {order.metricasTiempo && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Distancia: <strong>{order.metricasTiempo.distanciaKm} km</strong></span>
                <span className="text-slate-400">•</span>
                <span>ETA estimado: <strong>{order.metricasTiempo.estimadoEntregaMin} min</strong></span>
              </div>
            )}

            <div className="flex items-center gap-1.5 font-mono">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span>Total: <strong className="text-slate-900 dark:text-white font-bold">${order.montoTotalUsd.toFixed(2)} USD</strong> (Bs. {order.montoTotalBs.toFixed(2)})</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Special Banner for Store-Requested Delivery */}
          {isStoreRequest && (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Operación Comercial Exclusiva: Despacho Directo Solicitado por la Tienda</span>
                </div>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-md uppercase">
                  Logística Vixy B2B
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Este servicio de delivery fue contratado directamente por el comercio <strong className="text-slate-900 dark:text-white">{order.comercio.nombre}</strong> para enviar una comanda a su cliente directo. El motorizado de la flota Vixy actúa como operador logístico oficial de recogida y entrega.
              </p>
            </div>
          )}

          {/* Grid of 2 Main Cards: ORIGIN (Store) & DESTINATION (Customer) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Punto de Retiro (Comercio Solicitante) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Punto de Retiro (Comercio)
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">RIF: {order.comercio.rif}</span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {order.comercio.nombre}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{order.comercio.direccion}</span>
                </p>
              </div>

              {detallesTienda?.contactoRetiroComercio && (
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Encargado de Entrega en Local:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{detallesTienda.contactoRetiroComercio}</p>
                  {detallesTienda.telefonoRetiroComercio && (
                    <p className="text-[11px] text-slate-500">{detallesTienda.telefonoRetiroComercio}</p>
                  )}
                </div>
              )}

              {detallesTienda?.notasComercio && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                  <span className="text-[10px] font-bold uppercase block text-amber-600 dark:text-amber-400">
                    Instrucciones de Despacho de la Tienda:
                  </span>
                  <p className="mt-0.5 italic">"{detallesTienda.notasComercio}"</p>
                </div>
              )}

              {/* Action buttons for Store */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => openCall('Mesa Operativa Vixy', order.comercio.nombre, order.comercio.telefono, 'comercio')}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span>Llamar Tienda</span>
                </button>
                <button
                  onClick={() => openChat(order.id)}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  <span>Chat Comercio</span>
                </button>
              </div>
            </div>

            {/* 2. Punto de Entrega (Receptor / Cliente) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Punto de Entrega (Destinatario)
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">C.I: {order.cliente.cedula}</span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {order.cliente.nombre} {order.cliente.apellido}
                  </h4>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                    {order.cliente.telefono}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span>{detallesTienda?.ubicacionEscrita || order.cliente.direccion}</span>
                </p>

                {(detallesTienda?.puntoReferencia || order.cliente.puntoReferencia) && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-5">
                    <strong>Punto de referencia:</strong> {detallesTienda?.puntoReferencia || order.cliente.puntoReferencia}
                  </p>
                )}

                {detallesTienda?.zonaMunicipio && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 pl-5">
                    <strong>Zona/Municipio:</strong> {detallesTienda.zonaMunicipio}
                  </p>
                )}
              </div>

              {/* Cobro en destino vs Prepagado card */}
              <div className={`p-2.5 rounded-xl border text-xs ${
                detallesTienda?.modalidadCobro === 'cobro_efectivo_en_puerta'
                  ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              }`}>
                {detallesTienda?.modalidadCobro === 'cobro_efectivo_en_puerta' ? (
                  <div className="space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      COBRAR AL CLIENTE EN PUERTA: ${detallesTienda.montoACobrarClienteUsd || order.montoTotalUsd} USD
                    </span>
                    {detallesTienda.cambioParaClienteUsd ? (
                      <p className="text-[11px]">Llevar cambio exacto: ${detallesTienda.cambioParaClienteUsd.toFixed(2)} USD</p>
                    ) : (
                      <p className="text-[11px]">Cobro en efectivo divisa o pago móvil al recibir.</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>MERCANCÍA YA PAGADA AL COMERCIO • NO cobrar nada al cliente</span>
                  </div>
                )}
              </div>

              {/* Action buttons for Customer */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => openCall('Mesa Operativa Vixy', `${order.cliente.nombre} ${order.cliente.apellido}`, order.cliente.telefono, 'cliente')}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-500" />
                  <span>Llamar Destinatario</span>
                </button>
                <button
                  onClick={() => copyToClipboard(detallesTienda?.ubicacionEscrita || order.cliente.direccion, 'direccion')}
                  className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Copiar dirección de entrega"
                >
                  {copiedText === 'direccion' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText === 'direccion' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* 3. Operational Driver / Fleet Control Section */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Bike className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Control de Flota y Motorizado Asignado
                  </h4>
                  <span className="text-[10px] text-slate-400">Operador logístico en calle</span>
                </div>
              </div>

              {order.conductor ? (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                  MOTORIZADO EN OPERACIÓN
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] border border-amber-500/30">
                  PENDIENTE DE ASIGNACIÓN
                </span>
              )}
            </div>

            {order.conductor ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={order.conductor.avatarUrl}
                    alt={order.conductor.nombre}
                    className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {order.conductor.nombre} {order.conductor.apellido}
                    </h5>
                    <p className="text-[11px] text-slate-500 font-mono">
                      C.I: {order.conductor.legal.cedula} • Tel: {order.conductor.telefono}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold">
                        🏍️ {order.conductor.moto.marca} {order.conductor.moto.modelo} ({order.conductor.moto.ano})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-extrabold border border-slate-300 dark:border-slate-700">
                        Placa: [{order.conductor.moto.placa}]
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold">
                        {order.conductor.legal.licenciaGrado} • CMV Vigente
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => openCall('Mesa Operativa Vixy', `${order.conductor?.nombre} ${order.conductor?.apellido}`, order.conductor?.telefono || '', 'conductor')}
                    className="flex-1 sm:flex-initial py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Llamar Conductor</span>
                  </button>
                  <button
                    onClick={() => setIsAssigning(true)}
                    className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    Reasignar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Este servicio aún no tiene un motorizado asignado en calle.</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Puedes asignar de inmediato a cualquier conductor activo de la flota registrada en Caracas:
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full sm:flex-1 py-2 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">-- Seleccionar Motorizado de la Flota --</option>
                    {allDrivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.nombre} {d.apellido} • Moto: {d.moto.marca} ({d.moto.placa}) • Calificación: {d.calificacionPromedio}★
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={!selectedDriverId}
                    onClick={handleAssignDriver}
                    className="w-full sm:w-auto py-2 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer shadow-md"
                  >
                    Asignar Inmediato
                  </button>
                </div>
              </div>
            )}

            {/* Quick Reassign modal / dropdown if isAssigning */}
            {isAssigning && (
              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 space-y-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Cambiar / Reasignar Conductor del Servicio:</span>
                <div className="flex gap-2">
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="flex-1 py-1.5 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">-- Seleccionar Nuevo Motorizado --</option>
                    {allDrivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.nombre} {d.apellido} ({d.moto.placa})
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={!selectedDriverId}
                    onClick={handleAssignDriver}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold disabled:opacity-50 cursor-pointer"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => setIsAssigning(false)}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Products & Package Content Section */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Contenido de la Encomienda / Paquete
                </h4>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold font-mono text-slate-700 dark:text-slate-200 text-[11px]">
                      {item.cantidad}x
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.nombre}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ${((item.subtotalUsd || (item.precioUnitarioUsd * item.cantidad)) || 0).toFixed(2)} USD
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      (Unitario: ${item.precioUnitarioUsd.toFixed(2)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Financial Breakdown & BCV Official Exchange Rate */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Liquidación Financiera de la Operación
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Tasa BCV Oficial: Bs. {order.tasaBcvBs?.toFixed(2) || tasaBcv.toFixed(2)}/USD
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal Artículos Tienda:</span>
                  <span className="font-mono font-semibold">${(order.montoSubtotalUsd || 0).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tarifa de Delivery (Moto):</span>
                  <span className="font-mono font-semibold">${(order.costoEnvioUsd || 0).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                  <span>Método de Cobro Registrado:</span>
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">
                    {order.metodoPagoSeleccionado.replace(/_/g, ' ')}
                  </span>
                </div>
                {order.referenciaPago && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                    <span>Referencia / Comprobante:</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {order.referenciaPago}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-800 dark:text-slate-200">TOTAL OPERACIÓN:</span>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono block">
                      ${order.montoTotalUsd.toFixed(2)} USD
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Bs. {order.montoTotalBs.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Ganancia Neta Conductor:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      ${((order.costoEnvioUsd || 2.50) * 0.85).toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comisión Plataforma Vixy (15%):</span>
                    <span className="font-mono">${((order.costoEnvioUsd || 2.50) * 0.15).toFixed(2)} USD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Verification Photo if Delivered */}
          {order.fotoVerificacion && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Camera className="w-4 h-4 text-emerald-500" />
                <span>Comprobante Fotográfico de Entrega en Destino (GPS Auditado)</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={order.fotoVerificacion.url}
                  alt="Comprobante de entrega"
                  className="w-full sm:w-48 h-36 rounded-xl object-cover border border-emerald-500/50 shadow-md"
                />
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    "{order.fotoVerificacion.comentario}"
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    <strong>Fecha y Hora:</strong> {order.fotoVerificacion.fecha}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    <strong>Coordenadas GPS:</strong> {order.fotoVerificacion.coordenadas}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    <strong>Certificado por:</strong> {order.fotoVerificacion.conductorNombre}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-500 text-white font-bold text-[10px] uppercase">
                    Verificado por Auditoría Vixy
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 7. Step-by-Step Operations Log / Audit Trail */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Trazabilidad Operativa Completa (Línea de Tiempo)
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {order.historialOperaciones.length} eventos registrados
              </span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
              {order.historialOperaciones.map((h, i) => (
                <div key={h.id || i} className="relative text-xs">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white dark:border-slate-800" />
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white capitalize">
                        {h.estado.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono uppercase">
                          {h.actor}
                        </span>
                        <span className="font-mono text-[10px] text-amber-500 font-bold">
                          {h.timestamp}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {h.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer with Operational Action Buttons */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Operador en turno: <strong>Mesa de Tráfico Vixy</strong></span>
            <span>•</span>
            <span className="font-mono">ID: {order.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {order.estado === 'en_camino_al_comercio' && (
              <button
                onClick={() => driverPickUpOrder(order.id)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <span>Confirmar Retiro en Comercio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {order.estado === 'en_camino_al_cliente' && (
              <button
                onClick={() => driverDeliverOrder(order.id, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80', 'Entrega verificada por mesa operativa.')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Marcar Entregado con Foto</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
