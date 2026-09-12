/**
 * Vixy Shop Platform - Servicio de Keep-Alive & Telemetría en Segundo Plano
 * Envía un latido periódico (heartbeat) al backend PHP cada 20 segundos con la ubicación GPS real,
 * estado online y nivel de batería para mantener viva la sesión y la presencia en el mapa.
 */

export interface KeepAlivePayload {
  usuarioId: string;
  tipoUsuario: 'conductor' | 'comercio' | 'cliente';
  nombre: string;
  latitud?: number | null;
  longitud?: number | null;
  bateria?: number;
  online?: boolean;
  appVersion?: string;
}

let keepAliveIntervalId: any = null;

/**
 * Inicia el latido en segundo plano para el usuario conectado
 */
export function startKeepAliveHeartbeat(
  config: KeepAlivePayload,
  intervalSeconds: number = 20,
  onSuccess?: (data: any) => void,
  onError?: (err: any) => void
) {
  stopKeepAliveHeartbeat();

  const sendPing = async () => {
    try {
      let lat: number | undefined = config.latitud;
      let lng: number | undefined = config.longitud;

      // Obtener coordenadas GPS en tiempo real si el dispositivo/navegador lo permite
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        try {
          await new Promise<void>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
                resolve();
              },
              () => resolve(),
              { enableHighAccuracy: true, timeout: 3000, maximumAge: 10000 }
            );
          });
        } catch {
          // Usar fallback
        }
      }

      // Obtener nivel de batería si la Battery Status API está disponible
      let batteryLevel: number | undefined = config.bateria;
      if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
        try {
          const battery = await (navigator as any).getBattery();
          batteryLevel = Math.round(battery.level * 100);
        } catch {
          // Ignorar
        }
      }

      const bodyData = {
        usuario_id: config.usuarioId,
        tipo_usuario: config.tipoUsuario,
        nombre: config.nombre,
        latitud: lat,
        longitud: lng,
        bateria: batteryLevel,
        online: config.online !== false ? 1 : 0,
        app_version: config.appVersion || '2.0.0-shop'
      };

      // Detectar endpoint base apuntando a /shop/backend/php
      const apiEndpoint = typeof window !== 'undefined' && window.location.pathname.startsWith('/shop')
        ? '/shop/backend/php/keep_alive.php'
        : '/backend/php/keep_alive.php';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      if (response.ok) {
        const json = await response.json();
        if (onSuccess) onSuccess(json);
      } else {
        if (onError) onError(new Error(`HTTP ${response.status}`));
      }
    } catch (e) {
      if (onError) onError(e);
    }
  };

  // Enviar el primer ping de inmediato y luego periódicamente
  sendPing();
  keepAliveIntervalId = setInterval(sendPing, intervalSeconds * 1000);
}

/**
 * Detiene el latido en segundo plano (al cerrar turno o desconectarse)
 */
export function stopKeepAliveHeartbeat() {
  if (keepAliveIntervalId) {
    clearInterval(keepAliveIntervalId);
    keepAliveIntervalId = null;
  }
}
