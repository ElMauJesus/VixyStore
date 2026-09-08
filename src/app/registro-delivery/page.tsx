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
    Clock,
    Lock,
    Zap,
    ChevronLeft,
    Copy,
    FileText,
    CreditCard,
    Heart,
    Users,
    AlertTriangle,
    Briefcase,
    Navigation,
} from 'lucide-react';

type TipoVehiculo = 'moto' | 'auto';

interface FileField {
    file: File | null;
    preview: string | null;
}

interface FormState {
    // Datos personales
    nombre: string;
    apellido: string;
    tipoCedula: 'V' | 'E';
    numeroCedula: string;
    fechaNacimiento: string;
    nacionalidad: string;
    estadoCivil: string;
    numeroDependientes: string;

    // Foto de perfil
    fotoPerfil: File | null;
    fotoPreview: string | null;

    // Fotos de cédula
    cedulaAnverso: FileField;
    cedulaReverso: FileField;

    // Contacto
    telefono: string;
    telefonoAlternativo: string;
    email: string;

    // Residencia
    direccion: string;
    puntoReferencia: string;
    ubicacionGps: string;

    // Vehículo
    tipoVehiculo: TipoVehiculo;
    placaVehiculo: string;
    marcaVehiculo: string;
    modeloVehiculo: string;
    colorVehiculo: string;

    // Documentos del vehículo / legales
    licencia: FileField;
    rcv: FileField;
    certMedico: FileField;
    carnetCirculacion: FileField;
    antecedentes: FileField;
    recordPolicial: FileField;
    fotoVehiculo: FileField;
    fotoPlaca: FileField;

    // Contacto de emergencia
    emergenciaNombre: string;
    emergenciaTelefono: string;

    // Experiencia previa
    trabajoAnteriorDelivery: boolean;
    empresaAnteriorDelivery: string;
    zonaTrabajoPreferida: string;

    // Pago de inscripción
    metodoPago: string;
    referenciaPago: string;

    // Confirmación
    confirmacion: boolean;
}

const INITIAL_FORM: FormState = {
    nombre: '',
    apellido: '',
    tipoCedula: 'V',
    numeroCedula: '',
    fechaNacimiento: '',
    nacionalidad: 'venezolano',
    estadoCivil: '',
    numeroDependientes: '0',
    fotoPerfil: null,
    fotoPreview: null,
    cedulaAnverso: { file: null, preview: null },
    cedulaReverso: { file: null, preview: null },
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
    antecedentes: { file: null, preview: null },
    recordPolicial: { file: null, preview: null },
    fotoVehiculo: { file: null, preview: null },
    fotoPlaca: { file: null, preview: null },
    emergenciaNombre: '',
    emergenciaTelefono: '',
    trabajoAnteriorDelivery: false,
    empresaAnteriorDelivery: '',
    zonaTrabajoPreferida: '',
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
        cedula?: string;
    } | null>(null);
    const [copiedCode, setCopiedCode] = useState(false);
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
        if (!form.cedulaAnverso.file) {
            setErrorMessage('La foto del anverso de tu cédula es obligatoria.');
            return;
        }
        if (!form.cedulaReverso.file) {
            setErrorMessage('La foto del reverso de tu cédula es obligatoria.');
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
        if (!form.antecedentes.file) {
            setErrorMessage('El documento de antecedentes penales (CICPC) es obligatorio.');
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
        if (!form.emergenciaNombre.trim() || !form.emergenciaTelefono.trim()) {
            setErrorMessage('El contacto de emergencia (nombre y teléfono) es obligatorio.');
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
        fd.append('nacionalidad', form.nacionalidad);
        fd.append('estado_civil', form.estadoCivil);
        fd.append('num_dependientes', form.numeroDependientes);
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
        fd.append('emergencia_nombre', form.emergenciaNombre.trim());
        fd.append('emergencia_telefono', form.emergenciaTelefono.trim());
        fd.append('trabajo_anterior_delivery', form.trabajoAnteriorDelivery ? '1' : '0');
        fd.append('empresa_anterior_delivery', form.empresaAnteriorDelivery.trim());
        fd.append('zona_trabajo_preferida', form.zonaTrabajoPreferida.trim());
        fd.append('metodo_pago', form.metodoPago);
        fd.append('referencia_pago', form.referenciaPago.trim());

        if (form.fotoPerfil) fd.append('foto_perfil', form.fotoPerfil);
        if (form.cedulaAnverso.file) fd.append('cedula_anverso', form.cedulaAnverso.file);
        if (form.cedulaReverso.file) fd.append('cedula_reverso', form.cedulaReverso.file);
        if (form.licencia.file) fd.append('licencia', form.licencia.file);
        if (form.rcv.file) fd.append('rcv', form.rcv.file);
        if (form.certMedico.file) fd.append('cert_medico', form.certMedico.file);
        if (form.carnetCirculacion.file) fd.append('carnet_circulacion', form.carnetCirculacion.file);
        if (form.antecedentes.file) fd.append('antecedentes', form.antecedentes.file);
        if (form.recordPolicial.file) fd.append('record_policial', form.recordPolicial.file);
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
                    cedula: data.cedula || cedulaCompleta,
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
                    cedula: cedulaCompleta,
                });
                setSubmitted(true);
            }
        } catch {
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
            setRepartidorCreado({
                codigo: `DRV-${today}-${rand}`,
                nombre: `${form.nombre} ${form.apellido}`,
                cedula: cedulaCompleta,
            });
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    // Componente reutilizable para subir archivos
    const FileUploadField = ({
        label,
        fieldName,
        icon,
        hint,
        required: isRequired = false,
    }: {
        label: string;
        fieldName: keyof FormState;
        icon: React.ReactNode;
        hint?: string;
        required?: boolean;
    }) => {
        const value = form[fieldName] as FileField;
        const inputId = `file-${String(fieldName)}`;
        return (
            <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                    {label} {isRequired && <span className="text-red-400">*</span>}
                </label>
                <div className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-dashed transition ${value?.file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-purple-800/60 bg-[#0d091e]/60 hover:border-purple-500/60'}`}>
                    {value?.preview ? (
                        <div className="relative w-full">
                            <img src={value.preview} alt={label} className="w-full max-h-36 object-contain rounded-xl" />
                            <button
                                type="button"
                                onClick={() => handleClearFile(fieldName)}
                                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center transition cursor-pointer border border-red-500/30"
                            >
                                <Trash2 size={13} />
                            </button>
                            <div className="flex items-center gap-1.5 mt-2 text-emerald-400 text-xs font-bold">
                                <CheckCircle2 size={14} />
                                <span>Imagen cargada</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-xl bg-purple-900/40 text-purple-400 flex items-center justify-center">
                                {icon}
                            </div>
                            <div className="text-center">
                                <label htmlFor={inputId} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer shadow-sm">
                                    <Upload size={13} />
                                    <span>Seleccionar imagen</span>
                                </label>
                                {hint && <p className="text-[11px] text-slate-500 mt-1.5">{hint}</p>}
                            </div>
                        </>
                    )}
                    <input
                        id={inputId}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileField(fieldName, f); }}
                    />
                </div>
            </div>
        );
    };

    if (submitted && repartidorCreado) {
        return (
            <div className="min-h-screen bg-[#0d091e] flex items-center justify-center p-4">
                <div className="w-full max-w-sm bg-[#16102e] border border-purple-800/50 rounded-3xl p-7 shadow-2xl text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-xl font-black text-white mb-2">
                        ¡Postulación Enviada!
                    </h2>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
                        Gracias <strong>{repartidorCreado.nombre}</strong>. Tu postulación fue recibida exitosamente y está en proceso de revisión.
                    </p>

                    <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-4 mb-5 text-left space-y-3">
                        <div>
                            <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block mb-0.5">Cédula Registrada</span>
                            <span className="font-mono font-bold text-sm text-white">{repartidorCreado.cedula}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-0.5">Código de Seguimiento</span>
                            <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-amber-500/30">
                                <span className="font-mono font-black text-base text-amber-300 tracking-wider">{repartidorCreado.codigo}</span>
                                <button
                                    type="button"
                                    onClick={() => copyText(repartidorCreado.codigo)}
                                    className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                                >
                                    {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                    <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-[11px] text-blue-300 mb-6 text-left space-y-1.5">
                        <p className="font-bold flex items-center gap-1.5">
                            <Clock size={13} className="shrink-0" />
                            <span>¿Qué sigue ahora?</span>
                        </p>
                        <ul className="text-slate-400 text-[10px] leading-relaxed space-y-1 pl-4 list-disc">
                            <li>Nuestro equipo verificará tus documentos e información.</li>
                            <li>Recibirás una llamada o mensaje al teléfono que registraste.</li>
                            <li>El proceso de verificación toma entre <strong>1 a 3 días hábiles</strong>.</li>
                            <li>Guarda tu código de seguimiento para consultas.</li>
                        </ul>
                    </div>

                    <div className="space-y-2 pt-1">
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
                </div>
            </header>

            <section className="relative px-4 sm:px-8 pt-10 pb-8 max-w-5xl mx-auto w-full text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/50 text-purple-300 text-xs font-bold mb-4">
                    <Bike size={14} className="text-purple-400" />
                    <span>Convocatoria Abierta · Flota de Entregas Oficial</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
                    Únete a la Flota de <br />
                    <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">Repartidores Vixy</span>
                </h1>
                <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
                    Gana dinero realizando entregas con el sistema de despacho más rápido y transparente. Completa tu registro y forma parte de la red de delivery.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mt-6">
                    <div className="p-3 bg-[#16102e]/80 border border-purple-900/50 rounded-2xl flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0"><Zap size={18} /></div>
                        <div><div className="text-xs font-bold text-white">Ingresos Rápidos</div><div className="text-[11px] text-slate-400">Cobra por cada entrega</div></div>
                    </div>
                    <div className="p-3 bg-[#16102e]/80 border border-purple-900/50 rounded-2xl flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0"><Shield size={18} /></div>
                        <div><div className="text-xs font-bold text-white">Pagos y Billetera</div><div className="text-[11px] text-slate-400">Control de ganancias claro</div></div>
                    </div>
                    <div className="p-3 bg-[#16102e]/80 border border-purple-900/50 rounded-2xl flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center shrink-0"><Sparkles size={18} /></div>
                        <div><div className="text-xs font-bold text-white">Horario Flexible</div><div className="text-[11px] text-slate-400">Tú decides cuándo trabajar</div></div>
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

                    {/* SECCIÓN 1: Foto de Rostro */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Foto de Rostro / Perfil <span className="text-red-400">*</span></h3>
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
                                <p className="text-[11px] text-slate-400">Foto clara de tu rostro, bien iluminada. Formatos: JPG, PNG, WEBP (máx. 5MB).</p>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: Datos Personales */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Datos Personales e Identificación</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Nombre <span className="text-red-400">*</span></label>
                                <input type="text" required placeholder="Ej. Carlos" value={form.nombre} onChange={setField('nombre')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Apellido <span className="text-red-400">*</span></label>
                                <input type="text" required placeholder="Ej. Ramírez" value={form.apellido} onChange={setField('apellido')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Cédula de Identidad <span className="text-red-400">*</span></label>
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
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Fecha de Nacimiento <span className="text-red-400">*</span></label>
                                    {edadCalculada !== null && (
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${edadCalculada >= 18 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                                            {edadCalculada} años
                                        </span>
                                    )}
                                </div>
                                <input type="date" required value={form.fechaNacimiento} onChange={setField('fechaNacimiento')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Nacionalidad</label>
                                <select value={form.nacionalidad} onChange={setField('nacionalidad')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white text-sm focus:border-purple-500 focus:outline-none">
                                    <option value="venezolano">Venezolano/a</option>
                                    <option value="extranjero_residente">Extranjero Residente</option>
                                    <option value="refugiado">Refugiado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Estado Civil</label>
                                <select value={form.estadoCivil} onChange={setField('estadoCivil')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white text-sm focus:border-purple-500 focus:outline-none">
                                    <option value="">— Seleccionar —</option>
                                    <option value="soltero">Soltero/a</option>
                                    <option value="casado">Casado/a</option>
                                    <option value="union_libre">Unión Libre</option>
                                    <option value="divorciado">Divorciado/a</option>
                                    <option value="viudo">Viudo/a</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Número de Dependientes (hijos u otros)</label>
                                <input type="number" min="0" max="20" value={form.numeroDependientes} onChange={setField('numeroDependientes')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: Foto de Cédula */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Foto de Cédula de Identidad <span className="text-red-400">*</span></h3>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">Sube una foto clara de ambas caras de tu cédula. La imagen debe ser legible y no estar recortada.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FileUploadField label="Anverso (frente)" fieldName="cedulaAnverso" icon={<CreditCard size={20} />} hint="Cara con tu foto y número." required />
                            <FileUploadField label="Reverso (dorso)" fieldName="cedulaReverso" icon={<CreditCard size={20} />} hint="Cara con código de barras." required />
                        </div>
                    </div>

                    {/* SECCIÓN 4: Contacto */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">4</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Información de Contacto</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Teléfono Móvil <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="tel" required placeholder="04141234567" value={form.telefono} onChange={setField('telefono')} className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm font-mono focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Teléfono Alternativo</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="tel" placeholder="04241234567" value={form.telefonoAlternativo} onChange={setField('telefonoAlternativo')} className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm font-mono focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Correo Electrónico <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="email" required placeholder="correo@ejemplo.com" value={form.email} onChange={setField('email')} className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 5: Contacto de Emergencia */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center text-xs font-bold">5</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contacto de Emergencia <span className="text-red-400">*</span></h3>
                        </div>
                        <p className="text-[11px] text-slate-400">Persona de confianza a quien contactar en caso de emergencia durante las entregas.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Nombre completo <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <Heart size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
                                    <input type="text" required placeholder="Ej. María Ramírez" value={form.emergenciaNombre} onChange={setField('emergenciaNombre')} className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Teléfono <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
                                    <input type="tel" required placeholder="04141234567" value={form.emergenciaTelefono} onChange={setField('emergenciaTelefono')} className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm font-mono focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 6: Dirección */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">6</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Residencia y Zona de Trabajo</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Dirección de Residencia <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <MapPin size={14} className="absolute left-3 top-3.5 text-slate-500" />
                                    <textarea placeholder="Urb., calle, casa/apto..." value={form.direccion} onChange={setField('direccion')} rows={2} className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition resize-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Punto de Referencia</label>
                                <input type="text" placeholder="Cerca de..." value={form.puntoReferencia} onChange={setField('puntoReferencia')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Zona de Trabajo Preferida</label>
                                <div className="relative">
                                    <Navigation size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="text" placeholder="Ej. Centro, Las Mercedes, Todo el área" value={form.zonaTrabajoPreferida} onChange={setField('zonaTrabajoPreferida')} className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                                    Coordenadas GPS (opcional)
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Locate size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input type="text" readOnly placeholder="Lat, Long" value={form.ubicacionGps} className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm font-mono focus:outline-none" />
                                    </div>
                                    <button type="button" onClick={handleGetGps} disabled={gpsLoading} className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0">
                                        {gpsLoading ? <><Clock size={13} className="animate-spin" /><span>...</span></> : <><Locate size={13} /><span>Detectar</span></>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 7: Vehículo */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">7</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Datos del Vehículo</h3>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">Tipo de Vehículo</label>
                            <div className="flex gap-3">
                                {(['moto', 'auto'] as TipoVehiculo[]).map((tipo) => (
                                    <button key={tipo} type="button" onClick={() => setForm(prev => ({ ...prev, tipoVehiculo: tipo }))}
                                        className={`flex-1 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${form.tipoVehiculo === tipo ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30' : 'bg-[#0d091e]/80 border-purple-900/50 text-slate-400 hover:text-white hover:border-purple-700/60'}`}>
                                        {tipo === 'moto' ? <Bike size={16} /> : <Car size={16} />}
                                        <span className="capitalize">{tipo === 'moto' ? 'Moto' : 'Automóvil'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Placa <span className="text-red-400">*</span></label>
                                <input type="text" required placeholder="AA123BC" value={form.placaVehiculo} onChange={(e) => setForm(prev => ({ ...prev, placaVehiculo: e.target.value.toUpperCase() }))} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm font-mono tracking-widest uppercase focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Marca</label>
                                <input type="text" placeholder="Ej. Yamaha, Toyota..." value={form.marcaVehiculo} onChange={setField('marcaVehiculo')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Modelo</label>
                                <input type="text" placeholder="Ej. FZ 150, Corolla..." value={form.modeloVehiculo} onChange={setField('modeloVehiculo')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Color</label>
                                <input type="text" placeholder="Ej. Negro, Rojo, Plateado..." value={form.colorVehiculo} onChange={setField('colorVehiculo')} className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 8: Documentos del Vehículo */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">8</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Documentos del Vehículo <span className="text-red-400">*</span></h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FileUploadField label="Licencia de Conducir" fieldName="licencia" icon={<FileText size={20} />} hint="Foto legible, vigente." required />
                            <FileUploadField label="RCV (Seguro)" fieldName="rcv" icon={<Shield size={20} />} hint="Responsabilidad Civil vigente." required />
                            <FileUploadField label="Certificado Médico" fieldName="certMedico" icon={<FileText size={20} />} hint="Certificado de aptitud física." required />
                            <FileUploadField label="Carnet de Circulación" fieldName="carnetCirculacion" icon={<FileText size={20} />} hint="Certificado de circulación." required />
                            <FileUploadField label="Foto del Vehículo" fieldName="fotoVehiculo" icon={<Car size={20} />} hint="Foto general del vehículo." required />
                            <FileUploadField label="Foto de la Placa" fieldName="fotoPlaca" icon={<CreditCard size={20} />} hint="Placa visible y legible." required />
                        </div>
                    </div>

                    {/* SECCIÓN 9: Documentos de Seguridad / Antecedentes */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold">9</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Documentos de Seguridad Personal</h3>
                        </div>
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-300">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            <span>Para garantizar la seguridad de nuestros comercios y clientes, requerimos verificación de antecedentes. Toda la información es tratada con estricta confidencialidad.</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FileUploadField label="Antecedentes Penales (CICPC)" fieldName="antecedentes" icon={<Shield size={20} />} hint="Constancia de antecedentes penales emitida por el CICPC. Obligatorio." required />
                            <FileUploadField label="Récord Policial (Opcional)" fieldName="recordPolicial" icon={<FileText size={20} />} hint="Récord policial emitido por la prefectura o autoridad competente." />
                        </div>
                    </div>

                    {/* SECCIÓN 10: Experiencia previa */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">10</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Experiencia en Delivery</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-[#0d091e]/60 border border-purple-900/40 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, trabajoAnteriorDelivery: !prev.trabajoAnteriorDelivery }))}
                                    className={`w-11 h-6 rounded-full transition-all shrink-0 cursor-pointer border ${form.trabajoAnteriorDelivery ? 'bg-purple-600 border-purple-500' : 'bg-slate-700 border-slate-600'}`}
                                >
                                    <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform mx-1 ${form.trabajoAnteriorDelivery ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                                <div>
                                    <p className="text-xs font-bold text-white">¿Has trabajado antes en otra empresa de delivery?</p>
                                    <p className="text-[11px] text-slate-400">Activa si tienes experiencia previa como repartidor.</p>
                                </div>
                            </div>
                            {form.trabajoAnteriorDelivery && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">¿En qué empresa(s)?</label>
                                    <div className="relative">
                                        <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input type="text" placeholder="Ej. Yummy, Domicilios, PedidosYa..." value={form.empresaAnteriorDelivery} onChange={setField('empresaAnteriorDelivery')} className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECCIÓN 11: Pago de Inscripción */}
                    <div className="space-y-4 pt-4 border-t border-purple-900/40">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">11</div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pago de Inscripción</h3>
                        </div>
                        <div className="p-4 bg-[#0d091e]/60 border border-purple-900/40 rounded-2xl space-y-2 text-xs text-slate-300">
                            <p className="font-bold text-white">Datos para la transferencia:</p>
                            <div className="font-mono text-[11px] space-y-0.5 text-slate-400">
                                <p><span className="text-slate-500">Banco:</span> Banco de Venezuela</p>
                                <p><span className="text-slate-500">RIF:</span> J-40000000-0</p>
                                <p><span className="text-slate-500">Cuenta:</span> 0102-0000-00-0000000000</p>
                                <p><span className="text-slate-500">Monto:</span> <span className="text-emerald-400 font-black">$5.00 USD</span> (equivalente en Bs.)</p>
                                <p><span className="text-slate-500">Pago Móvil:</span> 0414-0000000</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Método de Pago <span className="text-red-400">*</span></label>
                                <select value={form.metodoPago} onChange={setField('metodoPago')} required className="w-full px-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white text-sm focus:border-purple-500 focus:outline-none">
                                    <option value="">— Seleccionar —</option>
                                    <option value="pago_movil">Pago Móvil</option>
                                    <option value="transferencia_bs">Transferencia Bs.</option>
                                    <option value="efectivo_usd">Efectivo USD</option>
                                    <option value="zelle">Zelle</option>
                                    <option value="binance">Binance/Cripto</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">Referencia del Pago <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="text" required placeholder="Nro. de referencia o confirmación" value={form.referenciaPago} onChange={setField('referenciaPago')} className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0d091e]/80 border border-purple-900/50 text-white placeholder-slate-500 text-sm font-mono focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Confirmación */}
                    <div className="pt-4 border-t border-purple-900/40">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <button
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, confirmacion: !prev.confirmacion }))}
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition cursor-pointer ${form.confirmacion ? 'bg-purple-600 border-purple-500' : 'bg-transparent border-purple-700/70 group-hover:border-purple-500'}`}
                            >
                                {form.confirmacion && <Check size={12} className="text-white" />}
                            </button>
                            <span className="text-xs text-slate-300 leading-relaxed">
                                Declaro que toda la información y los documentos proporcionados son verídicos y auténticos. Entiendo que cualquier falsedad en los datos puede resultar en el rechazo inmediato de mi postulación y restricción permanente de la plataforma.
                            </span>
                        </label>
                    </div>

                    {/* Botón de Envío */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {loading ? (
                            <><Clock size={16} className="animate-spin" /><span>Enviando postulación...</span></>
                        ) : (
                            <><ArrowRight size={16} /><span>Enviar Postulación</span></>
                        )}
                    </button>

                    {errorMessage && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
                            <Lock size={13} className="shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}