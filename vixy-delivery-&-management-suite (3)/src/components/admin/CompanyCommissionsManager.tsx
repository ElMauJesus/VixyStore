import React, { useState } from 'react';
import { 
  Percent, 
  Wallet, 
  QrCode, 
  Save, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  Phone, 
  CreditCard, 
  User, 
  Eye, 
  Sparkles,
  RefreshCw,
  Sliders,
  Database,
  Info,
  Layers,
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { PagoMovilModal } from '../common/PagoMovilModal';

export const CompanyCommissionsManager: React.FC = () => {
  const { 
    porcentajeComisionComercio, 
    setPorcentajeComisionComercio, 
    carterasConfig, 
    updateCarterasConfig, 
    pagoMovilConfig, 
    updatePagoMovilConfig,
    deliveryRates,
    updateDeliveryRates,
    tasaBcv,
    addActivityLog
  } = useDelivery();

  // Local form states
  const [comisionComercioInput, setComisionComercioInput] = useState(porcentajeComisionComercio.toString());
  const [comisionDeliveryInput, setComisionDeliveryInput] = useState((deliveryRates?.porcentajeComisionDelivery ?? 0).toString());
  
  // Carteras local state
  const [globalCarteras, setGlobalCarteras] = useState(carterasConfig.habilitadasGlobal);
  const [comerciosCarteras, setComerciosCarteras] = useState(carterasConfig.comerciosHabilitada);
  const [deliveriesCarteras, setDeliveriesCarteras] = useState(carterasConfig.deliveriesHabilitada);
  const [clientesCarteras, setClientesCarteras] = useState(carterasConfig.clientesHabilitada);
  const [mensajeMantenimiento, setMensajeMantenimiento] = useState(carterasConfig.mensajeMantenimiento || '');

  // Pago Móvil local state
  const [bancoInput, setBancoInput] = useState(pagoMovilConfig.banco);
  const [telefonoInput, setTelefonoInput] = useState(pagoMovilConfig.telefono);
  const [cedulaRifInput, setCedulaRifInput] = useState(pagoMovilConfig.cedulaRif);
  const [titularInput, setTitularInput] = useState(pagoMovilConfig.nombreTitular);
  const [qrImageUrlInput, setQrImageUrlInput] = useState(pagoMovilConfig.qrImageUrl);

  // Status feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Simulation state for live calculation preview
  const [simulatedStoreSale, setSimulatedStoreSale] = useState(25.0);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Update Commission Percentage
    const numComision = parseFloat(comisionComercioInput);
    if (!isNaN(numComision)) {
      setPorcentajeComisionComercio(numComision);
    }

    const numComisionDelivery = parseFloat(comisionDeliveryInput);
    if (!isNaN(numComisionDelivery) && updateDeliveryRates) {
      updateDeliveryRates({
        porcentajeComisionDelivery: numComisionDelivery,
        comisionMotorizadoPorcentaje: 100 - numComisionDelivery
      });
    }

    // 2. Update Carteras Status (syncs across all apps)
    updateCarterasConfig({
      habilitadasGlobal: globalCarteras,
      comerciosHabilitada: comerciosCarteras,
      deliveriesHabilitada: deliveriesCarteras,
      clientesHabilitada: clientesCarteras,
      mensajeMantenimiento: mensajeMantenimiento.trim() || undefined
    });

    // 3. Update Official Pago Móvil Data (syncs to modal in all apps)
    updatePagoMovilConfig({
      banco: bancoInput.trim(),
      telefono: telefonoInput.trim(),
      cedulaRif: cedulaRifInput.trim(),
      nombreTitular: titularInput.trim(),
      qrImageUrl: qrImageUrlInput.trim()
    });

    addActivityLog({
      accion: 'configuracion_actualizada',
      usuario: 'Administrador Web',
      ip: '192.168.1.1',
      detalles: `Comisiones actualizadas: Comercio ${comisionComercioInput}%, Delivery ${comisionDeliveryInput}%. Carteras: ${globalCarteras ? 'ACTIVAS' : 'INACTIVAS'}. Datos Pago Móvil actualizados.`
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleGenerateDefaultQr = () => {
    const defaultQr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAGOMOVIL%20${encodeURIComponent(bancoInput)}%20${encodeURIComponent(telefonoInput)}%20${encodeURIComponent(cedulaRifInput)}`;
    setQrImageUrlInput(defaultQr);
  };

  const parsedComision = parseFloat(comisionComercioInput) || 0;
  const simulatedComisionUsd = parseFloat(((simulatedStoreSale * parsedComision) / 100).toFixed(2));
  const simulatedComercioNetoUsd = parseFloat((simulatedStoreSale - simulatedComisionUsd).toFixed(2));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5" />
              Gestión de Comisiones & Carteras
            </span>
            <span className="text-xs text-neutral-400 font-mono">Tabla: configuracion_empresa</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white mt-1.5 flex items-center gap-2.5">
            Porcentajes de Comisión & Control Central de Pagos
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
            Configura el porcentaje de comisión sobre ventas de Vixy Store (inicia en 0%), controla la disponibilidad operativa de las carteras digitales en tiempo real y gestiona los datos oficiales del Pago Móvil fijo con código QR para todas las aplicaciones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center gap-2 transition cursor-pointer border border-neutral-200 dark:border-neutral-700 shadow-2xs"
          >
            <Eye className="w-4 h-4 text-amber-500" />
            <span>Previsualizar Modal Pago Móvil</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-xs font-bold animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>¡Todos los cambios han sido sincronizados exitosamente con la base de datos SQL y las aplicaciones activas (Vixy Pedidos, Vixy Store y Vixy Delivery)!</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* SECCIÓN 1: PORCENTAJES DE COMISIÓN DE EMPRESA */}
        <div className="bg-white dark:bg-neutral-850 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
                  1. Porcentaje de Comisión de Servicios de Empresa (Vixy Store)
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Modificador general de comisión. Inicia en 0%. No altera los precios fijados por el comercio.
                </p>
              </div>
            </div>

            <span className="text-xs px-3 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-black rounded-xl">
              Comisión Actual: {porcentajeComisionComercio}%
            </span>
          </div>

          {/* Scope note */}
          <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-amber-800 dark:text-amber-300 text-xs">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Protección de Precios al Consumidor</span>
              <p className="leading-relaxed opacity-90">
                Este porcentaje <strong>comienza en 0%</strong> por defecto y se deduce <strong>exclusivamente durante el corte contable de la cartera</strong> del comercio afiliado. Los precios de venta al público en los catálogos de Vixy Store <strong>NO son incrementados ni alterados</strong> por este modificador.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Input Comisión Comercios */}
            <div className="space-y-2 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Porcentaje de Comisión a Comercios (%):</span>
                <span className="text-[10px] text-neutral-400 font-normal">Valor entre 0% y 100%</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={comisionComercioInput}
                  onChange={(e) => setComisionComercioInput(e.target.value)}
                  className="w-full p-3 pl-4 pr-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 text-sm font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                  placeholder="0"
                />
                <span className="absolute right-4 top-3 text-sm font-bold text-neutral-400">%</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Al estar en 0%, el comercio recibe el 100% íntegro de sus ventas de artículos en su cartera.
              </p>
            </div>

            {/* Input Comisión Deliveries */}
            <div className="space-y-2 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Porcentaje de Comisión a Repartidores / Delivery (%):</span>
                <span className="text-[10px] text-neutral-400 font-normal">Flete de transporte</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={comisionDeliveryInput}
                  onChange={(e) => setComisionDeliveryInput(e.target.value)}
                  className="w-full p-3 pl-4 pr-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 text-sm font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                  placeholder="0"
                />
                <span className="absolute right-4 top-3 text-sm font-bold text-neutral-400">%</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Retención de plataforma por concepto de despacho y asignación de ruta.
              </p>
            </div>
          </div>

          {/* Live Simulator */}
          <div className="p-4 bg-neutral-900 text-white rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-4 h-4" />
                Simulador Dinámico de Liquidación en Cartera
              </span>
              <span className="text-neutral-400 text-[11px]">Tasa BCV: Bs. {tasaBcv.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-neutral-800 p-3 rounded-xl">
                <span className="text-[10px] text-neutral-400 block">Venta Bruta en Tienda</span>
                <input 
                  type="number" 
                  value={simulatedStoreSale}
                  onChange={(e) => setSimulatedStoreSale(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-700 px-2 py-1 rounded text-white font-mono font-bold text-sm mt-1"
                />
              </div>

              <div className="bg-neutral-800 p-3 rounded-xl">
                <span className="text-[10px] text-neutral-400 block">Precio al Cliente</span>
                <span className="text-sm font-black font-mono text-emerald-400 block mt-1">
                  ${simulatedStoreSale.toFixed(2)} USD
                </span>
                <span className="text-[9px] text-neutral-400">Sin recargo artificial</span>
              </div>

              <div className="bg-neutral-800 p-3 rounded-xl">
                <span className="text-[10px] text-neutral-400 block">Comisión Empresa ({parsedComision}%)</span>
                <span className="text-sm font-black font-mono text-amber-400 block mt-1">
                  -${simulatedComisionUsd.toFixed(2)} USD
                </span>
                <span className="text-[9px] text-neutral-400">Bs. {(simulatedComisionUsd * tasaBcv).toFixed(2)}</span>
              </div>

              <div className="bg-neutral-800 p-3 rounded-xl border border-emerald-500/30">
                <span className="text-[10px] text-neutral-400 block">Neto Liquidado en Cartera</span>
                <span className="text-sm font-black font-mono text-white block mt-1">
                  ${simulatedComercioNetoUsd.toFixed(2)} USD
                </span>
                <span className="text-[9px] text-emerald-400 font-bold">100% disponible</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: CONTROL CENTRAL DE CARTERAS (ACTIVAR / DESACTIVAR) */}
        <div className="bg-white dark:bg-neutral-850 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-black">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
                  2. Activación & Desactivación de Carteras Digitales
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Controla la disponibilidad del saldo en cartera para clientes, comercios y motorizados en tiempo real.
                </p>
              </div>
            </div>

            <span className={`text-xs px-3 py-1 font-mono font-bold rounded-xl ${
              globalCarteras 
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                : 'bg-red-500/15 text-red-600 dark:text-red-400'
            }`}>
              {globalCarteras ? 'Carteras ACTIVAS' : 'Carteras PAUSADAS'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Switch Global */}
            <div className={`p-4 rounded-2xl border transition ${
              globalCarteras 
                ? 'bg-purple-500/5 border-purple-500/30' 
                : 'bg-neutral-100 dark:bg-neutral-800/40 border-neutral-300 dark:border-neutral-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-900 dark:text-white">
                  Interruptor Maestro Global
                </span>
                <button
                  type="button"
                  onClick={() => setGlobalCarteras(!globalCarteras)}
                  className="cursor-pointer transition"
                >
                  {globalCarteras ? (
                    <ToggleRight className="w-8 h-8 text-purple-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-neutral-400" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
                Habilita o deshabilita todas las operaciones de billetera en el ecosistema Vixy de manera simultánea.
              </p>
            </div>

            {/* Switch Vixy Store (Comercios) */}
            <div className={`p-4 rounded-2xl border transition ${
              comerciosCarteras && globalCarteras
                ? 'bg-amber-500/5 border-amber-500/30' 
                : 'bg-neutral-100 dark:bg-neutral-800/40 border-neutral-300 dark:border-neutral-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-900 dark:text-white">
                  Cartera Comercios (Vixy Store)
                </span>
                <button
                  type="button"
                  onClick={() => setComerciosCarteras(!comerciosCarteras)}
                  className="cursor-pointer transition"
                >
                  {comerciosCarteras && globalCarteras ? (
                    <ToggleRight className="w-8 h-8 text-amber-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-neutral-400" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
                Permite a los comercios acumular saldos de ventas y solicitar liquidaciones a sus cuentas bancarias.
              </p>
            </div>

            {/* Switch Vixy Delivery (Repartidores) */}
            <div className={`p-4 rounded-2xl border transition ${
              deliveriesCarteras && globalCarteras
                ? 'bg-blue-500/5 border-blue-500/30' 
                : 'bg-neutral-100 dark:bg-neutral-800/40 border-neutral-300 dark:border-neutral-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-900 dark:text-white">
                  Cartera Drivers (Vixy Delivery)
                </span>
                <button
                  type="button"
                  onClick={() => setDeliveriesCarteras(!deliveriesCarteras)}
                  className="cursor-pointer transition"
                >
                  {deliveriesCarteras && globalCarteras ? (
                    <ToggleRight className="w-8 h-8 text-blue-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-neutral-400" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
                Habilita el cobro de comisiones y recargas de saldo de combustible y fletes a los motorizados.
              </p>
            </div>

            {/* Switch Vixy Pedidos (Clientes) */}
            <div className={`p-4 rounded-2xl border transition ${
              clientesCarteras && globalCarteras
                ? 'bg-emerald-500/5 border-emerald-500/30' 
                : 'bg-neutral-100 dark:bg-neutral-800/40 border-neutral-300 dark:border-neutral-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-neutral-900 dark:text-white">
                  Cartera Clientes (Vixy Pedidos)
                </span>
                <button
                  type="button"
                  onClick={() => setClientesCarteras(!clientesCarteras)}
                  className="cursor-pointer transition"
                >
                  {clientesCarteras && globalCarteras ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-neutral-400" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
                Si se desactiva, los clientes no podrán pagar pedidos con saldo y usarán el método fijo <strong>Pago Móvil</strong>.
              </p>
            </div>
          </div>

          {/* Mensaje de mantenimiento */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
              Mensaje Informativo cuando las carteras estén en pausa o mantenimiento:
            </label>
            <input 
              type="text"
              value={mensajeMantenimiento}
              onChange={(e) => setMensajeMantenimiento(e.target.value)}
              placeholder="El sistema de cartera se encuentra en mantenimiento programado. Por favor utiliza Pago Móvil directo."
              className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* SECCIÓN 3: DATOS OFICIALES DE PAGO MÓVIL FIJO & QR */}
        <div className="bg-white dark:bg-neutral-850 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-black">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
                  3. Datos de Pago Móvil Fijo & Código QR Oficial de la Empresa
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Estos datos bancarios y el código QR se presentarán automáticamente en la ventana emergente de pago de todas las apps.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateDefaultQr}
              className="text-xs px-3 py-1.5 bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold rounded-xl flex items-center gap-1.5 hover:bg-orange-500/25 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Generar QR Automático
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Banco */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-orange-500" />
                Banco Oficial:
              </label>
              <input
                type="text"
                value={bancoInput}
                onChange={(e) => setBancoInput(e.target.value)}
                placeholder="Ej. 0102 - Banco de Venezuela"
                className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-500" />
                Número de Teléfono / Celular:
              </label>
              <input
                type="text"
                value={telefonoInput}
                onChange={(e) => setTelefonoInput(e.target.value)}
                placeholder="Ej. 0414-1234567"
                className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            {/* Cédula o RIF */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-orange-500" />
                Cédula de Identidad o RIF:
              </label>
              <input
                type="text"
                value={cedulaRifInput}
                onChange={(e) => setCedulaRifInput(e.target.value)}
                placeholder="Ej. J-50123456-0 o V-12345678"
                className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            {/* Titular */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-500" />
                Nombre del Titular de la Cuenta:
              </label>
              <input
                type="text"
                value={titularInput}
                onChange={(e) => setTitularInput(e.target.value)}
                placeholder="Ej. Vixy Delivery C.A."
                className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            {/* URL o Imagen del Código QR */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-orange-500" />
                URL de Imagen o Enlace de Código QR para Escanear:
              </label>
              <input
                type="text"
                value={qrImageUrlInput}
                onChange={(e) => setQrImageUrlInput(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
              <p className="text-[10px] text-neutral-500">
                Puedes pegar una URL directa a tu imagen de código QR de banco o utilizar el botón "Generar QR Automático" para crearlo a partir de tus datos bancarios.
              </p>
            </div>
          </div>

          {/* QR Preview Box */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 flex flex-col sm:flex-row items-center gap-4">
            <div className="p-2 bg-white rounded-xl shadow-xs border border-neutral-200 shrink-0">
              <img 
                src={qrImageUrlInput || 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VIXY'} 
                alt="Vista previa QR" 
                className="w-24 h-24 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-xs space-y-1">
              <span className="font-extrabold text-neutral-900 dark:text-white block">
                Vista Previa del Código QR Oficial
              </span>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                Banco: <strong>{bancoInput}</strong> • Tlf: <strong>{telefonoInput}</strong> • RIF: <strong>{cedulaRifInput}</strong>
              </p>
              <p className="text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                Al escanear este código, los clientes y repartidores verán cargados de forma automática los datos para procesar su pago móvil sin cometer errores de tipeo.
              </p>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración en MySQL & Sincronizar Apps</span>
          </button>
        </div>
      </form>

      {/* Reusable Pago Móvil Preview Modal */}
      <PagoMovilModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        montoUsd={15.00}
        concepto="Simulación de Pago de Pedido Vixy"
      />
    </div>
  );
};
