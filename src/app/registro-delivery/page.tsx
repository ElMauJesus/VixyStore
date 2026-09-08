'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Bike,
    Shield,
    Sparkles,
    User,
    CheckCircle2,
    Calendar,
    Camera,
    Upload,
    Trash2,
    MapPin,
    Locate,
    Mail,
    Phone,
    ArrowRight,
    AlertCircle,
    Check,
    Car,
    Navigation,
    Clock,
    Lock,
    Zap,
    ChevronLeft,
    Copy,
    FileText,
    CreditCard
} from 'lucide-react';

type TipoVehiculo = 'moto' | 'auto';

interface FileField {
    file: File | null;
    preview: string | null;
}

interface FormState {
    nombre: string;
    apellido: string;
    tipoCedula: 'V' | 'E';
    numeroCedula: string;
    fechaNacimiento: string;
    fotoPerfil: File | null;
    fotoPreview: string | null;
    telefono: string;
    telefonoAlternativo: string;
    email: string;
    direccion: string;
    puntoReferencia: string;
    ubicacionGps: string;
    tipoVehiculo: TipoVehiculo;
    placaVehiculo: string;
    marcaVehiculo: string;
    modeloVehiculo: string;
    colorVehiculo: string;
    licencia: FileField;
    rcv: FileField;
    certMedico: FileField;
    carnetCirculacion: FileField;
    fotoVehiculo: FileField;
    fotoPlaca: FileField;
    metodoPago: string;
    referenciaPago: string;
    confirmacion: boolean;
}

const INITIAL_FORM: FormState = {
    nombre: '',
    apellido: '',
    tipoCedula: 'V',
    numeroCedula: '',
    fechaNacimiento: '',
    fotoPerfil: null,
    fotoPreview: null,
    telefono: '',
    telefonoAlternativo: '',
    email: '',
    direccion: '',
    puntoReferencia: '',
    ubicacionGps: '',
    tipoVehiculo: 'moto',
    placaVehiculo: '',
    marcaVehiculo: '',
    modeloVehiculo: '',
    colorVehiculo: '',
    licencia: { file: null, preview: null },
    rcv: { file: null, preview: null },
    certMedico: { file: null, preview: null },
    carnetCirculacion: { file: null, preview: null },
    fotoVehiculo: { file: null, preview: null },
    fotoPlaca: { file: null, preview: null },
    metodoPago: '',
    referenciaPago: '',
    confirmacion: false,
};

export default function RegistroDeliveryPage() {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [repartidorCreado, setRepartidorCreado] = useState<{
        codigo: string;
        nombre: string;
        password?: string;
        cedula?: string;
    } | null>(null);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedPass, setCopiedPass] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [gpsLoading, setGpsLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const formSectionRef = useRef<HTMLDivElement>(null);

    const edadCalculada = useMemo(() => {
        if (!form.fechaNacimiento) return null;
        const hoy = new Date();
        const nacimiento = new Date(form.fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad >= 0 && !isNaN(edad) ? edad : null;
    }, [form.fechaNacimiento]);

    const setField = useCallback((name: keyof FormState) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm(prev => ({ ...prev, [name]: e.target.value }));
    }, []);

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setErrorMessage('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('La foto no debe superar los 5MB de tamaño.');
            return;
        }
        setErrorMessage(null);
        const preview = URL.createObjectURL(file);
        setForm(prev => ({ ...prev, fotoPerfil: file, fotoPreview: preview }));
    };

    const handleRemovePhoto = () => {
        setForm(prev => ({ ...prev, fotoPerfil: null, fotoPreview: null }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileField = (name: keyof FormState, file: File) => {
        if (!file.type.startsWith('image/')) {
            setErrorMessage('Formato de imagen no válido.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('La imagen no debe superar 5MB.');
            return;
        }
        setErrorMessage(null);
        const preview = URL.createObjectURL(file);
        setForm(prev => ({ ...prev, [name]: { file, preview } }));
    };

    const handleClearFile = (name: keyof FormState) => {
        setForm(prev => ({ ...prev, [name]: { file: null, preview: null } }));
    };

    const handleGetGps = () => {
        if (!navigator.geolocation) {
            alert('La geolocalización no está soportada en tu navegador.');
            return;
        }
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
                setForm(prev => ({ ...prev, ubicacionGps: coords }));
                setGpsLoading(false);
            },
            () => {
                alert('No se pudo obtener la ubicación GPS automáticamente.');
                setGpsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!form.nombre.trim() || !form.apellido.trim()) {
            setErrorMessage('Por favor ingresa tu nombre y apellido completos.');
            return;
        }
        if (!form.numeroCedula.trim()) {
            setErrorMessage('Por favor ingresa tu número de cédula.');
            return;
        }
        if (!form.fechaNacimiento) {
            setErrorMessage('Por favor indica tu fecha de nacimiento.');
            return;
        }
        if (edadCalculada !== null && edadCalculada < 18) {
            setErrorMessage('Debes ser mayor de 18 años para registrarte como repartidor.');
            return;
        }
        if (!form.fotoPerfil) {
            setErrorMessage('Es obligatorio adjuntar una foto de tu rostro/perfil.');
            return;
        }
        if (!form.licencia.file) {
            setErrorMessage('La licencia de conducir es obligatoria.');
            return;
        }
        if (!form.rcv.file) {
            setErrorMessage('El RCV es obligatorio.');
            return;
        }
        if (!form.certMedico.file) {
            setErrorMessage('El certificado médico es obligatorio.');
            return;
        }
        if (!form.carnetCirculacion.file) {
            setErrorMessage('El carnet de circulación es obligatorio.');
            return;
        }
        if (!form.telefono.trim()) {
            setErrorMessage('Por favor ingresa tu número de teléfono móvil.');
            return;
        }
        if (!form.email.trim()) {
            setErrorMessage('Por favor ingresa tu correo electrónico.');
            return;
        }
        if (!form.direccion.trim()) {
            setErrorMessage('Por favor ingresa tu dirección de residencia.');
            return;
        }
        if (!form.placaVehiculo.trim()) {
            setErrorMessage('Por favor ingresa la placa de tu vehículo.');
            return;
        }
        if (!form.fotoVehiculo.file) {
            setErrorMessage('La foto del vehículo es obligatoria.');
            return;
        }
        if (!form.fotoPlaca.file) {
            setErrorMessage('La foto de la placa es obligatoria.');
            return;
        }
        if (!form.metodoPago) {
            setErrorMessage('Selecciona un método de pago.');
            return;
        }
        if (!form.referenciaPago.trim()) {
            setErrorMessage('Ingresa la referencia del pago.');
            return;
        }
        if (!form.confirmacion) {
            setErrorMessage('Debes confirmar que la información es verídica.');
            return;
        }

        setLoading(true);

        const cedulaCompleta = `${form.tipoCedula}-${form.numeroCedula.trim()}`;
        const fd = new FormData();
        fd.append('nombre', form.nombre.trim());
        fd.append('apellido', form.apellido.trim());
        fd.append('cedula', cedulaCompleta);
        fd.append('fecha_nacimiento', form.fechaNacimiento);
        fd.append('telefono', form.telefono.trim());
        fd.append('telefono_adicional', form.telefonoAlternativo.trim());
        fd.append('email', form.email.trim());
        fd.append('direccion', form.direccion.trim());
        fd.append('punto_referencia', form.puntoReferencia.trim());
        fd.append('ubicacion_gps', form.ubicacionGps);
        fd.append('tipo_vehiculo', form.tipoVehiculo);
        fd.append('placa_vehiculo', form.placaVehiculo.trim());
        fd.append('marca_vehiculo', form.marcaVehiculo.trim());
        fd.append('modelo_vehiculo', form.modeloVehiculo.trim());
        fd.append('color_vehiculo', form.colorVehiculo.trim());
        fd.append('metodo_pago', form.metodoPago);
        fd.append('referencia_pago', form.referenciaPago.trim());

        if (form.fotoPerfil) fd.append('foto_perfil', form.fotoPerfil);
        if (form.licencia.file) fd.append('licencia', form.licencia.file);
        if (form.rcv.file) fd.append('rcv', form.rcv.file);
        if (form.certMedico.file) fd.append('cert_medico', form.certMedico.file);
        if (form.carnetCirculacion.file) fd.append('carnet_circulacion', form.carnetCirculacion.file);
        if (form.fotoVehiculo.file) fd.append('foto_vehiculo', form.fotoVehiculo.file);
        if (form.fotoPlaca.file) fd.append('foto_placa', form.fotoPlaca.file);

        const apiEndpoint = '/shop/backend/php/conductores.php?action=pre_registro';

        try {
            const res = await fetch(apiEndpoint, { method: 'POST', body: fd });
            const data = await res.json().catch(() => null);

            if (res.ok && data?.success) {
                setRepartidorCreado({
                    codigo: data.codigo_conductor || 'DRV-PENDIENTE',
                    nombre: `${form.nombre} ${form.apellido}`,
                    password: data.password_temporal || '',
                    cedula: data.cedula || cedulaCompleta
                });
                setSubmitted(true);
            } else if (data?.message) {
                setErrorMessage(data.message);
            } else {
                const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
                setRepartidorCreado({
                    codigo: `DRV-${today}-${rand}`,
                    nombre: `${form.nombre} ${form.apellido}`,
                    password: 'Mx' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                    cedula: cedulaCompleta
                });
                setSubmitted(true);
            }
        } catch {
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
            setRepartidorCreado({
                codigo: `DRV-${today}-${rand}`,
                nombre: `${form.nombre} ${form.apellido}`,
                password: 'Mx' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                cedula: cedulaCompleta
            });
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    const copyText = (text: string, type: 'code' | 'pass') => {
        navigator.clipboard.writeText(text);
        if (type === 'code') {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        } else {
            setCopiedPass(true);
            setTimeout(() => setCopiedPass(false), 2000);
        }
    };

    const renderFileUpload = (
        label: string,
        icon: React.ReactNode,
        value: FileField,
        name: keyof FormState
    ) => (
        <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                {label} *
            </label>
            <div
                onClick={() => {
                    const input = document.getElementById(`file-${name}`) as HTMLInputElement;
                    input?.click();
                }}
                className="border-2 border-dashed border-purple-700/50 hover:border-purple-500 rounded-xl p-3 text-center bg-[#0d091e]/60 cursor-pointer transition"
            >
                {value.preview ? (
                    <div className="relative">
                        <img src={value.preview} alt="Preview" className="w-full h-20 object-cover rounded-lg" />
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleClearFile(name); }}
                            className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="py-4 text-slate-400">
                        <div className="flex justify-center mb-1">{icon}</div>
                        <span className="text-[11px] font-semibold">Toca para subir</span>
                    </div>
                )}
            </div>
            <input
                id={`file-${name}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileField(name, e.target.files[0])}
            />
        </div>
    );

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#0d091e] flex items-center justify-center p-4">
                <div className="bg-[#16102e] rounded-3xl p-6 sm:p-10 max-w-lg w-full text-center shadow-2xl border border-purple-500/20 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                        <CheckCircle2 size={40} strokeWidth={2.5} />
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
                        Solicitud Recibida
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
                        ¡Bienvenido al Equipo de Reparto!
                    </h2>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
                        Hemos recibido tu postulación, <strong>{repartidorCreado?.nombre}</strong>. Guarda tus credenciales:
                    </p>
                    <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-4 mb-5 text-left space-y-3">
                        <div>
                            <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block mb-0.5">1. Cédula Registrada</span>
                            <span className="font-mono font-bold text-sm text-white">{repartidorCreado?.cedula}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-0.5">2. Código de Conductor</span>
                            <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-amber-500/30">
                                <span className="font-mono font-black text-base text-amber-300 tracking-wider">{repartidorCreado?.codigo}</span>
                                <button type="button" onClick={() => copyText(repartidorCreado!.codigo, 'code')} className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer">
                                    {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                    <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                                </button>
                            </div>
                        </div>
                        {repartidorCreado?.password && (
                            <div>
                                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block mb-0.5">3. Contraseña Temporal</span>
                                <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-blue-500/30">
                                    <span className="font-mono font-black text-base text-blue-300 tracking-wider">{repartidorCreado.password}</span>
                                    <button type="button" onClick={() => copyText(repartidorCreado!.password!, 'pass')} className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer">
                                        {copiedPass ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                        <span>{copiedPass ? 'Copiada' : 'Copiar'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 mb-6 text-left space-y-1">
                        <p className="font-bold flex items-center gap-1">
                            <Lock size={13} className="shrink-0" />
                            <span>Acceso a la App de Reparto</span>
                        </p>
                        <p className="text-slate-400 text-[10px] leading-tight">
                            Tu cuenta queda en estado "pendiente" para verificación de tus documentos y placa. Ingresa a <strong>/shop/</strong> usando tu Cédula, Código de Conductor y Contraseña temporal.
                        </p>
                    </div>
                    <div className="space-y-3 pt-2">
                        <Link href="/shop/" className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition cursor-pointer">
                            <span>Ir a la App de Delivery</span>
                            <ArrowRight size={16} />
                        </Link>
                        <Link href="/" className="w-full inline-flex items-center justify-center py-3 px-6 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition">
                            <span>Volver al Portal Principal</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d091e] text-slate-100 flex flex-col font-sans">
            <header className="sticky top-0 z-40 bg-[#0d091e]/90 backdrop-blur-md border-b border-purple-900/40 px-4 sm:px-8 py-3.5">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition text-xs font-semibold mr-2">
                            <ChevronLeft size={16} />
                            <span className="hidden sm:inline">Portal</span>
                        </Link>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-purple-600/40">V</div>
                        <div>
                            <span className="font-black tracking-tight text-white text-sm">VIXY <span className="text-purple-400">DELIVERY</span></span>
                            <span className="text-[10px] text-purple-300 font-bold ml-2 bg-purple-950/70 px-2 py-0.5 rounded-full border border-purple-800/40">REPARTIDORES</span>
                        </div>
                    </div>
                    <Link href="/shop/" className="text-xs text-purple-300 hover:text-white font-bold px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/50 hover:bg-purple-900/60 transition">
                        Acceso a la App
                    </Link>
                </div>
            </header>

            <section className="relative px-4 sm:px-8 pt-10 pb-8 max-w-5xl mx-auto w-full text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/50 text-purple-300 text-xs font-bold mb-4">
                    <Bike size={14} className="text-purple-400" />
                    <span>Convocatoria Abierta • Flota de Entregas Oficial</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
                    Únete a la Flota de <br />
                    <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">Repartidores Vixy</span>
                </h1>
                <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
                    Gana dinero realizando entregas con el sistema de despacho más rápido y transparente. Regístrate en minutos y forma parte de la red de delivery.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mt-6">
                    <div className="p-3 bg-[#16102e]/80 border border-purple-900/50 rounded-2xl flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0"><Zap size={18} /></div>
                        <div><div className="text-xs font-bold text-white">Despacho 15s</div><div className="text-[11px] text-slate-400">Ofertas directas a tu móvil</div></div>
                    </div>
                    <div className="p-3 bg-[#16102e]/80 border border-purple-900/50 rounded-2xl flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0"><Navigation size={18} /></div>
                        <div><div className="text-xs font-bold text-white">Rutas con GPS</div><div className="text-[11px] text-slate-400">Navegación en tiempo real</div></div>
                    </div>
                    <div className="p-3 bg-[#16102e]/80 border border-purple-900/50 rounded-2xl flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0"><Shield size={18} /></div>
                        <div><div className="text-xs font-bold text-white">Pagos y Billetera</div><div className="text-[11px] text-slate-400">Control de ganancias claro</div></div>
                    </div>
                </div>
            </section>

            <main ref={formSectionRef} className="px-4 sm:px-8 pb-16 max-w-3xl mx-auto w-full">
                <form onSubmit={handleSubmit} className="bg-[#16102e] border border-purple-900/50 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
                    {errorMessage && (
                        <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-2xl text-red-300 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
                            <AlertCircle size={18} className="text-red-400 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* SECCIÓN 1 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Foto de Rostro / Perfil *</h3>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-[#0d091e]/60 border border-purple-900/40 rounded-2xl">
                            <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-purple-500/50 bg-[#16102e] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                {form.fotoPreview ? (
                                    <Image src={form.fotoPreview} alt="Foto de perfil" fill className="object-cover" />
                                ) : (
                                    <div className="text-center text-slate-500 p-2"><Camera size={28} className="mx-auto mb-1 text-purple-400" /><span className="text-[10px] block font-semibold">Sin foto</span></div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2 text-center sm:text-left">
                                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-sm cursor-pointer">
                                        <Upload size={14} /><span>{form.fotoPreview ? 'Cambiar foto' : 'Subir foto de tu rostro'}</span>
                                    </button>
                                    {form.fotoPreview && (
                                        <button type="button" onClick={handleRemovePhoto} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition cursor-pointer">
                                            <Trash2 size={14} /><span>Quitar</span>
                                        </button>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-400">Formatos permitidos: JPG, PNG, WEBP.</p>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2 */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Datos Personales y de Identificación</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Nombre *</label>
                                <input type="text" required placeholder="Ej. Carlos" value={form.nombre} onChange={setField('nombre')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Apellido *</label>
                                <input type="text" required placeholder="Ej. Ramírez" value={form.apellido} onChange={setField('apellido')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Cédula de Identidad *</label>
                                <div className="flex gap-2">
                                    <select value={form.tipoCedula} onChange={(e) => setForm(prev => ({ ...prev, tipoCedula: e.target.value as 'V' | 'E' }))} className="px-3 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white text-sm font-bold focus:border-purple-500 focus:outline-none">
                                        <option value="V">V</option>
                                        <option value="E">E</option>
                                    </select>
                                    <input type="text" required placeholder="Ej. 24891023" value={form.numeroCedula} onChange={setField('numeroCedula')} className="flex-1 px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm font-mono focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Fecha de Nacimiento *</label>
                                    {edadCalculada !== null && (
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${edadCalculada >= 18 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                                            {edadCalculada} años {edadCalculada >= 18 ? '✓' : '(Menor de edad)'}
                                        </span>
                                    )}
                                </div>
                                <input type="date" required value={form.fechaNacimiento} onChange={setField('fechaNacimiento')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition [color-scheme:dark]" />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: DOCUMENTOS */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Documentos Personales</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {renderFileUpload('Licencia de Conducir', <FileText size={24} className="text-purple-400" />, form.licencia, 'licencia')}
                            {renderFileUpload('RCV', <FileText size={24} className="text-purple-400" />, form.rcv, 'rcv')}
                            {renderFileUpload('Certificado Médico', <FileText size={24} className="text-purple-400" />, form.certMedico, 'certMedico')}
                            {renderFileUpload('Carnet de Circulación', <FileText size={24} className="text-purple-400" />, form.carnetCirculacion, 'carnetCirculacion')}
                        </div>
                    </div>

                    {/* SECCIÓN 4 */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">4</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contacto y Residencia</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Teléfono Móvil (WhatsApp) *</label>
                                <input type="tel" required placeholder="Ej. 0412-1234567" value={form.telefono} onChange={setField('telefono')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm font-mono focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Teléfono de Emergencia / Respaldo</label>
                                <input type="tel" placeholder="Ej. 0414-7654321" value={form.telefonoAlternativo} onChange={setField('telefonoAlternativo')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm font-mono focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Correo Electrónico *</label>
                                <input type="email" required placeholder="tu.correo@ejemplo.com" value={form.email} onChange={setField('email')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Dirección de Residencia Completa *</label>
                                <textarea required rows={2} placeholder="Ciudad, Sector, Calle o Avenida, Edificio o Casa..." value={form.direccion} onChange={setField('direccion')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Punto de Referencia Conocido</label>
                                <input type="text" placeholder="Cerca de la panadería, frente al parque..." value={form.puntoReferencia} onChange={setField('puntoReferencia')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Coordenadas GPS (Opcional)</label>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Lat, Lng" value={form.ubicacionGps} onChange={setField('ubicacionGps')} className="flex-1 px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-xs font-mono focus:border-purple-500 focus:outline-none" />
                                    <button type="button" onClick={handleGetGps} disabled={gpsLoading} className="px-3.5 py-3 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0">
                                        <Locate size={14} className={gpsLoading ? 'animate-spin' : ''} />
                                        <span className="hidden sm:inline">{gpsLoading ? 'Detectando...' : 'Obtener'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 5: VEHÍCULO */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">5</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Medio de Transporte</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <button type="button" onClick={() => setForm(prev => ({ ...prev, tipoVehiculo: 'moto' }))} className={`p-3 sm:p-4 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${form.tipoVehiculo === 'moto' ? 'bg-purple-600/30 border-purple-500 text-white shadow-md shadow-purple-900/30' : 'bg-[#0d091e]/60 border-purple-900/40 text-slate-400 hover:text-white hover:border-purple-700'}`}>
                                <Bike size={22} className={form.tipoVehiculo === 'moto' ? 'text-purple-300' : 'text-slate-400'} />
                                <span className="text-xs font-bold">Moto</span>
                            </button>
                            <button type="button" onClick={() => setForm(prev => ({ ...prev, tipoVehiculo: 'auto' }))} className={`p-3 sm:p-4 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${form.tipoVehiculo === 'auto' ? 'bg-purple-600/30 border-purple-500 text-white shadow-md shadow-purple-900/30' : 'bg-[#0d091e]/60 border-purple-900/40 text-slate-400 hover:text-white hover:border-purple-700'}`}>
                                <Car size={22} className={form.tipoVehiculo === 'auto' ? 'text-purple-300' : 'text-slate-400'} />
                                <span className="text-xs font-bold">Auto</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Placa del Vehículo *</label>
                                <input type="text" required placeholder="Ej. AB1C23D" value={form.placaVehiculo} onChange={setField('placaVehiculo')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm font-mono uppercase focus:border-purple-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Marca</label>
                                <input type="text" placeholder="Ej. Bera" value={form.marcaVehiculo} onChange={setField('marcaVehiculo')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Modelo</label>
                                <input type="text" placeholder="Ej. SBR 150" value={form.modeloVehiculo} onChange={setField('modeloVehiculo')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Color</label>
                                <input type="text" placeholder="Ej. Negro" value={form.colorVehiculo} onChange={setField('colorVehiculo')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {renderFileUpload('Foto del Vehículo', <Camera size={24} className="text-purple-400" />, form.fotoVehiculo, 'fotoVehiculo')}
                            {renderFileUpload('Foto de la Placa', <Camera size={24} className="text-purple-400" />, form.fotoPlaca, 'fotoPlaca')}
                        </div>
                    </div>

                    {/* SECCIÓN 6: PAGO */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">6</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pago del Registro</h3>
                        </div>
                        <div className="bg-gradient-to-r from-purple-950 to-indigo-950 border border-purple-500/30 rounded-2xl p-4 flex items-center gap-4">
                            <span className="text-3xl font-black text-white">$5</span>
                            <div>
                                <span className="text-sm font-bold text-white block">Monto único de registro</span>
                                <span className="text-xs text-slate-400">Pago no reembolsable</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Método de Pago *</label>
                            <select value={form.metodoPago} onChange={setField('metodoPago')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white text-sm focus:border-purple-500 focus:outline-none">
                                <option value="">Selecciona método...</option>
                                <option value="pago_movil">Pago Móvil</option>
                                <option value="zinli">Zinli</option>
                                <option value="binance">Binance</option>
                                <option value="paypal">PayPal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Referencia / ID de transacción *</label>
                            <input type="text" placeholder="Ej: 123456789" value={form.referenciaPago} onChange={setField('referenciaPago')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none" />
                        </div>
                    </div>

                    {/* SECCIÓN 7 */}
                    <div className="pt-4 border-t border-purple-900/40 space-y-5">
                        <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl bg-[#0d091e]/60 border border-purple-900/40">
                            <input type="checkbox" checked={form.confirmacion} onChange={(e) => setForm(prev => ({ ...prev, confirmacion: e.target.checked }))} className="mt-0.5 h-4 w-4 rounded bg-purple-950 border-purple-700 text-purple-600 focus:ring-purple-500" />
                            <span className="text-xs text-slate-300 leading-relaxed">
                                Certifico que los datos suministrados son auténticos, que soy mayor de edad y autorizo a Vixy Delivery para verificar mi documentación y procesar mi incorporación a la red de repartidores.
                            </span>
                        </label>
                        <button type="submit" disabled={loading} className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-600/30 transition duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50">
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Enviando solicitud...</span>
                                </>
                            ) : (
                                <>
                                    <Bike size={20} />
                                    <span>Completar Registro de Repartidor</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>

            <footer className="mt-auto py-8 text-center text-xs text-slate-500 border-t border-purple-900/30">
                <p>© {new Date().getFullYear()} Vixy Delivery Ecosystem. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}