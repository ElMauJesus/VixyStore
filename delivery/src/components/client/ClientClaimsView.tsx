import React, { useState } from 'react';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  Store, 
  ShieldAlert, 
  Send,
  X,
  FileImage,
  FolderTree
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

interface ClientClaimsViewProps {
  onBackToMenu?: () => void;
}

export const ClientClaimsView: React.FC<ClientClaimsViewProps> = ({ onBackToMenu }) => {
  const { 
    client, 
    orders, 
    claims, 
    createClaim, 
    stores 
  } = useDelivery();

  const [filterStatus, setFilterStatus] = useState<'all' | 'en_espera' | 'atendido' | 'solucionado'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State for new claim
  const clientOrders = orders.filter(o => o.cliente.id === client.id);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(clientOrders[0]?.id || '');
  const [motivo, setMotivo] = useState('Faltaron productos en el pedido');
  const [descripcion, setDescripcion] = useState('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Client's claims
  const clientClaims = claims.filter(c => c.clienteId === client.id);
  const filteredClaims = clientClaims.filter(c => {
    if (filterStatus !== 'all' && c.estado !== filterStatus) return false;
    return true;
  });

  const countEnEspera = clientClaims.filter(c => c.estado === 'en_espera').length;
  const countAtendidos = clientClaims.filter(c => c.estado === 'atendido').length;
  const countSolucionados = clientClaims.filter(c => c.estado === 'solucionado').length;

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      alert('Debes seleccionar un pedido para reportar el reclamo.');
      return;
    }
    if (!descripcion.trim()) {
      alert('Por favor describe detalladamente lo sucedido.');
      return;
    }

    createClaim({
      pedidoId: selectedOrderId,
      motivo,
      descripcion: descripcion.trim(),
      imagenes: uploadedPhotoUrl ? [uploadedPhotoUrl] : ['/uploads/reclamos/evidencia-sin-foto.jpg']
    });

    setFormSuccess(true);
    setDescripcion('');
    setUploadedPhotoUrl('');
    setTimeout(() => {
      setFormSuccess(false);
      setShowCreateModal(false);
    }, 1200);
  };

  return (
    <div className="space-y-4 text-neutral-900 dark:text-neutral-100">
      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-850 p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-600/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Reclamos y Seguimiento de Quejas
              </h2>
              <p className="text-[11px] text-neutral-500">
                Atención directa con el comercio y el Backend Central
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo Reclamo</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            filterStatus === 'all'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'
          }`}
        >
          Todos ({clientClaims.length})
        </button>
        <button
          onClick={() => setFilterStatus('en_espera')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            filterStatus === 'en_espera'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>En espera de respuesta ({countEnEspera})</span>
        </button>
        <button
          onClick={() => setFilterStatus('atendido')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            filterStatus === 'atendido'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span>Atendido ({countAtendidos})</span>
        </button>
        <button
          onClick={() => setFilterStatus('solucionado')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            filterStatus === 'solucionado'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Solucionado ({countSolucionados})</span>
        </button>
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        {filteredClaims.length === 0 ? (
          <div className="bg-white dark:bg-neutral-850 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-center text-neutral-400 space-y-2">
            <ShieldAlert className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-700" />
            <p className="text-xs font-medium">No tienes reclamos registrados en esta sección.</p>
            <p className="text-[11px] text-neutral-500">
              Si tuviste algún inconveniente con un pedido o entrega, pulsa "+ Nuevo Reclamo" para recibir soporte inmediato.
            </p>
          </div>
        ) : (
          filteredClaims.map(claim => (
            <div 
              key={claim.id}
              className="bg-white dark:bg-neutral-850 p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                      {claim.codigoReclamo}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {claim.fechaCreacion}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white mt-1">
                    <Store className="w-3.5 h-3.5 text-purple-600" />
                    <span>{claim.comercioNombre}</span>
                    <span className="text-[10px] text-neutral-400 font-normal">
                      • Pedido #{claim.pedidoCodigo}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                  claim.estado === 'en_espera'
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : claim.estado === 'atendido'
                    ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                }`}>
                  {claim.estado === 'en_espera' ? '🟡 En Espera' : claim.estado === 'atendido' ? '🟣 Atendido' : '🟢 Solucionado'}
                </span>
              </div>

              {/* Claim Description */}
              <div className="text-xs space-y-1 bg-neutral-50 dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <span className="font-bold text-neutral-800 dark:text-neutral-200 block">
                  Motivo: {claim.motivo}
                </span>
                <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                  "{claim.descripcion}"
                </p>

                {/* Attached Evidence */}
                {claim.imagenes && claim.imagenes.length > 0 && (
                  <div className="pt-2 flex items-center gap-2">
                    {claim.imagenes.map((img, idx) => (
                      <a 
                        key={idx} 
                        href={img} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-14 h-14 rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-700 block hover:opacity-80"
                      >
                        <img src={img} alt="Evidencia" className="w-full h-full object-cover" />
                      </a>
                    ))}
                    <div className="text-[10px] text-neutral-400 font-mono">
                      <FolderTree className="w-3 h-3 inline mr-1 text-purple-500" />
                      /uploads/clientes/{claim.clienteId}/reclamos/
                    </div>
                  </div>
                )}
              </div>

              {/* Resolution Proposal if replied */}
              {claim.solucionPropuesta ? (
                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                    <span>Respuesta y Solución Oficial:</span>
                    <span className="font-mono">{claim.fechaResolucion || 'Reciente'}</span>
                  </div>
                  <p className="text-neutral-900 dark:text-white font-medium text-[11px]">
                    {claim.solucionPropuesta}
                  </p>
                  <span className="text-[9px] text-purple-600 dark:text-purple-400 font-mono block">
                    Gestionado por: {claim.atendidoPor === 'comercio' ? claim.comercioNombre : 'Backend Central Vixy'}
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-[11px] text-neutral-500 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>El comercio y la central han recibido tu reclamo y se encuentran revisando la solución.</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: Create New Claim */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Notificar Inconveniente con un Pedido
                </h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                  ¡Reclamo Registrado Exitosamente!
                </h4>
                <p className="text-xs text-neutral-500">
                  Se ha enviado la notificación a Vixy Store y al Backend Central para gestionar tu solución.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitClaim} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">
                    Selecciona el Pedido Afectado *
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    required
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 outline-hidden font-mono"
                  >
                    {clientOrders.map(o => (
                      <option key={o.id} value={o.id}>
                        #{o.codigoSeguimiento} - {o.comercio.nombre} (${o.montoTotalUsd.toFixed(2)}) [{o.estado.toUpperCase()}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">
                    Motivo Principal del Reclamo *
                  </label>
                  <select
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 outline-hidden"
                  >
                    <option value="Faltaron productos en el pedido">Faltaron productos en el pedido</option>
                    <option value="Comida fría o en mal estado">Comida fría o en mal estado</option>
                    <option value="Empaque roto o derramado">Empaque roto o derramado</option>
                    <option value="Cobro indebido o discrepancia de monto">Cobro indebido o discrepancia de monto</option>
                    <option value="Retraso grave en la entrega">Retraso grave en la entrega</option>
                    <option value="Trato inadecuado del repartidor o tienda">Trato inadecuado del repartidor o tienda</option>
                    <option value="Otro inconveniente">Otro inconveniente</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">
                    Descripción del Inconveniente *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe qué ocurrió, cuáles productos faltaron o en qué estado llegó la orden..."
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 outline-hidden"
                  />
                </div>

                {/* Real Photo Attachment */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center justify-between">
                    <span>Adjuntar Foto de Evidencia Real</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400">/backend/php/uploads/reclamos/</span>
                  </label>
                  
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {uploadedPhotoUrl ? (
                      <img 
                        src={uploadedPhotoUrl} 
                        alt="Preview evidencia" 
                        className="w-16 h-16 rounded-xl object-cover border border-purple-400 shrink-0" 
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-400 shrink-0 text-[10px] text-center p-1 font-bold">
                        Sin foto
                      </div>
                    )}
                    
                    <div className="text-[11px] text-neutral-500 space-y-1.5 flex-1">
                      <p className="font-bold text-neutral-900 dark:text-white">
                        {uploadedPhotoUrl ? 'Foto cargada correctamente' : 'Selecciona una foto de la galería o toma con la cámara'}
                      </p>
                      
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] cursor-pointer shadow-xs transition">
                        <span>{uploadedPhotoUrl ? 'Cambiar Foto' : 'Cargar Foto Real'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          onChange={handlePhotoUpload} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Reclamo a la Central</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
