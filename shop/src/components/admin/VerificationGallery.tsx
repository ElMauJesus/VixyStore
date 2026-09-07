import React, { useState } from 'react';
import { FolderCheck, Image as ImageIcon, MapPin, Calendar, User, Bike, Eye, ExternalLink, Download } from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

export const VerificationGallery: React.FC = () => {
  const { verificationPhotos } = useDelivery();
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <FolderCheck className="w-4 h-4 text-emerald-500" />
            Galería de Verificación de Entregas (/uploads/verificaciones/)
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Depósito de comprobantes fotográficos tomados por los motorizados al momento de la entrega en destino
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-xl border border-neutral-200 dark:border-neutral-700">
            Directorio: /var/www/html/uploads/verificaciones/
          </span>
        </div>
      </div>

      {/* Grid of Delivery Proofs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {verificationPhotos.map((foto) => (
          <div
            key={foto.id}
            className="bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:border-amber-500/50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video bg-neutral-950 overflow-hidden">
                <img
                  src={foto.url}
                  alt="Comprobante de entrega"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/70 backdrop-blur-xs rounded-xl text-[10px] font-mono font-bold text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Pedido #{foto.pedidoId.toUpperCase()}
                </div>
              </div>

              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {foto.fecha}</span>
                </div>

                <div className="space-y-1">
                  <p className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <strong>Motorizado:</strong> {foto.conductorNombre}
                  </p>
                  <p className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <strong>Cliente Receptor:</strong> {foto.clienteNombre}
                  </p>
                  <p className="text-neutral-500 flex items-center gap-1.5 text-[11px] font-mono">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {foto.coordenadas}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-[11px] italic text-neutral-600 dark:text-neutral-400">
                  "{foto.comentario}"
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button
                onClick={() => setSelectedPhoto(foto)}
                className="w-full py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                Examinar Evidencia en Alta Resolución
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <FolderCheck className="w-4 h-4 text-emerald-400" />
                  Archivo de Verificación: {selectedPhoto.id}.jpg
                </h3>
                <p className="text-xs text-neutral-400">Pedido {selectedPhoto.pedidoId}</p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden max-h-[400px] flex items-center justify-center bg-black">
              <img
                src={selectedPhoto.url}
                alt="Alta resolución"
                className="w-full h-auto max-h-[400px] object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-850 p-3.5 rounded-xl border border-neutral-800">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">Motorizado</span>
                <span className="font-bold">{selectedPhoto.conductorNombre}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">Cliente Receptor</span>
                <span className="font-bold">{selectedPhoto.clienteNombre}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">Coordenadas GPS de Registro</span>
                <span className="font-mono text-emerald-400">{selectedPhoto.coordenadas}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">Fecha y Hora</span>
                <span className="font-mono">{selectedPhoto.fecha}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPhoto(null)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-xl text-xs"
            >
              Cerrar Visor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
