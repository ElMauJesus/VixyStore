import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Bike, 
  Store, 
  LayoutDashboard, 
  Layers, 
  RefreshCw, 
  Compass,
  ArrowLeft
} from 'lucide-react';
import { DeliveryProvider, useDelivery } from './context/DeliveryContext';
import { ClientApp } from './components/apps/ClientApp';
import { DriverApp } from './components/apps/DriverApp';
import { StoreApp } from './components/apps/StoreApp';
import { AdminPanel } from './components/apps/AdminPanel';
import { LiveFleetMapView } from './components/common/LiveFleetMapView';
import { PhoneFrame } from './components/common/PhoneFrame';
import { CallModal } from './components/common/CallModal';
import { LiveChatDrawer } from './components/common/LiveChatDrawer';
import { PushNotificationToast } from './components/common/PushNotificationToast';

type ViewMode = 'split' | 'cliente' | 'driver' | 'store' | 'admin' | 'mapa';

const MainAppContent: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [standalone, setStandalone] = useState<string | null>(null);
  const { tasaBcv, resetDemo, orders, client } = useDelivery();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const appParam = params.get('app') || (import.meta.env.VITE_APP_MODE as string | undefined);
      if (appParam) {
        setStandalone(appParam.toLowerCase());
      }
    }
  }, []);

  // --- MODO APLICACIÓN INDEPENDIENTE / APK NATIVO ---
  if (standalone === 'conductor' || standalone === 'driver') {
    return (
      <div className="w-screen h-screen overflow-hidden bg-neutral-900 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <DriverApp />
        </div>
        <CallModal />
      </div>
    );
  }

  if (standalone === 'cliente' || standalone === 'client') {
    return (
      <div className="w-screen h-screen overflow-hidden bg-neutral-900 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <ClientApp />
        </div>
        <CallModal />
        <PushNotificationToast />
        <LiveChatDrawer currentRole="cliente" senderName={`${client.nombre} ${client.apellido}`} />
      </div>
    );
  }

  if (standalone === 'comercio' || standalone === 'store') {
    return (
      <div className="w-screen h-screen overflow-hidden bg-neutral-900 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <StoreApp />
        </div>
        <CallModal />
      </div>
    );
  }

  if (standalone === 'admin') {
    return (
      <div className="w-screen h-screen overflow-hidden bg-[#F1F5F9] dark:bg-slate-950 flex flex-col">
        <AdminPanel />
        <CallModal />
      </div>
    );
  }

  // --- MODO ECOSISTEMA VIXY (VISTA PREVIA Y DESARROLLO) ---
  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans select-none overflow-hidden">
      {/* Top Global Bento Ecosystem Suite Navigation Bar */}
      <header className="h-16 px-4 md:px-6 bg-black border-b border-neutral-800 flex items-center justify-between shrink-0 z-30 text-white">
        {/* Brand & Hosting Label */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-purple-600/30">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tighter text-purple-400 italic flex items-center gap-1.5">
                VIXY
                <span className="text-white not-italic font-extrabold tracking-tight text-sm">SUITE</span>
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 text-[10px] font-mono border border-neutral-800">
                MySQL 8.0 • PHP 8.2 • cPanel
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest hidden sm:block">
              Superusuario: <strong className="text-amber-400 font-mono">vixydely</strong> / <span className="font-mono">123456</span>
            </p>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              viewMode === 'split'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Ver los 4 módulos interactuando simultáneamente"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Ecosistema Bento</span>
            <span className="lg:hidden">Todo</span>
          </button>

          <button
            onClick={() => setViewMode('cliente')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              viewMode === 'cliente'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-purple-300" />
            <span>Vixy Pedidos</span>
          </button>

          <button
            onClick={() => setViewMode('driver')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              viewMode === 'driver'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vixy Delivery</span>
          </button>

          <button
            onClick={() => setViewMode('store')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              viewMode === 'store'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-purple-300" />
            <span>Vixy Store</span>
          </button>

          <button
            onClick={() => setViewMode('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              viewMode === 'admin'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-purple-300" />
            <span>Panel Web</span>
          </button>

          <button
            onClick={() => setViewMode('mapa')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              viewMode === 'mapa'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Ver mapa satelital en vivo con todos los motorizados"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Mapa de Conductores</span>
            <span className="sm:hidden">Conductores</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          </button>
        </div>

        {/* Right Info: BCV Rate & Reset */}
        <div className="flex items-center gap-2.5">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-neutral-900 rounded-xl border border-neutral-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">Tasa BCV:</span>
            <span className="font-mono font-bold text-purple-400">
              Bs. {tasaBcv.toFixed(2)} / USD
            </span>
          </div>

          <button
            onClick={resetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition cursor-pointer border border-neutral-700"
            title="Reiniciar a pedido demo activo"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar Demo</span>
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <div className="flex-1 min-h-0 bg-neutral-100 dark:bg-neutral-950 relative overflow-hidden flex flex-col bg-bento-dots">
        {/* MODE 1: SPLIT SIMULTANEOUS VIEW */}
        {viewMode === 'split' && (
          <div className="flex-1 overflow-x-auto overflow-y-auto p-4 md:p-6">
            <div className="min-w-max mx-auto flex items-start justify-center gap-6 pb-6">
              {/* App 1: Cliente */}
              <PhoneFrame
                title="1. Vixy Pedidos (Cliente)"
                appName="cliente.tudominio.com"
                width="w-[360px]"
              >
                <ClientApp />
              </PhoneFrame>

              {/* App 2: Motorizado */}
              <PhoneFrame
                title="2. Vixy Delivery (Motorizado)"
                appName="delivery.tudominio.com"
                width="w-[360px]"
              >
                <DriverApp />
              </PhoneFrame>

              {/* App 3: Comercio */}
              <PhoneFrame
                title="3. Vixy Store (Comercio)"
                appName="comercio.tudominio.com"
                width="w-[360px]"
              >
                <StoreApp />
              </PhoneFrame>

              {/* App 4: Admin Web Panel Preview Window */}
              <div className="w-[660px] shrink-0 flex flex-col">
                <div className="mb-2 text-center">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide block">
                    4. Vixy Management (Web Admin)
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Subdominio: admin.tudominio.com
                  </span>
                </div>

                <div className="h-[690px] rounded-2xl overflow-hidden border-2 border-neutral-300 dark:border-neutral-800 shadow-2xl bg-white dark:bg-neutral-900 flex flex-col">
                  <AdminPanel />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: CLIENT FULL SCREEN */}
        {viewMode === 'cliente' && (
          <div className="flex-1 flex items-center justify-center p-4 bg-neutral-900/10 dark:bg-neutral-950 overflow-y-auto">
            <PhoneFrame
              title="Vixy Pedidos (Aplicación Móvil Cliente)"
              appName="cliente.tudominio.com"
              width="w-[410px]"
            >
              <ClientApp />
            </PhoneFrame>
          </div>
        )}

        {/* MODE 3: DRIVER FULL SCREEN */}
        {viewMode === 'driver' && (
          <div className="flex-1 flex items-center justify-center p-4 bg-neutral-900/10 dark:bg-neutral-950 overflow-y-auto">
            <PhoneFrame
              title="Vixy Delivery (Aplicación Móvil Motorizado)"
              appName="delivery.tudominio.com"
              width="w-[410px]"
            >
              <DriverApp />
            </PhoneFrame>
          </div>
        )}

        {/* MODE 4: STORE FULL SCREEN */}
        {viewMode === 'store' && (
          <div className="flex-1 flex items-center justify-center p-4 bg-slate-900/10 dark:bg-slate-950 overflow-y-auto">
            <PhoneFrame
              title="Vixy Store (Aplicación Móvil Comercio)"
              appName="comercio.tudominio.com"
              width="w-[410px]"
            >
              <StoreApp />
            </PhoneFrame>
          </div>
        )}

        {/* MODE 5: ADMIN FULL DESKTOP SCREEN */}
        {viewMode === 'admin' && (
          <div className="flex-1 overflow-hidden bg-[#F1F5F9] dark:bg-slate-950">
            <AdminPanel />
          </div>
        )}

        {/* MODE 6: LIVE FLEET GPS MAP FULL SCREEN */}
        {viewMode === 'mapa' && (
          <div className="flex-1 overflow-hidden bg-slate-950">
            <LiveFleetMapView />
          </div>
        )}
      </div>

      {/* Global Modals & Notifications */}
      <PushNotificationToast />
      <CallModal />
      <LiveChatDrawer currentRole="cliente" senderName={`${client.nombre} ${client.apellido}`} />
    </div>
  );
};

export default function App() {
  return (
    <DeliveryProvider>
      <MainAppContent />
    </DeliveryProvider>
  );
}
