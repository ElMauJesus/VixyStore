import React, { useState } from 'react';
import { 
  QrCode, 
  Copy, 
  Check, 
  X, 
  Building2, 
  Phone, 
  CreditCard, 
  User, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

interface PagoMovilModalProps {
  isOpen: boolean;
  onClose: () => void;
  montoUsd: number;
  montoBs?: number;
  concepto?: string;
  onConfirmReference?: (referencia: string) => void;
  initialReferencia?: string;
}

export const PagoMovilModal: React.FC<PagoMovilModalProps> = ({
  isOpen,
  onClose,
  montoUsd,
  montoBs,
  concepto = 'Pago de Servicio Vixy',
  onConfirmReference,
  initialReferencia = ''
}) => {
  const { pagoMovilConfig, tasaBcv } = useDelivery();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [referenciaInput, setReferenciaInput] = useState(initialReferencia);
  const [showQrEnlarged, setShowQrEnlarged] = useState(false);

  if (!isOpen) return null;

  const totalBs = montoBs ?? (montoUsd * tasaBcv);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirm = () => {
    if (onConfirmReference) {
      onConfirmReference(referenciaInput);
    }
    onClose();
  };

  // Generate dynamic QR code if custom URL is not provided
  const qrUrl = pagoMovilConfig.qrImageUrl || 
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAGOMOVIL%20${encodeURIComponent(pagoMovilConfig.banco)}%20${encodeURIComponent(pagoMovilConfig.telefono)}%20${encodeURIComponent(pagoMovilConfig.cedulaRif)}%20BS.${totalBs.toFixed(2)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm leading-tight">Pago Móvil Oficial Vixy</h3>
              <p className="text-[10px] text-amber-100 font-medium">{concepto}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="p-3.5 bg-amber-500/10 dark:bg-amber-500/5 border-b border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block uppercase tracking-wider">
              Monto Exacto a Transferir:
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black font-mono text-neutral-900 dark:text-white">
                Bs. {totalBs.toFixed(2)}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                (${montoUsd.toFixed(2)} USD)
              </span>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(totalBs.toFixed(2), 'monto')}
            className="px-2.5 py-1 rounded-xl bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-amber-600 transition cursor-pointer shadow-xs"
            title="Copiar monto exacto en Bs."
          >
            {copiedField === 'monto' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedField === 'monto' ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
          {/* QR Code Presentation Box */}
          <div className="bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-700/80 flex flex-col items-center text-center">
            <div 
              className="relative p-2 bg-white rounded-xl shadow-xs border border-neutral-200 dark:border-neutral-700 cursor-pointer group"
              onClick={() => setShowQrEnlarged(!showQrEnlarged)}
              title="Click para ampliar código QR"
            >
              <img 
                src={qrUrl} 
                alt="Código QR Pago Móvil" 
                className={`object-contain transition duration-200 ${showQrEnlarged ? 'w-56 h-56' : 'w-36 h-36'}`}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl text-white text-[10px] font-bold transition">
                {showQrEnlarged ? 'Reducir' : 'Ampliar QR'}
              </div>
            </div>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1.5 flex items-center gap-1">
              <QrCode className="w-3 h-3 text-amber-500" />
              Escanea directamente desde la app de tu banco
            </span>
          </div>

          {/* Official Bank Details List */}
          <div className="space-y-2 bg-white dark:bg-neutral-850 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center justify-between">
              <span>Datos Bancarios Oficiales</span>
              <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Verificado
              </span>
            </div>

            {/* Banco */}
            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-neutral-400 block">Banco:</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-100 truncate block">
                    {pagoMovilConfig.banco}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => copyToClipboard(pagoMovilConfig.banco, 'banco')}
                className="p-1.5 text-neutral-400 hover:text-amber-500 transition cursor-pointer"
                title="Copiar banco"
              >
                {copiedField === 'banco' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Teléfono */}
            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-neutral-400 block">Teléfono / Celular:</span>
                  <span className="font-mono font-bold text-neutral-800 dark:text-neutral-100 truncate block">
                    {pagoMovilConfig.telefono}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => copyToClipboard(pagoMovilConfig.telefono.replace(/[^0-9]/g, ''), 'telefono')}
                className="p-1.5 text-neutral-400 hover:text-amber-500 transition cursor-pointer"
                title="Copiar teléfono"
              >
                {copiedField === 'telefono' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Cédula / RIF */}
            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
              <div className="flex items-center gap-2 min-w-0">
                <CreditCard className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-neutral-400 block">Cédula / RIF:</span>
                  <span className="font-mono font-bold text-neutral-800 dark:text-neutral-100 truncate block">
                    {pagoMovilConfig.cedulaRif}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => copyToClipboard(pagoMovilConfig.cedulaRif, 'cedula')}
                className="p-1.5 text-neutral-400 hover:text-amber-500 transition cursor-pointer"
                title="Copiar RIF / Cédula"
              >
                {copiedField === 'cedula' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Titular */}
            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
              <div className="flex items-center gap-2 min-w-0">
                <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-neutral-400 block">Titular:</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-100 truncate block">
                    {pagoMovilConfig.nombreTitular}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-200 block">
              Número de Referencia Bancaria (6 u 8 dígitos):
            </label>
            <input 
              type="text"
              value={referenciaInput}
              onChange={(e) => setReferenciaInput(e.target.value)}
              placeholder="Ej. 748920"
              className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer text-xs"
          >
            Cerrar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition cursor-pointer text-xs shadow-md shadow-amber-500/20"
          >
            Registrar Pago
          </button>
        </div>
      </div>
    </div>
  );
};
