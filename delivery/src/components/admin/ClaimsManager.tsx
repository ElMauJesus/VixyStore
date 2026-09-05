import React, { useState } from 'react';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Store, 
  User, 
  Send, 
  Eye, 
  Filter, 
  FileImage, 
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

export const ClaimsManager: React.FC = () => {
  const { claims, updateClaimStatus, stores } = useDelivery();

  const [filterStatus, setFilterStatus] = useState<'all' | 'en_espera' | 'atendido' | 'solucionado'>('all');
  const [filterStore, setFilterStore] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [newStatus, setNewStatus] = useState<'atendido' | 'solucionado'>('atendido');

  const filteredClaims = claims.filter(c => {
    if (filterStatus !== 'all' && c.estado !== filterStatus) return false;
    if (filterStore !== 'all' && c.comercioId !== filterStore) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchClient = c.clienteNombre.toLowerCase().includes(q);
      const matchCode = c.codigoReclamo.toLowerCase().includes(q);
      const matchStore = c.comercioNombre.toLowerCase().includes(q);
      const matchReason = c.motivo.toLowerCase().includes(q);
      if (!matchClient && !matchCode && !matchStore && !matchReason) return false;
    }
    return true;
  });

  const countEnEspera = claims.filter(c => c.estado === 'en_espera').length;
  const countAtendidos = claims.filter(c => c.estado === 'atendido').length;
  const countSolucionados = claims.filter(c => c.estado === 'solucionado').length;

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim || !responseMsg.trim()) return;

    updateClaimStatus(selectedClaim.id, newStatus, responseMsg.trim());
    setSelectedClaim(null);
    setResponseMsg('');
  };

  return (
    <div className="space-y-4 text-neutral-900 dark:text-neutral-100">
      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-600/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Centro de Reclamos y Solución al Cliente (Backend)
            </h2>
            <p className="text-xs text-neutral-500">
              Gestión y seguimiento de incidentes de pedidos con Vixy Store y clientes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-right">
            <span className="text-[10px] text-amber-600 font-medium block">En Espera</span>
            <span className="text-sm font-bold text-amber-600 font-mono">{countEnEspera}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-right">
            <span className="text-[10px] text-purple-600 font-medium block">Atendidos</span>
            <span className="text-sm font-bold text-purple-600 font-mono">{countAtendidos}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-right">
            <span className="text-[10px] text-emerald-600 font-medium block">Solucionados</span>
            <span className="text-sm font-bold text-emerald-600 font-mono">{countSolucionados}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Todos ({claims.length})
            </button>
            <button
              onClick={() => setFilterStatus('en_espera')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                filterStatus === 'en_espera'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>En espera ({countEnEspera})</span>
            </button>
            <button
              onClick={() => setFilterStatus('atendido')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                filterStatus === 'atendido'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>Atendidos ({countAtendidos})</span>
            </button>
            <button
              onClick={() => setFilterStatus('solucionado')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                filterStatus === 'solucionado'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>Solucionados ({countSolucionados})</span>
            </button>
          </div>

          {/* Store Filter */}
          <select
            value={filterStore}
            onChange={(e) => setFilterStore(e.target.value)}
            className="text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-2.5 py-1.5 outline-hidden cursor-pointer"
          >
            <option value="all">Todos los comercios</option>
            {stores.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, reclamo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:border-purple-500"
          />
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        {filteredClaims.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm font-medium">No hay reclamos con este criterio.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredClaims.map(claim => (
              <div 
                key={claim.id} 
                className="p-4 hover:bg-neutral-50/60 dark:hover:bg-neutral-850/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                      {claim.codigoReclamo}
                    </span>
                    <span className="text-[11px] font-bold text-neutral-900 dark:text-white">
                      {claim.clienteNombre}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      (Tel: {claim.clienteTelefono})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center gap-1 font-medium">
                      <Store className="w-3 h-3 text-purple-600" />
                      {claim.comercioNombre}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Pedido: #{claim.pedidoCodigo}
                    </span>
                  </div>

                  <div className="text-xs">
                    <strong className="text-neutral-900 dark:text-white block mb-0.5">
                      Motivo: {claim.motivo}
                    </strong>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      "{claim.descripcion}"
                    </p>
                  </div>

                  {/* Images if attached */}
                  {claim.imagenes && claim.imagenes.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {claim.imagenes.map((img, idx) => (
                        <a 
                          key={idx} 
                          href={img} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-12 h-12 rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-700 block shrink-0 hover:opacity-80 transition"
                        >
                          <img src={img} alt="Evidencia cliente" className="w-full h-full object-cover" />
                        </a>
                      ))}
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {claim.imagenes.length} imagen(es) subida(s) a /uploads/clientes/{claim.clienteId}/reclamos/
                      </span>
                    </div>
                  )}

                  {/* Solution note if responded */}
                  {claim.solucionPropuesta && (
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs space-y-0.5">
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase block">
                        Solución Gestionada ({claim.atendidoPor === 'comercio' ? 'Tienda' : 'Backend Central'}):
                      </span>
                      <p className="text-neutral-800 dark:text-neutral-200">
                        {claim.solucionPropuesta}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Badge & Response button */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    claim.estado === 'en_espera'
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : claim.estado === 'atendido'
                      ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  }`}>
                    {claim.estado === 'en_espera' ? '🟡 En Espera' : claim.estado === 'atendido' ? '🟣 Atendido' : '🟢 Solucionado'}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedClaim(claim);
                      setResponseMsg(claim.solucionPropuesta || '');
                      setNewStatus(claim.estado === 'solucionado' ? 'solucionado' : 'atendido');
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Gestionar</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Respond & Coordinate Solution */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Gestionar Solución a Reclamo {selectedClaim.codigoReclamo}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Cliente: {selectedClaim.clienteNombre} • Comercio: {selectedClaim.comercioNombre}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedClaim(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendResponse} className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Detalle del Reclamo</span>
                <p className="font-bold text-neutral-900 dark:text-white">{selectedClaim.motivo}</p>
                <p className="text-neutral-600 dark:text-neutral-300 mt-1 italic">"{selectedClaim.descripcion}"</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500">Nuevo Estado del Reclamo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus('atendido')}
                    className={`p-2 rounded-xl font-bold border transition cursor-pointer text-center ${
                      newStatus === 'atendido'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    🟣 Marcar como Atendido
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('solucionado')}
                    className={`p-2 rounded-xl font-bold border transition cursor-pointer text-center ${
                      newStatus === 'solucionado'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    🟢 Marcar como Solucionado
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500">
                  Solución o Respuesta Oficial al Cliente
                </label>
                <textarea
                  rows={4}
                  required
                  value={responseMsg}
                  onChange={(e) => setResponseMsg(e.target.value)}
                  placeholder="Ej: Se coordinó con la tienda y se acreditó un reembolso de $5.00 a tu Cartera Vixy / Se reprogramó el despacho de los artículos faltantes..."
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Notificar al Cliente y Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
