import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

export const PushNotificationToast: React.FC = () => {
  const { notifications } = useDelivery();
  const [visibleNotif, setVisibleNotif] = useState<any | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      setVisibleNotif(latest);
      const timer = setTimeout(() => {
        setVisibleNotif(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  if (!visibleNotif) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top duration-300">
      <div className="bg-neutral-900/95 text-white border border-amber-500/30 rounded-2xl p-3.5 shadow-xl backdrop-blur-md flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <Bell className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 truncate">
              {visibleNotif.titulo}
            </span>
            <span className="text-[10px] text-neutral-400 ml-2 shrink-0">
              {visibleNotif.timestamp}
            </span>
          </div>
          <p className="text-xs text-neutral-200 mt-0.5 line-clamp-2 leading-relaxed">
            {visibleNotif.cuerpo}
          </p>
        </div>
        <button
          onClick={() => setVisibleNotif(null)}
          className="text-neutral-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
