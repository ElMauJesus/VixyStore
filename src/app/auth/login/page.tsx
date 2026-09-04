'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, AlertCircle, ArrowRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login({ email: email.trim(), password });
    setLoading(false);

    if (res.success) {
      try {
        const u = JSON.parse(localStorage.getItem('vixy_user') || '{}');
        if (u.role === 'administrator' || u.role === 'secretary') {
          router.push('/admin');
          return;
        }
      } catch {}

      router.push(redirectUrl);
    } else {
      setError(res.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block relative h-12 w-36 mb-3">
          <Image
            src="/logo/vixylogo.png"
            alt="Vixy Store"
            fill
            className="object-contain"
            priority
          />
        </Link>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Ingreso a Vixy Store
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Accede a tu cuenta de cliente o panel ERP administrativo
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-5 sm:py-8 sm:px-8 border border-purple-100 shadow-sm rounded-3xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="usuario@vixystore.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-purple-600/25 active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Validando acceso...</span>
              ) : (
                <>
                  <span>Ingresar a Vixy</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            ¿No tienes una cuenta aún?{' '}
            <Link
              href="/auth/register"
              className="font-bold text-purple-700 hover:text-purple-800 underline ml-1"
            >
              Regístrate aquí
            </Link>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-purple-600 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Volver a la tienda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24">
          <LoadingSpinner size="lg" text="Iniciando acceso..." />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
