'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Plus,
  Trash2,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { storeApi } from '@/lib/api';
import { Order, Address } from '@/types/store';
import { formatPrice, formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddingAddr, setIsAddingAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({
    address_line1: '',
    city: '',
    state: '',
    postal_code: '1010',
  });

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    occupation: '',
    equipment_info: '',
    password: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/cuenta');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        occupation: user.occupation || '',
        equipment_info: user.equipment_info || '',
        password: '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'orders') {
      setLoadingOrders(true);
      storeApi.getUserOrders()
        .then((res) => {
          if (res.success && res.data) {
            setOrders(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'addresses') {
      setLoadingAddresses(true);
      storeApi.getAddresses()
        .then((res) => {
          if (res.success && res.data) {
            setAddresses(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingAddresses(false));
    }
  }, [isAuthenticated, activeTab]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.address_line1 || !newAddr.city || !newAddr.state) return;

    const res = await storeApi.createAddress({
      ...newAddr,
      country: 'Venezuela',
      is_default: addresses.length === 0 ? 1 : 0,
    });

    if (res.success) {
      setIsAddingAddr(false);
      setNewAddr({ address_line1: '', city: '', state: '', postal_code: '1010' });
      const addrRes = await storeApi.getAddresses();
      if (addrRes.success && addrRes.data) setAddresses(addrRes.data);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('¿Eliminar esta dirección de envío?')) return;
    const res = await storeApi.deleteAddress(id);
    if (res.success) {
      setAddresses(addresses.filter((a) => a.id !== id));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    const payload: any = {
      first_name: profileForm.first_name.trim(),
      last_name: profileForm.last_name.trim(),
      phone: profileForm.phone.trim(),
      occupation: profileForm.occupation.trim() || null,
      equipment_info: profileForm.equipment_info.trim() || null,
    };

    if (profileForm.password.trim()) {
      if (profileForm.password.length < 8) {
        setProfileErrorMsg('La nueva contraseña debe tener al menos 8 caracteres.');
        setSavingProfile(false);
        return;
      }
      payload.password = profileForm.password;
    }

    const res = await storeApi.updateProfile(payload);
    setSavingProfile(false);

    if (res.success) {
      setProfileSuccessMsg('Perfil actualizado correctamente.');
      await refreshProfile();
      setProfileForm((prev) => ({ ...prev, password: '' }));
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    } else {
      setProfileErrorMsg(res.message || 'Error al guardar los cambios.');
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" text="Cargando cuenta de usuario..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900">
            Mi Cuenta
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestiona tus pedidos, direcciones de entrega y datos de tus vehículos.
          </p>
        </div>
        <div className="text-xs bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-xl font-bold self-start sm:self-auto">
          {user?.first_name} {user?.last_name}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'orders'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mis Pedidos ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'addresses'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Direcciones</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'profile'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Datos Personales</span>
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {loadingOrders ? (
            <div className="py-16">
              <LoadingSpinner size="md" text="Cargando pedidos..." />
            </div>
          ) : orders.length > 0 ? (
            orders.map((order) => {
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white border border-purple-100 rounded-2xl overflow-hidden shadow-xs"
                >
                  <div
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-purple-50/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black font-mono text-purple-900">
                          {order.order_number}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                            order.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-purple-100 text-purple-900'
                          }`}
                        >
                          {order.status === 'delivered' ? 'Entregado' : order.status === 'shipped' ? 'Enviado' : order.status === 'cancelled' ? 'Cancelado' : 'En proceso'}
                        </span>

                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                            order.payment_status === 'paid'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {order.payment_status === 'paid' ? 'Pago Verificado' : 'Pago en Revisión'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        <span>{formatDate(order.created_at)}</span>
                        <span>•</span>
                        <span className="uppercase font-semibold text-slate-700">
                          {order.payment_method?.replace('_', ' ')}
                        </span>
                        {order.payment_reference && (
                          <span>(Ref: {order.payment_reference})</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block">Total</span>
                        <span className="text-sm sm:text-base font-black text-slate-900">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                      <div className="text-purple-600">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Items */}
                  {isExpanded && order.items && order.items.length > 0 && (
                    <div className="border-t border-purple-100 bg-purple-50/30 p-4 sm:p-5 divide-y divide-purple-100/80">
                      <h4 className="text-xs font-bold text-purple-900 mb-2 uppercase tracking-wider">
                        Repuestos en este pedido
                      </h4>
                      {order.items.map((it) => (
                        <div key={it.id} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900">{it.product_name}</span>
                            <span className="text-slate-400 block text-[10px]">
                              {it.quantity} unidades × {formatPrice(it.unit_price)}
                            </span>
                          </div>
                          <span className="font-black text-slate-900">
                            {formatPrice(it.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white border border-purple-100 rounded-3xl p-6">
              <Package className="w-12 h-12 text-purple-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900 mb-1">Aún no tienes compras</h3>
              <p className="text-xs text-slate-500 mb-4">
                Tus pedidos aparecerán listados aquí con seguimiento en vivo.
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-5 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl"
              >
                Comenzar a comprar
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Direcciones de Despacho</h3>
            {!isAddingAddr && (
              <button
                onClick={() => setIsAddingAddr(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Dirección</span>
              </button>
            )}
          </div>

          {isAddingAddr && (
            <form onSubmit={handleCreateAddress} className="bg-white border border-purple-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-purple-900">Agregar Dirección de Envío</h4>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dirección completa *</label>
                <input
                  type="text"
                  required
                  placeholder="Calle, urbanización, edificio o local"
                  value={newAddr.address_line1}
                  onChange={(e) => setNewAddr({ ...newAddr, address_line1: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ciudad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Caracas"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Estado *</label>
                  <input
                    type="text"
                    required
                    placeholder="Distrito Capital"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingAddr(false)}
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {loadingAddresses ? (
            <LoadingSpinner size="md" text="Cargando..." />
          ) : addresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-white border border-purple-100 rounded-2xl p-4 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">{addr.city}, {addr.state}</span>
                      {addr.is_default ? (
                        <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          Principal
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-600">{addr.address_line1}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Venezuela</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No tienes direcciones registradas aún.</p>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white border border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Información Personal & Vehículos</h3>

          {profileSuccessMsg && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 text-purple-900 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {profileErrorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{profileErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Apellido</label>
                <input
                  type="text"
                  required
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  placeholder="0414-1234567"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Ocupación</label>
                <input
                  type="text"
                  placeholder="Mecánico, Conductor..."
                  value={profileForm.occupation}
                  onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Información de Vehículo(s) o Motocicleta
              </label>
              <input
                type="text"
                placeholder="Ej: Toyota Corolla 2012 / Bera Socialista 150cc"
                value={profileForm.equipment_info}
                onChange={(e) => setProfileForm({ ...profileForm, equipment_info: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nueva Contraseña (opcional)
              </label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres si deseas cambiarla"
                value={profileForm.password}
                onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-purple-600/25 transition-all active:scale-95 disabled:opacity-50"
            >
              {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
