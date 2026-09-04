import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Truck, Clock, Headphones } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0614] text-slate-300 pt-10 pb-8 border-t border-purple-950/80">
      {/* Value props (Mobile 2x2 grid, Desktop 4 cols) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 border-b border-purple-900/40">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-950/90 text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-800/60 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Garantía Real</h4>
              <p className="text-[11px] text-slate-400">Repuestos 100% testeados</p>
            </div>
          </div>

          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-950/90 text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-800/60 shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Envíos a Venezuela</h4>
              <p className="text-[11px] text-slate-400">MRW, Tealca, Zoom</p>
            </div>
          </div>

          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-950/90 text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-800/60 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Despacho Veloz</h4>
              <p className="text-[11px] text-slate-400">Salidas en 24-48 horas</p>
            </div>
          </div>

          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-950/90 text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-800/60 shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Asesoría Directa</h4>
              <p className="text-[11px] text-slate-400">Compatibilidad de piezas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 sm:col-span-2 md:col-span-1">
            <div className="relative h-9 w-28">
              <Image
                src="/logo/vixylogo.png"
                alt="Vixy Store"
                fill
                className="object-contain brightness-0 invert"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              E-Commerce y ERP automotriz especializado en repuestos para motos y vehículos con garantía certificada y pagos locales.
            </p>
          </div>

          {/* Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">Navegación</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-purple-300 transition-colors">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="hover:text-purple-300 transition-colors">
                  Ver mi Carrito
                </Link>
              </li>
              <li>
                <Link href="/cuenta" className="hover:text-purple-300 transition-colors">
                  Seguimiento de Pedido
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-purple-300 transition-colors">
                  Acceso Clientes / ERP
                </Link>
              </li>
            </ul>
          </div>

          {/* Pagos */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">Métodos de Pago</h5>
            <p className="text-xs text-slate-400 mb-3">
              Cobro directo en bolívares y divisas:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-purple-950/80 text-purple-300 rounded-md border border-purple-800/60">
                Pago Móvil
              </span>
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-slate-900 text-blue-300 rounded-md border border-slate-800">
                Banesco
              </span>
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-slate-900 text-yellow-300 rounded-md border border-slate-800">
                Binance Pay (USDT)
              </span>
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-slate-900 text-orange-300 rounded-md border border-slate-800">
                Zinli
              </span>
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-slate-900 text-white rounded-md border border-slate-800">
                Zelle / Efectivo
              </span>
            </div>
          </div>

          {/* Soporte */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">Contacto</h5>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Caracas, Venezuela</li>
              <li>soporte@vixystore.com</li>
              <li>Lun a Sáb: 8:00 AM - 6:00 PM</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-purple-950/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 text-center sm:text-left">
        <p>© {new Date().getFullYear()} Vixy Store. Todos los derechos reservados.</p>
        <p className="text-purple-400/80 font-medium">Gestión Empresarial ERP & E-Commerce</p>
      </div>
    </footer>
  );
}
