import React, { useState, useMemo } from 'react';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  DollarSign, 
  PackageCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Edit3,
  Calendar,
  Filter,
  Search,
  Power,
  ChevronRight,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { Comercio } from '../../types/delivery';

interface RubroOption {
  id: string;
  label: string;
  icon: string;
}

const RUBROS_CATALOGO: RubroOption[] = [
  { id: 'todos', label: 'Todos los Rubros', icon: '🏪' },
  { id: 'restaurantes', label: 'Restaurantes', icon: '🍽️' },
  { id: 'comida_rapida', label: 'Comida Rápida', icon: '⚡' },
  { id: 'supermercados', label: 'Supermercados & Víveres', icon: '🛒' },
  { id: 'ferreteria', label: 'Ferretería & Construcción', icon: '🔧' },
  { id: 'hogar', label: 'Hogar & Bazar', icon: '🏠' }
];

export const StoresManager: React.FC = () => {
  const { stores, updateStoreSchedule, toggleStoreActive, tasaBcv, orders } = useDelivery();

  const [selectedRubro, setSelectedRubro] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStore, setEditingStore] = useState<Comercio | null>(null);

  // Edit schedule form state
  const [editHoraApertura, setEditHoraApertura] = useState('08:00');
  const [editHoraCierre, setEditHoraCierre] = useState('22:00');
  const [editDias, setEditDias] = useState<string[]>([]);
  const [editActivo, setEditActivo] = useState(true);

  const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const openScheduleModal = (comercio: Comercio) => {
    setEditingStore(comercio);
    setEditHoraApertura(comercio.horaApertura || '08:00');
    setEditHoraCierre(comercio.horaCierre || '22:00');
    setEditDias(comercio.diasOperacion || DIAS_SEMANA);
    setEditActivo(comercio.activo ?? true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;

    updateStoreSchedule(editingStore.id, {
      horaApertura: editHoraApertura,
      horaCierre: editHoraCierre,
      diasOperacion: editDias,
      horarios: `${editHoraApertura} - ${editHoraCierre}`,
      activo: editActivo,
      abierto: editActivo
    });

    setEditingStore(null);
  };

  const toggleDia = (dia: string) => {
    setEditDias(prev => 
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  };

  const filteredStores = useMemo(() => {
    return stores.filter(s => {
      const matchesRubro = selectedRubro === 'todos' || s.categoriaPrincipal === selectedRubro;
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || 
        s.nombre.toLowerCase().includes(q) || 
        s.categoria.toLowerCase().includes(q) ||
        s.rif.toLowerCase().includes(q) ||
        (s.direccion && s.direccion.toLowerCase().includes(q));
      return matchesRubro && matchesSearch;
    });
  }, [stores, selectedRubro, searchTerm]);

  const activeStoresCount = stores.filter(s => s.activo !== false).length;
  const inactiveStoresCount = stores.filter(s => s.activo === false).length;

  return (
    <div className="space-y-5">
      {/* Header Info Banner */}
      <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Vixy Store • Comercios Aliados
            </span>
            <span className="text-xs text-neutral-400 font-mono">Padrón de Comercios</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-1 flex items-center gap-2">
            <Store className="w-5 h-5 text-purple-600" />
            Directorio de Comercios por Lista y Rubro
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Vista organizada en lista por rubro comercial seleccionable, gestión de horarios de atención y estado operativo.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{activeStoresCount} Activos</span>
          </div>
          <div className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span>{inactiveStoresCount} Inactivos</span>
          </div>
        </div>
      </div>

      {/* Selectable Rubros and Search Control Bar */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
              Seleccionar Rubro:
            </span>
          </div>

          {/* Real-time Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar comercio, RIF o zona..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white outline-hidden focus:border-purple-500"
            />
          </div>
        </div>

        {/* Rubro Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {RUBROS_CATALOGO.map(rubro => {
            const isSelected = selectedRubro === rubro.id;
            const countInRubro = rubro.id === 'todos' 
              ? stores.length 
              : stores.filter(s => s.categoriaPrincipal === rubro.id).length;

            return (
              <button
                key={rubro.id}
                onClick={() => setSelectedRubro(rubro.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                <span>{rubro.icon}</span>
                <span>{rubro.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-purple-700 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                }`}>
                  {countInRubro}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stores List: Coherent Vertical Row Layout */}
      <div className="space-y-3">
        {filteredStores.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 space-y-2">
            <Store className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm font-medium">No hay comercios registrados en el rubro seleccionado.</p>
            <button 
              onClick={() => { setSelectedRubro('todos'); setSearchTerm(''); }}
              className="text-xs text-purple-600 hover:underline font-bold cursor-pointer"
            >
              Restablecer filtros de rubro
            </button>
          </div>
        ) : (
          filteredStores.map((item) => {
            const storeOrders = orders.filter(o => o.comercio.id === item.id);
            const totalFacturadoUsd = storeOrders.reduce((sum, o) => sum + o.montoSubtotalUsd, 0);
            const isCurrentlyActive = item.activo !== false;

            return (
              <div 
                key={item.id}
                className={`bg-white dark:bg-neutral-900 rounded-2xl border transition shadow-xs p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${
                  isCurrentlyActive 
                    ? 'border-neutral-200 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-800/60' 
                    : 'border-neutral-300 dark:border-neutral-800/60 opacity-80 bg-neutral-50/70 dark:bg-neutral-950/40'
                }`}
              >
                {/* Store Identification Block */}
                <div className="flex items-start sm:items-center gap-3 min-w-0 xl:w-5/12">
                  <div className="relative shrink-0">
                    <img
                      src={item.logoUrl}
                      alt={item.nombre}
                      className="w-13 h-13 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                    />
                    <span 
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-neutral-900 ${
                        isCurrentlyActive ? 'bg-emerald-500' : 'bg-neutral-400'
                      }`}
                      title={isCurrentlyActive ? 'Comercio Activo' : 'Comercio Pausado'}
                    />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                        {item.nombre}
                      </h3>
                      {isCurrentlyActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold">
                          Inactivo / En Pausa
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md font-medium text-neutral-600 dark:text-neutral-300">
                        {item.categoria}
                      </span>
                      <span className="font-mono text-neutral-400">RIF: {item.rif}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 truncate">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{item.direccion}</span>
                    </div>
                  </div>
                </div>

                {/* Operating Schedule & Service Parameters Block */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 xl:py-0 border-y xl:border-y-0 xl:border-x border-neutral-100 dark:border-neutral-800 xl:px-4 xl:w-4/12 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-600" />
                      Horario
                    </span>
                    <p className="font-bold text-neutral-800 dark:text-neutral-200 font-mono text-xs">
                      {item.horaApertura || '08:00'} - {item.horaCierre || '22:00'}
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate">
                      {item.diasOperacion && item.diasOperacion.length === 7 
                        ? 'Todos los días' 
                        : (item.diasOperacion?.join(', ') || 'Lunes a Domingo')}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 text-amber-500" />
                      Catálogo
                    </span>
                    <p className="font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                      {item.productos.length} artículos
                    </p>
                    <p className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-current" />
                      {item.calificacion} ({item.totalCalificaciones || 0})
                    </p>
                  </div>

                  <div className="space-y-0.5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-500" />
                      Facturado
                    </span>
                    <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                      ${totalFacturadoUsd.toFixed(2)} USD
                    </p>
                    <p className="font-mono text-[10px] text-neutral-500">
                      Bs. {(totalFacturadoUsd * tasaBcv).toFixed(0)}
                    </p>
                  </div>
                </div>

                {/* Actions Block: Modify Schedule and Toggle */}
                <div className="flex items-center gap-2 shrink-0 xl:w-3/12 xl:justify-end">
                  <button
                    type="button"
                    onClick={() => openScheduleModal(item)}
                    className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-neutral-200 dark:border-neutral-700"
                    title="Configurar horario de apertura y días de servicio"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Modificar Horario</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleStoreActive(item.id)}
                    title={isCurrentlyActive ? 'Pausar o desactivar comercio' : 'Activar comercio'}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                      isCurrentlyActive
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isCurrentlyActive ? 'Activo' : 'Inactivo'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Schedule & Active Status Modal */}
      {editingStore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-700 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Horarios y Estatus de Atención
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {editingStore.nombre} ({editingStore.categoria})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStore(null)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
              {/* Active Toggle in Form */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">
                    Disponibilidad del Comercio
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Determina si los clientes pueden ordenar en este local
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditActivo(!editActivo)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    editActivo
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{editActivo ? 'Habilitado' : 'Pausado'}</span>
                </button>
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-500 text-[11px] mb-1 font-semibold">
                    Hora de Apertura
                  </label>
                  <input
                    type="time"
                    value={editHoraApertura}
                    onChange={(e) => setEditHoraApertura(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 text-[11px] mb-1 font-semibold">
                    Hora de Cierre
                  </label>
                  <input
                    type="time"
                    value={editHoraCierre}
                    onChange={(e) => setEditHoraCierre(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Operating Days */}
              <div>
                <label className="block text-neutral-500 text-[11px] mb-1.5 font-semibold">
                  Días de Servicio Activo en la Semana
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {DIAS_SEMANA.map(dia => {
                    const isSelected = editDias.includes(dia);
                    return (
                      <button
                        key={dia}
                        type="button"
                        onClick={() => toggleDia(dia)}
                        className={`p-2 rounded-xl text-[11px] font-bold transition text-center cursor-pointer border ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                        }`}
                      >
                        {dia.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingStore(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-xs cursor-pointer"
                >
                  Guardar Horarios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
