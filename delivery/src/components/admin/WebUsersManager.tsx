import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Key, 
  Lock, 
  UserCheck, 
  Filter, 
  CheckSquare, 
  Square,
  Sparkles,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { AdminNivelAcceso, AdminUser } from '../../types/delivery';

const ALL_TABS: { id: string; label: string; description: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard & Radar', description: 'Métricas generales, mapa satelital y estadísticas', icon: '📊' },
  { id: 'pedidos', label: 'Gestión de Pedidos', description: 'Monitoreo de flujo, estados y confirmación', icon: '🛍️' },
  { id: 'conductores', label: 'Padrón Motorizados (VE)', description: 'Fichas legales INTT, RCV y datos de motos', icon: '🛵' },
  { id: 'comercios', label: 'Comercios (Vixy Store)', description: 'Catálogos, menú, coordenadas y cobros', icon: '🏪' },
  { id: 'incidencias', label: 'Incidencias en Ruta', description: 'Resolución de contratiempos y disputas', icon: '⚠️' },
  { id: 'soporte', label: 'Soporte en Vivo', description: 'Atención al cliente, mensajería y llamadas', icon: '🎧' },
  { id: 'verificaciones', label: 'Galería de Entregas', description: 'Fotos de comprobante en uploads/verificaciones', icon: '📸' },
  { id: 'pagos', label: 'Tasa BCV & Tarifas', description: 'Ajuste de tasa oficial y márgenes de entrega', icon: '💵' },
  { id: 'usuarios_web', label: 'Usuarios Web & RBAC', description: 'Gestión de accesos, roles y permisos por pestaña', icon: '👥' },
  { id: 'backend', label: 'Código PHP & MySQL', description: 'Archivos Namecheap, consultas SQL y arquitectura', icon: '💾' },
];

export const WebUsersManager: React.FC = () => {
  const { 
    adminUsers, 
    currentAdminUser, 
    switchAdminUser, 
    addAdminUser, 
    updateAdminUser, 
    deleteAdminUser 
  } = useDelivery();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNivelFilter, setSelectedNivelFilter] = useState<string>('todos');

  // Form State
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [usuario, setUsuario] = useState('');
  const [passwordInicial, setPasswordInicial] = useState('123456');
  const [departamento, setDepartamento] = useState('');
  const [nivelAcceso, setNivelAcceso] = useState<AdminNivelAcceso>('operador');
  const [pestanasSeleccionadas, setPestanasSeleccionadas] = useState<string[]>([
    'dashboard', 'pedidos', 'incidencias', 'soporte'
  ]);

  const handleSelectRolePreset = (rol: AdminNivelAcceso) => {
    setNivelAcceso(rol);
    if (rol === 'super_admin') {
      setPestanasSeleccionadas(ALL_TABS.map(t => t.id));
    } else if (rol === 'operador') {
      setPestanasSeleccionadas(['dashboard', 'pedidos', 'conductores', 'comercios', 'incidencias', 'verificaciones']);
    } else if (rol === 'finanzas') {
      setPestanasSeleccionadas(['dashboard', 'pedidos', 'comercios', 'pagos']);
    } else if (rol === 'soporte') {
      setPestanasSeleccionadas(['dashboard', 'pedidos', 'incidencias', 'soporte']);
    } else if (rol === 'auditor') {
      setPestanasSeleccionadas(['dashboard', 'verificaciones', 'conductores', 'backend']);
    }
  };

  const toggleTabSelection = (tabId: string) => {
    setPestanasSeleccionadas(prev => 
      prev.includes(tabId) ? prev.filter(t => t !== tabId) : [...prev, tabId]
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    addAdminUser({
      nombre: nombre.trim(),
      email: email.trim(),
      username: usuario.trim() || email.split('@')[0],
      password: passwordInicial.trim() || '123456',
      departamento: departamento.trim() || 'Operaciones Web',
      nivelAcceso,
      pestanasPermitidas: pestanasSeleccionadas.length > 0 ? pestanasSeleccionadas : ['dashboard'],
      activo: true,
      debeCambiarClave: true,
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`
    });

    setNombre('');
    setEmail('');
    setUsuario('');
    setPasswordInicial('123456');
    setDepartamento('');
    setShowCreateModal(false);
  };

  const filteredUsers = selectedNivelFilter === 'todos' 
    ? adminUsers 
    : adminUsers.filter(u => u.nivelAcceso === selectedNivelFilter);

  return (
    <div className="space-y-6">
      {/* Header Bento Block */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              Seguridad & RBAC MySQL
            </span>
            <span className="text-xs text-slate-400 font-mono">Tabla: usuarios_administracion_web</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Usuarios del Panel Administrativo Web
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Control de acceso basado en roles (RBAC). Cada usuario tiene asignadas pestañas específicas en JSON que determinan dinámicamente su vista en la suite.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Usuario Web</span>
          </button>
        </div>
      </div>

      {/* Quick Role Switcher Banner to Test Access Levels */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={currentAdminUser.avatarUrl} 
                alt={currentAdminUser.nombre} 
                className="w-11 h-11 rounded-xl object-cover border-2 border-orange-500" 
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-white">Sesión Activa: {currentAdminUser.nombre}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  {currentAdminUser.nivelAcceso.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pestañas visibles en tu sidebar ({currentAdminUser.pestanasPermitidas.length}):{' '}
                <span className="text-slate-300 font-mono">
                  {currentAdminUser.pestanasPermitidas.join(', ')}
                </span>
              </p>
            </div>
          </div>

          {/* Switcher Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Probar como:</span>
            {adminUsers.map(u => {
              const isSelected = u.id === currentAdminUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => switchAdminUser(u.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-xs font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title={`Cambiar a ${u.nombre} (${u.nivelAcceso})`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{u.nombre.split(' ')[0]}</span>
                  <span className="text-[9px] opacity-70">({u.nivelAcceso})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs text-slate-400 font-medium">Filtrar por nivel:</span>
        {['todos', 'super_admin', 'operador', 'finanzas', 'soporte', 'auditor'].map(lvl => (
          <button
            key={lvl}
            onClick={() => setSelectedNivelFilter(lvl)}
            className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
              selectedNivelFilter === lvl
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {lvl.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Bento Grid Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => {
          const isCurrentUser = user.id === currentAdminUser.id;
          return (
            <div
              key={user.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition shadow-xs flex flex-col justify-between ${
                isCurrentUser 
                  ? 'border-2 border-orange-500 ring-4 ring-orange-500/10' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.nombre}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {user.nombre}
                      </h3>
                      <p className="text-xs text-orange-500 font-mono font-bold">@{user.username || user.email.split('@')[0]}</p>
                      <p className="text-[11px] text-slate-400">{user.email}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {user.debeCambiarClave ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[9px] font-bold font-mono">
                            ⚠️ Debe cambiar clave en 1er login (90d)
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[9px] font-mono">
                            Vence: {user.fechaVencimientoClave || '90 días'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    user.nivelAcceso === 'super_admin' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' :
                    user.nivelAcceso === 'operador' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                    user.nivelAcceso === 'finanzas' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                    user.nivelAcceso === 'soporte' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                    'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                  }`}>
                    {user.nivelAcceso.replace('_', ' ')}
                  </span>
                </div>

                {/* Permitted Tabs Tags */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Pestañas Autorizadas ({user.pestanasPermitidas.length}/{ALL_TABS.length}):
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {ALL_TABS.map(tab => {
                      const isAllowed = user.pestanasPermitidas.includes(tab.id);
                      return (
                        <span
                          key={tab.id}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                            isAllowed
                              ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-40 line-through'
                          }`}
                          title={tab.label}
                        >
                          {tab.icon} {tab.label.split(' ')[0]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => switchAdminUser(user.id)}
                  disabled={isCurrentUser}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isCurrentUser
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 cursor-default'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{isCurrentUser ? 'Usuario Actual' : 'Iniciar Sesión'}</span>
                </button>

                {adminUsers.length > 1 && (
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Eliminar usuario ${user.nombre}?`)) {
                        deleteAdminUser(user.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create User with RBAC Permissions */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Registrar Nuevo Usuario Administrativo Web
                </h3>
                <p className="text-xs text-slate-400">
                  Se guardará en la tabla MySQL <code className="text-orange-500">usuarios_administracion_web</code>
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Laura Morales"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="laura.morales@vixy.com"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Usuario (Login / Backend)</label>
                  <input
                    type="text"
                    required
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="Ej: lmorales"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Contraseña Inicial (Temporal)</label>
                  <input
                    type="text"
                    required
                    value={passwordInicial}
                    onChange={(e) => setPasswordInicial(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* Security policy notice */}
              <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[11px] text-orange-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
                <div>
                  <strong>Política de Seguridad de Contraseñas:</strong>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    El usuario tendrá una vigencia máxima de <strong>90 días</strong> y se activará el flag obligatorio para que cambie esta contraseña al iniciar sesión por primera vez.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Departamento</label>
                  <input
                    type="text"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    placeholder="Ej: Operaciones y Despacho"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nivel de Acceso (Rol)</label>
                  <select
                    value={nivelAcceso}
                    onChange={(e) => handleSelectRolePreset(e.target.value as AdminNivelAcceso)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="super_admin">Super Admin (Todas las Pestañas)</option>
                    <option value="operador">Operador Logístico</option>
                    <option value="finanzas">Finanzas & Tasa BCV</option>
                    <option value="soporte">Soporte al Usuario</option>
                    <option value="auditor">Auditor de Envíos & Código</option>
                  </select>
                </div>
              </div>

              {/* Tab Selector Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    Pestañas Autorizadas para este Usuario ({pestanasSeleccionadas.length}):
                  </label>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => setPestanasSeleccionadas(ALL_TABS.map(t => t.id))}
                      className="text-[10px] text-orange-500 hover:underline"
                    >
                      Marcar Todas
                    </button>
                    <span className="text-slate-400">|</span>
                    <button
                      type="button"
                      onClick={() => setPestanasSeleccionadas(['dashboard'])}
                      className="text-[10px] text-slate-400 hover:underline"
                    >
                      Solo Dashboard
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {ALL_TABS.map(tab => {
                    const isChecked = pestanasSeleccionadas.includes(tab.id);
                    return (
                      <div
                        key={tab.id}
                        onClick={() => toggleTabSelection(tab.id)}
                        className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                          isChecked
                            ? 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300 font-semibold'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                          isChecked ? 'bg-orange-500 text-white' : 'border border-slate-400'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block truncate leading-tight">{tab.icon} {tab.label}</span>
                          <span className="text-[9px] text-slate-400 block truncate">{tab.description}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md cursor-pointer"
                >
                  Guardar en MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
