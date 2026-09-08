import React, { useState, useEffect } from 'react';
import { Camera, MapPin, FolderOpen, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface DevicePermissionsBannerProps {
  appName: string;
  compact?: boolean;
}

export const DevicePermissionsBanner: React.FC<DevicePermissionsBannerProps> = ({ appName, compact = false }) => {
  const [cameraGranted, setCameraGranted] = useState<boolean | null>(null);
  const [gpsGranted, setGpsGranted] = useState<boolean | null>(null);
  const [mediaGranted, setMediaGranted] = useState<boolean>(true);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check initial permissions if browser supports Permissions API
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then(res => {
        if (res.state === 'granted') setGpsGranted(true);
        else if (res.state === 'denied') setGpsGranted(false);
      }).catch(() => {});

      navigator.permissions.query({ name: 'camera' as PermissionName }).then(res => {
        if (res.state === 'granted') setCameraGranted(true);
        else if (res.state === 'denied') setCameraGranted(false);
      }).catch(() => {});
    }
  }, []);

  const requestAllPermissions = async () => {
    setIsRequesting(true);

    // 1. Request GPS
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsGranted(true);
          setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.warn('GPS permission denied or unavailable:', err);
          setGpsGranted(false);
        },
        { timeout: 8000 }
      );
    } else {
      setGpsGranted(false);
    }

    // 2. Request Camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraGranted(true);
        // Stop stream after permission granted so camera indicator light goes off
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.warn('Camera permission denied or unavailable:', err);
        setCameraGranted(false);
      }
    } else {
      setCameraGranted(false);
    }

    // 3. Media files are always supported via HTML input file
    setMediaGranted(true);
    setIsRequesting(false);
  };

  const allGranted = cameraGranted === true && gpsGranted === true && mediaGranted === true;

  if (compact) {
    return (
      <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-[10px] flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold ${
            cameraGranted ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
          }`}>
            <Camera className="w-2.5 h-2.5" />
            <span>{cameraGranted ? 'Cámara OK' : 'Cámara'}</span>
          </span>

          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold ${
            gpsGranted ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
          }`}>
            <MapPin className="w-2.5 h-2.5" />
            <span>{gpsGranted ? 'GPS OK' : 'GPS'}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-600">
            <FolderOpen className="w-2.5 h-2.5" />
            <span>Archivos OK</span>
          </span>
        </div>

        {!allGranted && (
          <button
            type="button"
            onClick={requestAllPermissions}
            disabled={isRequesting}
            className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg cursor-pointer transition text-[9px] shrink-0"
          >
            {isRequesting ? 'Verificando...' : 'Permitir'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 rounded-2xl border border-amber-500/20 text-neutral-900 dark:text-neutral-100 space-y-2.5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500 text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">
              Permisos del Dispositivo ({appName})
            </h4>
            <p className="text-[10px] text-neutral-500">
              Requeridos para fotos de cédula/selfie, cálculo de rutas y archivos
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 underline cursor-pointer"
        >
          {showDetails ? 'Ocultar' : 'Detalles'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
        {/* Cámara */}
        <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
          cameraGranted === true
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold'
            : cameraGranted === false
            ? 'bg-red-50 dark:bg-red-950/20 border-red-500/30 text-red-600 font-bold'
            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
        }`}>
          <Camera className="w-3.5 h-3.5" />
          <span>Cámara</span>
          <span className="text-[8px] font-mono uppercase">
            {cameraGranted === true ? 'Concedido' : cameraGranted === false ? 'Denegado' : 'Pendiente'}
          </span>
        </div>

        {/* GPS */}
        <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
          gpsGranted === true
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold'
            : gpsGranted === false
            ? 'bg-red-50 dark:bg-red-950/20 border-red-500/30 text-red-600 font-bold'
            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
        }`}>
          <MapPin className="w-3.5 h-3.5" />
          <span>GPS Ubicación</span>
          <span className="text-[8px] font-mono uppercase">
            {gpsGranted === true ? 'Concedido' : gpsGranted === false ? 'Denegado' : 'Pendiente'}
          </span>
        </div>

        {/* Archivos Multimedia */}
        <div className="p-2 rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold flex flex-col items-center gap-1">
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Archivos</span>
          <span className="text-[8px] font-mono uppercase">
            Concedido
          </span>
        </div>
      </div>

      {gpsCoords && (
        <div className="text-[9px] font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800/80 px-2 py-1 rounded-lg text-center truncate">
          📍 GPS Lat: {gpsCoords.lat.toFixed(5)}, Lng: {gpsCoords.lng.toFixed(5)}
        </div>
      )}

      {!allGranted ? (
        <button
          type="button"
          onClick={requestAllPermissions}
          disabled={isRequesting}
          className="w-full py-2 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isRequesting ? 'Concediendo permisos...' : 'Activar Permisos de Cámara y GPS'}</span>
        </button>
      ) : (
        <div className="text-center text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Todos los accesos de hardware habilitados correctamente</span>
        </div>
      )}
    </div>
  );
};
