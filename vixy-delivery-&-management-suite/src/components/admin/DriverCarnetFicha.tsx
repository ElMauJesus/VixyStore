import React from 'react';
import { 
  Star, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Bike,
  ExternalLink,
  Calendar,
  Zap
} from 'lucide-react';
import { Conductor } from '../../types/delivery';

export interface DriverTripActivity {
  id: string;
  comercio: string;
  cliente: string;
  hora: string;
  distanciaKm: number;
  estado: string;
  costoTotalUsd: number;
  costoTotalBs: number;
  gananciaUsd: number;
  comisionUsd: number;
  distanciaExcedenteKm: number;
  costoAdicionalUsd: number;
}

interface DriverCarnetFichaProps {
  conductor: Conductor;
  carnetCode: string;
  isExpanded: boolean;
  onToggle: () => void;
  activities: DriverTripActivity[];
  tasaBcv: number;
  timeframe: 'dia' | 'semana' | 'mes';
  onTimeframeChange: (tf: 'dia' | 'semana' | 'mes') => void;
  onCall: () => void;
  onOpenDossier: () => void;
}

export const DriverCarnetFicha: React.FC<DriverCarnetFichaProps> = ({
  conductor,
  carnetCode,
  isExpanded,
  onToggle,
  activities,
  tasaBcv,
  timeframe,
  onTimeframeChange,
  onCall,
  onOpenDossier
}) => {
  const isOnline = conductor.disponible;
  const totalGanancia = activities.reduce((s, a) => s + a.gananciaUsd, 0);
  const totalKm = activities.reduce((s, a) => s + a.distanciaKm, 0);

  return (
    <div 
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isExpanded 
          ? 'bg-white dark:bg-neutral-900 border-amber-400 dark:border-amber-500 shadow-md ring-1 ring-amber-400/30' 
          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-amber-400/80 dark:hover:border-neutral-700 shadow-xs hover:shadow-sm'
      }`}
    >
      {/* 1. FICHA PEQUEÑA (CABECERA CLICKEABLE) */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-3 sm:py-3 sm:px-4 flex items-center justify-between gap-3 cursor-pointer select-none transition hover:bg-neutral-50/70 dark:hover:bg-neutral-850/50"
      >
        {/* Foto & Nombre */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Foto del conductor con indicador de disponibilidad */}
          <div className="relative shrink-0">
            <img
              src={conductor.fotoUrl}
              alt={conductor.nombre}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-amber-400 dark:border-amber-500 shadow-2xs"
            />
            <span 
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-900 ${
                isOnline ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              title={isOnline ? 'Disponible' : 'En carrera'}
            />
          </div>

          {/* Nombre & Estado */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-sm sm:text-base font-display font-bold text-neutral-900 dark:text-white truncate">
                {conductor.nombre} {conductor.apellido}
              </h3>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono text-neutral-400 dark:text-neutral-500 shrink-0">
                #{carnetCode}
              </span>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              <span>{isOnline ? 'Disponible' : 'En Reparto'}</span>
              <span>•</span>
              <span className="font-mono text-neutral-600 dark:text-neutral-300">[{conductor.moto.placa}]</span>
            </p>
          </div>
        </div>

        {/* Rating & Saldo */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Rating */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-bold font-mono">{conductor.rating.toFixed(1)}</span>
          </div>

          {/* Saldo */}
          <div className="text-right shrink-0 min-w-[70px]">
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block leading-none">
              Saldo
            </span>
            <span className={`text-xs sm:text-sm font-mono font-black block mt-0.5 ${
              conductor.billetera.saldoUsd >= 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-red-500'
            }`}>
              ${conductor.billetera.saldoUsd.toFixed(2)}
            </span>
          </div>

          {/* Flecha indicadora de desplegable */}
          <div className="p-1 rounded-lg text-neutral-400 group-hover:text-amber-500 transition">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-amber-500" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </button>

      {/* 2. LISTA DE ACTIVIDADES (SE DESPLIEGA AL DARLE CLICK) */}
      {isExpanded && (
        <div className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/60 p-4 space-y-3.5 animate-in fade-in duration-150">
          {/* Header de Actividades con Filtro de Período */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wide">
                Lista de Actividades y Carreras
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                {activities.length} viajes
              </span>
            </div>

            {/* Selector de Período */}
            <div className="flex items-center bg-white dark:bg-neutral-900 p-0.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs">
              <button
                type="button"
                onClick={() => onTimeframeChange('dia')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  timeframe === 'dia'
                    ? 'bg-amber-500 text-neutral-950 font-black shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => onTimeframeChange('semana')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  timeframe === 'semana'
                    ? 'bg-amber-500 text-neutral-950 font-black shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Semana
              </button>
              <button
                type="button"
                onClick={() => onTimeframeChange('mes')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  timeframe === 'mes'
                    ? 'bg-amber-500 text-neutral-950 font-black shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Mes
              </button>
            </div>
          </div>

          {/* Banner de Tarifa Oficial Aplicada */}
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-neutral-700 dark:text-neutral-300 truncate">
                Tarifa: <strong>$2.00 USD</strong> hasta 3 km • <strong>+$0.50</strong> por km adicional
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              Total: +${totalGanancia.toFixed(2)} USD
            </span>
          </div>

          {/* Resumen Métrico Rápido */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[9px] uppercase font-bold text-neutral-400 block">Carreras</span>
              <span className="font-mono font-black text-neutral-900 dark:text-white mt-0.5 block">
                {activities.length}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[9px] uppercase font-bold text-neutral-400 block">Recorrido</span>
              <span className="font-mono font-black text-neutral-900 dark:text-white mt-0.5 block">
                {totalKm.toFixed(1)} km
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[9px] uppercase font-bold text-neutral-400 block">Ganancia Neta</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                +${totalGanancia.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Lista de Actividades Recientes */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden">
            {activities.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-400">
                No hay carreras registradas en este período.
              </div>
            ) : (
              activities.map(act => (
                <div key={act.id} className="p-3 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">
                        #{act.id}
                      </span>
                      <span className="text-neutral-300 dark:text-neutral-700">•</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                        {act.comercio}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-500 truncate">
                      Cliente: {act.cliente}
                    </p>

                    <p className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5 flex-wrap">
                      <span>{act.distanciaKm} km</span>
                      <span>•</span>
                      {act.distanciaKm <= 3.0 ? (
                        <span>Tarifa mín: $2.00 USD</span>
                      ) : (
                        <span>$2.00 + (+{act.distanciaExcedenteKm.toFixed(1)}km × $0.50) = ${act.costoTotalUsd.toFixed(2)}</span>
                      )}
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{act.estado}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800 pt-1.5 sm:pt-0">
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm block">
                      +${act.gananciaUsd.toFixed(2)} USD
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400 block">
                      Bs. {(act.gananciaUsd * tasaBcv).toFixed(2)} • {act.hora}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Barra de Acciones del Conductor */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={onCall}
              className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white dark:text-emerald-400 dark:hover:text-neutral-950 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Llamar ({conductor.telefono})</span>
            </button>

            <button
              type="button"
              onClick={onOpenDossier}
              className="py-2 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Ver Expediente y Documentos</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
