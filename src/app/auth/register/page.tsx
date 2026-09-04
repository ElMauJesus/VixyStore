'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, UserCheck, Sparkles, ExternalLink, ArrowRight, ChevronLeft } from 'lucide-react';

export default function RegisterPage() {
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 mb-2">
          Acceso Exclusivo para Conductores
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Registro en Vixy Store
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Nuestra tienda de repuestos y suministros es un beneficio exclusivo para la red de conductores Vixy
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-5 sm:py-8 sm:px-8 border border-purple-100 shadow-sm rounded-3xl space-y-6">
          
          {/* Tarjeta 1: ¿Ya eres conductor? */}
          <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-purple-950">
                ¿Ya te registraste en VixyRider?
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                No necesitas crear una cuenta nueva. Inicia sesión directamente con el correo o teléfono y la contraseña de tu cuenta de conductor.
              </p>
              <div className="pt-1">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline"
                >
                  <span>Iniciar sesión como conductor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: ¿Aún no eres conductor? */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-purple-400 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900">
                ¿Aún no eres conductor Vixy?
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                El registro de conductores se gestiona a través de la plataforma y landing de <strong>VixyRider</strong>. Completa tu preregistro para acceder a repuestos con descuento exclusivo.
              </p>
              <div className="pt-1">
                <a
                  href="https://vixyrider.com/#registro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl shadow-xs transition-colors"
                >
                  <span>Registrarme como Conductor en VixyRider</span>
                  <ExternalLink className="w-3.5 h-3.5 text-purple-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Garantías y Beneficios */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>Precios preferenciales y repuestos con garantía certificada</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/auth/login"
              className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all"
            >
              Ir a la pantalla de Ingreso
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

