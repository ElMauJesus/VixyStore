'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Shield, UserCheck, Mail, Phone, Calendar } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { User } from '@/types/store';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
    return (
      fullName.includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.role_name && u.role_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900">
            Usuarios & Cuentas del Sistema
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualización de personal con acceso administrativo, secretaría y clientes registrados.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="p-2 self-start sm:self-auto text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-purple-50"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white border border-purple-100 rounded-2xl p-3 sm:p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Buscar usuario por nombre, email o rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" text="Cargando usuarios..." />
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Teléfono</th>
                  <th className="py-3 px-3 text-center">Rol</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          {u.first_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {u.first_name} {u.last_name}
                          </p>
                          <p className="text-[10px] text-slate-400">ID #{u.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {u.email}
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      {u.phone || 'No registrado'}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          u.role_name === 'administrator'
                            ? 'bg-purple-100 text-purple-900'
                            : u.role_name === 'secretary'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role_name}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {u.status || 'Activo'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-slate-500 whitespace-nowrap">
                      {formatDate(u.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No se encontraron usuarios.</p>
          </div>
        )}
      </div>
    </div>
  );
}
