/**
 * Vixy Delivery Platform - Cliente API Centralizado para PHP / cPanel
 * Permite alternar fácilmente entre la API de cPanel y el modo cliente
 */

// Por defecto apunta a /api o a la ruta configurada en .env (VITE_API_BASE_URL)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/backend/php';

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('vixy_auth_token');
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('vixy_auth_token', token);
      } else {
        localStorage.removeItem('vixy_auth_token');
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      return data as T;
    } catch (err: any) {
      console.warn(`[Vixy API] Offline o Endpoint inaccesible (${url}):`, err.message);
      throw err;
    }
  }

  // --- AUTENTICACIÓN (SUPERUSUARIO: vixydely / 123456) ---
  public async login(identifier: string, password: string) {
    return this.request<{
      success: boolean;
      token?: string;
      tipo?: string;
      usuario?: any;
      mensaje?: string;
      error?: boolean;
    }>('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
  }

  public async registerClient(clientData: any) {
    return this.request<{
      success: boolean;
      token?: string;
      usuario?: any;
      mensaje?: string;
    }>('/auth.php?action=register_client', {
      method: 'POST',
      body: JSON.stringify(clientData)
    });
  }

  public async changePassword(newPassword: string) {
    return this.request<{ success: boolean; mensaje: string }>('/auth.php?action=change_password', {
      method: 'POST',
      body: JSON.stringify({ nueva_clave: newPassword })
    });
  }

  // --- CONFIGURACIÓN Y TASAS ---
  public async getConfig() {
    return this.request<{
      success: boolean;
      config: {
        tasa_bcv: number;
        tarifa_base_usd: number;
        km_base: number;
        precio_km_adicional_usd: number;
        limite_saldo_negativo_conductor_usd: number;
        comision_plataforma_porcentaje: number;
      };
    }>('/configuracion.php');
  }

  // --- PEDIDOS ---
  public async getPedidos(filters: { cliente_id?: string; comercio_id?: string; conductor_id?: string; estado?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.cliente_id) params.set('cliente_id', filters.cliente_id);
    if (filters.comercio_id) params.set('comercio_id', filters.comercio_id);
    if (filters.conductor_id) params.set('conductor_id', filters.conductor_id);
    if (filters.estado) params.set('estado', filters.estado);

    return this.request<{ success: boolean; pedidos: any[] }>(`/pedidos.php?${params.toString()}`);
  }

  public async getPedido(id: string) {
    return this.request<{ success: boolean; pedido: any }>(`/pedidos.php?id=${encodeURIComponent(id)}`);
  }

  public async createPedido(pedidoData: any) {
    return this.request<{
      success: boolean;
      pedido_id: string;
      codigo_seguimiento: string;
      total_usd: number;
      total_bs: number;
    }>('/pedidos.php', {
      method: 'POST',
      body: JSON.stringify(pedidoData)
    });
  }

  public async updatePedidoEstado(id: string, nuevoEstado: string, conductorId?: string) {
    return this.request<{ success: boolean; mensaje: string }>(`/pedidos.php?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ estado: nuevoEstado, conductor_id: conductorId })
    });
  }

  // --- CONDUCTORES ---
  public async getConductores(soloDisponibles = true) {
    return this.request<{ success: boolean; conductores: any[] }>(
      `/conductores.php?disponibles=${soloDisponibles ? 1 : 0}`
    );
  }

  public async updateGps(conductorId: string, lat: number, lng: number, pedidoId?: string) {
    return this.request<{ success: boolean }>('/conductores.php?action=gps', {
      method: 'POST',
      body: JSON.stringify({ conductor_id: conductorId, latitud: lat, longitud: lng, pedido_id: pedidoId })
    });
  }

  public async setDriverAvailability(conductorId: string, disponible: boolean) {
    return this.request<{ success: boolean; disponible: boolean }>('/conductores.php?action=disponibilidad', {
      method: 'PUT',
      body: JSON.stringify({ conductor_id: conductorId, disponible: disponible ? 1 : 0 })
    });
  }

  // --- RECARGAS ---
  public async submitRecarga(recargaData: {
    usuario_id: string;
    tipo_usuario: 'conductor' | 'comercio' | 'cliente';
    monto_usd: number;
    metodo: string;
    banco_emisor?: string;
    referencia: string;
    comprobante_url?: string;
  }) {
    return this.request<{ success: boolean; recarga_id: string }>('/recargas.php', {
      method: 'POST',
      body: JSON.stringify(recargaData)
    });
  }

  public async getRecargas(estado?: string) {
    const q = estado ? `?estado=${encodeURIComponent(estado)}` : '';
    return this.request<{ success: boolean; recargas: any[] }>(`/recargas.php${q}`);
  }

  public async processRecarga(recargaId: string, accion: 'aprobar' | 'rechazar', motivoRechazo?: string) {
    return this.request<{ success: boolean; mensaje: string }>(`/recargas.php?id=${encodeURIComponent(recargaId)}`, {
      method: 'PUT',
      body: JSON.stringify({ accion, motivo_rechazo: motivoRechazo })
    });
  }

  // --- SUBIDA DE ARCHIVOS ---
  public async uploadImage(file: File, tipo: 'comercios' | 'productos' | 'entregas' | 'reclamos' | 'comprobantes' | 'admin', entityId?: string, campo?: string) {
    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('tipo', tipo);
    if (entityId) formData.append('entity_id', entityId);
    if (campo) formData.append('campo', campo);

    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(`${API_BASE_URL}/upload.php`, {
      method: 'POST',
      body: formData,
      headers
    });
    return res.json();
  }
}

export const api = new ApiService();
