import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Plus, 
  Minus,
  Trash2, 
  Play, 
  AlertTriangle, 
  CheckCircle2,
  Users,
  Timer,
  Hash,
  UserCheck,
  ChevronRight,
  Trophy,
  Star,
  Users as UsersIcon,
  MapPin,
  Activity,
  CalendarDays
} from 'lucide-react';
import { WeeklyShift, WeeklyAssignment, Caddie, WeeklyShiftRequirement } from '../types';

interface WeeklyDrawProps {
  caddies: Caddie[];
  shifts: WeeklyShift[];
  assignments: WeeklyAssignment[];
  onAddShift: (shift: WeeklyShift) => void;
  onRemoveShift: (id: string) => void;
  onGenerate: (day: string) => void;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const WeeklyDraw: React.FC<WeeklyDrawProps> = ({ 
  caddies, 
  shifts, 
  assignments, 
  onAddShift, 
  onRemoveShift, 
  onGenerate 
}) => {
  const [activeDay, setActiveDay] = useState('Viernes');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'Primera' | 'Segunda' | 'Tercera'>('Primera');
  const [newTime, setNewTime] = useState('08:00');
  const [counts, setCounts] = useState({ Primera: 1, Segunda: 0, Tercera: 0 });

  const dayShifts = shifts.filter(s => s.day === activeDay);
  const dayAssignments = assignments.filter(a => dayShifts.some(s => s.id === a.shiftId));

  const groupedAvailable = useMemo(() => {
    const available = caddies.filter(c => {
      if (!c.isActive) return false;
      const dayAvail = c.availability.find(a => a.day === activeDay);
      const isAssigned = dayAssignments.some(a => a.caddieId === c.id);
      return dayAvail?.isAvailable && !isAssigned;
    });

    return {
      Primera: available.filter(c => c.category === 'Primera').sort((a, b) => {
        if (a.isSkippedNextWeek !== b.isSkippedNextWeek) return a.isSkippedNextWeek ? -1 : 1;
        return a.weekendPriority - b.weekendPriority;
      }),
      Segunda: available.filter(c => c.category === 'Segunda').sort((a, b) => {
        if (a.isSkippedNextWeek !== b.isSkippedNextWeek) return a.isSkippedNextWeek ? -1 : 1;
        return a.weekendPriority - b.weekendPriority;
      }),
      Tercera: available.filter(c => c.category === 'Tercera').sort((a, b) => {
        if (a.isSkippedNextWeek !== b.isSkippedNextWeek) return a.isSkippedNextWeek ? -1 : 1;
        return a.weekendPriority - b.weekendPriority;
      }),
    };
  }, [caddies, activeDay, dayAssignments]);

  const handleAdd = () => {
    const requirements: WeeklyShiftRequirement[] = [
      { category: 'Primera' as const, count: counts.Primera },
      { category: 'Segunda' as const, count: counts.Segunda },
      { category: 'Tercera' as const, count: counts.Tercera },
    ].filter(r => r.count > 0);

    const shift: WeeklyShift = {
      id: Math.random().toString(36).substr(2, 9),
      day: activeDay,
      time: newTime,
      requirements
    };
    onAddShift(shift);
    setCounts({ Primera: 0, Segunda: 0, Tercera: 0 });
  };

  const categories = [
    { id: 'Primera', name: 'Primera Cat.', icon: Star, color: 'text-campestre-600', bg: 'bg-campestre-50' },
    { id: 'Segunda', name: 'Segunda Cat.', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'Tercera', name: 'Tercera Cat.', icon: UsersIcon, color: 'text-slate-600', bg: 'bg-slate-50' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-20">
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-campestre-100 shadow-sm">
        <div className="flex p-1 bg-arena border border-campestre-100 rounded-2xl overflow-x-auto no-scrollbar w-full xl:w-auto">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 xl:flex-none flex items-center justify-center py-3 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeDay === day ? 'bg-campestre-800 text-white shadow-lg' : 'text-campestre-400 hover:text-campestre-600'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="flex-1 xl:flex-none px-6 py-3 bg-campestre-50 border border-campestre-100 rounded-2xl text-center">
            <p className="text-[8px] font-black text-campestre-400 uppercase tracking-widest mb-0.5">Pool {activeDay}</p>
            <p className="text-xl font-black text-campestre-800 leading-none">
              {groupedAvailable.Primera.length + groupedAvailable.Segunda.length + groupedAvailable.Tercera.length}
            </p>
          </div>
          <button 
            onClick={() => onGenerate(activeDay)}
            disabled={dayShifts.length === 0}
            className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-campestre-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-campestre-500/20 active:scale-95 transition-all disabled:opacity-30"
          >
            <Play size={16} fill="currentColor" />
            Generar Sorteo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar de Personal Disponible con Restricciones */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-campestre-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
            <div className="p-8 border-b border-campestre-100">
              <div className="flex items-center gap-3 text-campestre-800 mb-6">
                <Users size={20} className="text-campestre-500" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em]">Disponibilidad y Restricciones</h3>
              </div>

              <div className="flex gap-2 p-1 bg-arena rounded-xl border border-campestre-50">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryTab(cat.id as any)}
                    className={`flex-1 py-2 px-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                      activeCategoryTab === cat.id ? 'bg-white shadow-sm ring-1 ring-campestre-100' : 'opacity-40 grayscale'
                    }`}
                  >
                    <cat.icon size={14} className={cat.color} />
                    <span className="text-[7px] font-black uppercase tracking-tighter">
                      {groupedAvailable[cat.id as keyof typeof groupedAvailable].length} {cat.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar bg-arena/20">
              {groupedAvailable[activeCategoryTab].map((c) => {
                const avail = c.availability.find(a => a.day === activeDay);
                const hasRestriction = avail?.range && avail.range.type !== 'full';
                
                return (
                  <div key={c.id} className={`p-5 rounded-[2rem] border flex flex-col gap-4 transition-all hover:shadow-md ${
                    c.isSkippedNextWeek ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-100' : 'bg-white border-campestre-100'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border-2 shadow-inner ${
                        c.isSkippedNextWeek ? 'bg-amber-500 text-white border-white' : 'bg-arena text-campestre-800 border-campestre-100'
                      }`}>
                        {c.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-campestre-800 uppercase truncate leading-none mb-2">{c.name}</p>
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-campestre-50 text-campestre-400 rounded-md border border-campestre-100">
                             <MapPin size={8} />
                             <span className="text-[7px] font-black uppercase">{c.location}</span>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-arena text-campestre-400 rounded-md border border-campestre-100">
                             <Activity size={8} />
                             <span className="text-[7px] font-black uppercase">{c.role}</span>
                          </div>
                        </div>
                      </div>
                      {c.isSkippedNextWeek && (
                        <div className="flex flex-col items-center gap-1 text-amber-500 animate-pulse">
                          <Timer size={16} />
                          <span className="text-[6px] font-black uppercase tracking-tighter">Prioridad</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-campestre-50">
                      {hasRestriction ? (
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 w-full">
                              <Clock size={12} />
                              <span className="text-[9px] font-black uppercase tracking-widest">
                                Restricción: {avail.range.type === 'after' ? 'Desde' : 'Hasta'} {avail.range.time}
                              </span>
                           </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 w-full">
                           <CalendarDays size={12} />
                           <span className="text-[9px] font-black uppercase tracking-widest">Disponibilidad Total</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {groupedAvailable[activeCategoryTab].length === 0 && (
                <div className="py-20 text-center space-y-4 opacity-30 grayscale">
                  <div className="w-16 h-16 bg-campestre-50 rounded-full flex items-center justify-center mx-auto">
                    <UsersIcon size={32} />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em]">Sin personal de {activeCategoryTab}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel de Configuración de Turnos */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-campestre-100 shadow-sm">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3 text-campestre-800">
                  <Clock size={22} className="text-campestre-500" />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em]">Configurar Salida</h3>
                </div>

                <div className="p-8 bg-arena rounded-[2.5rem] border border-campestre-100 flex flex-col items-center shadow-inner">
                  <label className="text-[10px] font-black text-campestre-400 uppercase tracking-widest mb-4">Hora de Teet-Off</label>
                  <input 
                    type="time" 
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="text-6xl font-black bg-transparent text-campestre-800 outline-none text-center tabular-nums hover:text-campestre-500 transition-colors" 
                  />
                  <div className="h-px w-20 bg-campestre-200 my-6"></div>
                  <p className="text-[8px] font-black text-campestre-300 uppercase tracking-widest">Sede Llanogrande</p>
                </div>
              </div>

              <div className="flex-[2] space-y-6">
                <h4 className="text-[10px] font-black text-campestre-400 uppercase tracking-widest px-1">Cupos Requeridos por Categoría</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categories.map(cat => {
                    const avail = groupedAvailable[cat.id as keyof typeof groupedAvailable].length;
                    const val = counts[cat.id as keyof typeof counts];
                    return (
                      <div key={cat.id} className={`p-6 rounded-[2.5rem] border-2 transition-all ${val > 0 ? 'bg-white border-campestre-500 shadow-lg' : 'bg-arena border-campestre-50'}`}>
                        <div className="flex items-center justify-between mb-6">
                          <cat.icon size={20} className={cat.color} />
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${avail < val ? 'bg-rose-100 text-rose-600' : 'bg-campestre-50 text-campestre-400'}`}>
                            Libres: {avail}
                          </span>
                        </div>
                        <p className="text-[10px] font-black text-campestre-800 uppercase tracking-tighter mb-4">{cat.id}</p>
                        <div className="flex items-center justify-between bg-arena/50 p-2 rounded-2xl border border-campestre-100">
                          <button 
                            onClick={() => setCounts(p => ({...p, [cat.id]: Math.max(0, p[cat.id as keyof typeof counts]-1)}))}
                            className="w-12 h-12 bg-white rounded-xl shadow-sm border border-campestre-100 flex items-center justify-center hover:bg-campestre-50 active:scale-90 transition-all"
                          >
                            <Minus size={16}/>
                          </button>
                          <span className="text-2xl font-black text-campestre-800">{val}</span>
                          <button 
                            onClick={() => setCounts(p => ({...p, [cat.id]: p[cat.id as keyof typeof counts]+1}))}
                            disabled={avail <= val}
                            className="w-12 h-12 bg-white rounded-xl shadow-sm border border-campestre-100 flex items-center justify-center hover:bg-campestre-50 active:scale-90 transition-all disabled:opacity-20"
                          >
                            <Plus size={16}/>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button 
              onClick={handleAdd}
              disabled={Object.values(counts).every(v => v === 0)}
              className="w-full mt-10 py-6 bg-campestre-800 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-campestre-900/30 flex items-center justify-center gap-4 active:scale-[0.99] transition-all disabled:opacity-30 disabled:shadow-none"
            >
              <Plus size={20} />
              Agregar Turno a la Agenda
            </button>
          </div>

          {/* Timeline de Turnos */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-6">
               <h3 className="text-sm font-black text-campestre-800 uppercase tracking-[0.2em]">Agenda Programada - {activeDay}</h3>
               <span className="text-[11px] font-black text-campestre-400 uppercase tracking-widest bg-white border border-campestre-100 px-4 py-1 rounded-full">{dayShifts.length} Grupos</span>
            </div>

            {dayShifts.length === 0 ? (
              <div className="bg-arena/50 p-24 rounded-[4rem] border-2 border-dashed border-campestre-100 flex flex-col items-center justify-center text-center opacity-40">
                {/* Fixed icon component name to CalendarDays and removed invalid 'days' prop */}
                <CalendarDays size={64} className="text-campestre-200 mb-6" />
                <p className="text-sm font-black text-campestre-300 uppercase tracking-[0.3em]">No hay salidas programadas para el {activeDay}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {dayShifts.map((shift, sIdx) => {
                  const shiftAssigned = dayAssignments.filter(a => a.shiftId === shift.id);
                  return (
                    <div key={shift.id} className="bg-white rounded-[3rem] border border-campestre-100 shadow-sm overflow-hidden group hover:border-campestre-500 transition-all duration-500">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-40 bg-campestre-50/30 p-8 flex md:flex-col items-center justify-between border-b md:border-b-0 md:border-r border-campestre-100 group-hover:bg-campestre-50 transition-colors">
                           <div className="text-center">
                             <p className="text-[9px] font-black text-campestre-300 uppercase tracking-widest mb-2">Salida {sIdx + 1}</p>
                             <p className="text-3xl font-black text-campestre-800 leading-none">{shift.time}</p>
                           </div>
                           <button 
                             onClick={() => onRemoveShift(shift.id)}
                             className="p-4 bg-white text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl border border-campestre-100 transition-all shadow-sm"
                           >
                             <Trash2 size={20} />
                           </button>
                        </div>

                        <div className="flex-1 p-10">
                           <div className="flex flex-wrap gap-4 mb-8">
                              {shift.requirements.map(req => (
                                <div key={req.category} className="flex items-center gap-3 px-5 py-2.5 bg-arena rounded-full border border-campestre-100">
                                   <div className={`w-2.5 h-2.5 rounded-full ${req.category === 'Primera' ? 'bg-campestre-500' : req.category === 'Segunda' ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
                                   <span className="text-[11px] font-black text-campestre-800 tracking-tight">{req.count} <span className="text-campestre-400 font-bold">{req.category}</span></span>
                                </div>
                              ))}
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {shiftAssigned.length === 0 ? (
                                <div className="col-span-full py-8 bg-arena/50 rounded-[2.5rem] border border-dashed border-campestre-100 flex flex-col items-center justify-center gap-3 opacity-40">
                                   <AlertTriangle size={24} className="text-amber-500" />
                                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-campestre-400">Pendiente de Sorteo Automatizado</span>
                                </div>
                              ) : (
                                shiftAssigned.map(a => (
                                  <div key={a.caddieId} className="flex items-center gap-4 p-4 bg-arena rounded-2xl border border-campestre-50 group/item hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-campestre-800 font-black text-xs border border-campestre-100 shadow-sm group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all">
                                      {a.caddieNumber}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-black text-[10px] text-campestre-800 uppercase tracking-tight truncate leading-none mb-1.5">{a.caddieName}</p>
                                      <div className="flex items-center gap-2">
                                         <span className="text-[8px] font-black text-campestre-300 uppercase tracking-widest">{a.category}</span>
                                         <CheckCircle2 size={12} className="text-emerald-500" />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyDraw;