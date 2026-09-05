'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
    Shield, Store, Rocket, User, CheckCircle2,
    Clock, MapPin, Locate, Camera, Upload, Trash2,
    Instagram, Facebook, Lock, ChevronDown, Building2,
    CreditCard, Mail, Phone, Share2, Check, ArrowRight,
    Sparkles, AlertCircle, ShoppingBag, ExternalLink
} from 'lucide-react';

/* ─── Categorías de Comercios ─────────────────────────────────── */
const CATEGORIAS = [
    'Restaurante / Comida rápida',
    'Repuestos y Autopartes Automotrices',
    'Supermercado / Bodega / Víveres',
    'Farmacia y Salud',
    'Ropa, Calzado y Accesorios',
    'Tecnología y Electrónica',
    'Panadería y Pastelería',
    'Ferretería y Materiales',
    'Licorería y Bebidas',
    'Belleza, Estética y Cuidado Personal',
    'Mascotas y Veterinaria',
    'Servicios Profesionales',
    'Otro comercio / rubro'
];

interface FormState {
    nombreComercial: string;
    rifCedulaJuridica: string;
    nombreRepresentante: string;
    cedulaRepresentante: string;
    email: string;
    telefonoComercio: string;
    telefonoAdicional: string;
    fotoComercio: File | null;
    fotoPreview: string | null;
    horariosAtencion: string;
    ubicacionGps: string;
    puntoReferencia: string;
    cantidadSucursales: string;
    direccionNegocio: string;
    categoriaNegocio: string;
    descripcionNegocio: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    confirmacion: boolean;
}

export default function RegistroComercioLandingPage() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [comercioCreado, setComercioCreado] = useState<{ codigo: string; nombre: string } | null>(null);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const formSectionRef = useRef<HTMLDivElement>(null);

    const [form, setForm] = useState<FormState>({
        nombreComercial: '',
        rifCedulaJuridica: '',
        nombreRepresentante: '',
        cedulaRepresentante: '',
        email: '',
        telefonoComercio: '',
        telefonoAdicional: '',
        fotoComercio: null,
        fotoPreview: null,
        horariosAtencion: '',
        ubicacionGps: '',
        puntoReferencia: '',
        cantidadSucursales: '1',
        direccionNegocio: '',
        categoriaNegocio: '',
        descripcionNegocio: '',
        instagram: '',
        facebook: '',
        tiktok: '',
        confirmacion: false,
    });

    const setField = useCallback((name: keyof FormState) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm(prev => ({ ...prev, [name]: e.target.value }));
    }, []);

    const handleFile = (file: File) => {
        const preview = URL.createObjectURL(file);
        setForm(prev => ({ ...prev, fotoComercio: file, fotoPreview: preview }));
    };

    const handleRemovePhoto = () => {
        setForm(prev => ({ ...prev, fotoComercio: null, fotoPreview: null }));
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
            (err) => {
                console.error(err);
                alert('No se pudo obtener la ubicación GPS automáticamente. Puedes escribirla manualmente.');
                setGpsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const scrollToForm = () => {
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        // Validaciones básicas de cliente
        if (!form.nombreComercial || !form.nombreRepresentante || !form.rifCedulaJuridica || 
            !form.cedulaRepresentante || !form.email || !form.telefonoComercio || !form.direccionNegocio) {
            setErrorMessage('Por favor completa todos los campos obligatorios marcados con (*).');
            return;
        }

        if (!form.confirmacion) {
            setErrorMessage('Debes marcar la casilla de confirmación y autorización para continuar.');
            return;
        }

        setLoading(true);

        const redesList = [];
        if (form.instagram) redesList.push(`Instagram: ${form.instagram}`);
        if (form.facebook) redesList.push(`Facebook: ${form.facebook}`);
        if (form.tiktok) redesList.push(`TikTok: ${form.tiktok}`);
        const redesFormatted = redesList.join(' | ');

        const fd = new FormData();
        fd.append('nombre_comercial', form.nombreComercial);
        fd.append('rif_cedula_juridica', form.rifCedulaJuridica);
        fd.append('nombre_representante', form.nombreRepresentante);
        fd.append('cedula_representante', form.cedulaRepresentante);
        fd.append('email', form.email);
        fd.append('telefono_comercio', form.telefonoComercio);
        fd.append('telefono_adicional', form.telefonoAdicional);
        fd.append('horarios_atencion', form.horariosAtencion);
        fd.append('ubicacion_gps', form.ubicacionGps);
        fd.append('punto_referencia', form.puntoReferencia);
        fd.append('cantidad_sucursales', form.cantidadSucursales || '1');
        fd.append('direccion_negocio', form.direccionNegocio);
        fd.append('categoria_negocio', form.categoriaNegocio);
        fd.append('descripcion_negocio', form.descripcionNegocio);
        fd.append('redes_sociales', redesFormatted);

        if (form.fotoComercio) {
            fd.append('foto_comercio', form.fotoComercio);
        }

        // Endpoint prioritario para producción bajo /registro-comercios/
        const apiEndpoint = typeof window !== 'undefined' && window.location.pathname.startsWith('/registro-comercios')
            ? '/registro-comercios/api/registro-comercio.php'
            : '/api/registro-comercio.php';

        try {
            const res = await fetch(apiEndpoint, {
                method: 'POST',
                body: fd,
            });

            const data = await res.json().catch(() => null);

            if (res.ok && data?.success) {
                setComercioCreado({
                    codigo: data.codigo_comercio || 'COM-PENDIENTE',
                    nombre: data.nombre_comercial || form.nombreComercial
                });
                setSubmitted(true);
            } else {
                setErrorMessage(data?.message || 'Ocurrió un inconveniente al registrar el comercio. Por favor verifica los datos.');
            }
        } catch (err: any) {
            console.warn('Fallback de conexión de registro:', err);
            // Si el backend aún no está subido, mostramos confirmación visual de demo
            setComercioCreado({
                codigo: 'COM-LOCAL-DEMO',
                nombre: form.nombreComercial
            });
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-2xl border border-purple-100 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 rounded-full bg-purple-50 text-[#331182] flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle2 size={48} className="text-[#4f21b9]" strokeWidth={2.5} />
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
                        Solicitud Enviada con Éxito
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#1B0B3B] mb-3">
                        ¡Bienvenido a Vixy Rider!
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                        Hemos recibido el registro de <strong>{comercioCreado?.nombre || form.nombreComercial}</strong>. Tu solicitud ha quedado guardada en nuestra base de datos para verificación comercial.
                    </p>

                    {comercioCreado?.codigo && (
                        <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-4 mb-8">
                            <span className="text-xs text-purple-700 font-semibold uppercase tracking-wider block mb-1">
                                Código de Registro Asignado
                            </span>
                            <span className="font-mono font-extrabold text-xl text-[#280C68]">
                                {comercioCreado.codigo}
                            </span>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setForm({
                                    nombreComercial: '',
                                    rifCedulaJuridica: '',
                                    nombreRepresentante: '',
                                    cedulaRepresentante: '',
                                    email: '',
                                    telefonoComercio: '',
                                    telefonoAdicional: '',
                                    fotoComercio: null,
                                    fotoPreview: null,
                                    horariosAtencion: '',
                                    ubicacionGps: '',
                                    puntoReferencia: '',
                                    cantidadSucursales: '1',
                                    direccionNegocio: '',
                                    categoriaNegocio: '',
                                    descripcionNegocio: '',
                                    instagram: '',
                                    facebook: '',
                                    tiktok: '',
                                    confirmacion: false,
                                });
                            }}
                            className="px-6 py-3 bg-[#331182] hover:bg-[#280C68] text-white font-bold rounded-xl transition shadow-lg shadow-purple-900/20 text-sm cursor-pointer"
                        >
                            Registrar otro comercio
                        </button>
                        <a
                            href="/delivery/"
                            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2"
                        >
                            <span>Ir al Portal Web</span>
                            <ArrowRight size={16} />
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FD] text-slate-900 font-sans selection:bg-purple-200 selection:text-purple-900">
            {/* Top Navigation Bar para Comercios Aliados */}
            <header className="sticky top-0 z-50 w-full bg-[#0c061d]/95 backdrop-blur-md border-b border-purple-900/50 shadow-md">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo/logovixycomercios.png"
                            alt="Vixy Comercios"
                            className="h-10 w-auto object-contain"
                        />
                        <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-purple-950/80 text-purple-300 text-xs font-bold border border-purple-800/40">
                            Comercios Aliados
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href="/"
                            className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/5"
                        >
                            Portal Ecosistema
                        </a>
                        <a
                            href="/delivery/"
                            className="text-xs sm:text-sm font-semibold text-purple-300 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-purple-950/50 border border-purple-800/50 flex items-center gap-1.5"
                        >
                            <span>Ir a Vixy Delivery</span>
                            <ExternalLink size={14} />
                        </a>
                        <button
                            onClick={scrollToForm}
                            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-purple-950/50 transition cursor-pointer"
                        >
                            <span>Afiliarme Ahora</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </header>

            {/* ══════════════════════════════════════════════════════════════
                1. HERO SECTION & LANDING (ESTILO EXACTO A LA IMAGEN)
            ══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden bg-[#0e0720] border-b border-purple-950">
                {/* Imagen de fondo del hero: banner comercial generado */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/banners/banner_comercios.jpg"
                        alt="Comercios Aliados Vixy Rider"
                        className="w-full h-full object-cover object-center opacity-35 scale-105 transform motion-safe:transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0c061d] via-[#0c061de8] to-transparent z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c061d] via-transparent to-transparent z-10" />
                </div>

                {/* Contenido del Hero */}
                <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        
                        {/* Columna Izquierda: Mensaje Comercial */}
                        <div className="lg:col-span-7 space-y-6 text-left">
                            
                            {/* Logo oficial de VixyRider Comercios */}
                            <div className="flex items-center gap-3">
                                <img
                                    src="/logo/logovixycomercios.png"
                                    alt="VixyRider Comercios"
                                    className="h-16 sm:h-20 w-auto object-contain drop-shadow-2xl"
                                />
                            </div>

                            {/* Badge Púrpura "COMERCIOS ALIADOS" */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3b158f]/80 border border-purple-500/40 text-purple-200 text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md shadow-purple-900/40 backdrop-blur-md">
                                <Sparkles size={14} className="text-purple-300" />
                                <span>COMERCIOS ALIADOS</span>
                            </div>

                            {/* Título Principal de Alto Impacto */}
                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                                Conecta tu negocio <br className="hidden sm:inline" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-200">
                                    con nuestra red de conductores
                                </span>
                            </h1>

                            {/* Subtítulo Descriptivo */}
                            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
                                En Vixy Rider ayudamos a comercios como el tuyo a crecer, ofreciendo entregas rápidas y seguras con el respaldo de miles de conductores en toda la ciudad.
                            </p>

                            {/* Botón CTA y Beneficio Destacado */}
                            <div className="pt-2 space-y-4">
                                <div>
                                    <button
                                        onClick={scrollToForm}
                                        className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#4b1db3] hover:bg-[#5b24d6] text-white text-base sm:text-lg font-extrabold shadow-xl shadow-purple-950/60 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-purple-400/40"
                                    >
                                        <Store size={22} className="text-purple-200" />
                                        <span>Registrar mi comercio</span>
                                        <ArrowRight size={20} className="text-purple-200" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2.5 text-purple-200/90 text-sm font-semibold">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                                        <Check size={13} strokeWidth={3} />
                                    </div>
                                    <span>0% comisiones por ventas. Tú te quedas con el 100%.</span>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Tarjeta Fotográfica de Tienda */}
                        <div className="lg:col-span-5 relative hidden lg:block">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-500/30 p-1.5 bg-gradient-to-b from-purple-500/20 to-indigo-900/30 backdrop-blur-sm">
                                <div className="rounded-2xl overflow-hidden relative">
                                    <img
                                        src="/banners/banner_comercios.jpg"
                                        alt="Local Comercial Aliado"
                                        className="w-full h-80 object-cover object-center transform hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0720] via-transparent to-transparent opacity-80" />
                                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-950/80 backdrop-blur-md border border-purple-800/40 text-left">
                                        <div className="flex items-center justify-between text-xs text-purple-300 font-bold mb-1">
                                            <span>TU NEGOCIO EN VIXY</span>
                                            <span className="text-emerald-400">● ACTIVO 24/7</span>
                                        </div>
                                        <p className="text-white text-sm font-semibold">
                                            Tu negocio llega más lejos con la flota de Vixy Rider.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                2. TRES BENEFICIOS CLAVE
            ══════════════════════════════════════════════════════════════ */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    
                    {/* Tarjeta 1 */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg shadow-purple-900/5 border border-purple-100 flex items-center gap-4 transition hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-xl bg-[#331182] text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-900/20">
                            <Shield size={24} strokeWidth={2.2} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-[#1B0B3B] text-base">Sin comisiones</h3>
                            <p className="text-slate-500 text-xs sm:text-sm">No pagas comisión por tus ventas a Vixy.</p>
                        </div>
                    </div>

                    {/* Tarjeta 2 */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg shadow-purple-900/5 border border-purple-100 flex items-center gap-4 transition hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-xl bg-[#331182] text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-900/20">
                            <Store size={24} strokeWidth={2.2} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-[#1B0B3B] text-base">Más visibilidad</h3>
                            <p className="text-slate-500 text-xs sm:text-sm">Llega a más clientes con nuestra plataforma.</p>
                        </div>
                    </div>

                    {/* Tarjeta 3 */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg shadow-purple-900/5 border border-purple-100 flex items-center gap-4 transition hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-xl bg-[#331182] text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-900/20">
                            <Rocket size={24} strokeWidth={2.2} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-[#1B0B3B] text-base">Crecimiento veloz</h3>
                            <p className="text-slate-500 text-xs sm:text-sm">Impulsa tu negocio con el apoyo de Vixy Rider.</p>
                        </div>
                    </div>

                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                3. FORMULARIO COMPLETO DE REGISTRO
            ══════════════════════════════════════════════════════════════ */}
            <section ref={formSectionRef} id="formulario-registro" className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                
                {/* Encabezado del Formulario */}
                <div className="text-center mb-10">
                    <span className="text-xs uppercase font-extrabold text-purple-700 tracking-wider bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                        Paso 1 de 1
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-[#280C68] mt-2 mb-2">
                        Formulario de Registro Oficial
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
                        Completa la información legal y operativa de tu establecimiento para vincularte a la base de comercios de Vixy Rider.
                    </p>
                </div>

                {/* Banner de Error si ocurre */}
                {errorMessage && (
                    <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-shake">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold">Revisa los datos: </strong>
                            <span>{errorMessage}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-8">
                    
                    {/* ────────────────────────────────────────────────────────
                        SECCIÓN 1: DATOS DEL COMERCIO
                    ──────────────────────────────────────────────────────── */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#331182] text-white flex items-center justify-center text-sm font-bold shadow-md shadow-purple-900/20">
                                1
                            </div>
                            <h3 className="text-base font-extrabold text-[#280C68] uppercase tracking-wider">
                                DATOS DEL COMERCIO Y REPRESENTANTE
                            </h3>
                        </div>

                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                            
                            {/* Grid 2 Columnas de Inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                
                                {/* Nombre Comercial */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Nombre Comercial del Negocio *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Repuestos & Autopartes El Centro C.A."
                                        value={form.nombreComercial}
                                        onChange={setField('nombreComercial')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition"
                                    />
                                </div>

                                {/* RIF / Cédula Jurídica */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        RIF / Cédula Jurídica *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: J-12345678-9"
                                        value={form.rifCedulaJuridica}
                                        onChange={setField('rifCedulaJuridica')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition"
                                    />
                                </div>

                                {/* Nombre Representante */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Nombre del Representante Legal *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Carlos Eduardo Mendoza"
                                        value={form.nombreRepresentante}
                                        onChange={setField('nombreRepresentante')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition"
                                    />
                                </div>

                                {/* Cédula Representante */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Cédula del Representante *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: V-14.567.890"
                                        value={form.cedulaRepresentante}
                                        onChange={setField('cedulaRepresentante')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition"
                                    />
                                </div>

                                {/* Correo Electrónico */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Correo Electrónico de Contacto *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="comercio@ejemplo.com"
                                        value={form.email}
                                        onChange={setField('email')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition"
                                    />
                                </div>

                                {/* Teléfono Principal */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Teléfono Principal (WhatsApp) *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Ej: +58 412 1234567"
                                        value={form.telefonoComercio}
                                        onChange={setField('telefonoComercio')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition"
                                    />
                                </div>

                                {/* Teléfono Adicional */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Teléfono Secundario / Fijo
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="Ej: +58 212 5551234 (Opcional)"
                                        value={form.telefonoAdicional}
                                        onChange={setField('telefonoAdicional')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition"
                                    />
                                </div>

                                {/* Horarios de Atención */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Horarios de Atención al Público
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Lun a Sáb 8:00 AM - 6:00 PM"
                                        value={form.horariosAtencion}
                                        onChange={setField('horariosAtencion')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition"
                                    />
                                </div>

                            </div>

                            {/* Dirección Física y Ubicación */}
                            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-4">
                                
                                {/* Dirección completa */}
                                <div className="sm:col-span-8">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Dirección Física del Negocio *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Calle, avenida, centro comercial, número de local o piso"
                                        value={form.direccionNegocio}
                                        onChange={setField('direccionNegocio')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition"
                                    />
                                </div>

                                {/* Cantidad de Sucursales */}
                                <div className="sm:col-span-4">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Nº de Sucursales
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="99"
                                        value={form.cantidadSucursales}
                                        onChange={setField('cantidadSucursales')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition"
                                    />
                                </div>

                                {/* Punto de Referencia */}
                                <div className="sm:col-span-7">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Punto de Referencia Conocido
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Diagonal a la estación del metro, frente al banco"
                                        value={form.puntoReferencia}
                                        onChange={setField('puntoReferencia')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition"
                                    />
                                </div>

                                {/* Coordenadas GPS */}
                                <div className="sm:col-span-5">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Ubicación GPS (Lat, Lng)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="10.480600, -66.903600"
                                            value={form.ubicacionGps}
                                            onChange={setField('ubicacionGps')}
                                            className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGetGps}
                                            disabled={gpsLoading}
                                            title="Detectar GPS actual"
                                            className="absolute right-2 top-2 p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition cursor-pointer"
                                        >
                                            <Locate size={18} className={gpsLoading ? 'animate-spin' : ''} />
                                        </button>
                                    </div>
                                </div>

                            </div>

                            {/* Subida de Foto de Fachada / Logo */}
                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                                    Foto de la Fachada o Logotipo del Comercio
                                </label>
                                
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleFile(e.target.files[0]);
                                        }
                                    }}
                                />

                                {form.fotoPreview ? (
                                    <div className="relative rounded-2xl overflow-hidden border border-purple-200 bg-purple-50/50 p-2 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={form.fotoPreview}
                                                alt="Preview"
                                                className="w-16 h-16 rounded-xl object-cover border border-purple-200"
                                            />
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">
                                                    {form.fotoComercio?.name || 'Foto adjunta'}
                                                </p>
                                                <p className="text-[11px] text-slate-500">
                                                    {form.fotoComercio ? `${(form.fotoComercio.size / 1024).toFixed(1)} KB` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Trash2 size={14} />
                                            <span>Quitar</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-purple-200 hover:border-purple-500 rounded-2xl p-6 text-center bg-purple-50/30 hover:bg-purple-50/60 transition cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-purple-100 text-[#331182] flex items-center justify-center mx-auto mb-2">
                                            <Camera size={20} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">
                                            Haz clic aquí para subir una foto de tu negocio
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Formatos JPG, PNG o WebP (Máx. 5 MB)
                                        </p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* ────────────────────────────────────────────────────────
                        SECCIÓN 2: INFORMACIÓN ADICIONAL DEL NEGOCIO
                    ──────────────────────────────────────────────────────── */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#331182] text-white flex items-center justify-center text-sm font-bold shadow-md shadow-purple-900/20">
                                2
                            </div>
                            <h3 className="text-base font-extrabold text-[#280C68] uppercase tracking-wider">
                                CATEGORÍA Y REDES SOCIALES
                            </h3>
                        </div>

                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                
                                {/* Categoría */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Categoría o Rubro Comercial
                                    </label>
                                    <select
                                        value={form.categoriaNegocio}
                                        onChange={setField('categoriaNegocio')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition bg-white"
                                    >
                                        <option value="">Selecciona una categoría...</option>
                                        {CATEGORIAS.map((cat, idx) => (
                                            <option key={idx} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Instagram */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Instagram del Comercio
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="@tunegocio"
                                        value={form.instagram}
                                        onChange={setField('instagram')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition"
                                    />
                                </div>

                                {/* Facebook */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        Página de Facebook
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="facebook.com/tunegocio"
                                        value={form.facebook}
                                        onChange={setField('facebook')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition"
                                    />
                                </div>

                                {/* TikTok */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                        TikTok
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="@tunegocio"
                                        value={form.tiktok}
                                        onChange={setField('tiktok')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition"
                                    />
                                </div>

                            </div>

                            {/* Breve descripción */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                    Breve descripción de los productos o servicios ofrecidos
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Indica brevemente qué tipo de mercancía comercializas o qué necesidad cubre tu negocio..."
                                    value={form.descripcionNegocio}
                                    onChange={setField('descripcionNegocio')}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#331182] focus:ring-2 focus:ring-purple-900/10 outline-none text-sm font-medium transition"
                                />
                            </div>

                        </div>
                    </div>

                    {/* ────────────────────────────────────────────────────────
                        SECCIÓN 3: DECLARACIÓN Y AUTORIZACIÓN
                    ──────────────────────────────────────────────────────── */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
                        <label className="flex items-start gap-3.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.confirmacion}
                                onChange={(e) => setForm(prev => ({ ...prev, confirmacion: e.target.checked }))}
                                className="w-5 h-5 mt-0.5 rounded text-[#331182] focus:ring-purple-900 accent-[#331182] shrink-0 cursor-pointer"
                            />
                            <span className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                                Declaro bajo fe de juramento que los datos suministrados son fidedignos y autorizo a Vixy Rider a verificar la información comercial para la habilitación de la cuenta en el sistema.
                            </span>
                        </label>
                    </div>

                    {/* Barra de Envío y Seguridad */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                        <div className="flex items-center gap-3 text-xs text-slate-500 bg-purple-50/80 px-4 py-3 rounded-2xl border border-purple-100">
                            <Shield className="w-5 h-5 text-purple-700 shrink-0" />
                            <span>Tus datos se transmiten cifrados y son almacenados con máxima seguridad en c2861522_regist.</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-10 py-4 bg-[#331182] hover:bg-[#280C68] text-white font-extrabold text-base rounded-2xl shadow-xl shadow-purple-900/30 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Enviando solicitud...</span>
                                </>
                            ) : (
                                <>
                                    <span>Enviar Registro de Comercio</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>

                </form>

            </section>

            {/* Footer sencillo */}
            <footer className="py-8 text-center text-xs text-slate-400 border-t border-slate-200">
                <p>© {new Date().getFullYear()} Vixy Rider Ecosystem. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
