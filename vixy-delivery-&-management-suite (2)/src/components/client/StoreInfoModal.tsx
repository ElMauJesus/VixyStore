import React from 'react';
import { Store as StoreIcon, Clock, Star, MapPin, Phone, ShieldCheck, X } from 'lucide-react';
import { Comercio } from '../../types/delivery';

interface StoreInfoModalProps {
  store: Comercio;
  isOpen: boolean;
  onClose: () => void;
}

export const StoreInfoModal: React.FC<StoreInfoModalProps> = ({ store, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <img 
              src={store.logoUrl} 
              alt={store.nombre} 
              className="w-12 h-12 rounded-2xl object-cover border border-purple-500/30 shadow-xs" 
            />
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">
                {store.nombre}
              </h3>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                {store.categoria} • RIF: {store.rif}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Rating Score Card */}
        <div className="p-3.5 rounded-2xl bg-neutral-950 text-white border border-purple-900/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-mono block">Calificación de la Empresa</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black font-mono text-purple-400">{store.calificacion.toFixed(1)}</span>
              <div className="flex text-purple-400">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    className={`w-3.5 h-3.5 ${star <= Math.round(store.calificacion) ? 'fill-purple-400 text-purple-400' : 'text-neutral-600'}`} 
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="text-right text-[11px] text-neutral-400 font-mono">
            <span>{store.totalCalificaciones || 24} opiniones</span>
            <span className="block text-emerald-400 font-bold">98% Satisfacción</span>
          </div>
        </div>

        {/* Business Hours */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-white">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Horarios de Atención al Cliente</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Lunes a Sábado</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {store.horarios?.lunesASabado || '11:00 AM - 10:30 PM'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Domingos & Feriados</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {store.horarios?.domingos || '12:00 PM - 09:30 PM'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-neutral-500 flex items-center justify-between px-1">
            <span>Estado: <strong className={store.abierto ? 'text-emerald-500' : 'text-red-500'}>{store.abierto ? 'Abierto y Despachando' : 'Cerrado Temporalmente'}</strong></span>
            <span>Tiempo de entrega: {store.tiempoEstimadoMin}-{store.tiempoEstimadoMax} min</span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-neutral-800 dark:text-white block">
            Últimas Reseñas de Clientes Vixy
          </span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {(!store.resenasComercio || store.resenasComercio.length === 0) ? (
              <p className="text-xs text-neutral-400 italic">No hay reseñas recientes.</p>
            ) : (
              store.resenasComercio.map(res => (
                <div 
                  key={res.id}
                  className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 dark:text-white text-[11px]">{res.clienteNombre}</span>
                    <div className="flex items-center gap-0.5 text-purple-500">
                      <Star className="w-3 h-3 fill-purple-500" />
                      <span className="font-mono font-bold text-[10px]">{res.estrellas}</span>
                    </div>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 text-[11px]">"{res.comentario}"</p>
                  <span className="text-[9px] text-neutral-400 font-mono block">{res.fecha}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 text-right">
          <button
            onClick={onClose}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
