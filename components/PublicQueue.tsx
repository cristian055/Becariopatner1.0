import React from 'react';
import { Caddie, ListConfig, CaddieStatus } from '../types';
import { Volume2, Trophy, Star, Users as UsersIcon, ExternalLink, Hash } from 'lucide-react';
import { useDispatchMonitor } from '../hooks/useDispatchMonitor';
import MonitorNavBar from './MonitorNavBar';
import './PublicQueue.css';

interface PublicQueueProps {
  caddies: Caddie[];
  lists: ListConfig[];
  lastDispatchBatch?: { ids: string[], timestamp: number } | null;
  onBack?: () => void;
}

const PublicQueue: React.FC<PublicQueueProps> = ({ caddies, lists, lastDispatchBatch, onBack }) => {
  const { showPopup, callingCaddies, layout } = useDispatchMonitor(lastDispatchBatch, caddies);

  const getCategoryTop = (category: string) => {
    const list = lists.find(l => l.category === category);
    if (!list) return [];
    return caddies
      .filter(c => 
        c.isActive && // Solo caddies activos
        c.category === category && 
        (c.status === CaddieStatus.AVAILABLE || c.status === CaddieStatus.LATE)
      )
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === CaddieStatus.AVAILABLE ? -1 : 1;
        
        if (list.order === 'RANDOM' || list.order === 'MANUAL') {
          return a.weekendPriority - b.weekendPriority;
        }
        return list.order === 'ASC' ? a.number - b.number : b.number - a.number;
      })
      .slice(0, 5);
  };

  const categories = [
    { name: 'Primera', icon: Star, color: 'bg-campestre-800' },
    { name: 'Segunda', icon: Trophy, color: 'bg-campestre-600' },
    { name: 'Tercera', icon: UsersIcon, color: 'bg-campestre-500' }
  ];

  return (
    <div className="monitor-container animate-in fade-in duration-500 flex flex-col h-screen overflow-hidden">
      
      <MonitorNavBar onBack={() => onBack?.()} />

      {showPopup && callingCaddies.length > 0 && (
        <div className="fixed inset-0 z-[500] bg-campestre-900/98 backdrop-blur-md flex items-center justify-center p-3 md:p-8 animate-in fade-in zoom-in duration-300">
          <div className="max-w-full md:max-w-[95vw] w-full bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl overflow-hidden border-[6px] md:border-[12px] border-campestre-500 flex flex-col max-h-[92vh]">
            
            <div className="bg-campestre-500 py-3 md:py-8 flex flex-col items-center justify-center shrink-0">
              <div className="flex items-center gap-4 md:gap-8">
                <Volume2 size={32} className="text-white animate-bounce md:size-[100px]" />
                <h2 className={`${callingCaddies.length > 2 ? 'text-2xl md:text-6xl' : 'text-3xl md:text-8xl'} font-black text-white uppercase tracking-widest`}>Llamado</h2>
              </div>
              <p className="text-campestre-100 font-bold uppercase tracking-[0.3em] text-[8px] md:text-sm text-center px-4 mt-1">Favor presentarse en Starter ahora</p>
            </div>
            
            <div className={`p-4 md:p-10 overflow-y-auto flex-1 grid ${layout.grid} gap-3 md:gap-8 items-center justify-center`}>
              {callingCaddies.map(caddie => (
                <div key={caddie.id} className={`flex items-center ${layout.card} bg-arena rounded-[1.5rem] md:rounded-[3rem] border-2 md:border-4 border-campestre-100 shadow-md relative overflow-hidden`}>
                  <div className="absolute top-2 left-2 flex items-center gap-1 opacity-20">
                     <Hash size={12} className="text-campestre-800" />
                     <span className="text-[8px] font-black uppercase">Numero</span>
                  </div>
                  
                  <div className={`${layout.circle} bg-campestre-800 rounded-[1.2rem] md:rounded-[2.5rem] flex items-center justify-center text-white font-black shadow-lg ring-4 md:ring-8 ring-white/10 shrink-0`}>
                    {caddie.number}
                  </div>
                  <div className="flex-1 min-w-0 ml-4 md:ml-0">
                    <p className={`${layout.name} font-black text-campestre-800 uppercase tracking-tighter mb-1 md:mb-4 leading-none truncate`}>
                      {caddie.name}
                    </p>
                    <div className={`inline-flex px-3 py-1 md:px-8 md:py-3 bg-campestre-200 text-campestre-900 rounded-full ${layout.badge} font-black uppercase tracking-widest`}>
                      {caddie.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="popup-timer-bar">
              <div className="popup-timer-progress"></div>
            </div>
          </div>
        </div>
      )}

      <header className="h-16 md:h-28 bg-white border-b-4 md:border-b-8 border-campestre-100 flex items-center px-4 md:px-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 md:gap-12">
          <div className="w-8 h-8 md:w-16 md:h-16 bg-campestre-800 rounded-xl flex items-center justify-center font-black text-base md:text-3xl text-white">C</div>
          <div>
            <h1 className="text-lg md:text-4xl font-black text-campestre-800 uppercase tracking-tight leading-none">Turnos de Salida</h1>
            <p className="text-[8px] md:text-sm font-black text-campestre-400 uppercase tracking-[0.3em] md:tracking-[0.8em] mt-0.5">Club Campestre Medellín</p>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-12 p-4 md:p-12 monitor-grid overflow-y-auto">
        {categories.map(cat => (
          <div key={cat.name} className="flex flex-col space-y-3 md:space-y-10">
            <div className={`p-4 md:p-10 ${cat.color} rounded-[1.5rem] md:rounded-[4rem] text-white shadow-lg flex items-center justify-between relative overflow-hidden shrink-0`}>
              <div className="relative z-10">
                <h2 className="text-xl md:text-5xl font-black uppercase tracking-tight">{cat.name}</h2>
                <p className="text-[8px] md:text-sm font-bold uppercase opacity-60 tracking-widest mt-0.5">Cola de Espera</p>
              </div>
              <cat.icon className="absolute -right-4 -bottom-4 size-16 md:size-[100px] md:-right-8 md:-bottom-8 opacity-20" />
            </div>

            <div className="flex-1 space-y-2 md:space-y-6">
              {getCategoryTop(cat.name).map((caddie, idx) => (
                <div 
                  key={caddie.id} 
                  className={idx === 0 ? 'caddie-card-active' : 'caddie-card-idle'}
                >
                  <div className="flex items-center gap-3 md:gap-10">
                    <div className={`w-10 h-10 md:w-24 md:h-24 rounded-lg md:rounded-[2rem] flex flex-col items-center justify-center font-black shadow-inner ${
                      idx === 0 ? 'bg-campestre-500 text-white' : 'bg-arena text-campestre-300'
                    }`}>
                      <span className="text-lg md:text-4xl leading-none">{caddie.number}</span>
                      <span className="text-[6px] md:text-[10px] uppercase opacity-60 font-black mt-1">Numero</span>
                    </div>
                    <div className="min-w-0">
                      <p className={`font-black text-sm md:text-3xl uppercase tracking-tighter truncate max-w-[120px] md:max-w-[200px] ${idx === 0 ? 'text-campestre-800' : 'text-campestre-400'}`}>
                        {caddie.name}
                      </p>
                      <p className={`text-[7px] md:text-[12px] font-black uppercase tracking-[0.2em] mt-0.5 ${idx === 0 ? 'text-campestre-500' : 'text-campestre-300'}`}>
                        {idx === 0 ? 'SIGUIENTE EN TURNO' : `POSICIÓN #${idx + 1}`}
                      </p>
                    </div>
                  </div>
                  {idx === 0 && (
                    <div className="w-2.5 h-2.5 md:w-6 md:h-6 rounded-full bg-campestre-500 animate-ping"></div>
                  )}
                </div>
              ))}
              
              {Array.from({ length: Math.max(0, 5 - getCategoryTop(cat.name).length) }).map((_, i) => (
                <div key={i} className="h-[60px] md:h-[140px] bg-arena/40 rounded-[1.2rem] md:rounded-[3rem] border-2 md:border-4 border-dashed border-campestre-100/40 flex items-center justify-center opacity-30">
                  <div className="w-10 h-1.5 md:w-20 md:h-4 bg-campestre-100 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="h-14 md:h-20 bg-campestre-900 text-white flex flex-col md:flex-row items-center justify-between px-4 md:px-20 shrink-0 border-t border-campestre-800 gap-2 md:gap-0 py-2 md:py-0">
        <div className="flex items-center gap-4 md:gap-20 order-2 md:order-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse"></div>
            <span className="text-[7px] md:text-xs font-black uppercase tracking-widest text-campestre-200">Sincronizado</span>
          </div>
          <p className="text-[7px] md:text-xs font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] text-campestre-400 italic text-center">
            Favor estar atento a la pantalla para su salida
          </p>
        </div>

        <div className="flex items-center order-1 md:order-2">
          <a 
            href="https://berracode.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group flex items-center gap-1.5 text-[8px] md:text-[11px] font-bold uppercase tracking-widest text-campestre-500 hover:text-white transition-all duration-300"
          >
            <span className="opacity-70 group-hover:opacity-100">Desarrollado por</span>
            <span className="font-black text-campestre-300 group-hover:text-campestre-100 underline decoration-campestre-500 underline-offset-4">Berracode.com</span>
            <ExternalLink size={10} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default PublicQueue;