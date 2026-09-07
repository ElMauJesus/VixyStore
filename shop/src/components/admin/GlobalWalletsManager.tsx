import React, { useState } from 'react';
import { 
  Database, 
  Wallet, 
  ShieldCheck, 
  User, 
  Bike, 
  Store, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  Search, 
  Lock, 
  FolderTree, 
  FileText, 
  CheckCircle2,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

export const GlobalWalletsManager: React.FC = () => {
  const { 
    globalLedger, 
    allClientWallets, 
    allDriverWallets, 
    allStoreWallets,
    tasaBcv 
  } = useDelivery();

  const [activeSubTab, setActiveSubTab] = useState<'clientes' | 'conductores' | 'comercios'>('clientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWalletUser, setSelectedWalletUser] = useState<any | null>(null);

  return (
    <div className="space-y-4 text-neutral-900 dark:text-neutral-100">
      {/* Master Custody Ledger Cards (Purple, Black & White Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Custodia */}
        <div className="bg-neutral-950 text-white p-4 rounded-2xl border border-purple-900/40 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-purple-300 font-medium">
            <span>Custodia Global Vixy</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono tracking-tight text-white">
              ${globalLedger.totalGlobalCustodiaUsd.toFixed(2)}
            </span>
            <span className="text-xs text-neutral-400 block font-mono">
              Bs. {(globalLedger.totalGlobalCustodiaUsd * tasaBcv).toFixed(2)}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-purple-300/80 font-mono">
            Balance auditado en cuentas bancarias
          </div>
        </div>

        {/* Clientes */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Carteras Clientes</span>
            <User className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono tracking-tight text-neutral-900 dark:text-white">
              ${globalLedger.totalClientesUsd.toFixed(2)}
            </span>
            <span className="text-xs text-neutral-500 block font-mono">
              {allClientWallets.length} carteras activas
            </span>
          </div>
          <div className="mt-2 text-[10px] text-neutral-400">
            Saldos prepagados para compras
          </div>
        </div>

        {/* Conductores */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Carteras Motorizados</span>
            <Bike className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono tracking-tight text-neutral-900 dark:text-white">
              ${globalLedger.totalConductoresUsd.toFixed(2)}
            </span>
            <span className="text-xs text-neutral-500 block font-mono">
              {allDriverWallets.length} conductores
            </span>
          </div>
          <div className="mt-2 text-[10px] text-neutral-400">
            Fondo de comisiones y carreras
          </div>
        </div>

        {/* Comercios */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Carteras Comercios</span>
            <Store className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono tracking-tight text-neutral-900 dark:text-white">
              ${globalLedger.totalComerciosUsd.toFixed(2)}
            </span>
            <span className="text-xs text-neutral-500 block font-mono">
              {allStoreWallets.length} tiendas Vixy
            </span>
          </div>
          <div className="mt-2 text-[10px] text-neutral-400">
            Ventas prepagadas por liquidar
          </div>
        </div>
      </div>

      {/* Sub-Tabs & Entity Search */}
      <div className="bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('clientes')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'clientes'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Clientes ({allClientWallets.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('conductores')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'conductores'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Motorizados ({allDriverWallets.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('comercios')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'comercios'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Comercios ({allStoreWallets.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Filtrar por nombre, cédula o RIF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:border-purple-500"
          />
        </div>
      </div>

      {/* Tables based on Sub-Tab */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        {activeSubTab === 'clientes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-850 text-neutral-500 uppercase text-[10px] font-bold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-3">Cliente / Cédula</th>
                  <th className="p-3">Carpeta Aislada</th>
                  <th className="p-3 text-right">Saldo USD</th>
                  <th className="p-3 text-right">Saldo Bs.</th>
                  <th className="p-3 text-right">Total Recargado</th>
                  <th className="p-3 text-right">Total Gastado</th>
                  <th className="p-3 text-center">Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {allClientWallets
                  .filter(c => {
                    if (!searchTerm.trim()) return true;
                    const q = searchTerm.toLowerCase();
                    return c.clienteNombre.toLowerCase().includes(q) || c.cedula.toLowerCase().includes(q);
                  })
                  .map(c => (
                    <tr key={c.clienteId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition">
                      <td className="p-3">
                        <div className="font-bold text-neutral-900 dark:text-white">{c.clienteNombre}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{c.cedula} • ID: {c.clienteId}</div>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1">
                        <FolderTree className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-xs">{c.carpetaComprobantes}</span>
                      </td>
                      <td className="p-3 text-right font-bold text-neutral-900 dark:text-white font-mono">
                        ${c.saldoUsd.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-neutral-500 font-mono">
                        Bs. {(c.saldoUsd * tasaBcv).toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-purple-600 dark:text-purple-400 font-mono">
                        +${c.totalRecargadoUsd.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-neutral-500 font-mono">
                        -${c.totalGastadoUsd.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedWalletUser({ ...c, tipo: 'cliente' })}
                          className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-purple-600 transition cursor-pointer"
                          title="Ver Transacciones"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSubTab === 'conductores' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-850 text-neutral-500 uppercase text-[10px] font-bold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-3">Motorizado / Cédula</th>
                  <th className="p-3">Carpeta Comprobantes</th>
                  <th className="p-3 text-right">Saldo USD</th>
                  <th className="p-3 text-right">Límite Negativo</th>
                  <th className="p-3 text-center">Estado Operativo</th>
                  <th className="p-3 text-center">Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {allDriverWallets
                  .filter(d => {
                    if (!searchTerm.trim()) return true;
                    const q = searchTerm.toLowerCase();
                    return d.conductorNombre.toLowerCase().includes(q) || d.cedula.toLowerCase().includes(q);
                  })
                  .map(d => (
                    <tr key={d.conductorId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition">
                      <td className="p-3">
                        <div className="font-bold text-neutral-900 dark:text-white">{d.conductorNombre}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{d.cedula} • ID: {d.conductorId}</div>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1">
                        <FolderTree className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-xs">{d.carpetaComprobantes}</span>
                      </td>
                      <td className={`p-3 text-right font-bold font-mono ${d.saldoUsd < 0 ? 'text-red-500' : 'text-neutral-900 dark:text-white'}`}>
                        ${d.saldoUsd.toFixed(2)} USD
                      </td>
                      <td className="p-3 text-right text-neutral-500 font-mono">
                        ${d.limiteSaldoNegativo.toFixed(2)} USD
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          d.bloqueado 
                            ? 'bg-red-500/10 text-red-600 border border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        }`}>
                          {d.bloqueado ? '⛔ Bloqueado (Saldo Insuficiente)' : '✅ Habilitado para Viajes'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedWalletUser({ ...d, tipo: 'conductor' })}
                          className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-purple-600 transition cursor-pointer"
                          title="Ver Transacciones"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSubTab === 'comercios' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-850 text-neutral-500 uppercase text-[10px] font-bold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-3">Comercio / RIF</th>
                  <th className="p-3 text-right">Saldo Comercial USD</th>
                  <th className="p-3 text-right">Saldo en Bs.</th>
                  <th className="p-3 text-right">Ventas Acumuladas</th>
                  <th className="p-3 text-right">Retiros Realizados</th>
                  <th className="p-3 text-center">Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {allStoreWallets
                  .filter(s => {
                    if (!searchTerm.trim()) return true;
                    const q = searchTerm.toLowerCase();
                    return s.comercioNombre.toLowerCase().includes(q) || s.rif.toLowerCase().includes(q);
                  })
                  .map(s => (
                    <tr key={s.comercioId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition">
                      <td className="p-3">
                        <div className="font-bold text-neutral-900 dark:text-white">{s.comercioNombre}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">RIF: {s.rif} • ID: {s.comercioId}</div>
                      </td>
                      <td className="p-3 text-right font-bold text-purple-600 dark:text-purple-400 font-mono">
                        ${s.saldoUsd.toFixed(2)} USD
                      </td>
                      <td className="p-3 text-right text-neutral-500 font-mono">
                        Bs. {(s.saldoUsd * tasaBcv).toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-mono">
                        +${s.totalVentasUsd.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-neutral-400 font-mono">
                        -${s.totalRetiradoUsd.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedWalletUser({ ...s, tipo: 'comercio' })}
                          className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-purple-600 transition cursor-pointer"
                          title="Ver Movimientos"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction History Modal for Selected Entity */}
      {selectedWalletUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Historial de Transacciones de Cartera
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {selectedWalletUser.clienteNombre || selectedWalletUser.conductorNombre || selectedWalletUser.comercioNombre}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedWalletUser(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {(!selectedWalletUser.transacciones || selectedWalletUser.transacciones.length === 0) ? (
                <div className="p-8 text-center text-neutral-400 text-xs">
                  No hay transacciones registradas para esta cartera.
                </div>
              ) : (
                selectedWalletUser.transacciones.map((tx: any) => (
                  <div 
                    key={tx.id}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {tx.descripcion}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {tx.fecha} • Ref: {tx.referencia || 'N/A'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold ${
                        (tx.monto || tx.montoUsd) > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-neutral-900 dark:text-white'
                      }`}>
                        {(tx.monto || tx.montoUsd) > 0 ? '+' : ''}${(tx.monto || tx.montoUsd).toFixed(2)} USD
                      </span>
                      <span className="block text-[10px] text-neutral-400 font-mono">
                        Saldo: ${((tx.saldoResultante || tx.saldoResultanteUsd) ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 text-right">
              <button
                onClick={() => setSelectedWalletUser(null)}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
