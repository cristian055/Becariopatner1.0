import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  CalendarDays, 
  MapPin, 
  Activity, 
  Star, 
  Trophy, 
  Users as UsersIcon,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft
} from 'lucide-react';
import { WeeklyShift, WeeklyAssignment, Caddie } from '../types';
import MonitorNavBar from './MonitorNavBar';

interface WeeklyMonitorProps {
  caddies: Caddie[];
  shifts: WeeklyShift[];
  assignments: WeeklyAssignment[];
  onBack?: () => void;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const WeeklyMonitor: React.FC<WeeklyMonitorProps> = ({ 
  caddies, 
  shifts, 
  assignments, 
  onBack 
}) => {
  const [activeDay, setActiveDay] = useState('Viernes');

  const dayShifts = useMemo(() => 
    shifts.filter(s => s.day === activeDay).sort((a, b) => a.time.localeCompare(b.time)),
    [shifts, activeDay]
  );
  
  const dayAssignments = assignments.filter(a => dayShifts.some(s => s.id === a.shiftId));

  const groupedPool = useMemo(() => {
    const pool = caddies.filter(c => {
      if (!c.isActive) return false;
      const dayAvail = c.availability.find(a => a.day === activeDay);
      const isAssigned = dayAssignments.some(a => a.caddieId === c.id);
      return dayAvail?.isAvailable && !isAssigned;
    });

    return {
      Primera: pool.filter(c => c.category === 'Primera').sort((a, b) => a.weekendPriority - b.weekendPriority),
      Segunda: pool.filter(c => c.category === 'Segunda').sort((a, b) => a.weekendPriority - b.weekendPriority),
      Tercera: pool.filter(c => c.category === 'Tercera').sort((a, b) => a.weekendPriority - b.weekendPriority),
    };
  }, [caddies, activeDay, dayAssignments]);

  return (
    <div className="fixed inset-0 bg-arena z-[100] flex flex-col font-sans overflow-hidden">
      
      <MonitorNavBar onBack={() => onBack?.()} />

      <header className="h-16 md:h-24 bg-white border-b-4 border-campestre-100 flex items-center px-4 md:px-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-4 md:gap-8 w-full">
          <button 
            onClick={() => window.location.hash = '#/monitor'}
            className="p-2 md:p-4 bg-campestre-50 text-campestre-600 rounded-2xl hover:bg-campestre-800 hover:text-white transition-all shadow-sm"
            title="Volver a Turnos de Hoy"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-xl md:text-3xl font-black text-campestre-800 uppercase tracking-tight leading-none">Sorteo Semanal</h1>
            <p className="text-[8px] md:text-xs font-black text-campestre-400 uppercase tracking-[0.3em] mt-1">Programación Sede Llanogrande</p>
          </div>

          <div className="ml-auto flex p-1 bg-arena border border-campestre-100 rounded-2xl overflow-x-auto no-scrollbar">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`py-2 px-4 md:px-6 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeDay === day ? 'bg-campestre-800 text-white shadow-lg' : 'text-campestre-400 hover:text-campestre-600'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-4 md:p-8 gap-4 md:gap-8">
        
        {/* Left Section: Agenda / Shifts */}
        <section className="flex-[2] flex flex-col h-full space-y-4 md:space-y-8 overflow-y-auto no-scrollbar pr-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm md:text-xl font-black text-campestre-800 uppercase tracking-[0.2em] flex items-center gap-3">
              <CalendarDays className="text-campestre-500" />
              Agenda de Salidas - {activeDay}
            </h2>
            <div className="bg-white border border-campestre-100 px-4 py-1 rounded-full text-[10px] font-black text-campestre-400 uppercase tracking-widest">
              {dayShifts.length} Grupos Programados
            </div>
          </div>

          {dayShifts.length === 0 ? (
            <div className="flex-1 bg-white/50 rounded-[3rem] border-4 border-dashed border-campestre-100 flex flex-col items-center justify-center text-center p-12 opacity-40">
              <CalendarDays size={80} className="text-campestre-200 mb-6" />
              <p className="text-xl font-black text-campestre-300 uppercase tracking-[0.3em]">No hay programación registrada para este día</p>
            </div>
          ) : (
            <div className="space-y-6">
              {dayShifts.map((shift, idx) => {
                const shiftAssigned = assignments.filter(a => a.shiftId === shift.id);
                return (
                  <div key={shift.id} className="bg-white rounded-[2.5rem] md:rounded-[4rem] border-4 border-campestre-100 shadow-xl overflow-hidden animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-32 bg-campestre-50 p-6 md:p-10 flex flex-row md:flex-col items-center justify-center border-b md:border-b-0 md:border-r-4 border-campestre-100 shrink-0">
                         <p className="text-3xl md:text-5xl font-black text-campestre-800 tabular-nums">{shift.time}</p>
                         <p className="text-[8px] md:text-[10px] font-black text-campestre-400 uppercase tracking-widest md:mt-2 md:rotate-0 rotate-0 ml-4 md:ml-0">SALIDA {idx + 1}</p>
                      </div>

                      <div className="flex-1 p-6 md:p-10">
                        <div className="flex flex-wrap gap-2 mb-6">
                           {shift.requirements.map(req => (
                             <div key={req.category} className="flex items-center gap-2 px-4 py-1.5 bg-arena rounded-full border border-campestre-50">
                                <div className={`w-2 h-2 rounded-full ${req.category === 'Primera' ? 'bg-campestre-500' : req.category === 'Segunda' ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
                                <span className="text-[10px] font-black text-campestre-800 tracking-tight uppercase">{req.count} {req.category}</span>
                             </div>
                           ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                           {shiftAssigned.length === 0 ? (
                             <div className="col-span-full py-8 bg-arena/50 rounded-[2rem] border-2 border-dashed border-campestre-100 flex flex-col items-center justify-center gap-3 opacity-30">
                                <AlertTriangle size={32} className="text-amber-500 animate-pulse" />
                                <span className="text-[12px] md:text-sm font-black uppercase tracking-[0.2em] text-campestre-400">Sorteo Pendiente</span>
                             </div>
                           ) : (
                             shiftAssigned.map(a => (
                               <div key={a.caddieId} className="flex items-center gap-4 p-4 bg-arena rounded-[2rem] border-2 border-campestre-50 shadow-sm">
                                 <div className="w-10 h-10 md:w-14 md:h-14 bg-campestre-800 text-white rounded-2xl flex items-center justify-center font-black text-base md:text-xl border-2 border-white shadow-md shrink-0">
                                   {a.caddieNumber}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <p className="font-black text-xs md:text-sm text-campestre-800 uppercase tracking-tight truncate leading-none mb-1.5">{a.caddieName}</p>
                                   <div className="flex items-center gap-2">
                                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                        a.category === 'Primera' ? 'bg-campestre-50 text-campestre-500 border-campestre-100' :
                                        a.category === 'Segunda' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                        'bg-slate-50 text-slate-500 border-slate-100'
                                      }`}>
                                        {a.category}
                                      </span>
                                      <CheckCircle2 size={14} className="text-emerald-500" />
                                   </div>
                                 </div>
                               </div>
                             ))
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Section: Caddie Pool (Waiting) */}
        <section className="flex-1 hidden lg:flex flex-col h-full bg-white rounded-[3rem] border-4 border-campestre-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b-4 border-campestre-100 bg-campestre-50/50">
            <div className="flex items-center gap-3 text-campestre-800 mb-6">
              <UsersIcon size={24} className="text-campestre-500" />
              <h3 className="text-lg font-black uppercase tracking-[0.2em]">Caddies en Pool</h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Primera', icon: Star, color: 'text-campestre-500' },
                { id: 'Segunda', icon: Trophy, color: 'text-amber-500' },
                { id: 'Tercera', icon: UsersIcon, color: 'text-slate-400' }
              ].map(cat => (
                <div key={cat.id} className="bg-white p-3 rounded-2xl border border-campestre-100 text-center flex flex-col items-center gap-1 shadow-sm">
                  <cat.icon size={16} className={cat.color} />
                  <p className="text-[10px] font-black text-campestre-800 leading-none">{groupedPool[cat.id as keyof typeof groupedPool].length}</p>
                  <p className="text-[7px] font-black text-campestre-300 uppercase tracking-widest">{cat.id}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-arena/30">
            {Object.entries(groupedPool).map(([category, caddies]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                   <div className={`w-2 h-2 rounded-full ${category === 'Primera' ? 'bg-campestre-500' : category === 'Segunda' ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
                   <h4 className="text-[9px] font-black text-campestre-400 uppercase tracking-widest">{category} ({caddies.length})</h4>
                </div>
                {caddies.map((c, cIdx) => (
                  <div key={c.id} className="flex items-center gap-4 p-4 bg-white rounded-[1.5rem] border border-campestre-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-arena rounded-xl flex items-center justify-center font-black text-sm text-campestre-800 border border-campestre-100">
                      {c.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-campestre-800 uppercase truncate leading-none mb-1.5">{c.name}</p>
                      <div className="flex items-center gap-2">
                         <div className="flex items-center gap-1 text-[8px] text-campestre-300 font-bold uppercase tracking-widest">
                           <MapPin size={8} /> {c.location}
                         </div>
                         {c.isSkippedNextWeek && (
                           <div className="flex items-center gap-1 text-[8px] text-amber-500 font-black uppercase bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                             Prioridad
                           </div>
                         )}
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-campestre-100">
                      #{cIdx + 1}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            
            {Object.values(groupedPool).every(p => p.length === 0) && (
              <div className="py-20 text-center space-y-4 opacity-20">
                 <UsersIcon size={64} className="mx-auto" />
                 <p className="text-sm font-black uppercase tracking-widest">Pool Vacío</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="h-12 md:h-16 bg-campestre-900 text-white flex items-center justify-between px-6 md:px-10 shrink-0 border-t border-campestre-800">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
            <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-campestre-200">Sorteo en Tiempo Real</span>
          </div>
          <p className="hidden md:block text-[10px] font-bold text-campestre-400 uppercase tracking-widest italic">
            El sorteo de prioridad aplica para caddies que no salieron la semana anterior
          </p>
        </div>
        <div className="text-[9px] md:text-xs font-black uppercase tracking-widest text-campestre-500">
          Fundación Club Campestre v2.5
        </div>
      </footer>
    </div>
  );
};

export default WeeklyMonitor;