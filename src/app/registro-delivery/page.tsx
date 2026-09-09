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
    X,
} from 'lucide-react';
import styles from "./page.module.css";

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
    nacionalidad: string;
    estadoCivil: string;
    numeroDependientes: string;
    fotoPerfil: File | null;
    fotoPreview: string | null;
    cedulaAnverso: FileField;
    cedulaReverso: FileField;
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
    antecedentes: FileField;
    recordPolicial: FileField;
    fotoVehiculo: FileField;
    fotoPlaca: FileField;
    emergenciaNombre: string;
    emergenciaTelefono: string;
    trabajoAnteriorDelivery: boolean;
    empresaAnteriorDelivery: string;
    zonaTrabajoPreferida: string;
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
            <div className={styles.fileGroup}>
                <label className={styles.fileLabel}>
                    {label} {isRequired && <span style={{ color: 'red' }}>*</span>}
                </label>
                <div className={`${styles.dropzone} ${value?.file ? styles.dropzoneFilled : ''}`}>
                    {value?.preview ? (
                        <div className="relative w-full">
                            <img src={value.preview} alt={label} className={styles.previewImg} />
                            <button type="button" onClick={() => handleClearFile(fieldName)} className={styles.clearFile}>
                                <Trash2 size={14} />
                            </button>
                            <div className="flex items-center gap-1.5 mt-2 text-emerald-600 text-xs font-bold">
                                <CheckCircle2 size={14} />
                                <span>Imagen cargada</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <span className={styles.dropzoneIcon}>{icon}</span>
                            <span className={styles.dropzoneHint}>Toca para subir</span>
                            {hint && <span className={styles.dropzoneSub}>{hint}</span>}
                        </>
                    )}
                    <input
                        id={inputId}
                        type="file"
                        accept="image/*"
                        className={styles.fileInputHidden}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileField(fieldName, f); }}
                    />
                </div>
            </div>
        );
    };

    if (submitted && repartidorCreado) {
        return (
            <div className={styles.page}>
                <header className={styles.header}>
                    <Link href="/" className={styles.backLink}>
                        <ChevronLeft size={20} /> Volver al inicio
                    </Link>
                </header>
                <main className={styles.successPage}>
                    <div className={styles.successCard}>
                        <div className={styles.successIconWrap}>
                            <CheckCircle2 size={60} strokeWidth={1.5} />
                        </div>
                        <h1 className={styles.successTitle}>¡Postulación Enviada!</h1>
                        <p className={styles.successText}>
                            Gracias <strong>{repartidorCreado.nombre}</strong>. Tu postulación fue recibida exitosamente y está en proceso de revisión.
                        </p>
                        <div style={{ background: '#F7F3FF', borderRadius: '16px', padding: '1rem', marginBottom: '1rem', width: '100%' }}>
                            <span style={{ fontSize: '0.7rem', color: '#5E17EB', fontWeight: 'bold' }}>Código de Seguimiento</span>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: '900', color: '#1A153A' }}>{repartidorCreado.codigo}</span>
                                <button type="button" onClick={() => copyText(repartidorCreado.codigo)} style={{ cursor: 'pointer', background: '#5E17EB', color: 'white', border: 'none', borderRadius: '8px', padding: '0.25rem 0.5rem' }}>
                                    {copiedCode ? '✓' : 'Copiar'}
                                </button>
                            </div>
                        </div>
                        <Link href="/" className={styles.successBtn}>
                            Volver al Portal Principal
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>
                    <ChevronLeft size={20} />
                    <span>Volver al inicio</span>
                </Link>
                <div className={styles.logoWrap}>
                    <Image src="/icons/footer/vixylogo.png" alt="Vixy Delivery" width={120} height={75} style={{ objectFit: "contain" }} priority />
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.pageWrapper}>
                    <div className={styles.heroTitle}>
                        <h1 className={styles.heroH1}>
                            Registro<br />
                            <span className={styles.heroAccent}>Repartidor Vixy</span>
                        </h1>
                        <p className={styles.heroSub}>
                            Completa todos los campos para unirte<br />
                            a la flota de repartidores.
                        </p>
                    </div>

                    <div className={styles.badges}>
                        <div className={styles.badge}>
                            <div className={styles.badgeIcon}><Zap size={22} /></div>
                            <div>
                                <p className={styles.badgeTitle}>Ingresos Rápidos</p>
                                <p className={styles.badgeSub}>Cobra por cada entrega.</p>
                            </div>
                        </div>
                        <div className={styles.badge}>
                            <div className={styles.badgeIcon}><Shield size={22} /></div>
                            <div>
                                <p className={styles.badgeTitle}>Pagos y Billetera</p>
                                <p className={styles.badgeSub}>Control de ganancias claro.</p>
                            </div>
                        </div>
                        <div className={styles.badge}>
                            <div className={styles.badgeIcon}><Sparkles size={22} /></div>
                            <div>
                                <p className={styles.badgeTitle}>Horario Flexible</p>
                                <p className={styles.badgeSub}>Tú decides cuándo trabajar.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
                        {errorMessage && (
                            <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", padding: "0.85rem 1.2rem", borderRadius: "10px", fontSize: "0.92rem", marginBottom: "1rem", textAlign: "center" }}>
                                {errorMessage}
                            </div>
                        )}

                        {/* SECCIÓN 1 */}
                        <section className={styles.formSection}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}><Camera size={18} /></div>
                                <h2 className={styles.sectionTitle}>1. FOTO DE ROSTRO</h2>
                            </div>
                            <div className={styles.fieldsGrid2}>
                                <div className={styles.fileGroup}>
                                    <label className={styles.fileLabel}>Foto de rostro / Selfie *</label>
                                    <div className={`${styles.dropzone} ${form.fotoPreview ? styles.dropzoneFilled : ''}`}>
                                        {form.fotoPreview ? (
                                            <>
                                                <img src={form.fotoPreview} alt="Preview" className={styles.previewImg} />
                                                <button className={styles.clearFile} onClick={handleRemovePhoto}><X size={14} /></button>
                                            </>
                                        ) : (
                                            <>
                                                <span className={styles.dropzoneIcon}><Camera size={28} /></span>
                                                <span className={styles.dropzoneHint}>Sube tu selfie (mira a la cámara)</span>
                                                <span className={styles.dropzoneSub}>Toca para subir o arrastra aquí</span>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" className={styles.fileInputHidden} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                                </div>
                                <FileUploadField label="Cédula - Anverso" fieldName="cedulaAnverso" icon={<CreditCard size={28} />} hint="Frente de tu cédula" required />
                                <FileUploadField label="Cédula - Reverso" fieldName="cedulaReverso" icon={<CreditCard size={28} />} hint="Reverso de tu cédula" required />
                            </div>
                        </section>

                        {/* SECCIÓN 2 */}
                        <section className={styles.formSection}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}><User size={18} /></div>
                                <h2 className={styles.sectionTitle}>2. DATOS PERSONALES</h2>
                            </div>
                            <div className={styles.fieldsGrid2}>
                                <div className={styles.fieldGroup}><label className={styles.label}>Nombre *</label><input type="text" required placeholder="Ej. Carlos" value={form.nombre} onChange={setField('nombre')} className={styles.input} /></div>
                                <div className={styles.fieldGroup}><label className={styles.label}>Apellido *</label><input type="text" required placeholder="Ej. Ramírez" value={form.apellido} onChange={setField('apellido')} className={styles.input} /></div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Cédula de Identidad *</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select value={form.tipoCedula} onChange={(e) => setForm(prev => ({ ...prev, tipoCedula: e.target.value as 'V' | 'E' }))} className={styles.input} style={{ width: '70px' }}>
                                            <option value="V">V</option>
                                            <option value="E">E</option>
                                        </select>
                                        <input type="text" required placeholder="Ej. 24891023" value={form.numeroCedula} onChange={setField('numeroCedula')} className={styles.input} />
                                    </div>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Fecha de Nacimiento *</label>
                                    <input type="date" required value={form.fechaNacimiento} onChange={setField('fechaNacimiento')} className={styles.input} />
                                    {edadCalculada !== null && <span style={{ fontSize: '0.75rem', color: edadCalculada >= 18 ? 'green' : 'red' }}>{edadCalculada} años</span>}
                                </div>
                                <div className={styles.fieldGroup}><label className={styles.label}>Nacionalidad</label><select value={form.nacionalidad} onChange={setField('nacionalidad')} className={styles.input}><option value="venezolano">Venezolano/a</option><option value="extranjero_residente">Extranjero Residente</option><option value="refugiado">Refugiado</option></select></div>
                                <div className={styles.fieldGroup}><label className={styles.label}>Estado Civil</label><select value={form.estadoCivil} onChange={setField('estadoCivil')} className={styles.input}><option value="">— Seleccionar —</option><option value="soltero">Soltero/a</option><option value="casado">Casado/a</option><option value="union_libre">Unión Libre</option><option value="divorciado">Divorciado/a</option><option value="viudo">Viudo/a</option></select></div>
                                <div className={styles.fieldGroup}><label className={styles.label}>Número de Dependientes</label><input type="number" min="0" max="20" value={form.numeroDependientes} onChange={setField('numeroDependientes')} className={styles.input} /></div>
                            </div>
                        </section>

                        {/* SECCIÓN 3 */}
                        <section className={styles.formSection}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}><Phone size={18} /></div>
                                <h2 className={styles.sectionTitle}>3. CONTACTO</h2>
                            </div>
                            <div className={styles.fieldsGrid2}>
                                <div className={styles.fieldGroup}><label className={styles.label}>Teléfono Móvil *</label><input type="tel" required placeholder="04141234567" value={form.telefono} onChange={setField('telefono')} className={styles.input} /></div>
                                <div className={styles.fieldGroup}><label className={styles.label}>Teléfono Alternativo</label><input type="tel" placeholder="04241234567" value={form.telefonoAlternativo} onChange={setField('telefonoAlternativo')} className={styles.input} /></div>
                                <div className={styles.fieldGroup}><label className={styles.label}>Correo Electrónico *</label><input type="email" required placeholder="correo@ejemplo.com" value={form.email} onChange={setField('email')} className={styles.input} /></div>
                                <div className={styles.fieldGroup}><label className={styles.label}>Dirección *</label><input type="text" required placeholder="Urb., calle, casa/apto..." value={form.direccion} onChange={setField('direccion')} className={styles.input} /></div>
                                <div className={styles.fieldGroup}><label className={styles.label}>Punto de Referencia</label><input type="text" placeholder="Cerca de..." value={form.puntoReferencia} onChange={setField('puntoReferencia')} className={styles.input} /></div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Ubicación GPS (opcional)</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input type="text" readOnly placeholder="Lat, Lng" value={form.ubicacionGps} className={styles.input} />
                                        <button type="button" onClick={handleGetGps} className={styles.input} style={{ width: 'auto', cursor: 'pointer' }}>{gpsLoading ? '...' : 'GPS'}</button>
                                    </div>
                                </div>
                                <div className={styles.fieldGroup}><label className={styles.label}>Zona de Trabajo Preferida</label><input type="text" placeholder="Ej. Centro, Las Mercedes" value={form.zonaTrabajoPreferida} onChange={setField('zonaTrabajoPreferida')} className={styles.input} /></div>
                            </div>
                        </section>

                        {/* SECCIÓN 4: EMERGENCIA */}
                        <section className={styles.formSection}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}><Heart size={18} /></div>
                                <h2 className={styles.sectionTitle}>4. CONTACTO DE EMERGENCIA</h2>
                            </div>
                            <div className={styles.fieldsGrid2}>
                                <div className={styles.fieldGroup}><label className={styles.label}>Nombre completo *</label><input type="text" required placeholder="Ej. María Ramírez" value={form.emergenciaNombre} onChange={setField('emergenciaNombre')} className={styles.input} /></div>
                                <div className={styles.fieldGroup}><label className={styles.label}>Teléfono *</label><input type="tel" required placeholder="04141234567" value={form.emergenciaTelefono} onChange={setField('emergenciaTelefono')} className={styles.input} /></div>
                            </div>
                        </section>

                        {/* SECCIÓN 5: VEHÍCULO */}
                        <section className={styles.formSection}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}><Car size={18} /></div>
                                <h2 className={styles.sectionTitle}>5. VEHÍCULO</h2>
                                <div className={styles.vehicleToggle}>
                                    <button type="button" className={`${styles.toggleBtn} ${form.tipoVehiculo === 'moto' ? styles.toggleActive : ''}`} onClick={() => setForm(prev => ({ ...prev, tipoVehiculo: 'moto' }))}>Moto</button>
                                    <button type="button" className={`${styles.toggleBtn} ${form.tipoVehiculo === 'auto' ? styles.toggleActive : ''}`} onClick={() => setForm(prev => ({ ...prev, tipoVehiculo: 'auto' }))}>Auto</button>
                                </div>
                            </div>
                            <div className={styles.fieldsGrid2}>
                                <div className={styles.fieldGroup}><label className={styles.label}>Placa *</label><input type="text" required placeholder="AA123BC" value={form.placaVehiculo} onChange={(e) => setForm(prev => ({ ...prev, placaVehiculo: e.target.value.toUpperCase() }))} className={styles.input} /></div>
                                <div className={styles.fieldGroup}><label className={styles.label}>Marca</label><input type="text" placeholder="Ej. Yamaha, Toyota..." value={form.marcaVehiculo} onChange={setField('marcaVehiculo')} className={styles.input} /></div>
                                <div className={styles.fieldGroup}><label className={styles.label}>Modelo</label><input type="text" placeholder="Ej. FZ 150, Corolla..." value={form.modeloVehiculo} onChange={setField('modeloVehiculo')} className={styles.input} /></div>
                                <div className={styles.fieldGroup}><label className={styles.label}>Color</label><input type="text" placeholder="Ej. Negro, Rojo..." value={form.colorVehiculo} onChange={setField('colorVehiculo')} className={styles.input} /></div>
                            </div>
                        </section>

                        {/* SECCIÓN 6: DOCUMENTOS */}
                        <section className={styles.formSection}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}><FileText size={18} /></div>
                                <h2 className={styles.sectionTitle}>6. DOCUMENTOS</h2>
                            </div>
                            <div className={styles.fieldsGrid2}>
                                <FileUploadField label="Licencia de Conducir *" fieldName="licencia" icon={<FileText size={28} />} hint="Foto legible, vigente." required />
                                <FileUploadField label="RCV (Seguro) *" fieldName="rcv" icon={<Shield size={28} />} hint="Responsabilidad Civil vigente." required />
                                <FileUploadField label="Certificado Médico *" fieldName="certMedico" icon={<FileText size={28} />} hint="Certificado de aptitud física." required />
                                <FileUploadField label="Carnet de Circulación *" fieldName="carnetCirculacion" icon={<FileText size={28} />} hint="Certificado de circulación." required />
                                <FileUploadField label="Foto del Vehículo *" fieldName="fotoVehiculo" icon={<Car size={28} />} hint="Foto general del vehículo." required />
                                <FileUploadField label="Foto de la Placa *" fieldName="fotoPlaca" icon={<CreditCard size={28} />} hint="Placa visible y legible." required />
                            </div>
                        </section>

                        {/* SECCIÓN 7: SEGURIDAD */}
                        <section className={styles.formSection}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}><Shield size={18} /></div>
                                <h2 className={styles.sectionTitle}>7. DOCUMENTOS DE SEGURIDAD</h2>
                            </div>
                            <div className={styles.fieldsGrid2}>
                                <FileUploadField label="Antecedentes Penales (CICPC) *" fieldName="antecedentes" icon={<Shield size={28} />} hint="Constancia del CICPC. Obligatorio." required />
                                <FileUploadField label="Récord Policial (Opcional)" fieldName="recordPolicial" icon={<FileText size={28} />} hint="Récord policial." />
                            </div>
                        </section>

                        {/* SECCIÓN 8: EXPERIENCIA */}
                        <section className={styles.formSection}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}><Briefcase size={18} /></div>
                                <h2 className={styles.sectionTitle}>8. EXPERIENCIA EN DELIVERY</h2>
                            </div>
                            <div className={styles.fieldsGrid2}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>¿Trabajó antes en delivery?</label>
                                    <select value={form.trabajoAnteriorDelivery ? 'si' : 'no'} onChange={(e) => setForm(prev => ({ ...prev, trabajoAnteriorDelivery: e.target.value === 'si' }))} className={styles.input}>
                                        <option value="no">No</option>
                                        <option value="si">Sí</option>
                                    </select>
                                </div>
                                {form.trabajoAnteriorDelivery && (
                                    <div className={styles.fieldGroup}><label className={styles.label}>Empresa anterior</label><input type="text" placeholder="Ej. Yummy, PedidosYa..." value={form.empresaAnteriorDelivery} onChange={setField('empresaAnteriorDelivery')} className={styles.input} /></div>
                                )}
                            </div>
                        </section>

                        {/* SECCIÓN 9: PAGO */}
                        <section className={styles.formSection}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}><CreditCard size={18} /></div>
                                <h2 className={styles.sectionTitle}>9. PAGO DE INSCRIPCIÓN</h2>
                            </div>
                            <div className={styles.fieldsGrid2}>
                                <div className={styles.fieldGroup}><label className={styles.label}>Método de Pago *</label><select value={form.metodoPago} onChange={setField('metodoPago')} className={styles.input}><option value="">— Seleccionar —</option><option value="pago_movil">Pago Móvil</option><option value="transferencia_bs">Transferencia Bs.</option><option value="efectivo_usd">Efectivo USD</option><option value="zelle">Zelle</option><option value="binance">Binance/Cripto</option></select></div>
                                <div className={styles.fieldGroup}><label className={styles.label}>Referencia del Pago *</label><input type="text" required placeholder="Nro. de referencia" value={form.referenciaPago} onChange={setField('referenciaPago')} className={styles.input} /></div>
                            </div>
                        </section>

                        {/* CONFIRMACIÓN */}
                        <div className={styles.submitArea}>
                            <label className={styles.checkboxLabel}>
                                <input type="checkbox" checked={form.confirmacion} onChange={(e) => setForm(prev => ({ ...prev, confirmacion: e.target.checked }))} className={styles.checkbox} />
                                <span>Declaro que toda la información es verídica.</span>
                            </label>

                            {errorMessage && (
                                <div style={{ color: 'red', fontSize: '0.85rem' }}>{errorMessage}</div>
                            )}

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                <Check size={18} />
                                {loading ? 'Enviando...' : 'Enviar Postulación'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}