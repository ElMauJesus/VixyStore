import React, { useState } from 'react';
import { X, Send, User, Store, Bike, Shield } from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

interface LiveChatDrawerProps {
  currentRole: 'cliente' | 'comercio' | 'conductor' | 'soporte';
  senderName: string;
}

export const LiveChatDrawer: React.FC<LiveChatDrawerProps> = ({ currentRole, senderName }) => {
  const { chatModal, closeChat, chatMessages, sendChatMessage, orders } = useDelivery();
  const [text, setText] = useState('');

  if (!chatModal.isOpen) return null;

  const currentOrder = orders.find(o => o.id === chatModal.orderId);
  const messages = chatMessages.filter(m => m.pedidoId === chatModal.orderId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendChatMessage(chatModal.orderId, currentRole, senderName, text.trim());
    setText('');
  };

  const getBadgeIcon = (tipo: string) => {
    switch (tipo) {
      case 'cliente': return <User className="w-3 h-3 text-sky-500" />;
      case 'comercio': return <Store className="w-3 h-3 text-amber-500" />;
      case 'conductor': return <Bike className="w-3 h-3 text-emerald-500" />;
      default: return <Shield className="w-3 h-3 text-purple-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col h-[520px] overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-850">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
              VIX
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                Chat del Pedido #{currentOrder?.codigoSeguimiento || chatModal.orderId}
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Canal tripartito: Cliente • Comercio • Motorizado
              </p>
            </div>
          </div>
          <button
            onClick={closeChat}
            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/50 dark:bg-neutral-900/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400 text-xs">
              <p>No hay mensajes en esta conversación aún.</p>
              <p className="mt-1">Escribe para comunicarte con el cliente, comercio o motorizado.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.emisorTipo === currentRole;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {getBadgeIcon(m.emisorTipo)}
                    <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                      {m.emisorNombre}
                    </span>
                    <span className="text-[9px] text-neutral-400">
                      {m.timestamp}
                    </span>
                  </div>
                  <div
                    className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-amber-500 text-white rounded-tr-xs shadow-xs'
                        : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700/60 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {m.mensaje}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center gap-2"
        >
          <div className="text-[10px] px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
            Como: {senderName.split(' ')[0]}
          </div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje en tiempo real..."
            className="flex-1 bg-neutral-100 dark:bg-neutral-800 border-0 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-1 focus:ring-amber-500 outline-hidden"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
