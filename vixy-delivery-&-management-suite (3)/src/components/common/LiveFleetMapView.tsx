import React, { useState } from 'react';
import { 
  Bike, 
  Compass, 
  MapPin, 
  Navigation, 
  Phone, 
  MessageSquare, 
  Search, 
  ShieldCheck, 
  Flame, 
  Clock, 
  Radio, 
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  Activity,
  Maximize2
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { DeliveryRadarMap } from './DeliveryRadarMap';
import { Conductor } from '../../types/delivery';

export const LiveFleetMapView: React.FC = () => {
  const { allDrivers, openCall, openChat, realGpsActive, realGpsCoords, orders } = useDelivery();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'disponible' | 'en_ruta'>('todos');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const activeOrdersCount = orders.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado').length;
  const availableDriversCount = allDrivers.filter(d => d.disponible).length;
  const busyDriversCount = allDrivers.filter(d => !d.disponible).length;

  const filteredDrivers = allDrivers.filter(driver => {
    const matchesSearch = 
      driver.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.moto.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.moto.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.ubicacionActual.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'disponible') return driver.disponible;
    if (statusFilter === 'en_ruta') return !driver.disponible;
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans min-h-[650px]">
      {/* Top Telemetry Header */}
      <header className="p-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-lg shadow-lg">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Mapa de Conductores y Flota en Vivo</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    EN VIVO
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Ubicación satelital en tiempo real mediante OpenStreetMap & CARTO Basemaps
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-xl flex items-center gap-2">
              <Bike className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Conductores:</span>
              <strong className="text-white font-bold">{allDrivers.length}</strong>
            </div>

            <div className="px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-center gap-2 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Disponibles:</span>
              <strong className="text-emerald-200 font-bold">{availableDriversCount}</strong>
            </div>

            <div className="px-3 py-1.5 bg-blue-950/40 border border-blue-800/40 rounded-xl flex items-center gap-2 text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>En Ruta:</span>
              <strong className="text-blue-200 font-bold">{busyDriversCount}</strong>
            </div>

            <div className="px-3 py-1.5 bg-amber-950/40 border border-amber-800/40 rounded-xl flex items-center gap-2 text-amber-300">
              <span>Órdenes Activas:</span>
              <strong className="text-amber-200 font-bold">{activeOrdersCount}</strong>
            </div>
          </div>
        </div>
      </header>

      {/* Main Split Layout: Left Map, Right Driver Roster */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[560px]">
        {/* Radar Map Canvas Container */}
        <div className="flex-1 p-3 sm:p-4 overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex-1 relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl flex flex-col min-h-[480px]">
            <DeliveryRadarMap 
              compact={false}
              showAllDrivers={true}
              selectedDriverId={selectedDriverId}
              onSelectDriver={(id) => setSelectedDriverId(id)}
              className="w-full h-full min-h-[480px]"
            />
          </div>
        </div>

        {/* Right Sidebar: Fleet Roster & Dispatcher Controls */}
        <aside className="w-full lg:w-96 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0 overflow-hidden">
          {/* Search & Filter Header */}
          <div className="p-3 sm:p-4 border-b border-slate-800 space-y-3 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, placa o sector..."
                className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 font-sans"
              />
            </div>

            {/* Filter Buttons */}
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
              <button
                onClick={() => setStatusFilter('todos')}
                className={`py-1.5 rounded-xl transition cursor-pointer ${
                  statusFilter === 'todos' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Todos ({allDrivers.length})
              </button>
              <button
                onClick={() => setStatusFilter('disponible')}
                className={`py-1.5 rounded-xl transition cursor-pointer ${
                  statusFilter === 'disponible' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Libres ({availableDriversCount})
              </button>
              <button
                onClick={() => setStatusFilter('en_ruta')}
                className={`py-1.5 rounded-xl transition cursor-pointer ${
                  statusFilter === 'en_ruta' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                En Ruta ({busyDriversCount})
              </button>
            </div>
          </div>

          {/* Drivers Scrollable List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredDrivers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                <Bike className="w-8 h-8 mx-auto opacity-40" />
                <p>No se encontraron motorizados con ese criterio.</p>
              </div>
            ) : (
              filteredDrivers.map(drv => {
                const isSelected = selectedDriverId === drv.id;

                return (
                  <div
                    key={drv.id}
                    onClick={() => setSelectedDriverId(drv.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-950/40'
                        : 'bg-slate-900/60 hover:bg-slate-800/70 border-slate-800'
                    }`}
                  >
                    {/* Header: Driver Photo, Name & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={drv.fotoUrl}
                            alt={drv.nombre}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          />
                          <span 
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                              drv.disponible ? 'bg-emerald-400' : 'bg-blue-400'
                            }`} 
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-xs truncate">
                            {drv.nombre} {drv.apellido}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono">
                            C.I: {drv.legal.cedula}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                        drv.disponible 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                      }`}>
                        {drv.disponible ? 'Disponible' : 'En Ruta'}
                      </span>
                    </div>

                    {/* Vehicle & Telemetry Info */}
                    <div className="p-2 bg-slate-950/60 rounded-xl text-[10px] space-y-1 border border-slate-800/60">
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">Moto:</span>
                        <span className="font-semibold text-slate-200 truncate">
                          {drv.moto.marca} {drv.moto.modelo} ({drv.moto.color})
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">Placa:</span>
                        <span className="font-mono font-bold text-amber-400">[{drv.moto.placa}]</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">Ubicación actual:</span>
                        <span className="font-medium text-slate-300 truncate max-w-[170px]">{drv.ubicacionActual}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300 pt-0.5 border-t border-slate-800">
                        <span className="text-slate-400">Velocidad GPS:</span>
                        <span className="font-mono font-bold text-emerald-400">{drv.velocidadKmh || 0} km/h • ±{drv.precisionGps || 5}m</span>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDriverId(drv.id);
                        }}
                        className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 transition cursor-pointer border border-slate-700"
                      >
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>Ubicar</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCall(drv.nombre, drv.telefono, drv.fotoUrl);
                        }}
                        className="py-1.5 px-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Llamar</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openChat(`conductor-${drv.id}`, `${drv.nombre} ${drv.apellido}`);
                        }}
                        className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 transition cursor-pointer border border-slate-700"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
