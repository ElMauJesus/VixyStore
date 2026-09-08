import React, { useState } from 'react';
import { CheckCircle2, Star, AlertTriangle, ShieldCheck, ThumbsUp, Send } from 'lucide-react';
import { Pedido } from '../../types/delivery';
import { useDelivery } from '../../context/DeliveryContext';

interface OrderDeliveryConfirmationCardProps {
  order: Pedido;
  onOpenClaimModal?: () => void;
  onOrderClosed?: () => void;
}

export const OrderDeliveryConfirmationCard: React.FC<OrderDeliveryConfirmationCardProps> = ({
  order,
  onOpenClaimModal,
  onOrderClosed
}) => {
  const { confirmDeliveryByClient } = useDelivery();

  const [ratingStore, setRatingStore] = useState(5);
  const [ratingDriver, setRatingDriver] = useState(5);
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosedNow, setIsClosedNow] = useState(false);

  const isConfirmed = order.confirmacionEntregaCliente?.confirmado || order.peticionCerrada || isClosedNow;

  const handleConfirmAndClose = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    confirmDeliveryByClient(order.id, ratingStore, ratingDriver, comentario.trim() || undefined);
    setIsClosedNow(true);
    setIsSubmitting(false);
    if (onOrderClosed) {
      setTimeout(() => onOrderClosed(), 1500);
    }
  };

  if (isConfirmed) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-3xl p-5 text-xs space-y-3 text-center animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <h4 className="font-bold text-neutral-900 dark:text-white text-sm">
            ¡Petición Cerrada y Calificada!
          </h4>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
            Tu calificación ha sido registrada en el sistema central y la orden ha sido archivada con éxito.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] max-w-xs mx-auto pt-1">
          <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center gap-1.5">
            <span className="text-neutral-500">Tienda:</span>
            <div className="flex items-center gap-1 font-bold text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{order.confirmacionEntregaCliente?.calificacionComercio || ratingStore}⭐</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center gap-1.5">
            <span className="text-neutral-500">Repartidor:</span>
            <div className="flex items-center gap-1 font-bold text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{order.confirmacionEntregaCliente?.calificacionConductor || ratingDriver}⭐</span>
            </div>
          </div>
        </div>

        {onOrderClosed && (
          <button
            type="button"
            onClick={onOrderClosed}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs"
          >
            Volver al Menú Principal
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border-2 border-emerald-500/50 rounded-3xl p-5 text-xs space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-neutral-900 dark:text-white text-sm">
            ¡Tu pedido ha sido entregado!
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          Califica para Cerrar Petición
        </span>
      </div>

      <p className="text-neutral-500 text-[11px]">
        Para finalizar y archivar tu pedido en Vixy, califica la experiencia con la tienda y el repartidor:
      </p>

      <form onSubmit={handleConfirmAndClose} className="space-y-3 pt-1">
        {/* Rating Tienda */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-900 dark:text-white block">
              Comercio: {order.comercio.nombre}
            </span>
            <span className="text-[10px] text-neutral-400">Calidad y presentación del producto</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRatingStore(star)}
                className="p-1 cursor-pointer transition hover:scale-125"
              >
                <Star 
                  className={`w-4 h-4 ${star <= ratingStore ? 'fill-amber-400 text-amber-500' : 'text-neutral-300 dark:text-neutral-600'}`} 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Rating Conductor */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-900 dark:text-white block">
              Repartidor: {order.conductorAsignado?.nombre || order.conductor?.nombre || 'Motorizado'}
            </span>
            <span className="text-[10px] text-neutral-400">Rapidez y trato cordial</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRatingDriver(star)}
                className="p-1 cursor-pointer transition hover:scale-125"
              >
                <Star 
                  className={`w-4 h-4 ${star <= ratingDriver ? 'fill-amber-400 text-amber-500' : 'text-neutral-300 dark:text-neutral-600'}`} 
                />
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="Comentario opcional sobre tu experiencia..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="w-full text-xs p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-700 outline-hidden focus:border-emerald-500"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Calificar y Cerrar Petición</span>
        </button>
      </form>
    </div>
  );
};
