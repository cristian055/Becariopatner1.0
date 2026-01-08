import React from 'react';
import { Lock, ShieldCheck, CalendarDays, Monitor } from 'lucide-react';

interface MonitorNavBarProps {
  onBack: () => void;
}

const MonitorNavBar: React.FC<MonitorNavBarProps> = ({ onBack }) => {
  const currentPath = window.location.hash;
  const isWeekly = currentPath === '#/weekly-monitor';

  return (
    <nav className="sticky top-0 w-full z-[300] bg-white/70 backdrop-blur-xl border-b border-campestre-100/50 px-4 md:px-10 h-14 md:h-16 flex items-center transition-all duration-300">
      <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between">
        
        {/* Status & View Toggle */}
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <ShieldCheck size={16} className="text-emerald-500 relative z-10" />
              <div className="absolute inset-0 bg-emerald-500/20 blur-sm rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-campestre-800 leading-none">
                Sincronización Activa
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600/70 mt-0.5">
                {isWeekly ? 'Sorteo Semanal' : 'Monitor de Turnos'}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-campestre-100 hidden md:block"></div>

          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => window.location.hash = '#/monitor'}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${!isWeekly ? 'bg-campestre-800 text-white shadow-md' : 'text-campestre-400 hover:text-campestre-600'}`}
            >
              <Monitor size={12} />
              Hoy
            </button>
            <button 
              onClick={() => window.location.hash = '#/weekly-monitor'}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isWeekly ? 'bg-campestre-800 text-white shadow-md' : 'text-campestre-400 hover:text-campestre-600'}`}
            >
              <CalendarDays size={12} />
              Semanal
            </button>
          </div>
        </div>
        
        {/* Admin Access Button */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 px-4 py-2 bg-white border border-campestre-200 text-campestre-800 rounded-full hover:bg-campestre-800 hover:text-white hover:border-campestre-800 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-95"
          aria-label="Acceso Administrativo"
        >
          <div className="w-6 h-6 rounded-full bg-campestre-50 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <Lock size={12} className="text-campestre-600 group-hover:text-white" />
          </div>
          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">
            Acceso Administrador
          </span>
        </button>

      </div>
    </nav>
  );
};

export default MonitorNavBar;