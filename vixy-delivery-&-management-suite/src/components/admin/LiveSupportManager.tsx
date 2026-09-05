import React, { useState } from 'react';
import { Headphones, Send, User, Store, Bike, ShieldCheck, CheckCheck } from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

export const LiveSupportManager: React.FC = () => {
  const { supportMessages, respondSupportMessage } = useDelivery();
  const [replyText, setReplyText] = useState('');

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    respondSupportMessage(replyText.trim());
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Headphones className="w-4 h-4 text-amber-500" />
            Mesa de Ayuda & Soporte en Vivo (Central Web)
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Canal de asistencia en tiempo real para clientes, motorizados y comercios
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            Operadores Conectados: 3
          </span>
        </div>
      </div>

      {/* Support Chat Interface */}
      <div className="bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col h-[560px] overflow-hidden">
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
              VIX
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                Canal Unificado de Asistencia Logística
              </h4>
              <p className="text-[11px] text-neutral-400">
                Atendiendo solicitudes activas del ecosistema Vixy
              </p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/40 dark:bg-neutral-900/40">
          {supportMessages.map((msg) => {
            const isAdmin = msg.emisor === 'agente';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px]">
                  {isAdmin ? (
                    <ShieldCheck className="w-3 h-3 text-amber-500" />
                  ) : msg.usuarioTipo === 'conductor' ? (
                    <Bike className="w-3 h-3 text-emerald-500" />
                  ) : msg.usuarioTipo === 'comercio' ? (
                    <Store className="w-3 h-3 text-amber-500" />
                  ) : (
                    <User className="w-3 h-3 text-sky-500" />
                  )}
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">
                    {msg.usuarioNombre}
                  </span>
                  <span className="text-[9px] text-neutral-400">{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    isAdmin
                      ? 'bg-amber-500 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-tl-xs'
                  }`}
                >
                  {msg.texto}
                </div>
              </div>
            );
          })}
        </div>

        {/* Response Bar */}
        <form
          onSubmit={handleSendReply}
          className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-850 flex items-center gap-3"
        >
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Responder como Agente de Soporte Vixy..."
            className="flex-1 text-xs p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl border-0 outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!replyText.trim()}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <Send className="w-3.5 h-3.5" />
            Responder
          </button>
        </form>
      </div>
    </div>
  );
};
