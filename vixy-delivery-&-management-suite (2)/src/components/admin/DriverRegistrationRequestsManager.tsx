import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Bike, 
  User, 
  ShieldCheck, 
  Search, 
  Eye, 
  Phone, 
  Mail, 
  Calendar,
  AlertTriangle,
  Camera,
  ExternalLink
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { SolicitudRegistroConductor } from '../../types/delivery';

export const DriverRegistrationRequestsManager: React.FC = () => {
  const { 
    solicitudesRegistroConductores, 
    aprobarRegistroConductor, 
    rechazarRegistroConductor,
    openCall
  } = useDelivery();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendiente_aprobacion' | 'aprobada' | 'rechazada'>('todos');
  const [inspectingSolicitud, setInspectingSolicitud] = useState<SolicitudRegistroConductor | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<{ title: string; url: string } | null>(null);

  const filteredSolicitudes = solicitudesRegistroConductores.filter(sol => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q ||
      sol.nombre.toLowerCase().includes(q) ||
      sol.apellido.toLowerCase().includes(q) ||
      sol.cedula.toLowerCase().includes(q) ||
      sol.placaMoto.toLowerCase().includes(q) ||
      sol.telefono.includes(q);

    if (!matchesSearch) return false;
    if (filterStatus === 'todos') return true;
    return sol.estado === filterStatus;
  });

  const handleApprove = (sol: SolicitudRegistroConductor) => {
    if (window.confirm(`¿Confirmas la aprobación del conductor ${sol.nombre} ${sol.apellido} (C.I. ${sol.cedula})?\n\nSe creará su expediente de conductor oficial, se activará su billetera con límite de saldo negativo y podrá iniciar sesión en Vixy Conductor.`)) {
      const res = aprobarRegistroConductor(sol.id);
      if (res.success) {
        alert(`✓ Conductor ${sol.nombre} ${sol.apellido} aprobado y dado de alta exitosamente en el sistema.`);
        if (inspectingSolicitud?.id === sol.id) setInspectingSolicitud(null);
      } else {
        alert(`Error: ${res.error}`);
      }
    }
  };

  const handleReject = (sol: SolicitudRegistroConductor) => {
    const motivo = window.prompt(`Ingresa el motivo del rechazo para la postulación de ${sol.nombre} ${sol.apellido}:`, 'Documentos borrosos o datos de vehículo no coinciden');
    if (motivo) {
      const res = rechazarRegistroConductor(sol.id, motivo);
      if (res.success) {
        alert(`Solicitud rechazada. Motivo guardado en el expediente.`);
        if (inspectingSolicitud?.id === sol.id) setInspectingSolicitud(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, C.I., placa o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs flex-wrap gap-1">
          <button
            onClick={() => setFilterStatus('todos')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterStatus === 'todos' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Todas ({solicitudesRegistroConductores.length})
          </button>
          <button
            onClick={() => setFilterStatus('pendiente_aprobacion')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
              filterStatus === 'pendiente_aprobacion' ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Pendientes ({solicitudesRegistroConductores.filter(s => s.estado === 'pendiente_aprobacion').length})</span>
          </button>
          <button
            onClick={() => setFilterStatus('aprobada')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
              filterStatus === 'aprobada' ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Aprobadas</span>
          </button>
          <button
            onClick={() => setFilterStatus('rechazada')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
              filterStatus === 'rechazada' ? 'bg-white dark:bg-neutral-900 text-red-600 dark:text-red-400 shadow-xs' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <XCircle className="w-3 h-3 text-red-500" />
            <span>Rechazadas</span>
          </button>
        </div>
      </div>

      {/* Solicitudes List */}
      {filteredSolicitudes.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 space-y-2">
          <FileText className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-700" />
          <p className="text-sm font-medium">No hay solicitudes de registro que coincidan con el filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredSolicitudes.map((sol) => {
            const isPending = sol.estado === 'pendiente_aprobacion';
            const isApproved = sol.estado === 'aprobada';
            const isRejected = sol.estado === 'rechazada';

            return (
              <div
                key={sol.id}
                className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs hover:border-amber-500/40 transition space-y-4"
              >
                {/* Card Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                          {sol.nombre} {sol.apellido}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                          {sol.cedula}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 flex items-center gap-2">
                        <span>Postulado: {sol.fechaSolicitud}</span>
                        <span>•</span>
                        <span>{sol.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pendiente Aprobación</span>
                      </span>
                    )}
                    {isApproved && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprobado y Activo</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Rechazado</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Moto Details */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Vehículo (Moto)</span>
                    <p className="font-bold text-neutral-900 dark:text-white">
                      {sol.marcaMoto} {sol.modeloMoto} ({sol.anoMoto})
                    </p>
                    <p className="text-neutral-500 font-mono">
                      Color: {sol.colorMoto} • Placa: <strong className="text-neutral-800 dark:text-neutral-200">{sol.placaMoto}</strong>
                    </p>
                  </div>

                  {/* Document Legal Info */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Vigencia Documentos</span>
                    <p className="text-neutral-700 dark:text-neutral-300">
                      Licencia ({sol.licenciaGrado}): <span className="font-mono font-bold text-neutral-900 dark:text-white">{sol.licenciaVencimiento}</span>
                    </p>
                    <p className="text-neutral-700 dark:text-neutral-300">
                      Certificado Médico: <span className="font-mono font-bold text-neutral-900 dark:text-white">{sol.certificadoMedicoVencimiento}</span>
                    </p>
                  </div>

                  {/* Contact & Terms */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Contacto & Términos</span>
                    <p className="font-mono font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                      <Phone className="w-3 h-3 text-amber-500" />
                      <span>{sol.telefono}</span>
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Términos y condiciones aceptados</span>
                    </p>
                  </div>
                </div>

                {/* Photos Thumbnail Bar & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setInspectingSolicitud(sol)}
                    className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-neutral-200 dark:border-neutral-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-500" />
                    <span>Auditar 6 Fotos y Documentos</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openCall(sol.telefono, `${sol.nombre} ${sol.apellido}`, 'conductor')}
                      className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Llamar</span>
                    </button>

                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleReject(sol)}
                          className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Rechazar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(sol)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aprobar y Activar Cuenta</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Dossier de Documentos y Fotos (6 items) */}
      {inspectingSolicitud && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-60 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  <span>Expediente de Documentos y Fotos: {inspectingSolicitud.nombre} {inspectingSolicitud.apellido}</span>
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  C.I. {inspectingSolicitud.cedula} • Placa: {inspectingSolicitud.placaMoto} • {inspectingSolicitud.telefono}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingSolicitud(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 6 Documents Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { title: '1. Cédula de Identidad', url: inspectingSolicitud.fotoCedulaUrl },
                { title: '2. Licencia de Conducir', url: inspectingSolicitud.fotoLicenciaUrl },
                { title: '3. Certificado Médico', url: inspectingSolicitud.fotoCertificadoMedicoUrl },
                { title: '4. Carnet de Circulación', url: inspectingSolicitud.fotoCarnetCirculacionUrl },
                { title: '5. Foto de la Moto', url: inspectingSolicitud.fotoVehiculoUrl },
                { title: '6. Foto de la Placa', url: inspectingSolicitud.fotoPlacaUrl },
              ].map((doc, i) => (
                <div 
                  key={i} 
                  className="p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2 cursor-pointer group hover:border-amber-500/50 transition"
                  onClick={() => setSelectedPhoto(doc)}
                >
                  <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 block truncate">
                    {doc.title}
                  </span>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    <img 
                      src={doc.url} 
                      alt={doc.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                      <Eye className="w-4 h-4" />
                      <span>Ver Grande</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions at bottom */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setInspectingSolicitud(null)}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar Visor
              </button>

              {inspectingSolicitud.estado === 'pendiente_aprobacion' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleReject(inspectingSolicitud)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-xl text-xs border border-red-500/30 cursor-pointer"
                  >
                    Rechazar Solicitud
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(inspectingSolicitud)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprobar y Activar Conductor</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SINGLE PHOTO FULL SCREEN ZOOM MODAL */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-70">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-4 space-y-3 text-white">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="font-bold text-sm">{selectedPhoto.title}</span>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-hidden rounded-2xl bg-black flex items-center justify-center">
              <img src={selectedPhoto.url} alt={selectedPhoto.title} className="max-h-[70vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
