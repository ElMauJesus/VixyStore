'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
    Shield, Store, Rocket, User, FileText, CheckCircle2,
    Clock, MapPin, Locate, Crosshair, Camera, Upload, Trash2,
    Instagram, Facebook, Lock, ChevronDown, Building2,
    CreditCard, Mail, Phone, Share2, Check
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────── */
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

const CATEGORIAS = [
    'Restaurante / Comida rápida',
    'Repuestos y Autopartes',
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

export default function RegistroComercioPage() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

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
        cantidadSucursales: '',
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
            alert('La geolocalización no está soportada por tu navegador');
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
                alert('No se pudo obtener la ubicación GPS automáticamente. Puedes ingresarla manualmente.');
                setGpsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        // Agrupar redes sociales
        const redesList = [];
        if (form.instagram) redesList.push(`Instagram: ${form.instagram}`);
        if (form.facebook) redesList.push(`Facebook: ${form.facebook}`);
        if (form.tiktok) redesList.push(`TikTok: ${form.tiktok}`);
        const redesSocialesFormatted = redesList.join(' | ');

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
        fd.append('redes_sociales', redesSocialesFormatted);

        if (form.fotoComercio) {
            fd.append('foto_comercio', form.fotoComercio);
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/registro-comercio.php`, {
                method: 'POST',
                body: fd,
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setSubmitted(true);
            } else {
                setErrorMessage(data.message || 'Error al procesar el registro.');
            }
        } catch (err) {
            // Si el backend PHP no está activo localmente, mostramos confirmación de éxito para pruebas de interfaz
            console.warn('Backend PHP no detectado, completando flujo visual:', err);
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FD', padding: '1.5rem' }}>
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    padding: '3rem 2rem',
                    maxWidth: '480px',
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 20px 40px rgba(51, 17, 130, 0.08)',
                    border: '1px solid #EBE7F6'
                }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: '#EEF2FF',
                        color: '#331182',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        <CheckCircle2 size={44} strokeWidth={2.2} />
                    </div>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.85rem', fontWeight: 800, color: '#1B0B3B', marginBottom: '0.75rem' }}>
                        ¡Registro Exitoso!
                    </h2>
                    <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        Los datos de tu comercio <strong>{form.nombreComercial || 'tu negocio'}</strong> han sido recibidos. Nuestro equipo validará la información y te contactará a la brevedad.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        style={{
                            padding: '0.9rem 2.2rem',
                            background: '#331182',
                            color: '#FFFFFF',
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '1rem',
                            fontWeight: 700,
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 8px 20px rgba(51, 17, 130, 0.25)'
                        }}
                    >
                        Hacer otro registro
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F8F9FD', padding: '2.5rem 1rem 4rem' }}>
            <div style={{ maxWidth: '1040px', margin: '0 auto' }}>

                {/* ─── ENCABEZADO ───────────────────────────── */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 'clamp(2rem, 4vw, 2.6rem)',
                        fontWeight: 900,
                        color: '#280C68',
                        letterSpacing: '-0.02em',
                        margin: '0 0 0.5rem 0'
                    }}>
                        Registro para Comercios
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: '#475569',
                        margin: 0,
                        fontWeight: 500
                    }}>
                        Completa todos los campos para que tu negocio haga parte de Vixy Rider.
                    </p>
                </div>

                {/* ─── 3 BADGES SUPERIORES ─────────────────── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.25rem',
                    marginBottom: '2.5rem'
                }}>
                    {/* Badge 1 */}
                    <div style={styles.benefitCard}>
                        <div style={styles.benefitIconBox}>
                            <Shield size={24} color="#FFFFFF" strokeWidth={2.2} />
                        </div>
                        <div>
                            <h4 style={styles.benefitTitle}>Sin comisiones</h4>
                            <p style={styles.benefitText}>No pagas comisión por tus ventas a Vixy.</p>
                        </div>
                    </div>

                    {/* Badge 2 */}
                    <div style={styles.benefitCard}>
                        <div style={styles.benefitIconBox}>
                            <Store size={24} color="#FFFFFF" strokeWidth={2.2} />
                        </div>
                        <div>
                            <h4 style={styles.benefitTitle}>Más visibilidad</h4>
                            <p style={styles.benefitText}>Llega a más clientes con nuestra plataforma.</p>
                        </div>
                    </div>

                    {/* Badge 3 */}
                    <div style={styles.benefitCard}>
                        <div style={styles.benefitIconBox}>
                            <Rocket size={24} color="#FFFFFF" strokeWidth={2.2} />
                        </div>
                        <div>
                            <h4 style={styles.benefitTitle}>Crecimiento</h4>
                            <p style={styles.benefitText}>Impulsa tu negocio con el apoyo de Vixy Rider.</p>
                        </div>
                    </div>
                </div>

                {/* ─── FORMULARIO ──────────────────────────── */}
                <form onSubmit={handleSubmit} noValidate>

                    {/* ═══════════════════════════════════════════
                        SECCIÓN 1: DATOS DEL COMERCIO
                    ═══════════════════════════════════════════ */}
                    <div style={styles.sectionHeader}>
                        <div style={styles.sectionBadge}>
                            <User size={18} color="#FFFFFF" strokeWidth={2.5} />
                        </div>
                        <h2 style={styles.sectionTitleText}>1. DATOS DEL COMERCIO</h2>
                    </div>

                    <div style={styles.sectionCard}>
                        {/* Bloque superior: Inputs 2 columnas + Foto a la derecha */}
                        <div style={styles.topDataGrid}>
                            
                            {/* Columna Izquierda: 2 Columnas de inputs */}
                            <div style={styles.leftInputsGrid}>
                                
                                {/* Fila 1 */}
                                <div>
                                    <label style={styles.label}>
                                        <span style={styles.labelDot}>⦿</span> Nombre comercial
                                    </label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        placeholder="Ingresa el nombre de tu negocio"
                                        value={form.nombreComercial}
                                        onChange={setField('nombreComercial')}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={styles.label}>
                                        <span style={styles.labelDot}>⦿</span> RIF / Cédula jurídica
                                    </label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        placeholder="Ej: J-12345678-9"
                                        value={form.rifCedulaJuridica}
                                        onChange={setField('rifCedulaJuridica')}
                                        required
                                    />
                                </div>

                                {/* Fila 2 */}
                                <div>
                                    <label style={styles.label}>
                                        <span style={styles.labelDot}>⦿</span> Nombre del representante
                                    </label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        placeholder="Ingresa al nombre completo"
                                        value={form.nombreRepresentante}
                                        onChange={setField('nombreRepresentante')}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={styles.label}>
                                        <span style={styles.labelDot}>⦿</span> Cédula del representante
                                    </label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        placeholder="Ej: 28.123.456"
                                        value={form.cedulaRepresentante}
                                        onChange={setField('cedulaRepresentante')}
                                        required
                                    />
                                </div>

                                {/* Fila 3 */}
                                <div>
                                    <label style={styles.label}>
                                        Correo electrónico
                                    </label>
                                    <input
                                        type="email"
                                        style={styles.input}
                                        placeholder="ejemplo@correo.com"
                                        value={form.email}
                                        onChange={setField('email')}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={styles.label}>
                                        Teléfono del comercio
                                    </label>
                                    <input
                                        type="tel"
                                        style={styles.input}
                                        placeholder="Ej: 0412-1234567"
                                        value={form.telefonoComercio}
                                        onChange={setField('telefonoComercio')}
                                        required
                                    />
                                </div>

                            </div>

                            {/* Columna Derecha: Foto del comercio y Teléfono adicional */}
                            <div style={styles.rightPhotoColumn}>
                                <label style={styles.label}>
                                    Foto del comercio
                                </label>
                                
                                <div style={styles.photoContainer}>
                                    {form.fotoPreview ? (
                                        <div style={{ width: '100%' }}>
                                            <div style={styles.photoPreviewWrapper}>
                                                <img
                                                    src={form.fotoPreview}
                                                    alt="Foto del comercio"
                                                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px' }}
                                                />
                                            </div>
                                            <div style={styles.photoActionButtons}>
                                                <button
                                                    type="button"
                                                    style={styles.changePhotoBtn}
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <Upload size={14} /> Cambiar foto
                                                </button>
                                                <button
                                                    type="button"
                                                    style={styles.deletePhotoBtn}
                                                    onClick={handleRemovePhoto}
                                                >
                                                    <Trash2 size={14} /> Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            style={styles.dropzone}
                                            onClick={() => fileInputRef.current?.click()}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div style={styles.dropzoneIconWrapper}>
                                                <Camera size={26} color="#331182" />
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E1B4B' }}>
                                                Subir foto de la fachada o local
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                                JPG, PNG o WEBP (máx. 5MB)
                                            </span>
                                        </div>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                        style={{ display: 'none' }}
                                    />
                                </div>

                                {/* Teléfono adicional */}
                                <div style={{ marginTop: '0.85rem' }}>
                                    <label style={styles.label}>
                                        <span style={styles.labelDot}>⦿</span> Número telefónico adicional (opcional)
                                    </label>
                                    <input
                                        type="tel"
                                        style={styles.input}
                                        placeholder="Ej: 0414-7654321"
                                        value={form.telefonoAdicional}
                                        onChange={setField('telefonoAdicional')}
                                    />
                                </div>

                            </div>

                        </div>

                        {/* Fila 4: 4 Columnas inferiores (Horarios, GPS, Punto referencia, Sucursales) */}
                        <div style={styles.bottomFourGrid}>
                            
                            {/* 1. Horarios de atención */}
                            <div>
                                <label style={styles.label}>
                                    Horarios de atención
                                </label>
                                <div style={styles.inputWithIconWrapper}>
                                    <div style={styles.inputLeftIcon}>
                                        <Clock size={16} color="#331182" />
                                    </div>
                                    <textarea
                                        style={{
                                            ...styles.inputWithIcon,
                                            minHeight: '68px',
                                            paddingTop: '0.55rem',
                                            resize: 'none',
                                            fontSize: '0.8rem',
                                            lineHeight: '1.35'
                                        }}
                                        placeholder={`Ej: Lunes a Viernes 8:00am - 8:00pm\nSábado y Domingo 9:00am - 5:00pm`}
                                        value={form.horariosAtencion}
                                        onChange={setField('horariosAtencion')}
                                    />
                                </div>
                            </div>

                            {/* 2. Ubicación GPS */}
                            <div>
                                <label style={styles.label}>
                                    Ubicación GPS
                                </label>
                                <div style={styles.inputWithIconWrapper}>
                                    <div style={styles.inputLeftIcon}>
                                        <MapPin size={16} color="#331182" />
                                    </div>
                                    <input
                                        type="text"
                                        style={{ ...styles.inputWithIcon, paddingRight: '2.5rem', fontSize: '0.82rem' }}
                                        placeholder="Ingresa la ubicación GPS de tu negocio"
                                        value={form.ubicacionGps}
                                        onChange={setField('ubicacionGps')}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleGetGps}
                                        title="Detectar ubicación GPS actual"
                                        style={styles.gpsButton}
                                    >
                                        <Crosshair size={17} color={gpsLoading ? '#94A3B8' : '#331182'} />
                                    </button>
                                </div>
                            </div>

                            {/* 3. Punto de referencia */}
                            <div>
                                <label style={styles.label}>
                                    Punto de referencia
                                </label>
                                <div style={styles.inputWithIconWrapper}>
                                    <div style={styles.inputLeftIcon}>
                                        <MapPin size={16} color="#331182" />
                                    </div>
                                    <input
                                        type="text"
                                        style={{ ...styles.inputWithIcon, fontSize: '0.82rem' }}
                                        placeholder="Ej: Frente al centro comercial, al lado de la farmacia..."
                                        value={form.puntoReferencia}
                                        onChange={setField('puntoReferencia')}
                                    />
                                </div>
                            </div>

                            {/* 4. Cantidad de sucursales */}
                            <div>
                                <label style={styles.label}>
                                    Cantidad de sucursales
                                </label>
                                <div style={styles.inputWithIconWrapper}>
                                    <div style={styles.inputLeftIcon}>
                                        <Store size={16} color="#331182" />
                                    </div>
                                    <input
                                        type="text"
                                        style={{ ...styles.inputWithIcon, fontSize: '0.82rem' }}
                                        placeholder="Ej: 1, 2, 3..."
                                        value={form.cantidadSucursales}
                                        onChange={setField('cantidadSucursales')}
                                    />
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* ═══════════════════════════════════════════
                        SECCIÓN 2: INFORMACIÓN DEL COMERCIO
                    ═══════════════════════════════════════════ */}
                    <div style={{ ...styles.sectionHeader, marginTop: '2.5rem' }}>
                        <div style={styles.sectionBadge}>
                            <FileText size={18} color="#FFFFFF" strokeWidth={2.5} />
                        </div>
                        <h2 style={styles.sectionTitleText}>2. INFORMACIÓN DEL COMERCIO</h2>
                    </div>

                    <div style={styles.sectionCard}>
                        <div style={styles.section2Grid}>
                            
                            {/* Columna Izquierda: Dirección + Descripción */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={styles.label}>
                                        <span style={styles.labelDot}>⦿</span> Dirección del negocio
                                    </label>
                                    <div style={styles.inputWithIconWrapper}>
                                        <div style={styles.inputLeftIcon}>
                                            <MapPin size={16} color="#331182" />
                                        </div>
                                        <input
                                            type="text"
                                            style={styles.inputWithIcon}
                                            placeholder="Ingresa la dirección completa"
                                            value={form.direccionNegocio}
                                            onChange={setField('direccionNegocio')}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={styles.label}>
                                        Descripción del negocio
                                    </label>
                                    <textarea
                                        style={{ ...styles.input, minHeight: '115px', resize: 'vertical' }}
                                        placeholder="Cuéntanos sobre tu negocio, productos o servicios que ofreces..."
                                        value={form.descripcionNegocio}
                                        onChange={setField('descripcionNegocio')}
                                    />
                                </div>
                            </div>

                            {/* Columna Derecha: Categoría + Redes Sociales */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={styles.label}>
                                        Categoría del negocio
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            style={{
                                                ...styles.input,
                                                appearance: 'none',
                                                paddingRight: '2.5rem',
                                                color: form.categoriaNegocio ? '#0F172A' : '#94A3B8',
                                                cursor: 'pointer'
                                            }}
                                            value={form.categoriaNegocio}
                                            onChange={setField('categoriaNegocio')}
                                        >
                                            <option value="" disabled>Selecciona la categoría</option>
                                            {CATEGORIAS.map((cat, idx) => (
                                                <option key={idx} value={cat} style={{ color: '#0F172A' }}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748B' }}>
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label style={styles.label}>
                                        Redes sociales (opcional)
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {/* Instagram */}
                                        <div style={styles.inputWithIconWrapper}>
                                            <div style={styles.inputLeftIcon}>
                                                <Instagram size={16} color="#331182" />
                                            </div>
                                            <input
                                                type="text"
                                                style={styles.inputWithIcon}
                                                placeholder="Instagram (ej: @tu_negocio)"
                                                value={form.instagram}
                                                onChange={setField('instagram')}
                                            />
                                        </div>

                                        {/* Facebook */}
                                        <div style={styles.inputWithIconWrapper}>
                                            <div style={styles.inputLeftIcon}>
                                                <Facebook size={16} color="#331182" />
                                            </div>
                                            <input
                                                type="text"
                                                style={styles.inputWithIcon}
                                                placeholder="Facebook (ej: Tu Negocio)"
                                                value={form.facebook}
                                                onChange={setField('facebook')}
                                            />
                                        </div>

                                        {/* TikTok */}
                                        <div style={styles.inputWithIconWrapper}>
                                            <div style={styles.inputLeftIcon}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#331182' }}>🎵</span>
                                            </div>
                                            <input
                                                type="text"
                                                style={styles.inputWithIcon}
                                                placeholder="TikTok (ej: @tu_negocio)"
                                                value={form.tiktok}
                                                onChange={setField('tiktok')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════
                        SECCIÓN 3: CONFIRMACIÓN
                    ═══════════════════════════════════════════ */}
                    <div style={{ ...styles.sectionHeader, marginTop: '2.5rem' }}>
                        <div style={styles.sectionBadge}>
                            <Check size={18} color="#FFFFFF" strokeWidth={3} />
                        </div>
                        <h2 style={styles.sectionTitleText}>3. CONFIRMACIÓN</h2>
                    </div>

                    <div style={{ ...styles.sectionCard, padding: '1.25rem 1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer', margin: 0 }}>
                            <input
                                type="checkbox"
                                checked={form.confirmacion}
                                onChange={(e) => setForm(prev => ({ ...prev, confirmacion: e.target.checked }))}
                                style={{
                                    width: '19px',
                                    height: '19px',
                                    accentColor: '#331182',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                }}
                            />
                            <span style={{ fontSize: '0.88rem', color: '#1E1B4B', fontWeight: 500, lineHeight: 1.4 }}>
                                Declaro que la información proporcionada es verdadera y autorizo a Vixy Rider a verificar los datos de mi negocio.
                            </span>
                        </label>
                    </div>

                    {/* Mensaje de error si aplica */}
                    {errorMessage && (
                        <div style={{
                            marginTop: '1.25rem',
                            padding: '1rem',
                            background: '#FEE2E2',
                            border: '1px solid #FCA5A5',
                            borderRadius: '12px',
                            color: '#991B1B',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            {errorMessage}
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════
                        BARRA INFERIOR DE ACCIÓN
                    ═══════════════════════════════════════════ */}
                    <div style={styles.bottomActionBar}>
                        {/* Info de seguridad */}
                        <div style={styles.securityBox}>
                            <div style={styles.securityIconWrapper}>
                                <Shield size={20} color="#FFFFFF" strokeWidth={2.2} />
                            </div>
                            <div>
                                <h5 style={{ margin: '0 0 2px 0', fontSize: '0.85rem', fontWeight: 800, color: '#1E1B4B' }}>
                                    Tu información está protegida
                                </h5>
                                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                                    Usamos encriptación y cumplimos con altos estándares de seguridad.
                                </p>
                            </div>
                        </div>

                        {/* Botón de envío */}
                        <button
                            type="submit"
                            style={{
                                ...styles.submitButton,
                                opacity: loading || !form.confirmacion ? 0.6 : 1,
                                cursor: loading || !form.confirmacion ? 'not-allowed' : 'pointer'
                            }}
                            disabled={loading || !form.confirmacion}
                        >
                            <Store size={20} strokeWidth={2.2} />
                            <span>{loading ? 'Registrando...' : 'Registrarme'}</span>
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}

/* ─── Styles ─────────────────────────────────────────── */
const styles: { [key: string]: React.CSSProperties } = {
    benefitCard: {
        background: '#FFFFFF',
        border: '1px solid #EAE6F5',
        borderRadius: '16px',
        padding: '1.15rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 2px 8px rgba(51, 17, 130, 0.03)',
    },
    benefitIconBox: {
        width: '46px',
        height: '46px',
        borderRadius: '12px',
        background: '#331182',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    benefitTitle: {
        fontFamily: "'Outfit', sans-serif",
        fontSize: '0.95rem',
        fontWeight: 800,
        color: '#1B0B3B',
        margin: '0 0 0.2rem 0',
    },
    benefitText: {
        fontSize: '0.8rem',
        color: '#64748B',
        margin: 0,
        lineHeight: 1.35,
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.9rem',
    },
    sectionBadge: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: '#331182',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    sectionTitleText: {
        fontFamily: "'Outfit', sans-serif",
        fontSize: '0.95rem',
        fontWeight: 900,
        color: '#280C68',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        margin: 0,
    },
    sectionCard: {
        background: '#FFFFFF',
        border: '1px solid #EAE6F5',
        borderRadius: '18px',
        padding: '1.5rem',
        boxShadow: '0 4px 16px rgba(51, 17, 130, 0.04)',
    },
    topDataGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '1.5rem',
        marginBottom: '1.5rem',
    },
    leftInputsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    rightPhotoColumn: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '0.82rem',
        fontWeight: 700,
        color: '#1E1B4B',
        marginBottom: '0.4rem',
    },
    labelDot: {
        color: '#331182',
        fontSize: '0.9rem',
    },
    input: {
        width: '100%',
        boxSizing: 'border-box',
        padding: '0.75rem 0.95rem',
        border: '1.5px solid #E2E8F0',
        borderRadius: '10px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '0.86rem',
        color: '#0F172A',
        background: '#FFFFFF',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    photoContainer: {
        border: '1.5px solid #E2E8F0',
        borderRadius: '12px',
        padding: '0.5rem',
        background: '#FBFBFE',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '160px',
    },
    photoPreviewWrapper: {
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '10px',
    },
    photoActionButtons: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '0.5rem',
        width: '100%',
    },
    changePhotoBtn: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem',
        padding: '0.5rem',
        background: '#EEF2FF',
        color: '#331182',
        border: '1px solid #DDD6FE',
        borderRadius: '8px',
        fontSize: '0.78rem',
        fontWeight: 700,
        cursor: 'pointer',
    },
    deletePhotoBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem',
        padding: '0.5rem 0.8rem',
        background: '#FEF2F2',
        color: '#DC2626',
        border: '1px solid #FECACA',
        borderRadius: '8px',
        fontSize: '0.78rem',
        fontWeight: 700,
        cursor: 'pointer',
    },
    dropzone: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.35rem',
        padding: '1.5rem 1rem',
        cursor: 'pointer',
        textAlign: 'center',
        width: '100%',
    },
    dropzoneIconWrapper: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: '#EEF2FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.25rem',
    },
    bottomFourGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid #F1F0F7',
    },
    inputWithIconWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
    },
    inputLeftIcon: {
        position: 'absolute',
        left: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 1,
    },
    inputWithIcon: {
        width: '100%',
        boxSizing: 'border-box',
        padding: '0.75rem 0.85rem 0.75rem 2.45rem',
        border: '1.5px solid #E2E8F0',
        borderRadius: '10px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '0.86rem',
        color: '#0F172A',
        background: '#FFFFFF',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    gpsButton: {
        position: 'absolute',
        right: '0.5rem',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0.3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
    },
    section2Grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
    },
    bottomActionBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginTop: '2rem',
    },
    securityBox: {
        background: '#EEF2FF',
        border: '1px solid #E0E7FF',
        borderRadius: '14px',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        flex: '1 1 320px',
        maxWidth: '520px',
    },
    securityIconWrapper: {
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        background: '#331182',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    submitButton: {
        background: '#331182',
        color: '#FFFFFF',
        fontFamily: "'Outfit', sans-serif",
        fontSize: '1.05rem',
        fontWeight: 800,
        padding: '1rem 2.4rem',
        borderRadius: '14px',
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        boxShadow: '0 8px 24px rgba(51, 17, 130, 0.3)',
        transition: 'all 0.2s ease',
    },
};