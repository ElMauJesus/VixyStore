import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Shield, 
  ShoppingBag, 
  Bike, 
  Store, 
  DollarSign, 
  LifeBuoy, 
  Cpu, 
  Clock, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Database
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { LogActividad } from '../../types/delivery';

export const ActivityLogsManager: React.FC = () => {
  const { activityLogs, clearActivityLogs } = useDelivery();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('todos');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('todos');
  const [selectedLog, setSelectedLog] = useState<LogActividad | null>(null);

  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      const matchModule = selectedModule === 'todos' || log.modulo === selectedModule;
      const matchSeverity = selectedSeverity === 'todos' || log.severidad === selectedSeverity;
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = !searchTerm || 
        log.accion.toLowerCase().includes(searchLower) ||
        log.detalles.toLowerCase().includes(searchLower) ||
        log.usuarioNombre.toLowerCase().includes(searchLower) ||
        log.ip.toLowerCase().includes(searchLower);

      return matchModule && matchSeverity && matchSearch;
    });
  }, [activityLogs, selectedModule, selectedSeverity, searchTerm]);

  const exportLogsAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vixy_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getModuleIcon = (modulo: string) => {
    switch (modulo) {
      case 'seguridad':
        return <Shield className="w-4 h-4 text-purple-500" />;
      case 'pedidos':
        return <ShoppingBag className="w-4 h-4 text-amber-500" />;
      case 'conductores':
        return <Bike className="w-4 h-4 text-emerald-500" />;
      case 'comercios':
        return <Store className="w-4 h-4 text-sky-500" />;
      case 'tarifas':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'soporte':
        return <LifeBuoy className="w-4 h-4 text-rose-500" />;
      default:
        return <Cpu className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'exito':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Éxito
          </span>
        );
      case 'advertencia':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Aviso
          </span>
        );
      case 'critico':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Crítico
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Info
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="p-5 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Auditoría & Trazabilidad MySQL
            </span>
            <span className="text-xs text-neutral-400 font-mono">Tabla: logs_actividades_sistema</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Log Central de Actividades del Sistema
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Registro cronológico inmutable de todas las operaciones administrativas, cambios de tarifas BCV, auditorías de pagos y asignación de motorizados.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={exportLogsAsJSON}
            className="px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-neutral-200 dark:border-neutral-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar JSON</span>
          </button>

          {activityLogs.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('¿Desea vaciar el buffer de auditoría local? (En servidor MySQL los registros permanecen archivados).')) {
                  clearActivityLogs();
                }
              }}
              className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
              title="Limpiar vista actual"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Registros</span>
          <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">{activityLogs.length}</span>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block">Eventos de Seguridad</span>
          <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
            {activityLogs.filter(l => l.modulo === 'seguridad').length}
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block">Cambios de Tarifas</span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {activityLogs.filter(l => l.modulo === 'tarifas').length}
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block">Operaciones Logística</span>
          <span className="text-xl font-bold font-mono text-amber-500">
            {activityLogs.filter(l => l.modulo === 'pedidos' || l.modulo === 'conductores').length}
          </span>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por acción, usuario, detalles o dirección IP..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Module Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-neutral-400 font-semibold shrink-0">Módulo:</span>
            {['todos', 'seguridad', 'pedidos', 'conductores', 'tarifas', 'sistema'].map(mod => (
              <button
                key={mod}
                onClick={() => setSelectedModule(mod)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition shrink-0 cursor-pointer ${
                  selectedModule === mod
                    ? 'bg-amber-500 text-neutral-950 shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>

        {/* Severity filter row */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-400 font-medium">Severidad:</span>
          {['todos', 'info', 'exito', 'advertencia', 'critico'].map(sev => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize transition cursor-pointer ${
                selectedSeverity === sev
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {sev}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-neutral-400 font-mono">
            Mostrando {filteredLogs.length} de {activityLogs.length} logs
          </span>
        </div>
      </div>

      {/* Logs Table / Timeline List */}
      <div className="bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <Database className="w-8 h-8 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
            <p className="text-xs font-medium">No se encontraron registros que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getModuleIcon(log.modulo)}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {log.accion}
                      </span>
                      {getSeverityBadge(log.severidad)}
                      <span className="px-2 py-0.2 rounded text-[9px] uppercase font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                        {log.modulo}
                      </span>
                    </div>

                    <p className="text-neutral-600 dark:text-neutral-300 line-clamp-1">
                      {log.detalles}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-mono">
                      <span>👤 {log.usuarioNombre} ({log.usuarioRol})</span>
                      <span>•</span>
                      <span>🌐 {log.ip}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:text-right shrink-0">
                  <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span>{log.fecha}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                {getModuleIcon(selectedLog.modulo)}
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Detalle de Actividad #{selectedLog.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-neutral-400 hover:text-white text-base font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block">Acción Ejecutada</label>
                <p className="font-bold text-neutral-900 dark:text-white text-sm mt-0.5">{selectedLog.accion}</p>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block">Descripción y Carga Útil</label>
                <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-xl text-neutral-800 dark:text-neutral-200 font-mono leading-relaxed mt-1">
                  {selectedLog.detalles}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block">Usuario / Actor</label>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                    {selectedLog.usuarioNombre} <span className="text-[10px] font-mono text-neutral-400">({selectedLog.usuarioRol})</span>
                  </p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block">Módulo Afectado</label>
                  <p className="font-semibold uppercase font-mono text-neutral-800 dark:text-neutral-200 mt-0.5">{selectedLog.modulo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block">Fecha y Hora UTC-4</label>
                  <p className="font-mono text-neutral-700 dark:text-neutral-300 mt-0.5">{selectedLog.fecha}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block">Dirección IP de Origen</label>
                  <p className="font-mono text-neutral-700 dark:text-neutral-300 mt-0.5">{selectedLog.ip}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block">Estado de Auditoría</label>
                <div className="mt-1">{getSeverityBadge(selectedLog.severidad)}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold rounded-xl text-xs"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
