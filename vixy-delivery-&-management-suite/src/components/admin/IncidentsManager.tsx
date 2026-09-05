import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, ShieldAlert, Check } from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

export const IncidentsManager: React.FC = () => {
  const { incidents, resolveIncident } = useDelivery();
  const [resolutionText, setResolutionText] = useState<{ [id: string]: string }>({});

  const handleResolve = (id: string) => {
    const res = resolutionText[id] || 'Caso solucionado por el operador logístico de Vixy.';
    resolveIncident(id, res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Centro de Control & Gestión de Incidencias en Tiempo Real
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Monitoreo y resolución de novedades operativas (retrasos climáticos, fallas de moto, conciliación de pagos)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold">
            {incidents.filter(i => i.estado !== 'resuelta').length} Abiertas / En Revisión
          </span>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {incidents.map((inc) => (
          <div
            key={inc.id}
            className={`p-5 rounded-3xl border shadow-xs transition space-y-3 ${
              inc.estado === 'resuelta'
                ? 'bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 opacity-80'
                : 'bg-white dark:bg-neutral-850 border-amber-500/40'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  inc.estado === 'resuelta' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
                }`} />
                <span className="text-xs font-bold font-mono text-neutral-900 dark:text-white">
                  {inc.codigoIncidencia}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase font-semibold">
                  {inc.tipo.replace(/_/g, ' ')}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  inc.prioridad === 'alta' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  Prioridad {inc.prioridad.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span>Reportado: {inc.fechaCreacion}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                  inc.estado === 'resuelta'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {inc.estado.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="text-xs space-y-1.5">
              <p className="text-neutral-500 text-[11px]">
                <strong>Origen del reporte:</strong> {inc.reportanteNombre} ({inc.reportadoPor.toUpperCase()})
                {inc.pedidoId && <span className="ml-2 font-mono text-amber-500 font-bold">• Pedido: {inc.pedidoId}</span>}
              </p>
              <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium bg-neutral-50 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                "{inc.descripcion}"
              </p>
            </div>

            {/* Resolution Section */}
            {inc.estado === 'resuelta' ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1 text-emerald-800 dark:text-emerald-300">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Resolución del Caso:
                </span>
                <p>{inc.resolucion}</p>
              </div>
            ) : (
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={resolutionText[inc.id] || ''}
                  onChange={(e) => setResolutionText(prev => ({ ...prev, [inc.id]: e.target.value }))}
                  placeholder="Escribe la acción correctiva tomada para resolver esta incidencia..."
                  className="flex-1 text-xs p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
                />
                <button
                  onClick={() => handleResolve(inc.id)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <Check className="w-4 h-4" />
                  Marcar como Resuelta
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
