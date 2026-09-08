import React, { useState } from 'react';
import { 
  Code, 
  Copy, 
  Check, 
  Server, 
  Database, 
  Globe, 
  ShieldCheck, 
  FileCode, 
  Terminal,
  Download
} from 'lucide-react';
import { BACKEND_FILES, BackendFile } from '../../data/backendCodeRepository';

export const BackendCodeViewer: React.FC = () => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(BACKEND_FILES[0].path);
  const [copied, setCopied] = useState(false);

  const currentFile = BACKEND_FILES.find(f => f.path === selectedFilePath) || BACKEND_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    { id: 'all', label: 'Todos los Archivos' },
    { id: 'php', label: 'PHP Backend' },
    { id: 'sql', label: 'MySQL Schema' },
    { id: 'config', label: 'Configuraciones' },
    { id: 'hosting', label: 'Namecheap & Docker' },
  ];

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFiles = BACKEND_FILES.filter(f => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'php') return f.language === 'php';
    if (activeCategory === 'sql') return f.language === 'sql';
    if (activeCategory === 'config') return f.folder === 'config' || f.path.includes('config');
    if (activeCategory === 'hosting') return f.language === 'yaml' || f.language === 'dockerfile' || f.language === 'htaccess' || f.path.includes('docker') || f.path.includes('namecheap');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
            <Server className="w-4 h-4 text-orange-500" />
            Repositorio de Código Backend (PHP 8.2 + MySQL + Namecheap)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Arquitectura desacoplada, API RESTful Gateway y scripts listos para subir a cPanel o contenedores
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl font-mono">
            100% PHP Nativo & MySQL (Sin Firebase)
          </span>
        </div>
      </div>

      {/* Subdomains & Hosting Architecture Blueprint Banner */}
      <div className="p-5 rounded-2xl bg-[#0F172A] text-white border border-slate-800 space-y-3 shadow-md relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }} 
        />
        <div className="relative flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400 flex items-center gap-1.5">
            <Globe className="w-4 h-4" />
            Mapeo de Subdominios Independientes (Hosting Namecheap cPanel)
          </span>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-300 border border-slate-700">
            public_html
          </span>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-[10px] text-orange-400 font-bold block uppercase tracking-wider">1. Clientes</span>
            <code className="text-[11px] text-white font-mono block">cliente.tudominio.com</code>
            <p className="text-[10px] text-slate-400 font-mono">/subdominios/cliente</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">2. Motorizados</span>
            <code className="text-[11px] text-white font-mono block">delivery.tudominio.com</code>
            <p className="text-[10px] text-slate-400 font-mono">/subdominios/delivery</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-[10px] text-sky-400 font-bold block uppercase tracking-wider">3. Comercios</span>
            <code className="text-[11px] text-white font-mono block">comercio.tudominio.com</code>
            <p className="text-[10px] text-slate-400 font-mono">/subdominios/comercio</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-[10px] text-purple-400 font-bold block uppercase tracking-wider">4. Panel Web</span>
            <code className="text-[11px] text-white font-mono block">admin.tudominio.com</code>
            <p className="text-[10px] text-slate-400 font-mono">/subdominios/admin</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-[10px] text-red-400 font-bold block uppercase tracking-wider">5. API Gateway</span>
            <code className="text-[11px] text-white font-mono block">api.tudominio.com</code>
            <p className="text-[10px] text-slate-400 font-mono">/subdominios/api</p>
          </div>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Files List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              Estructura de Archivos
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {filteredFiles.length} de {BACKEND_FILES.length}
            </span>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredFiles.map((file) => {
              const isSelected = file.path === selectedFilePath;

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-0.5 cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500 text-white font-bold shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] truncate flex items-center gap-1.5">
                      <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-orange-500'}`} />
                      {file.name}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                      isSelected ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {file.language}
                    </span>
                  </div>
                  <span className={`text-[10px] truncate ${isSelected ? 'text-orange-100' : 'text-slate-400'}`}>
                    {file.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-2 bg-[#0F172A] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-md h-[580px]">
          {/* Top Bar */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              <span className="font-mono text-slate-300 ml-2 font-semibold">
                {currentFile.path}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>

          {/* Code Text Area */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-emerald-400/90 leading-relaxed select-all whitespace-pre bg-[#0F172A]">
            {currentFile.content}
          </div>

          {/* Footer info */}
          <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 px-4">
            <span>{currentFile.description}</span>
            <span className="font-mono text-slate-500">
              {currentFile.content.split('\n').length} líneas de código
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
