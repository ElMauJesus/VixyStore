import React, { useState, useRef } from 'react';
import { 
  Bike, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ShieldCheck, 
  User, 
  X, 
  RefreshCw,
  Eye
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

interface DriverRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriverRegistrationModal: React.FC<DriverRegistrationModalProps> = ({ isOpen, onClose }) => {
  const { solicitarRegistroConductor } = useDelivery();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    email: '',
    marcaMoto: 'Bera',
    modeloMoto: 'SBR 150',
    anoMoto: '2024',
    colorMoto: 'Azul',
    placaMoto: '',
    licenciaGrado: '2da',
    licenciaVencimiento: '2027-05-18',
    certificadoMedicoVencimiento: '2026-10-12',
    aceptaTerminos: false
  });

  const [photos, setPhotos] = useState<{
    fotoCedulaUrl: string;
    fotoLicenciaUrl: string;
    fotoCertificadoMedicoUrl: string;
    fotoCarnetCirculacionUrl: string;
    fotoVehiculoUrl: string;
    fotoPlacaUrl: string;
  }>({
    fotoCedulaUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=80',
    fotoLicenciaUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
    fotoCertificadoMedicoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80',
    fotoCarnetCirculacionUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    fotoVehiculoUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    fotoPlacaUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80'
  });

  const [activeCameraField, setActiveCameraField] = useState<keyof typeof photos | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Hidden file inputs
  const fileInputRefs = {
    fotoCedulaUrl: useRef<HTMLInputElement>(null),
    fotoLicenciaUrl: useRef<HTMLInputElement>(null),
    fotoCertificadoMedicoUrl: useRef<HTMLInputElement>(null),
    fotoCarnetCirculacionUrl: useRef<HTMLInputElement>(null),
    fotoVehiculoUrl: useRef<HTMLInputElement>(null),
    fotoPlacaUrl: useRef<HTMLInputElement>(null)
  };

  const handleFileChange = (field: keyof typeof photos, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotos(prev => ({ ...prev, [field]: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setErrorMsg('Nombre y apellido son obligatorios');
      return;
    }
    if (!formData.cedula.trim() || !formData.telefono.trim()) {
      setErrorMsg('Cédula y teléfono son obligatorios');
      return;
    }
    if (!formData.placaMoto.trim()) {
      setErrorMsg('La placa del vehículo es obligatoria');
      return;
    }
    if (!formData.aceptaTerminos) {
      setErrorMsg('Debes aceptar los Términos y Condiciones de Servicio de Vixy Delivery');
      return;
    }

    const res = solicitarRegistroConductor({
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      cedula: formData.cedula.trim().toUpperCase(),
      telefono: formData.telefono.trim(),
      email: (formData.email || '').trim() || `${(formData.nombre || '').toLowerCase().replace(/\s+/g, '')}@vixydelivery.com`,
      marcaMoto: formData.marcaMoto.trim(),
      modeloMoto: formData.modeloMoto.trim(),
      anoMoto: formData.anoMoto.trim(),
      colorMoto: formData.colorMoto.trim(),
      placaMoto: formData.placaMoto.trim().toUpperCase(),
      licenciaGrado: formData.licenciaGrado,
      licenciaVencimiento: formData.licenciaVencimiento,
      certificadoMedicoVencimiento: formData.certificadoMedicoVencimiento,
      fotoCedulaUrl: photos.fotoCedulaUrl,
      fotoLicenciaUrl: photos.fotoLicenciaUrl,
      fotoCertificadoMedicoUrl: photos.fotoCertificadoMedicoUrl,
      fotoCarnetCirculacionUrl: photos.fotoCarnetCirculacionUrl,
      fotoVehiculoUrl: photos.fotoVehiculoUrl,
      fotoPlacaUrl: photos.fotoPlacaUrl,
      aceptaTerminos: true
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Error al procesar la solicitud');
      return;
    }

    setErrorMsg('');
    setSubmittedSuccess(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Postulación de Conductor / Repartidor
              </h3>
              <p className="text-xs text-neutral-500">
                Registro directo con verificación de cédula, vehículo y documentos legales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {submittedSuccess ? (
          <div className="py-8 px-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
                ¡Solicitud Registrada con Éxito!
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                Tus datos, fotos de documentos y vehículo han sido enviados a los supervisores del Backend Central. Tu cuenta será evaluada y aprobada para comenzar a recibir viajes.
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto">
              <p className="font-bold">Estado: Pendiente de Aprobación en Backend</p>
              <p className="text-[11px] mt-0.5">Te notificaremos una vez que la administración valide tus documentos en el panel de control.</p>
            </div>
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                onClose();
              }}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
            >
              Entendido / Volver al Inicio
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Paso 1: Datos Personales */}
            <div className="space-y-2">
              <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 pb-1">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>1. Datos Personales</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Carlos Alberto"
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    placeholder="Ramírez Mendoza"
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Cédula de Identidad *</label>
                  <input
                    type="text"
                    required
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                    placeholder="V-25890123"
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Teléfono Móvil *</label>
                  <input
                    type="text"
                    required
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="0414-1234567"
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Paso 2: Datos de la Moto */}
            <div className="space-y-2">
              <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 pb-1">
                <Bike className="w-3.5 h-3.5 text-amber-500" />
                <span>2. Datos del Vehículo (Moto)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Marca</label>
                  <input
                    type="text"
                    required
                    value={formData.marcaMoto}
                    onChange={(e) => setFormData({ ...formData, marcaMoto: e.target.value })}
                    placeholder="Bera, Empire, etc."
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Modelo</label>
                  <input
                    type="text"
                    required
                    value={formData.modeloMoto}
                    onChange={(e) => setFormData({ ...formData, modeloMoto: e.target.value })}
                    placeholder="SBR 150"
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Año</label>
                  <input
                    type="number"
                    required
                    value={formData.anoMoto}
                    onChange={(e) => setFormData({ ...formData, anoMoto: e.target.value })}
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Placa Vehículo *</label>
                  <input
                    type="text"
                    required
                    value={formData.placaMoto}
                    onChange={(e) => setFormData({ ...formData, placaMoto: e.target.value })}
                    placeholder="AA1B23C"
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Paso 3: Captura de Documentos y Fotos (Cámara o Carga) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-1">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-500" />
                  <span>3. Fotos de Documentos y Vehículo (6 Requeridas)</span>
                </h4>
                <span className="text-[10px] text-neutral-400 font-medium">Usa la cámara o sube archivo</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* 1. Cédula */}
                <div className="p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                    <span>Foto Cédula</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                    <img src={photos.fotoCedulaUrl} alt="Cédula" className="w-full h-full object-cover" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    ref={fileInputRefs.fotoCedulaUrl}
                    onChange={(e) => handleFileChange('fotoCedulaUrl', e)}
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.fotoCedulaUrl.current?.click()}
                    className="w-full py-1 rounded-lg bg-neutral-200 dark:bg-neutral-750 hover:bg-amber-500 hover:text-white transition font-medium text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Tomar Foto</span>
                  </button>
                </div>

                {/* 2. Licencia */}
                <div className="p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                    <span>Foto Licencia</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                    <img src={photos.fotoLicenciaUrl} alt="Licencia" className="w-full h-full object-cover" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    ref={fileInputRefs.fotoLicenciaUrl}
                    onChange={(e) => handleFileChange('fotoLicenciaUrl', e)}
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.fotoLicenciaUrl.current?.click()}
                    className="w-full py-1 rounded-lg bg-neutral-200 dark:bg-neutral-750 hover:bg-amber-500 hover:text-white transition font-medium text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Tomar Foto</span>
                  </button>
                </div>

                {/* 3. Certificado Médico */}
                <div className="p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                    <span>Certificado Médico</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                    <img src={photos.fotoCertificadoMedicoUrl} alt="Certificado Médico" className="w-full h-full object-cover" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    ref={fileInputRefs.fotoCertificadoMedicoUrl}
                    onChange={(e) => handleFileChange('fotoCertificadoMedicoUrl', e)}
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.fotoCertificadoMedicoUrl.current?.click()}
                    className="w-full py-1 rounded-lg bg-neutral-200 dark:bg-neutral-750 hover:bg-amber-500 hover:text-white transition font-medium text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Tomar Foto</span>
                  </button>
                </div>

                {/* 4. Carnet de Circulación */}
                <div className="p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                    <span>Carnet Circulación</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                    <img src={photos.fotoCarnetCirculacionUrl} alt="Carnet Circulación" className="w-full h-full object-cover" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    ref={fileInputRefs.fotoCarnetCirculacionUrl}
                    onChange={(e) => handleFileChange('fotoCarnetCirculacionUrl', e)}
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.fotoCarnetCirculacionUrl.current?.click()}
                    className="w-full py-1 rounded-lg bg-neutral-200 dark:bg-neutral-750 hover:bg-amber-500 hover:text-white transition font-medium text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Tomar Foto</span>
                  </button>
                </div>

                {/* 5. Foto del Vehículo */}
                <div className="p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                    <span>Foto de la Moto</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                    <img src={photos.fotoVehiculoUrl} alt="Foto Moto" className="w-full h-full object-cover" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    ref={fileInputRefs.fotoVehiculoUrl}
                    onChange={(e) => handleFileChange('fotoVehiculoUrl', e)}
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.fotoVehiculoUrl.current?.click()}
                    className="w-full py-1 rounded-lg bg-neutral-200 dark:bg-neutral-750 hover:bg-amber-500 hover:text-white transition font-medium text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Tomar Foto</span>
                  </button>
                </div>

                {/* 6. Foto de la Placa */}
                <div className="p-2.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                    <span>Foto de la Placa</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                    <img src={photos.fotoPlacaUrl} alt="Foto Placa" className="w-full h-full object-cover" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    ref={fileInputRefs.fotoPlacaUrl}
                    onChange={(e) => handleFileChange('fotoPlacaUrl', e)}
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.fotoPlacaUrl.current?.click()}
                    className="w-full py-1 rounded-lg bg-neutral-200 dark:bg-neutral-750 hover:bg-amber-500 hover:text-white transition font-medium text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Tomar Foto</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Términos y Condiciones */}
            <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.aceptaTerminos}
                  onChange={(e) => setFormData({ ...formData, aceptaTerminos: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded-md text-amber-500 accent-amber-500 cursor-pointer"
                />
                <span className="text-neutral-700 dark:text-neutral-300 leading-tight text-[11px]">
                  Acepto los <span className="font-bold underline text-amber-600 dark:text-amber-400">Términos y Condiciones de Servicio de Vixy Delivery</span>, autorizo la auditoría de antecedentes y entiendo que toda solicitud requiere aprobación de los supervisores antes de la activación.
                </span>
              </label>
            </div>

            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Enviar Solicitud para Aprobación</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
