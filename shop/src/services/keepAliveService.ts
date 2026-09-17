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

export async function sendDriverGpsHeartbeat(payload: {
  usuario_id: string;
  nombre: string;
  cedula?: string;
  latitud: number;
  longitud: number;
}) {
  const body = JSON.stringify({
    ...payload,
    tipo_usuario: 'conductor',
    online: 1,
    app_version: '2.0.0-gps'
  });

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      navigator.sendBeacon('/api/keep_alive.php', new Blob([body], { type: 'application/json' }));
    } catch {
      // Continue with fetch below.
    }
  }

  for (const endpoint of ['/api/keep_alive.php', '/shop/backend/php/keep_alive.php']) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      if (response.ok) return response;
    } catch {
      // Continue with the synchronized fallback endpoint.
    }
  }

  throw new Error('No se pudo publicar el GPS del conductor');
}

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
      let gpsFresh = false;

      // Obtener coordenadas GPS en tiempo real si el dispositivo/navegador lo permite
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        try {
          await new Promise<void>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
                gpsFresh = true;
                config.latitud = lat;
                config.longitud = lng;
                resolve();
              },
              () => resolve(),
              { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
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
        // A conductor must have a fresh sensor reading to remain visible online.
        online: config.online !== false && (config.tipoUsuario !== 'conductor' || gpsFresh) ? 1 : 0,
        app_version: config.appVersion || '2.0.0-shop'
      };

      const endpoints = ['/api/keep_alive.php', '/shop/backend/php/keep_alive.php'];
      let response: Response | null = null;
      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
          });
          if (response.ok) break;
        } catch {
          // Continue with the synchronized fallback endpoint.
        }
      }

      if (response && response.ok) {
        const json = await response.json().catch(() => null);
        if (onSuccess && json) onSuccess(json);
      } else if (response) {
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

/**
 * Fuerza un latido inmediato (útil cuando la app vuelve de segundo plano/WhatsApp)
 */
export function forceKeepAlivePing(config: KeepAlivePayload) {
  startKeepAliveHeartbeat(config, 20);
}
