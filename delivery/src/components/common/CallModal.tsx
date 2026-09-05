import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldCheck, MessageSquare } from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

export const CallModal: React.FC = () => {
  const { callModal, closeCall } = useDelivery();
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    let timer: any;
    if (callModal.isOpen) {
      setSeconds(0);
      timer = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callModal.isOpen]);

  if (!callModal.isOpen) return null;

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const cleanPhone = callModal.phone.replace(/[^0-9+]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center text-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-neutral-800 text-purple-400 mb-6 border border-neutral-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            Canal Telefónico Directo Vixy
          </div>

          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 p-1 mb-4 shadow-lg shadow-purple-500/20">
            <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center">
              <Phone className="w-10 h-10 text-purple-400 animate-pulse" />
            </div>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white mb-1">
            {callModal.callee}
          </h3>
          <p className="text-xs text-neutral-400 mb-2 uppercase tracking-wider">
            {callModal.role} • {callModal.phone}
          </p>

          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-sm font-mono text-emerald-400">
              {formatDuration(seconds)}
            </span>
          </div>

          {/* Quick Real Contact Actions: GSM Phone Call & WhatsApp */}
          <div className="grid grid-cols-2 gap-2.5 w-full mb-5">
            <a
              href={`tel:${cleanPhone}`}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
              title="Llamar directamente por la red celular GSM"
            >
              <Phone className="w-4 h-4" />
              <span>Llamar Móvil</span>
            </a>

            <a
              href={`https://wa.me/${cleanPhone.replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
              title="Abrir chat de WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-3 w-full mb-6">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-2xl flex items-center justify-center gap-2 transition ${
                isMuted ? 'bg-amber-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="text-xs font-medium">{isMuted ? 'Silenciado' : 'Mute'}</span>
            </button>

            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`p-3 rounded-2xl flex items-center justify-center gap-2 transition ${
                isSpeaker ? 'bg-neutral-700 text-white' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {isSpeaker ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-xs font-medium">Altavoz</span>
            </button>
          </div>

          <button
            onClick={closeCall}
            className="w-full py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition"
          >
            <PhoneOff className="w-5 h-5" />
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};
