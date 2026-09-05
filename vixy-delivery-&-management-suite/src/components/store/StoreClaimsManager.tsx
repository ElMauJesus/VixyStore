import React, { useState } from 'react';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, ShieldAlert, Send, Store, FolderTree, Image as ImageIcon } from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

export const StoreClaimsManager: React.FC = () => {
  const { store, claims, updateClaimStatus } = useDelivery();

  const storeClaims = claims.filter(c => c.comercioId === store.id);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [solutionNote, setSolutionNote] = useState('');
  const [actionStatus, setActionStatus] = useState<'atendido' | 'solucionado'>('atendido');

  const countEnEspera = storeClaims.filter(c => c.estado === 'en_espera').length;

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim || !solutionNote.trim()) return;

    updateClaimStatus(selectedClaim.id, actionStatus, solutionNote.trim());
    setSelectedClaim(null);
    setSolutionNote('');
  };

  return (
    <div className="space-y-4 text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-600/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              Quejas y Reclamos de Clientes ({store.nombre})
            </h2>
            <p className="text-[11px] text-neutral-500">
              Notificaciones remitidas por el Backend Central para gestión de soluciones
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold font-mono">
          {countEnEspera} pendientes de respuesta
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        {storeClaims.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-center text-neutral-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
            <p className="text-xs font-medium">¡No tienes reclamos pendientes en tu tienda!</p>
            <p className="text-[11px] text-neutral-500">Tus clientes se encuentran satisfechos con los despachos.</p>
          </div>
        ) : (
          storeClaims.map(claim => (
            <div 
              key={claim.id}
              className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                      {claim.codigoReclamo}
                    </span>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      Cliente: {claim.clienteNombre}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      (Tel: {claim.clienteTelefono})
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                    Pedido #{claim.pedidoCodigo} • Fecha: {claim.fechaCreacion}
                  </span>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  claim.estado === 'en_espera'
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : claim.estado === 'atendido'
                    ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                }`}>
                  {claim.estado === 'en_espera' ? '🟡 En Espera' : claim.estado === 'atendido' ? '🟣 Atendido' : '🟢 Solucionado'}
                </span>
              </div>

              {/* Reason & description */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-xs space-y-1">
                <span className="font-bold text-neutral-900 dark:text-white block">
                  Motivo: {claim.motivo}
                </span>
                <p className="text-neutral-600 dark:text-neutral-300 text-[11px]">
                  "{claim.descripcion}"
                </p>

                {/* Evidence photos */}
                {claim.imagenes && claim.imagenes.length > 0 && (
                  <div className="pt-2 flex items-center gap-2">
                    {claim.imagenes.map((img, idx) => (
                      <a key={idx} href={img} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-700 block">
                        <img src={img} alt="Evidencia cliente" className="w-full h-full object-cover" />
                      </a>
                    ))}
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Foto cargada por el cliente desde su dispositivo
                    </span>
                  </div>
                )}
              </div>

              {/* Existing Solution */}
              {claim.solucionPropuesta && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase block">
                    Solución Gestionada ({claim.atendidoPor === 'comercio' ? 'Tienda' : 'Backend Central'}):
                  </span>
                  <p className="text-neutral-800 dark:text-neutral-200 text-[11px]">
                    {claim.solucionPropuesta}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <div className="text-right">
                <button
                  onClick={() => {
                    setSelectedClaim(claim);
                    setSolutionNote(claim.solucionPropuesta || '');
                    setActionStatus(claim.estado === 'solucionado' ? 'solucionado' : 'atendido');
                  }}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Gestionar Solución al Cliente
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Store manage claim */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Gestionar Solución a {selectedClaim.codigoReclamo}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedClaim(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolve} className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-neutral-800 dark:text-neutral-200">Reclamo:</p>
                <p className="text-neutral-500 italic mt-0.5">"{selectedClaim.descripcion}"</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500">Nuevo Estado</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionStatus('atendido')}
                    className={`p-2 rounded-xl font-bold border transition cursor-pointer text-center ${
                      actionStatus === 'atendido'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    🟣 Marcar Atendido
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionStatus('solucionado')}
                    className={`p-2 rounded-xl font-bold border transition cursor-pointer text-center ${
                      actionStatus === 'solucionado'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    🟢 Marcar Solucionado
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500">
                  Solución o Propuesta al Cliente
                </label>
                <textarea
                  rows={3}
                  required
                  value={solutionNote}
                  onChange={(e) => setSolutionNote(e.target.value)}
                  placeholder="Ej: Hola! Lamentamos lo sucedido. Te enviamos el complemento faltante de cortesía y aplicamos un cupón..."
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
                  <span>Enviar Solución</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
