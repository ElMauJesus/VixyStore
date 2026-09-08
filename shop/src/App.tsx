import React, { useState, useEffect } from 'react';
import { 
  Store, 
  LayoutDashboard, 
  Compass, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { DeliveryProvider, useDelivery } from './context/DeliveryContext';
import { StoreApp } from './components/apps/StoreApp';
import { AdminPanel } from './components/apps/AdminPanel';
import { LiveFleetMapView } from './components/common/LiveFleetMapView';
import { CallModal } from './components/common/CallModal';
import { PushNotificationToast } from './components/common/PushNotificationToast';

type WebTabMode = 'comercio' | 'mapa' | 'admin';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WebTabMode>('comercio');
  const { tasaBcv, resetDemo } = useDelivery();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') || params.get('view');
      if (tabParam === 'admin') setActiveTab('admin');
      else if (tabParam === 'mapa' || tabParam === 'map') setActiveTab('mapa');
      else if (tabParam === 'comercio' || tabParam === 'store') setActiveTab('comercio');
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen h-screen w-screen bg-slate-900 text-slate-100 font-sans select-none overflow-hidden">
      {/* Barra de Navegación Web Superior */}
      <header className="h-16 px-4 md:px-8 bg-[#130924] border-b border-purple-900/40 flex items-center justify-between shrink-0 z-30 shadow-xl">
        {/* Brand & Descripción */}
        <div className="flex items-center gap-3">
          <img
            src="./logo/logovixycomercios.png"
            alt="Vixy Comercios"
            className="h-9 md:h-10 w-auto object-contain drop-shadow"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.src.endsWith('/logovixycomercios.png')) {
                target.src = './logovixycomercios.png';
              }
            }}
          />
          <div className="hidden sm:block border-l border-purple-800/40 pl-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 text-[10px] font-bold border border-purple-700/50 uppercase tracking-wider">
                Portal Comercios Web
              </span>
            </div>
            <p className="text-[11px] text-purple-300/60 hidden md:block">
              Gestión comercial, catálogo, comanda de pedidos y despacho logístico
            </p>
          </div>
        </div>

        {/* Pestañas de Navegación Web */}
        <nav className="flex items-center bg-[#1e1035] p-1.5 rounded-2xl border border-purple-900/50 text-xs shadow-inner">
          <button
            onClick={() => setActiveTab('comercio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'comercio'
                ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white shadow-md shadow-purple-600/40'
                : 'text-purple-300/70 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <Store className="w-4 h-4 text-purple-200" />
            <span>Mi Comercio</span>
          </button>

          <button
            onClick={() => setActiveTab('mapa')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'mapa'
                ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white shadow-md shadow-purple-600/40'
                : 'text-purple-300/70 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Radares en Vivo</span>
            <span className="sm:hidden">Mapa</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white shadow-md shadow-purple-600/40'
                : 'text-purple-300/70 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-300" />
            <span>Administración</span>
          </button>
        </nav>

        {/* Info lateral derecha: Tasa BCV y Enlaces del Ecosistema */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#1e1035] rounded-xl border border-purple-900/50 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-purple-300/70 uppercase text-[10px] tracking-wider font-semibold">Tasa BCV:</span>
            <span className="font-mono font-bold text-purple-200">
              Bs. {(tasaBcv ?? 78.50).toFixed(2)}
            </span>
          </div>

          <a
            href="/store/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 text-xs font-bold transition border border-purple-800/40"
            title="Ir a Vixy Store (Exclusivo Conductores)"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden md:inline">Vixy Store</span>
            <ExternalLink className="w-3 h-3 text-purple-400" />
          </a>

          <button
            onClick={resetDemo}
            className="p-2 rounded-xl bg-[#1e1035] hover:bg-purple-900/50 text-purple-300 hover:text-white transition border border-purple-900/50 cursor-pointer"
            title="Sincronizar datos con la Base de Datos"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Contenedor Web Principal (Pantalla Completa Responsiva, sin marcos de teléfono) */}
      <main className="flex-1 min-h-0 relative overflow-hidden flex flex-col bg-slate-950">
        {/* PESTAÑA 1: PANEL WEB DE COMERCIO (STORE APP) */}
        {activeTab === 'comercio' && (
          <div className="flex-1 overflow-y-auto w-full">
            <StoreApp />
          </div>
        )}

        {/* PESTAÑA 2: MAPA SATELITAL DE FLOTA EN PANTALLA COMPLETA */}
        {activeTab === 'mapa' && (
          <div className="flex-1 overflow-hidden w-full h-full bg-slate-950">
            <LiveFleetMapView />
          </div>
        )}

        {/* PESTAÑA 3: PANEL ADMINISTRATIVO GENERAL */}
        {activeTab === 'admin' && (
          <div className="flex-1 overflow-y-auto w-full h-full bg-[#F1F5F9] dark:bg-slate-950">
            <AdminPanel />
          </div>
        )}
      </main>

      {/* Notificaciones y Modales */}
      <PushNotificationToast />
      <CallModal />
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Vixy Error Boundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 font-sans select-none">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black">Vixy Delivery</h2>
            <p className="text-xs text-slate-400">
              Se detectó un cambio en la estructura de datos del servidor. Hemos protegido tu sesión.
            </p>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-400 font-mono text-left overflow-auto max-h-32">
              {this.state.error?.message || 'Error de sincronización con la base de datos'}
            </div>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('vixy_store_session');
                } catch {}
                window.location.reload();
              }}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-purple-600/30"
            >
              Reiniciar y Sincronizar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <DeliveryProvider>
        <MainAppContent />
      </DeliveryProvider>
    </ErrorBoundary>
  );
}
