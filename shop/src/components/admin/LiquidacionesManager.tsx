import React, { useState, useEffect } from 'react';
import {
    Wallet, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw, CreditCard, User
} from 'lucide-react';

// Interfaces para tipar los datos que vienen del backend
interface Solicitud {
    id: string;
    usuario_id: string;
    tipo_usuario: 'comercio' | 'conductor';
    nombre_usuario: string;
    documento_usuario: string;
    monto_solicitado_usd: string;
    monto_solicitado_bs: string;
    metodo_pago: string;
    banco_destino: string;
    cuenta_telefono_destino: string;
    titular_destino: string;
    cedula_rif_destino: string;
    creado_en: string;
}

export const LiquidacionesManager: React.FC = () => {
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para el Modal de Acción
    const [modalOpen, setModalOpen] = useState(false);
    const [accionActual, setAccionActual] = useState<'aprobar' | 'rechazar'>('aprobar');
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);

    // Estados del Formulario del Modal
    const [referencia, setReferencia] = useState('');
    const [notas, setNotas] = useState('');
    const [procesando, setProcesando] = useState(false);

    // Función para cargar la bandeja de pendientes
    const fetchPendientes = async () => {
        setLoading(true);
        try {
            // Ajusta la ruta o añade los headers de autenticación según manejen el login en Antigravity
            const response = await fetch('/api/admin/procesar-liquidacion.php');
            const data = await response.json();
            if (data.success) {
                setSolicitudes(data.data);
            }
        } catch (error) {
            console.error("Error cargando liquidaciones:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendientes();
    }, []);

    // Abrir modal configurado
    const handleOpenModal = (solicitud: Solicitud, accion: 'aprobar' | 'rechazar') => {
        setSolicitudSeleccionada(solicitud);
        setAccionActual(accion);
        setReferencia('');
        setNotas('');
        setModalOpen(true);
    };

    // Enviar la decisión al Backend
    const handleSubmitAccion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!solicitudSeleccionada) return;

        setProcesando(true);
        try {
            const response = await fetch('/api/admin/procesar-liquidacion.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    solicitud_id: solicitudSeleccionada.id,
                    accion: accionActual,
                    referencia_bancaria: referencia,
                    notas: notas
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(data.mensaje); // O usa un Toast de tu sistema
                setModalOpen(false);
                fetchPendientes(); // Recargamos la lista
            } else {
                alert("Error: " + data.mensaje);
            }
        } catch (error) {
            console.error("Error al procesar:", error);
            alert("Hubo un error de conexión al procesar la liquidación.");
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Bento */}
            <div className="p-5 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex justify-between items-center shadow-xs">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            Finanzas & Retiros
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-1 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-indigo-500" />
                        Bandeja de Liquidaciones
                    </h2>
                </div>
                <button
                    onClick={fetchPendientes}
                    className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                    <RefreshCw className={`w-5 h-5 text-neutral-600 dark:text-neutral-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Lista de Solicitudes */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="p-10 text-center text-neutral-500">Cargando solicitudes pendientes...</div>
                ) : solicitudes.length === 0 ? (
                    <div className="p-10 text-center text-neutral-500 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                        <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-50" />
                        No hay solicitudes de liquidación pendientes. ¡Todo al día!
                    </div>
                ) : (
                    solicitudes.map((solicitud) => (
                        <div key={solicitud.id} className="p-5 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                            {/* Info del Usuario */}
                            <div className="flex items-start gap-3">
                                <div className={`p-3 rounded-xl ${solicitud.tipo_usuario === 'comercio' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                    {solicitud.tipo_usuario === 'comercio' ? <Wallet className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 dark:text-white text-lg">
                                        {solicitud.nombre_usuario}
                                    </h4>
                                    <div className="text-xs text-neutral-500 font-mono space-y-0.5 mt-1">
                                        <p>ID: {solicitud.id}</p>
                                        <p>{solicitud.tipo_usuario.toUpperCase()} • {solicitud.documento_usuario}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Financiera y Bancaria */}
                            <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 text-sm w-full lg:w-auto flex-1 max-w-md">
                                <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700 pb-2 mb-2">
                                    <span className="text-neutral-500">Monto a pagar:</span>
                                    <div className="text-right">
                                        <span className="font-black text-emerald-500 text-lg">${parseFloat(solicitud.monto_solicitado_usd).toFixed(2)}</span>
                                        <span className="text-xs text-neutral-400 font-mono block">Bs. {parseFloat(solicitud.monto_solicitado_bs).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                                    <p><strong className="text-neutral-800 dark:text-neutral-200">Banco:</strong> {solicitud.banco_destino} ({solicitud.metodo_pago})</p>
                                    <p><strong className="text-neutral-800 dark:text-neutral-200">Titular:</strong> {solicitud.titular_destino} - {solicitud.cedula_rif_destino}</p>
                                    <p><strong className="text-neutral-800 dark:text-neutral-200">Cuenta/Tlf:</strong> <span className="font-mono">{solicitud.cuenta_telefono_destino}</span></p>
                                </div>
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex lg:flex-col gap-2 w-full lg:w-auto">
                                <button
                                    onClick={() => handleOpenModal(solicitud, 'aprobar')}
                                    className="flex-1 lg:w-32 py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" /> Aprobar
                                </button>
                                <button
                                    onClick={() => handleOpenModal(solicitud, 'rechazar')}
                                    className="flex-1 lg:w-32 py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Rechazar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* MODAL DE ACCIÓN */}
            {modalOpen && solicitudSeleccionada && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-neutral-850 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-neutral-200 dark:border-neutral-800">
                        <h3 className={`text-xl font-bold flex items-center gap-2 ${accionActual === 'aprobar' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {accionActual === 'aprobar' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                            {accionActual === 'aprobar' ? 'Aprobar Liquidación' : 'Rechazar Liquidación'}
                        </h3>

                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                            Usuario: <strong className="text-neutral-900 dark:text-white">{solicitudSeleccionada.nombre_usuario}</strong><br />
                            Monto: <strong className="text-neutral-900 dark:text-white">${parseFloat(solicitudSeleccionada.monto_solicitado_usd).toFixed(2)}</strong>
                        </p>

                        <form onSubmit={handleSubmitAccion} className="mt-5 space-y-4">
                            {accionActual === 'aprobar' && (
                                <div>
                                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                                        Número de Referencia Bancaria (Requerido)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={referencia}
                                        onChange={(e) => setReferencia(e.target.value)}
                                        placeholder="Ej. 123456789"
                                        className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-xl border border-neutral-200 dark:border-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    Notas adicionales (Opcional)
                                </label>
                                <textarea
                                    value={notas}
                                    onChange={(e) => setNotas(e.target.value)}
                                    placeholder={accionActual === 'rechazar' ? "Motivo del rechazo (ej. Datos inválidos)" : "Detalle adicional..."}
                                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-xl border border-neutral-200 dark:border-neutral-700 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    disabled={procesando}
                                    className="px-4 py-2 text-neutral-600 dark:text-neutral-400 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={procesando}
                                    className={`px-6 py-2 text-white font-bold rounded-xl transition ${accionActual === 'aprobar'
                                        ? 'bg-emerald-500 hover:bg-emerald-600'
                                        : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                >
                                    {procesando ? 'Procesando...' : 'Confirmar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};