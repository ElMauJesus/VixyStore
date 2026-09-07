/**
 * Vixy Delivery Platform - Servicio Unificado de Permisos Nativos
 * Gestiona permisos de Notificaciones Push/Web, Acceso a Cámara y Geolocalización GPS.
 * Compatible con navegadores modernos, PWAs y contenedores nativos Android (Capacitor).
 */

export interface PermissionStatusResult {
  notifications: 'granted' | 'denied' | 'prompt' | 'unsupported';
  camera: 'granted' | 'denied' | 'prompt' | 'unsupported';
  geolocation: 'granted' | 'denied' | 'prompt' | 'unsupported';
}

/**
 * Solicita autorización para mostrar notificaciones sonoras y emergentes en pantalla
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Este dispositivo no admite la API de notificaciones Web.');
    return false;
  }

  try {
    if (Notification.permission === 'granted') {
      return true;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error al solicitar permiso de notificaciones:', error);
    return false;
  }
}

/**
 * Solicita acceso a la cámara del dispositivo para captura de comprobantes y fotos de entrega
 */
export async function requestCameraPermission(): Promise<{ granted: boolean; stream?: MediaStream; error?: string }> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return { granted: false, error: 'Dispositivo sin soporte de captura de cámara' };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Prioriza la cámara trasera en teléfonos
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
    return { granted: true, stream };
  } catch (err: any) {
    console.warn('Permiso de cámara rechazado o no disponible:', err);
    return { granted: false, error: err?.message || 'Acceso a cámara denegado por el usuario' };
  }
}

/**
 * Solicita permiso de GPS de alta precisión y retorna las coordenadas actuales
 */
export async function requestGpsPermission(): Promise<{
  granted: boolean;
  coords?: { lat: number; lng: number; accuracy: number; speed?: number };
  error?: string;
}> {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return { granted: false, error: 'Geolocalización GPS no disponible en este dispositivo' };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          granted: true,
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed ?? undefined
          }
        });
      },
      (err) => {
        let msg = 'Error desconocido al acceder a GPS';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Permiso de ubicación denegado. Activa el GPS de tu dispositivo.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Señal de satélite GPS no disponible actualmente.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Tiempo de espera agotado al consultar GPS.';
        }
        resolve({ granted: false, error: msg });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );
  });
}

/**
 * Consulta el estado actual de los 3 permisos sin disparar el diálogo
 */
export async function checkAllPermissions(): Promise<PermissionStatusResult> {
  const result: PermissionStatusResult = {
    notifications: 'unsupported',
    camera: 'unsupported',
    geolocation: 'unsupported'
  };

  // Notificaciones
  if (typeof window !== 'undefined' && 'Notification' in window) {
    result.notifications = Notification.permission as any;
  }

  // Permisos vía Permissions API
  if (typeof navigator !== 'undefined' && 'permissions' in navigator && navigator.permissions.query) {
    try {
      const geoStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      result.geolocation = geoStatus.state as any;
    } catch {
      // Ignorar si el navegador restringe la consulta
    }

    try {
      const camStatus = await navigator.permissions.query({ name: 'camera' as any });
      result.camera = camStatus.state as any;
    } catch {
      // Ignorar
    }
  }

  return result;
}
