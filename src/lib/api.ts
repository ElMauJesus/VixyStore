import { ApiResponse, Product, Category, Supplier, Order, Address, WarrantyLog, InventorySummary, InventoryLog, User } from '@/types/store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';

function getApiBase(): string {
  if (API_BASE_URL) return API_BASE_URL;
  if (typeof window === 'undefined') return '/store/api';
  return window.location.pathname.startsWith('/store') ? '/store/api' : '/api';
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vixy_auth_token');
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vixy_auth_token', token);
  }
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vixy_auth_token');
    localStorage.removeItem('vixy_user');
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Only add Content-Type if there's a body and it's not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Auth-Token'] = token;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${getApiBase()}${cleanEndpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || `Error del servidor (${res.status})`,
      };
    }

    return data || { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Error de conexión con el servidor',
    };
  }
}

// -------------------------------------------------------------
// PUBLIC STORE APIS
// -------------------------------------------------------------

export const storeApi = {
  // Productos
  getProducts: (params?: {
    categoria?: number | string;
    busqueda?: string;
    pagina?: number;
    orden?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.categoria) query.set('categoria', String(params.categoria));
    if (params?.busqueda) query.set('busqueda', params.busqueda);
    if (params?.pagina) query.set('pagina', String(params.pagina));
    if (params?.orden) query.set('orden', params.orden);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<Product[]>(`/productos.php${queryString}`);
  },

  getProductDetail: (idOrSlug: { id?: number; slug?: string }) => {
    const query = new URLSearchParams();
    if (idOrSlug.id) query.set('id', String(idOrSlug.id));
    if (idOrSlug.slug) query.set('slug', idOrSlug.slug);
    return request<{ producto: Product; imagenes: { image_url: string; is_primary: number; display_order: number }[] }>(
      `/producto-detalle.php?${query.toString()}`
    );
  },

  // Categorias
  getCategories: () => {
    return request<Category[]>('/categorias.php');
  },

  // Auth
  login: (credentials: { email: string; password: string }) => {
    return request<{ user: User; token: string }>('/login.php', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
  }) => {
    return request<{ user: User; token: string }>('/register.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  logout: () => {
    return request('/logout.php', { method: 'POST' });
  },

  // Carrito (Authenticated)
  getCart: () => {
    return request<{ items: any[]; total_items: number; subtotal: number }>('/carrito.php');
  },

  addToCart: (productId: number, quantity: number = 1) => {
    return request('/carrito.php', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  updateCartItem: (itemId: number | string, quantity: number) => {
    return request('/carrito.php', {
      method: 'PUT',
      body: JSON.stringify({ item_id: itemId, quantity }),
    });
  },

  removeFromCart: (itemId: number | string) => {
    return request(`/carrito.php?item_id=${itemId}`, {
      method: 'DELETE',
    });
  },

  // Checkout
  checkout: (data: {
    shipping_address_id?: number;
    payment_method: string;
    payment_reference?: string;
    notes?: string;
  }) => {
    return request<{ order_id: number; order_number: string; total: number }>('/checkout.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Direcciones
  getAddresses: () => {
    return request<Address[]>('/direcciones.php');
  },

  createAddress: (data: Omit<Address, 'id'>) => {
    return request<{ address_id: number }>('/direcciones.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAddress: (data: Partial<Address> & { id: number }) => {
    return request('/direcciones.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAddress: (id: number) => {
    return request(`/direcciones.php?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Perfil y Pedidos de cliente
  getProfile: () => {
    return request<User>('/perfil.php?action=profile');
  },

  getUserOrders: () => {
    return request<Order[]>('/perfil.php?action=orders');
  },

  updateProfile: (data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    occupation?: string;
    equipment_info?: string;
    password?: string;
  }) => {
    return request('/perfil.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// -------------------------------------------------------------
// ADMIN ERP APIS
// -------------------------------------------------------------

export const adminApi = {
  // Productos Admin
  getProducts: (params?: { busqueda?: string; categoria?: number; low_stock?: boolean; pagina?: number }) => {
    const query = new URLSearchParams();
    if (params?.busqueda) query.set('busqueda', params.busqueda);
    if (params?.categoria) query.set('categoria', String(params.categoria));
    if (params?.low_stock) query.set('low_stock', '1');
    if (params?.pagina) query.set('pagina', String(params.pagina));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Product[]>(`/admin/productos.php${qs}`);
  },

  createProduct: (data: any) => {
    return request<{ product_id: number }>('/admin/productos.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProduct: (data: any) => {
    return request('/admin/productos.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProduct: (id: number) => {
    return request(`/admin/productos.php?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Inventario Admin
  getInventorySummary: () => {
    return request<InventorySummary>('/admin/inventario.php');
  },

  addInventoryMovement: (data: {
    product_id: number;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    quantity: number;
    reason: string;
  }) => {
    return request('/admin/inventario.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Proveedores Admin
  getSuppliers: (params?: { busqueda?: string; activo?: number }) => {
    const query = new URLSearchParams();
    if (params?.busqueda) query.set('busqueda', params.busqueda);
    if (params?.activo !== undefined) query.set('activo', String(params.activo));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Supplier[]>(`/admin/proveedores.php${qs}`);
  },

  createSupplier: (data: Partial<Supplier>) => {
    return request<{ supplier_id: number }>('/admin/proveedores.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSupplier: (data: Partial<Supplier> & { id: number }) => {
    return request('/admin/proveedores.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteSupplier: (id: number) => {
    return request(`/admin/proveedores.php?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Pedidos Admin
  getOrders: (params?: { status?: string; payment_status?: string; pagina?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.payment_status) query.set('payment_status', params.payment_status);
    if (params?.pagina) query.set('pagina', String(params.pagina));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Order[]>(`/admin/pedidos.php${qs}`);
  },

  getOrderDetail: (id: number) => {
    return request<Order>(`/admin/pedidos.php?id=${id}`);
  },

  updateOrderStatus: (id: number, data: { status?: string; payment_status?: string; notes?: string }) => {
    return request('/admin/pedidos.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  },

  // Fichas de Garantía
  getWarrantyLogs: (params?: { pagina?: number }) => {
    const query = new URLSearchParams();
    if (params?.pagina) query.set('pagina', String(params.pagina));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<WarrantyLog[]>(`/fichas-garantia.php${qs}`);
  },

  createWarrantyLog: (data: {
    product_id: number;
    supplier_id: number;
    failure_reason: string;
    claim_status?: string;
  }) => {
    return request('/fichas-garantia.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateWarrantyLog: (data: {
    id: number;
    claim_status?: string;
    supplier_resolution?: string;
  }) => {
    return request('/fichas-garantia.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Usuarios Admin
  getUsers: () => {
    return request<User[]>('/admin/usuarios.php');
  },
};
