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
    ChevronLeft
} from 'lucide-react';

type TipoVehiculo = 'moto' | 'bicicleta' | 'auto';

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
    modeloVehiculo: string;
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
    modeloVehiculo: '',
    confirmacion: false,
};

export default function RegistroDeliveryPage() {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [repartidorCreado, setRepartidorCreado] = useState<{ codigo: string; nombre: string } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [gpsLoading, setGpsLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const formSectionRef = useRef<HTMLDivElement>(null);

    // Cálculo de edad en tiempo real
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
                alert('No se pudo obtener la ubicación GPS automáticamente. Puedes escribirla o dejarla en blanco.');
                setGpsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        // Validaciones obligatorias
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
            setErrorMessage('Es obligatorio adjuntar una foto de tu rostro/perfil para tu credencial de repartidor.');
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

        if (form.tipoVehiculo === 'moto' && !form.placaVehiculo.trim()) {
            setErrorMessage('Por favor ingresa la placa de tu moto.');
            return;
        }

        if (!form.confirmacion) {
            setErrorMessage('Debes confirmar que la información proporcionada es verídica para continuar.');
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
        fd.append('modelo_vehiculo', form.modeloVehiculo.trim());

        if (form.fotoPerfil) {
            fd.append('foto_perfil', form.fotoPerfil);
        }

        const apiEndpoint = '/delivery/backend/php/conductores.php?action=pre_registro';

        try {
            const res = await fetch(apiEndpoint, {
                method: 'POST',
                body: fd,
            });

            const data = await res.json().catch(() => null);

            if (res.ok && data?.success) {
                setRepartidorCreado({
                    codigo: data.codigo_conductor || 'REP-PENDIENTE',
                    nombre: `${form.nombre} ${form.apellido}`
                });
                setSubmitted(true);
            } else if (data?.message) {
                setErrorMessage(data.message);
            } else {
                // Generación de código local demo si no hay servidor PHP activo
                const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
                setRepartidorCreado({
                    codigo: `REP-${today}-${rand}`,
                    nombre: `${form.nombre} ${form.apellido}`
                });
                setSubmitted(true);
            }
        } catch {
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
            setRepartidorCreado({
                codigo: `REP-${today}-${rand}`,
                nombre: `${form.nombre} ${form.apellido}`
            });
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#0d091e] flex items-center justify-center p-4">
                <div className="bg-[#16102e] rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-2xl border border-purple-500/20 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                        <CheckCircle2 size={44} strokeWidth={2.5} />
                    </div>

                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
                        Solicitud Recibida
                    </span>

                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
                        ¡Bienvenido al Equipo de Reparto!
                    </h2>

                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                        Hemos recibido tu postulación, <strong>{repartidorCreado?.nombre}</strong>. Nuestro equipo de logística y control de calidad verificará tus datos para activar tu cuenta de repartidor.
                    </p>

                    {repartidorCreado?.codigo && (
                        <div className="bg-purple-950/60 border border-purple-500/40 rounded-2xl p-4 mb-6 text-center">
                            <span className="text-[11px] text-purple-300 font-bold uppercase tracking-wider block mb-1">
                                Código de Postulante Asignado
                            </span>
                            <span className="font-mono font-black text-2xl text-purple-200 tracking-wider">
                                {repartidorCreado.codigo}
                            </span>
                        </div>
                    )}

                    <div className="space-y-3 pt-2">
                        <Link
                            href="/delivery/"
                            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition cursor-pointer"
                        >
                            <span>Ir a la App de Delivery</span>
                            <ArrowRight size={16} />
                        </Link>

                        <Link
                            href="/"
                            className="w-full inline-flex items-center justify-center py-3 px-6 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition"
                        >
                            <span>Volver al Portal Principal</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d091e] text-slate-100 flex flex-col font-sans">
            {/* Header / Navbar */}
            <header className="sticky top-0 z-40 bg-[#0d091e]/90 backdrop-blur-md border-b border-purple-900/40 px-4 sm:px-8 py-3.5">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition text-xs font-semibold mr-2">
                            <ChevronLeft size={16} />
                            <span className="hidden sm:inline">Portal</span>
                        </Link>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-purple-600/40">
                            V
                        </div>
                        <div>
                            <span className="font-black tracking-tight text-white text-sm">VIXY <span className="text-purple-400">DELIVERY</span></span>
                            <span className="text-[10px] text-purple-300 font-bold ml-2 bg-purple-950/70 px-2 py-0.5 rounded-full border border-purple-800/40">REPARTIDORES</span>
                        </div>
                    </div>

                    <Link
                        href="/delivery/"
                        className="text-xs text-purple-300 hover:text-white font-bold px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/50 hover:bg-purple-900/60 transition"
                    >
                        Acceso a la App
                    </Link>
                </div>
            </header>

            {/* Hero Banner */}
            <section className="relative px-4 sm:px-8 pt-10 pb-8 max-w-5xl mx-auto w-full text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/50 text-purple-300 text-xs font-bold mb-4">
                    <Bike size={14} className="text-purple-400" />
                    <span>Convocatoria Abierta • Flota de Entregas Oficial</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
                    Únete a la Flota de <br />
                    <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                        Repartidores Vixy
                    </span>
                </h1>

                <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
                    Gana dinero realizando entregas con el sistema de despacho más rápido y transparente. Regístrate en minutos y forma parte de la red de delivery.
                </p>

                {/* Badges de Beneficios */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mt-6">
                    <div className="p-3 bg-[#16102e]/80 border border-purple-900/50 rounded-2xl flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                            <Zap size={18} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white">Despacho 15s</div>
                            <div className="text-[11px] text-slate-400">Ofertas directas a tu móvil</div>
                        </div>
                    </div>

                    <div className="p-3 bg-[#16102e]/80 border border-purple-900/50 rounded-2xl flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                            <Navigation size={18} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white">Rutas con GPS</div>
                            <div className="text-[11px] text-slate-400">Navegación en tiempo real</div>
                        </div>
                    </div>

                    <div className="p-3 bg-[#16102e]/80 border border-purple-900/50 rounded-2xl flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                            <Shield size={18} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white">Pagos y Billetera</div>
                            <div className="text-[11px] text-slate-400">Control de ganancias claro</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Formulario Principal */}
            <main ref={formSectionRef} className="px-4 sm:px-8 pb-16 max-w-3xl mx-auto w-full">
                <form onSubmit={handleSubmit} className="bg-[#16102e] border border-purple-900/50 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
                    
                    {errorMessage && (
                        <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-2xl text-red-300 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
                            <AlertCircle size={18} className="text-red-400 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* SECCIÓN 1: FOTO DE PERFIL / ROSTRO */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Foto de Rostro / Perfil *</h3>
                        </div>
                        <p className="text-xs text-slate-400">
                            Esta foto aparecerá en tu credencial de repartidor y será visible para clientes y comercios para identificarte.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-[#0d091e]/60 border border-purple-900/40 rounded-2xl">
                            {/* Vista previa circular */}
                            <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-purple-500/50 bg-[#16102e] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                {form.fotoPreview ? (
                                    <Image
                                        src={form.fotoPreview}
                                        alt="Foto de perfil"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="text-center text-slate-500 p-2">
                                        <Camera size={28} className="mx-auto mb-1 text-purple-400" />
                                        <span className="text-[10px] block font-semibold">Sin foto</span>
                                    </div>
                                )}
                            </div>

                            {/* Botones de acción */}
                            <div className="flex-1 space-y-2 text-center sm:text-left">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFile(file);
                                    }}
                                />

                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                                    >
                                        <Upload size={14} />
                                        <span>{form.fotoPreview ? 'Cambiar foto' : 'Subir foto de tu rostro'}</span>
                                    </button>

                                    {form.fotoPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition cursor-pointer"
                                        >
                                            <Trash2 size={14} />
                                            <span>Quitar</span>
                                        </button>
                                    )}
                                </div>

                                <p className="text-[11px] text-slate-400">
                                    Formatos permitidos: JPG, PNG, WEBP. Asegúrate de que tu rostro esté bien iluminado y sin lentes oscuros.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: DATOS PERSONALES */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Datos Personales y de Identificación</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Nombre */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Carlos"
                                    value={form.nombre}
                                    onChange={setField('nombre')}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                                />
                            </div>

                            {/* Apellido */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                                    Apellido *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Ramírez"
                                    value={form.apellido}
                                    onChange={setField('apellido')}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                                />
                            </div>

                            {/* Cédula */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                                    Cédula de Identidad *
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={form.tipoCedula}
                                        onChange={(e) => setForm(prev => ({ ...prev, tipoCedula: e.target.value as 'V' | 'E' }))}
                                        className="px-3 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white text-sm font-bold focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="V">V</option>
                                        <option value="E">E</option>
                                    </select>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. 24891023"
                                        value={form.numeroCedula}
                                        onChange={setField('numeroCedula')}
                                        className="flex-1 px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm font-mono focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Fecha de Nacimiento */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                                        Fecha de Nacimiento *
                                    </label>
                                    {edadCalculada !== null && (
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                            edadCalculada >= 18 
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                        }`}>
                                            {edadCalculada} años {edadCalculada >= 18 ? '✓' : '(Menor de edad)'}
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="date"
                                    required
                                    value={form.fechaNacimiento}
                                    onChange={setField('fechaNacimiento')}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition [color-scheme:dark]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: CONTACTO Y UBICACIÓN */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contacto y Residencia</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Teléfono */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                                    Teléfono Móvil (WhatsApp) *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="Ej. 0412-1234567"
                                    value={form.telefono}
                                    onChange={setField('telefono')}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm font-mono focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                                />
                            </div>

                            {/* Teléfono Adicional */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                                    Teléfono de Emergencia / Respaldo
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Ej. 0414-7654321"
                                    value={form.telefonoAlternativo}
                                    onChange={setField('telefonoAlternativo')}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm font-mono focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                                />
                            </div>

                            {/* Email */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                                    Correo Electrónico *
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="tu.correo@ejemplo.com"
                                    value={form.email}
                                    onChange={setField('email')}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                                />
                            </div>

                            {/* Dirección */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                                    Dirección de Residencia Completa *
                                </label>
                                <textarea
                                    required
                                    rows={2}
                                    placeholder="Ciudad, Sector, Calle o Avenida, Edificio o Casa..."
                                    value={form.direccion}
                                    onChange={setField('direccion')}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition resize-none"
                                />
                            </div>

                            {/* Punto de Referencia */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                                    Punto de Referencia Conocido
                                </label>
                                <input
                                    type="text"
                                    placeholder="Cerca de la panadería, frente al parque..."
                                    value={form.puntoReferencia}
                                    onChange={setField('puntoReferencia')}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                                />
                            </div>

                            {/* Ubicación GPS */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                                    Coordenadas GPS (Opcional)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Lat, Lng"
                                        value={form.ubicacionGps}
                                        onChange={setField('ubicacionGps')}
                                        className="flex-1 px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-xs font-mono focus:border-purple-500 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleGetGps}
                                        disabled={gpsLoading}
                                        className="px-3.5 py-3 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                                    >
                                        <Locate size={14} className={gpsLoading ? 'animate-spin' : ''} />
                                        <span className="hidden sm:inline">{gpsLoading ? 'Detectando...' : 'Obtener'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 4: VEHÍCULO Y TRANSPORTE */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">4</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Medio de Transporte</h3>
                        </div>

                        {/* Selector de Vehículo */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, tipoVehiculo: 'moto' }))}
                                className={`p-3 sm:p-4 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                                    form.tipoVehiculo === 'moto'
                                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-md shadow-purple-900/30'
                                        : 'bg-[#0d091e]/60 border-purple-900/40 text-slate-400 hover:text-white hover:border-purple-700'
                                }`}
                            >
                                <Bike size={22} className={form.tipoVehiculo === 'moto' ? 'text-purple-300' : 'text-slate-400'} />
                                <span className="text-xs font-bold">Moto</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, tipoVehiculo: 'bicicleta' }))}
                                className={`p-3 sm:p-4 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                                    form.tipoVehiculo === 'bicicleta'
                                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-md shadow-purple-900/30'
                                        : 'bg-[#0d091e]/60 border-purple-900/40 text-slate-400 hover:text-white hover:border-purple-700'
                                }`}
                            >
                                <Bike size={22} className={form.tipoVehiculo === 'bicicleta' ? 'text-purple-300' : 'text-slate-400'} />
                                <span className="text-xs font-bold">Bicicleta</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, tipoVehiculo: 'auto' }))}
                                className={`p-3 sm:p-4 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                                    form.tipoVehiculo === 'auto'
                                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-md shadow-purple-900/30'
                                        : 'bg-[#0d091e]/60 border-purple-900/40 text-slate-400 hover:text-white hover:border-purple-700'
                                }`}
                            >
                                <Car size={22} className={form.tipoVehiculo === 'auto' ? 'text-purple-300' : 'text-slate-400'} />
                                <span className="text-xs font-bold">Auto</span>
                            </button>
                        </div>

                        {form.tipoVehiculo !== 'bicicleta' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                                        Placa del Vehículo *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. AB1C23D"
                                        value={form.placaVehiculo}
                                        onChange={setField('placaVehiculo')}
                                        className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm font-mono uppercase focus:border-purple-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                                        Marca / Modelo / Año
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Bera SBR 150 (2023)"
                                        value={form.modeloVehiculo}
                                        onChange={setField('modeloVehiculo')}
                                        className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECCIÓN 5: DECLARACIÓN Y ENVÍO */}
                    <div className="pt-4 border-t border-purple-900/40 space-y-5">
                        <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl bg-[#0d091e]/60 border border-purple-900/40">
                            <input
                                type="checkbox"
                                checked={form.confirmacion}
                                onChange={(e) => setForm(prev => ({ ...prev, confirmacion: e.target.checked }))}
                                className="mt-0.5 h-4 w-4 rounded bg-purple-950 border-purple-700 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-xs text-slate-300 leading-relaxed">
                                Certifico que los datos suministrados son auténticos, que soy mayor de edad y autorizo a Vixy Delivery para verificar mi documentación y procesar mi incorporación a la red de repartidores.
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-600/30 transition duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
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

            {/* Footer */}
            <footer className="mt-auto py-8 text-center text-xs text-slate-500 border-t border-purple-900/30">
                <p>© {new Date().getFullYear()} Vixy Delivery Ecosystem. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
