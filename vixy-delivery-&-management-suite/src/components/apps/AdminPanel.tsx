import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Bike, 
  Store, 
  AlertTriangle, 
  Headphones, 
  FolderCheck, 
  DollarSign, 
  FileCode,
  ShieldCheck,
  LogOut,
  Bell,
  Users,
  UserCheck,
  ChevronDown,
  Wallet,
  Database,
  MessageSquare,
  Compass
} from 'lucide-react';
import { AdminDashboard } from '../admin/AdminDashboard';
import { OrdersManager } from '../admin/OrdersManager';
import { DriversManager } from '../admin/DriversManager';
import { StoresManager } from '../admin/StoresManager';
import { IncidentsManager } from '../admin/IncidentsManager';
import { LiveSupportManager } from '../admin/LiveSupportManager';
import { VerificationGallery } from '../admin/VerificationGallery';
import { PaymentConfigManager } from '../admin/PaymentConfigManager';
import { BackendCodeViewer } from '../admin/BackendCodeViewer';
import { WebUsersManager } from '../admin/WebUsersManager';
import { ActivityLogsManager } from '../admin/ActivityLogsManager';
import { RechargesManager } from '../admin/RechargesManager';
import { GlobalWalletsManager } from '../admin/GlobalWalletsManager';
import { ClaimsManager } from '../admin/ClaimsManager';
import { LiveFleetMapView } from '../common/LiveFleetMapView';
import { useDelivery } from '../../context/DeliveryContext';

export const AdminPanel: React.FC = () => {
  const { 
    incidents, 
    orders, 
    rechargeRequests,
    claims,
    currentAdminUser, 
    adminUsers, 
    switchAdminUser, 
    adminIsLoggedIn, 
    loginAdmin, 
    logoutAdmin, 
    changeAdminPassword,
    activityLogs,
    allDrivers
  } = useDelivery();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('vixydely');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [loginError, setLoginError] = useState('');

  // Estados para cambio obligatorio de contraseña en primer inicio de sesión
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [confirmPasswordVal, setConfirmPasswordVal] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  const unresolvedIncidentsCount = incidents.filter(i => i.estado !== 'resuelta').length;
  const activeOrdersCount = orders.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado').length;
  const pendingRechargesCount = rechargeRequests.filter(r => r.estado === 'pendiente').length;
  const pendingClaimsCount = claims.filter(c => c.estado === 'en_espera').length;

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard & Radar', icon: LayoutDashboard },
    { id: 'mapa_conductores', label: 'Mapa de Conductores', icon: Compass, badge: allDrivers.length, badgeColor: 'bg-emerald-600' },
    { id: 'recargas', label: 'Autorización Recarga & Vault', icon: Wallet, badge: pendingRechargesCount, badgeColor: 'bg-purple-600' },
    { id: 'custodia', label: 'Custodia & Wallets', icon: Database },
    { id: 'reclamos', label: 'Reclamos y Quejas', icon: MessageSquare, badge: pendingClaimsCount, badgeColor: 'bg-purple-600' },
    { id: 'pedidos', label: 'Gestión de Pedidos', icon: ShoppingBag, badge: activeOrdersCount },
    { id: 'conductores', label: 'Conductores (Carnet Vixy)', icon: Bike },
    { id: 'comercios', label: 'Comercios (Lista & Rubros)', icon: Store },
    { id: 'incidencias', label: 'Incidencias en Ruta', icon: AlertTriangle, badge: unresolvedIncidentsCount, badgeColor: 'bg-red-500' },
    { id: 'soporte', label: 'Mesa de Soporte en Vivo', icon: Headphones },
    { id: 'pagos', label: 'Tasa BCV & Tarifas', icon: DollarSign },
    { id: 'logs', label: 'Log de Actividades', icon: ShieldCheck, badge: activityLogs.length, badgeColor: 'bg-purple-700' },
    { id: 'usuarios_web', label: 'Usuarios Web & RBAC', icon: Users, badge: adminUsers.length, badgeColor: 'bg-purple-900' },
    { id: 'backend', label: 'Código PHP & MySQL', icon: FileCode },
  ];

  // Filter tabs dynamically based on user's permitted tabs in MySQL
  const allowedMenuItems = allMenuItems.filter(item => 
    currentAdminUser.pestanasPermitidas.includes(item.id) ||
    (item.id === 'mapa_conductores' && currentAdminUser.pestanasPermitidas.includes('mapa_flota'))
  );

  // If current active tab is not allowed for the switched user, fallback to the first allowed tab
  useEffect(() => {
    const isAllowed = currentAdminUser.pestanasPermitidas.includes(activeTab) ||
      (activeTab === 'mapa_conductores' && currentAdminUser.pestanasPermitidas.includes('mapa_flota'));
    if (!isAllowed) {
      if (allowedMenuItems.length > 0) {
        setActiveTab(allowedMenuItems[0].id);
      }
    }
  }, [currentAdminUser, activeTab, allowedMenuItems]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = loginAdmin(loginIdentifier, loginPassword);
    if (!res.success) {
      setLoginError(res.error || 'Credenciales de acceso inválidas');
    }
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (!newPasswordVal || newPasswordVal.length < 6) {
      setPasswordChangeError('La contraseña debe contener al menos 6 caracteres.');
      return;
    }

    if (newPasswordVal !== confirmPasswordVal) {
      setPasswordChangeError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    const res = changeAdminPassword(currentAdminUser.id, newPasswordVal);
    if (res.success) {
      setPasswordChangeSuccess('¡Contraseña actualizada con éxito! Vigencia de 90 días activada.');
      setNewPasswordVal('');
      setConfirmPasswordVal('');
    } else {
      setPasswordChangeError(res.error || 'Error al actualizar contraseña.');
    }
  };

  // If admin is not logged in, show sleek login portal
  if (!adminIsLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-full bg-slate-950 p-4 font-sans text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black tracking-tighter text-orange-500 italic">
              VIXY <span className="text-white not-italic">ADMIN</span>
            </h1>
            <p className="text-xs text-slate-400">
              Panel de Control Centralizado y Gestión RBAC • Caracas
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Autenticación Segura MySQL / PHP</span>
            </div>
          </div>

          {loginError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Usuario o Correo Electrónico</label>
              <input
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="vixydely"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-hidden focus:border-orange-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Contraseña de Acceso</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="123456"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-hidden focus:border-orange-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
            >
              Acceder al Panel Web
            </button>
          </form>

          {/* Superuser credentials info */}
          <div className="pt-3 border-t border-slate-800/80 text-center text-[11px] text-slate-400">
            <span className="font-mono text-slate-300">Superusuario: <strong>vixydely</strong> / Clave: <strong>123456</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // Si el usuario tiene la bandera `debeCambiarClave === true`, se le fuerza a cambiar la clave
  if (currentAdminUser.debeCambiarClave) {
    return (
      <div className="flex items-center justify-center min-h-full bg-slate-950 p-4 font-sans text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-orange-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto border border-orange-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">
              Cambio Obligatorio de Contraseña
            </h2>
            <p className="text-xs text-slate-400">
              Hola, <strong className="text-white">{currentAdminUser.nombre}</strong>. Este es tu primer inicio de sesión o tu clave provisional ha expirado.
            </p>
          </div>

          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs text-orange-400 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span>🔐 Política de Seguridad Vixy:</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Debes establecer una nueva contraseña personal. La nueva contraseña tendrá una <strong>vigencia máxima de 90 días</strong>, tras los cuales el sistema solicitará una renovación periódica.
            </p>
          </div>

          {passwordChangeError && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
              {passwordChangeError}
            </div>
          )}

          {passwordChangeSuccess && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400">
              {passwordChangeSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordChangeSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Nueva Contraseña</label>
              <input
                type="password"
                required
                value={newPasswordVal}
                onChange={(e) => setNewPasswordVal(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-hidden focus:border-orange-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                required
                value={confirmPasswordVal}
                onChange={(e) => setConfirmPasswordVal(e.target.value)}
                placeholder="Repite tu nueva contraseña"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-hidden focus:border-orange-500 font-mono"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={logoutAdmin}
                className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition"
              >
                Cerrar Sesión
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                Guardar y Acceder
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#F1F5F9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Bento Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col shrink-0 border-r border-slate-800">
        {/* Brand */}
        <div className="p-6 border-b border-slate-700/80">
          <h1 className="text-2xl font-bold tracking-tighter text-orange-500 italic">
            VIXY <span className="text-white not-italic font-bold">MANAGEMENT</span>
          </h1>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              Centralized Admin v2.2
            </p>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold uppercase">
              RBAC Activo
            </span>
          </div>
        </div>

        {/* User Role Card inside Sidebar */}
        <div className="p-3 mx-3 my-2 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src={currentAdminUser.avatarUrl} 
              alt={currentAdminUser.nombre} 
              className="w-8 h-8 rounded-lg object-cover border border-orange-500/50 shrink-0" 
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {currentAdminUser.nombre}
              </p>
              <span className="text-[10px] text-orange-400 uppercase font-mono block">
                {currentAdminUser.nivelAcceso.replace('_', ' ')}
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
            {allowedMenuItems.length} tabs
          </span>
        </div>

        {/* Navigation Menu (Filtered by user permissions) */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-3 py-1">
            Pestañas Permitidas
          </div>
          {allowedMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs uppercase tracking-wide font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  {isActive ? (
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shrink-0" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shrink-0 ${item.badgeColor || 'bg-orange-600'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Status & Logout Footer */}
        <div className="p-3 border-t border-slate-700/80 bg-slate-900/50 space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xs uppercase text-white shadow-xs shrink-0">
              JWT
            </div>
            <div className="text-xs min-w-0">
              <p className="font-bold text-white truncate">Rol: {currentAdminUser.nivelAcceso}</p>
              <p className="text-slate-400 text-[10px] truncate">{currentAdminUser.departamento}</p>
            </div>
          </div>

          <button
            onClick={logoutAdmin}
            className="w-full py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-red-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F1F5F9] dark:bg-slate-950">
        {/* Top Header Bar */}
        <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 shadow-2xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {allMenuItems.find(m => m.id === activeTab)?.label || 'Panel de Control'}
            </h2>
            <span className="text-[11px] text-slate-400">
              Acceso RBAC con MySQL 8.0 & PHP • Sesión: <strong className="text-slate-600 dark:text-slate-300">{currentAdminUser.nombre}</strong> ({currentAdminUser.nivelAcceso})
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Switch User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer transition"
              >
                <img 
                  src={currentAdminUser.avatarUrl} 
                  alt={currentAdminUser.nombre} 
                  className="w-5 h-5 rounded-full object-cover" 
                />
                <span>Cambiar Rol ({currentAdminUser.nombre.split(' ')[0]})</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 space-y-1">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Cambiar de Usuario Administrativo</p>
                    <p className="text-[11px] text-slate-500">Prueba los diferentes niveles de acceso y pestañas en tiempo real:</p>
                  </div>

                  {adminUsers.map(u => {
                    const isSelected = u.id === currentAdminUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchAdminUser(u.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full p-2 rounded-xl text-left text-xs flex items-center justify-between transition cursor-pointer ${
                          isSelected 
                            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={u.avatarUrl} alt={u.nombre} className="w-7 h-7 rounded-lg object-cover" />
                          <div>
                            <p className="leading-tight font-bold">{u.nombre}</p>
                            <span className="text-[10px] text-slate-400">{u.nivelAcceso} • {u.pestanasPermitidas.length} pestañas</span>
                          </div>
                        </div>
                        {isSelected && <span className="text-orange-500 text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-500/15 text-slate-600 dark:text-slate-300 hover:text-red-500 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Cerrar Sesión del Panel Web"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </header>

        {/* Tab View Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-100 dark:bg-neutral-950">
          {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveTab} />}
          {(activeTab === 'mapa_conductores' || activeTab === 'mapa_flota') && <LiveFleetMapView />}
          {activeTab === 'recargas' && <RechargesManager />}
          {activeTab === 'custodia' && <GlobalWalletsManager />}
          {activeTab === 'reclamos' && <ClaimsManager />}
          {activeTab === 'pedidos' && <OrdersManager />}
          {activeTab === 'conductores' && <DriversManager />}
          {activeTab === 'comercios' && <StoresManager />}
          {activeTab === 'incidencias' && <IncidentsManager />}
          {activeTab === 'soporte' && <LiveSupportManager />}
          {activeTab === 'verificaciones' && <VerificationGallery />}
          {activeTab === 'pagos' && <PaymentConfigManager />}
          {activeTab === 'logs' && <ActivityLogsManager />}
          {activeTab === 'usuarios_web' && <WebUsersManager />}
          {activeTab === 'backend' && <BackendCodeViewer />}
        </div>
      </main>
    </div>
  );
};

