import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Bike, 
  Receipt, 
  User, 
  Store,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Eye,
  ArrowRight,
  Layers,
  Check,
  Phone,
  DollarSign,
  Calendar,
  MapPin,
  Tag,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { Pedido } from '../../types/delivery';
import { ServiceOperationModal } from './ServiceOperationModal';

export const OrdersManager: React.FC = () => {
  const { orders, tasaBcv, openChat, openCall } = useDelivery();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [originTab, setOriginTab] = useState<'todos' | 'comercio' | 'cliente'>('todos');
  const [groupByRequester, setGroupByRequester] = useState<boolean>(true);
  const [expandedInlineId, setExpandedInlineId] = useState<string | null>(null);
  
  // Selected order for the full "Ficha de Operación Completa de Servicio" modal
  const [modalOrder, setModalOrder] = useState<Pedido | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Helper to identify if an order was requested by a store
  const isOrderFromStore = (order: Pedido): boolean => {
    return !!(order.esPedidoTienda || order.origenPedido === 'tienda_independiente' || order.solicitadoPor === 'comercio');
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const isStore = isOrderFromStore(order);

      // Tab filter
      if (originTab === 'comercio' && !isStore) return false;
      if (originTab === 'cliente' && isStore) return false;

      // Status filter
      if (statusFilter !== 'todos' && order.estado !== statusFilter) return false;

      // Search term filter
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesCod = order.codigoSeguimiento?.toLowerCase().includes(term);
        const matchesClient = `${order.cliente?.nombre || ''} ${order.cliente?.apellido || ''}`.toLowerCase().includes(term);
        const matchesStore = order.comercio?.nombre?.toLowerCase().includes(term);
        const matchesDriver = `${order.conductor?.nombre || ''} ${order.conductor?.apellido || ''} ${order.conductor?.moto?.placa || ''}`.toLowerCase().includes(term);
        const matchesPhone = (order.cliente?.telefono || '').toLowerCase().includes(term);
        const matchesDireccion = (order.detallesEntregaTienda?.ubicacionEscrita || order.cliente?.direccion || '').toLowerCase().includes(term);

        if (!matchesCod && !matchesClient && !matchesStore && !matchesDriver && !matchesPhone && !matchesDireccion) {
          return false;
        }
      }

      return true;
    });
  }, [orders, originTab, statusFilter, searchTerm]);

  // Split into groups
  const storeOrders = useMemo(() => {
    return filteredOrders.filter(isOrderFromStore);
  }, [filteredOrders]);

  const clientOrders = useMemo(() => {
    return filteredOrders.filter(o => !isOrderFromStore(o));
  }, [filteredOrders]);

  // Overall statistics
  const totalStoreOrdersAll = orders.filter(isOrderFromStore).length;
  const totalClientOrdersAll = orders.filter(o => !isOrderFromStore(o)).length;
  const activeOrdersCount = orders.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado').length;

  const openFichaModal = (order: Pedido) => {
    setModalOrder(order);
    setIsModalOpen(true);
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'entregado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
            <Check className="w-3 h-3" /> Entregado
          </span>
        );
      case 'en_camino_al_cliente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 whitespace-nowrap animate-pulse">
            <Bike className="w-3 h-3" /> En Camino al Cliente
          </span>
        );
      case 'en_camino_al_comercio':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 whitespace-nowrap">
            <Store className="w-3 h-3" /> En Camino a Tienda
          </span>
        );
      case 'esperando_repartidor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
            <Clock className="w-3 h-3" /> Esperando Repartidor
          </span>
        );
      case 'en_preparacion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 whitespace-nowrap">
            <Clock className="w-3 h-3" /> En Preparación
          </span>
        );
      case 'pago_verificado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
            <Check className="w-3 h-3" /> Pago Verificado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 whitespace-nowrap">
            <Clock className="w-3 h-3" /> {status.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  // Render a clean, high-density row in the list
  const renderOrderRow = (order: Pedido) => {
    const isStore = isOrderFromStore(order);
    const isInlineOpen = expandedInlineId === order.id;
    const destinoTexto = order.detallesEntregaTienda?.ubicacionEscrita || order.cliente?.direccion || 'Destino no especificado';

    return (
      <div 
        key={order.id}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs hover:border-amber-500/40 transition"
      >
        {/* Main List Row Item */}
        <div 
          onClick={() => isStore ? openFichaModal(order) : setExpandedInlineId(prev => prev === order.id ? null : order.id)}
          className="p-3.5 sm:p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
        >
          {/* Left Column: Code, Origin Badge & Creation date */}
          <div className="flex items-center gap-3 min-w-[210px]">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
              isStore 
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
            }`}>
              {isStore ? <Store className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  #{order.codigoSeguimiento}
                </span>
                {isStore ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    Comercio (B2B)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                    Cliente App
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{order.creadoEn}</span>
              </p>
            </div>
          </div>

          {/* Center Column 1: Requester & Route */}
          <div className="flex-1 min-w-[220px] space-y-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-900 dark:text-white">
                {isStore ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    🏪 {order.comercio.nombre} (Solicita servicio)
                  </span>
                ) : (
                  <span className="text-slate-800 dark:text-slate-200">
                    👤 {order.cliente.nombre} {order.cliente.apellido}
                  </span>
                )}
              </span>
              <span className="text-slate-400">→</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[220px]">
                {isStore ? `Entrega a ${order.cliente.nombre}` : order.comercio.nombre}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 flex items-start gap-1 line-clamp-1">
              <MapPin className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
              <span>{destinoTexto}</span>
            </p>
          </div>

          {/* Center Column 2: Status & Driver */}
          <div className="min-w-[190px] space-y-1">
            <div>{getStatusPill(order.estado)}</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <Bike className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {order.conductor ? (
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                  {order.conductor.nombre} ({order.conductor.moto.placa})
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
                  Sin asignar (Buscando...)
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Amount & Action Button */}
          <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
            <div className="text-left lg:text-right">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-mono block">
                ${order.montoTotalUsd.toFixed(2)} USD
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                Bs. {order.montoTotalBs.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Primary button: "Ficha de Operación" */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openFichaModal(order);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                  isStore 
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
                title="Abrir Ficha Integral de Operación"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isStore ? 'Ficha de Operación' : 'Ver Ficha'}</span>
              </button>

              {/* Toggle Inline Quick Details */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedInlineId(prev => prev === order.id ? null : order.id);
                }}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                title="Desplegar resumen rápido"
              >
                {isInlineOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Inline Quick Panel */}
        {isInlineOpen && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Punto de Entrega</span>
                <p className="font-bold text-slate-900 dark:text-white">{order.cliente.nombre} {order.cliente.apellido}</p>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">{destinoTexto}</p>
                {order.detallesEntregaTienda?.puntoReferencia && (
                  <p className="text-slate-500 text-[10px]">Ref: {order.detallesEntregaTienda.puntoReferencia}</p>
                )}
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Comercio</span>
                <p className="font-bold text-slate-900 dark:text-white">{order.comercio.nombre}</p>
                <p className="text-slate-500 text-[11px]">RIF: {order.comercio.rif}</p>
                <p className="text-slate-500 text-[11px]">Tel: {order.comercio.telefono}</p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Detalles de Cobro</span>
                <p className="font-bold text-slate-900 dark:text-white capitalize">
                  {order.metodoPagoSeleccionado.replace(/_/g, ' ')}
                </p>
                {order.referenciaPago && (
                  <p className="text-slate-500 font-mono text-[10px]">Ref: {order.referenciaPago}</p>
                )}
                {isStore && order.detallesEntregaTienda?.notasComercio && (
                  <p className="text-amber-600 dark:text-amber-400 text-[10px] italic">
                    "{order.detallesEntregaTienda.notasComercio}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                {order.items.length} productos en la comanda
              </span>
              <button
                type="button"
                onClick={() => openFichaModal(order)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Abrir Ficha de Operación Completa</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* 1. Header & Filters Card */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <span>Gestión de Pedidos & Servicios de Delivery</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Monitoreo y despacho en lista ordenada • Soporte integral para solicitudes B2B de comercios y clientes
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 text-[10px] block">TOTAL PEDIDOS</span>
              <strong className="font-mono text-slate-900 dark:text-white text-xs">{orders.length}</strong>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
              <span className="text-[10px] block font-bold">SOLICITUDES COMERCIOS (B2B)</span>
              <strong className="font-mono text-xs">{totalStoreOrdersAll}</strong>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400">
              <span className="text-[10px] block font-bold">CLIENTES APP</span>
              <strong className="font-mono text-xs">{totalClientOrdersAll}</strong>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
              <span className="text-[10px] block font-bold">EN RUTA ACTIVA</span>
              <strong className="font-mono text-xs">{activeOrdersCount}</strong>
            </div>
          </div>
        </div>

        {/* Origin Selector Tabs & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Tabs by Requester / Origin */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <button
              onClick={() => setOriginTab('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                originTab === 'todos'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos ({orders.length})
            </button>

            <button
              onClick={() => setOriginTab('comercio')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                originTab === 'comercio'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Solicitados por Comercios ({totalStoreOrdersAll})</span>
            </button>

            <button
              onClick={() => setOriginTab('cliente')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                originTab === 'cliente'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-500'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Solicitados por Clientes ({totalClientOrdersAll})</span>
            </button>
          </div>

          {/* Search, Status & Grouping Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar código, comercio, cliente..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full sm:w-56 outline-hidden focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white outline-hidden cursor-pointer"
            >
              <option value="todos">Todos los Estados</option>
              <option value="pendiente_pago">Pendiente Pago</option>
              <option value="pago_verificado">Pago Verificado</option>
              <option value="en_preparacion">En Preparación</option>
              <option value="esperando_repartidor">Esperando Repartidor</option>
              <option value="en_camino_al_comercio">En Camino a Tienda</option>
              <option value="en_camino_al_cliente">En Camino al Cliente</option>
              <option value="entregado">Entregado</option>
            </select>

            {/* Toggle grouping */}
            <button
              onClick={() => setGroupByRequester(!groupByRequester)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                groupByRequester
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
              title="Agrupar pedidos en la lista por tipo de emisor"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agrupar por Solicitante</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Orders Content: Grouped or Unified List */}
      {filteredOrders.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No se encontraron pedidos con los filtros aplicados
          </h4>
          <p className="text-xs text-slate-400">
            Intenta cambiar el término de búsqueda o restablecer el filtro de estado.
          </p>
        </div>
      ) : groupByRequester && originTab === 'todos' ? (
        /* GROUPED VIEW: STORE REQUESTS FIRST, THEN CLIENT REQUESTS */
        <div className="space-y-6">
          
          {/* GROUP 1: SOLICITADOS POR COMERCIOS (B2B EXPRESS) */}
          <div className="space-y-3">
            <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Solicitudes de Delivery Realizadas por Comercios</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                      B2B EXPRESS
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Comercios que contratan delivery para sus pedidos telefónicos o directos en tienda
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 font-bold text-amber-700 dark:text-amber-400">
                  {storeOrders.length} {storeOrders.length === 1 ? 'servicio registrado' : 'servicios registrados'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {storeOrders.map(renderOrderRow)}
            </div>
          </div>

          {/* GROUP 2: SOLICITADOS POR CLIENTES EN LA APP */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent rounded-2xl border border-blue-500/30 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Pedidos Solicitados por Clientes en la App</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black">
                      MARKETPLACE
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Usuarios que ordenan comida, víveres y artículos a través del catálogo de Vixy
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-blue-500/30 font-bold text-blue-700 dark:text-blue-400">
                  {clientOrders.length} {clientOrders.length === 1 ? 'pedido registrado' : 'pedidos registrados'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {clientOrders.map(renderOrderRow)}
            </div>
          </div>

        </div>
      ) : (
        /* UNIFIED LIST VIEW (WHEN FILTERED BY TAB OR GROUPING TOGGLED OFF) */
        <div className="space-y-2.5">
          {filteredOrders.map(renderOrderRow)}
        </div>
      )}

      {/* 3. Full Service Operation Modal ("Modo Ficha de Operación") */}
      <ServiceOperationModal
        order={modalOrder}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalOrder(null);
        }}
      />
    </div>
  );
};
