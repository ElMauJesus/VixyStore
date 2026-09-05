import React, { useState } from 'react';
import { 
  DollarSign, 
  Save, 
  Sliders, 
  Database, 
  ShieldAlert, 
  Check, 
  Info, 
  Bike, 
  Navigation, 
  Calculator, 
  Percent, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

export const PaymentConfigManager: React.FC = () => {
  const { 
    tasaBcv, 
    deliveryRates, 
    updateDeliveryRates, 
    calculateDeliveryTripCost 
  } = useDelivery();

  const [localTasa, setLocalTasa] = useState(tasaBcv.toString());
  const [comisionDelivery, setComisionDelivery] = useState(deliveryRates.porcentajeComisionDelivery.toString());
  const [tarifaBaseMinima, setTarifaBaseMinima] = useState(deliveryRates.tarifaBaseMinimaUsd.toString());
  const [costoPorFraccion, setCostoPorFraccion] = useState(deliveryRates.costoPorFraccionUsd.toString());
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Simulation State
  const [simulatedKm, setSimulatedKm] = useState(4.2);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const tVal = parseFloat(localTasa);
    const comVal = parseFloat(comisionDelivery);
    const baseVal = parseFloat(tarifaBaseMinima);
    const fracVal = parseFloat(costoPorFraccion);

    if (!isNaN(tVal) && !isNaN(comVal) && !isNaN(baseVal) && !isNaN(fracVal)) {
      updateDeliveryRates({
        tasaBcvBs: tVal,
        porcentajeComisionDelivery: comVal,
        tarifaBaseMinimaUsd: baseVal,
        distanciaBaseKm: 3.0,
        fraccionCalculoKm: 1.0,
        costoPorFraccionUsd: fracVal,
        comisionMotorizadoPorcentaje: 100 - comVal
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    }
  };

  const simulation = calculateDeliveryTripCost(simulatedKm);

  return (
    <div className="space-y-6">
      {/* Header Bento */}
      <div className="p-5 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Economía & Tarifas Operativas
            </span>
            <span className="text-xs text-neutral-400 font-mono">Tabla: configuracion_tarifas_delivery</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-1 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            Tasas BCV & Tarifas de Servicio Delivery
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Configuración de la tasa cambiaria oficial, comisión de servicio de plataforma y cálculo de viaje mínimo (3 km) con tramos de 0.5 km.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-bounce">
            <Check className="w-4 h-4" />
            ¡Parámetros y comisión sincronizados en MySQL!
          </span>
        )}
      </div>

      {/* Explicit Legal / Operational Scope Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-amber-800 dark:text-amber-300">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold block uppercase tracking-wider">
            Regla de Alcance Estricto: Comisión de Delivery vs Precios de Comercios
          </span>
          <p className="leading-relaxed opacity-90">
            Los porcentajes y márgenes configurados en esta pestaña <strong>aplican exclusivamente al costo del servicio de transporte/delivery</strong>. 
            Esta pestaña <strong>NO maneja, no interfiere ni modifica los precios de venta de los artículos o productos</strong> ofrecidos por los comercios afiliados (Vixy Store), los cuales son administrados de manera soberana e individual por cada establecimiento en su respectivo catálogo.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Box 1: Tasa Oficial BCV & Comisión Delivery */}
          <div className="p-6 bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                1. Tasa Oficial BCV y Comisión de Servicio
              </h3>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold font-mono">
                USD / VED
              </span>
            </div>

            {/* Tasa BCV Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Tasa Oficial del Día (Banco Central de Venezuela):
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">Bs. por $1.00 USD</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 font-mono">
                  Bs.
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={localTasa}
                  onChange={(e) => setLocalTasa(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-xl border border-neutral-200 dark:border-neutral-700 text-base font-mono font-bold outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[10px] text-neutral-500">
                Se propaga automáticamente a todos los cobros en Bolívares por Pago Móvil y efectivo.
              </p>
            </div>

            {/* Comisión Delivery Porcentaje */}
            <div className="space-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-500" />
                  Porcentaje de Comisión por Servicio de Delivery:
                </label>
                <span className="text-sm font-black font-mono text-amber-500">
                  {comisionDelivery}%
                </span>
              </div>

              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={comisionDelivery}
                onChange={(e) => setComisionDelivery(e.target.value)}
                className="w-full accent-amber-500 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>5% (Mínimo)</span>
                <span>12% (Estándar Vixy)</span>
                <span>30% (Máximo)</span>
              </div>

              {/* Reparto de Ingresos Delivery */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Distribución del Flete de Delivery
                </span>
                <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300">
                  <span>Comisión Vixy Plataforma:</span>
                  <span className="font-bold text-amber-500 font-mono">{comisionDelivery}% del flete</span>
                </div>
                <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300">
                  <span>Ganancia Neta del Motorizado:</span>
                  <span className="font-bold text-emerald-500 font-mono">
                    {(100 - (parseFloat(comisionDelivery) || 0)).toFixed(0)}% del flete
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: Viaje Mínimo (3 km) y Tramos de 0.5 km */}
          <div className="p-6 bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Bike className="w-4 h-4 text-amber-500" />
                2. Parámetros de Viaje Mínimo & Distancia
              </h3>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-bold font-mono">
                3 KM BASE + 0.5 KM
              </span>
            </div>

            {/* Tarifa Base 3 km */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Tarifa Mínima de Servicio (Hasta 3.0 km incluidos):
                </label>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">$ USD</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 font-mono">
                  $
                </span>
                <input
                  type="number"
                  step="0.10"
                  required
                  value={tarifaBaseMinima}
                  onChange={(e) => setTarifaBaseMinima(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-xl border border-neutral-200 dark:border-neutral-700 text-base font-mono font-bold outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <p className="text-[10px] text-neutral-500">
                Tarifa mínima fija: <strong>$2.00 USD</strong> que cubren los primeros <strong>3.0 km de recorrido</strong>.
              </p>
            </div>

            {/* Cálculo a partir de 3.0 km */}
            <div className="space-y-1.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Costo por Km Adicional (después de 3.0 km de recorrido):
                </label>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">$ USD / km</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 font-mono">
                  $
                </span>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={costoPorFraccion}
                  onChange={(e) => setCostoPorFraccion(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-xl border border-neutral-200 dark:border-neutral-700 text-base font-mono font-bold outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <p className="text-[10px] text-neutral-500">
                A partir de los 3 km de recorrido, se suma exactamente <strong>$0.50 USD por cada kilómetro adicional</strong>.
              </p>
            </div>

            {/* Mathematical explanation */}
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1">
              <span className="font-bold text-neutral-800 dark:text-neutral-200 block">Fórmula de Tarificación Vigente:</span>
              <p className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                Distancia ≤ 3.0 km ➔ Costo = ${tarifaBaseMinima} USD
              </p>
              <p className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                Distancia &gt; 3.0 km ➔ Costo = ${tarifaBaseMinima} + (km - 3.0) × ${costoPorFraccion} USD
              </p>
            </div>
          </div>
        </div>

        {/* Save Button Bar */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Parámetros en Base de Datos MySQL</span>
          </button>
        </div>
      </form>

      {/* Simulator Section: Interactive Kilometers & Breakdown */}
      <div className="p-6 bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-500" />
              Simulador Interactivo de Tarifas de Delivery
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Prueba en tiempo real cómo se calcula el flete para el cliente según los kilómetros del viaje
            </p>
          </div>

          <span className="px-3 py-1 bg-amber-500/10 text-amber-500 font-mono font-bold text-xs rounded-xl">
            Distancia: {simulatedKm.toFixed(1)} KM
          </span>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              Distancia desde el Comercio hasta el Cliente:
            </span>
            <span className="font-mono font-bold text-amber-500 text-sm">
              {simulatedKm.toFixed(1)} km
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="15.0"
            step="0.5"
            value={simulatedKm}
            onChange={(e) => setSimulatedKm(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
            <span>0.5 km (Mínimo cálculo)</span>
            <span>3.0 km (Fin de tramo base)</span>
            <span>7.5 km</span>
            <span>15.0 km (Zona metropolitana)</span>
          </div>
        </div>

        {/* Breakdown Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">Tarifa Mínima (≤3 km)</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
                ${simulation.tarifaBaseUsd.toFixed(2)}
              </span>
              <span className="text-[10px] text-neutral-400">USD</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">
              Cubre hasta 3.0 km de recorrido
            </span>
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">Km Adicionales (&gt;3 km)</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-amber-500">
                +${simulation.costoAdicionalUsd.toFixed(2)}
              </span>
              <span className="text-[10px] text-neutral-400">USD</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">
              {simulation.distanciaExcedenteKm > 0 
                ? `+${simulation.distanciaExcedenteKm.toFixed(1)} km a $0.50/km` 
                : 'Sin excedente (dentro de 3 km)'}
            </span>
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">Comisión Vixy ({deliveryRates.porcentajeComisionDelivery}%)</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                ${simulation.comisionPlataformaUsd.toFixed(2)}
              </span>
              <span className="text-[10px] text-neutral-400">USD</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">
              Retención de servicio plataforma
            </span>
          </div>

          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
              Ganancia Conductor ({deliveryRates.comisionMotorizadoPorcentaje}%)
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                ${simulation.gananciaMotorizadoUsd.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-600/70">USD</span>
            </div>
            <span className="text-[10px] text-emerald-600/80 mt-0.5 block">
              Ingreso directo a cartera
            </span>
          </div>
        </div>

        {/* Total Cost Display */}
        <div className="p-4 bg-neutral-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Total Flete a Cobrar al Cliente
            </span>
            <h4 className="text-lg font-bold text-white">
              Costo de Envío para {simulatedKm.toFixed(1)} km
            </h4>
          </div>

          <div className="text-right">
            <div className="flex items-baseline gap-2 justify-end">
              <span className="text-2xl font-black font-mono text-amber-400">
                ${simulation.totalViajeUsd.toFixed(2)} USD
              </span>
              <span className="text-sm font-mono text-neutral-300">
                (Bs. {simulation.totalViajeBs.toFixed(2)})
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              Calculado a tasa BCV oficial {tasaBcv.toFixed(2)} Bs/USD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
