import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Check, 
  MapPin, 
  Activity, 
  Clock,
  Calendar,
  Save,
  Pencil,
  Trophy,
  Power,
  ChevronDown,
  UserCheck,
  UserX,
  Layers,
  User,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { Caddie, CaddieStatus, CaddieLocation, CaddieRole, DayAvailability } from '../types';

interface CaddieManagerProps {
  caddies: Caddie[];
  onUpdateCaddie: (id: string, updates: Partial<Caddie>) => void;
  onAddCaddie: (newCaddie: Omit<Caddie, 'id' | 'lastActionTime' | 'historyCount' | 'absencesCount' | 'lateCount' | 'leaveCount' | 'status' | 'listId'>) => void;
}

type CategoryFilter = 'All' | 'Primera' | 'Segunda' | 'Tercera';
type ActiveFilter = 'All' | 'Active' | 'Inactive';

const DEFAULT_AVAILABILITY: DayAvailability[] = [
  { day: 'Viernes', isAvailable: true, range: { type: 'after', time: '09:30 AM' } },
  { day: 'Sábado', isAvailable: true, range: { type: 'full' } },
  { day: 'Domingo', isAvailable: true, range: { type: 'full' } }
];

const CaddieManager: React.FC<CaddieManagerProps> = ({ caddies, onUpdateCaddie, onAddCaddie }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCaddie, setEditingCaddie] = useState<Caddie | null>(null);
  const [isAddingCaddie, setIsAddingCaddie] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Nuevo Caddie State
  const [newCaddie, setNewCaddie] = useState<Omit<Caddie, 'id' | 'lastActionTime' | 'historyCount' | 'absencesCount' | 'lateCount' | 'leaveCount' | 'status' | 'listId'>>({
    name: '',
    number: 1,
    isActive: true,
    category: 'Primera',
    location: 'Llanogrande',
    role: 'Golf',
    availability: [...DEFAULT_AVAILABILITY],
    weekendPriority: 0,
    isSkippedNextWeek: false
  });

  // Al abrir el modal de "Nuevo", calcular el siguiente número disponible
  useEffect(() => {
    if (isAddingCaddie) {
      const nextNum = caddies.length > 0 ? Math.max(...caddies.map(c => c.number)) + 1 : 1;
      setNewCaddie(prev => ({ ...prev, number: nextNum }));
      setError(null);
    }
  }, [isAddingCaddie, caddies]);

  // Estados de Filtro
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('All');

  const filteredCaddies = caddies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.number.toString().includes(searchTerm);
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesActive = activeFilter === 'All' || 
                         (activeFilter === 'Active' ? c.isActive : !c.isActive);
    
    return matchesSearch && matchesCategory && matchesActive;
  });

  const hasActiveFilters = categoryFilter !== 'All' || activeFilter !== 'All';

  const getStatusConfig = (status: CaddieStatus, isActive: boolean) => {
    if (!isActive) return { label: 'Inactivo', color: 'bg-slate-100 text-slate-400 border-slate-200' };
    
    switch (status) {
      case CaddieStatus.AVAILABLE:
        return { label: 'Disponible', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case CaddieStatus.IN_FIELD:
        return { label: 'En Campo', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case CaddieStatus.IN_PREP:
        return { label: 'En Carga', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
      case CaddieStatus.LATE:
        return { label: 'Tarde', color: 'bg-amber-100 text-amber-600 border-amber-200' };
      case CaddieStatus.ABSENT:
        return { label: 'No Vino', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case CaddieStatus.ON_LEAVE:
        return { label: 'Permiso', color: 'bg-sky-100 text-sky-700 border-sky-200' };
      default:
        return { label: 'Inactivo', color: 'bg-slate-100 text-slate-500 border-slate-200' };
    }
  };

  const handleSaveEdit = () => {
    if (editingCaddie) {
      const isDuplicate = caddies.some(c => c.number === editingCaddie.number && c.id !== editingCaddie.id);
      if (isDuplicate) {
        setError("El número de carné ya está en uso");
        return;
      }
      onUpdateCaddie(editingCaddie.id, editingCaddie);
      setEditingCaddie(null);
      setError(null);
    }
  };

  const handleSaveNew = () => {
    setError(null);
    if (!newCaddie.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    
    const isDuplicate = caddies.some(c => c.number === newCaddie.number);
    if (isDuplicate) {
      setError(`El número de carné ${newCaddie.number} ya está asignado`);
      return;
    }

    onAddCaddie({
      ...newCaddie,
      weekendPriority: newCaddie.number
    });
    setIsAddingCaddie(false);
    
    setNewCaddie({
      name: '',
      number: 1,
      isActive: true,
      category: 'Primera',
      location: 'Llanogrande',
      role: 'Golf',
      availability: [...DEFAULT_AVAILABILITY],
      weekendPriority: 0,
      isSkippedNextWeek: false
    });
  };

  const updateAvailability = (isNew: boolean, dayIndex: number, updates: Partial<DayAvailability>) => {
    if (isNew) {
      const newAvailability = [...newCaddie.availability];
      newAvailability[dayIndex] = { ...newAvailability[dayIndex], ...updates };
      setNewCaddie({ ...newCaddie, availability: newAvailability });
    } else if (editingCaddie) {
      const newAvailability = [...editingCaddie.availability];
      newAvailability[dayIndex] = { ...newAvailability[dayIndex], ...updates };
      setEditingCaddie({ ...editingCaddie, availability: newAvailability });
    }
  };

  const resetFilters = () => {
    setCategoryFilter('All');
    setActiveFilter('All');
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-campestre-200" size={18} />
          <input 
            type="text" 
            placeholder="Buscar caddie por nombre o carné..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-campestre-100 rounded-3xl focus:ring-4 focus:ring-campestre-500/5 outline-none transition-all shadow-sm font-medium text-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
              showFilters || hasActiveFilters
                ? 'bg-campestre-800 text-white border-campestre-800 shadow-lg' 
                : 'bg-white text-campestre-600 border-campestre-100 hover:bg-campestre-50'
            }`}
          >
            <Filter size={16} />
            Filtros
            {hasActiveFilters && <div className="w-2 h-2 bg-campestre-500 rounded-full animate-pulse"></div>}
          </button>

          {showFilters && (
            <div className="absolute right-0 top-full mt-3 w-80 bg-white border border-campestre-100 rounded-[2.5rem] shadow-2xl z-50 p-8 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black text-campestre-800 uppercase tracking-widest">Ajustes de Vista</h4>
                <button onClick={resetFilters} className="text-[8px] font-black text-campestre-400 hover:text-rose-500 uppercase tracking-widest underline decoration-campestre-100 underline-offset-4">Limpiar</button>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-campestre-400">
                    <Layers size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Por Categoría</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Primera', 'Segunda', 'Tercera'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat as CategoryFilter)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                          categoryFilter === cat 
                            ? 'bg-campestre-100 text-campestre-800 border-campestre-200' 
                            : 'bg-arena text-campestre-400 border-transparent hover:border-campestre-100'
                        }`}
                      >
                        {cat === 'All' ? 'Todas' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-campestre-400">
                    <Power size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Estado Maestro</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'All', label: 'Todos los registros', icon: Layers },
                      { id: 'Active', label: 'Personal Operativo', icon: UserCheck },
                      { id: 'Inactive', label: 'Personal Retirado', icon: UserX }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setActiveFilter(opt.id as ActiveFilter)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                          activeFilter === opt.id 
                            ? 'bg-campestre-50 text-campestre-800 border-campestre-200' 
                            : 'bg-arena text-campestre-400 border-transparent hover:bg-campestre-50'
                        }`}
                      >
                        <opt.icon size={14} className={activeFilter === opt.id ? 'text-campestre-500' : 'text-campestre-200'} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-campestre-50">
                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full py-3 bg-campestre-800 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em]"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}

          <button 
            onClick={() => setIsAddingCaddie(true)}
            className="px-8 py-4 bg-campestre-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-campestre-500/20 active:scale-95 transition-all flex items-center gap-3"
          >
            <PlusCircle size={18} />
            Nuevo Caddie
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-campestre-100 overflow-hidden min-h-[400px]">
        {filteredCaddies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-arena rounded-3xl flex items-center justify-center text-campestre-100 mb-6">
              <Search size={40} />
            </div>
            <h3 className="text-lg font-black text-campestre-800 uppercase tracking-tight">Sin resultados</h3>
            <p className="text-xs font-bold text-campestre-300 mt-2">No encontramos caddies con los filtros seleccionados</p>
            <button onClick={resetFilters} className="mt-6 text-[10px] font-black text-campestre-500 uppercase tracking-widest underline decoration-campestre-200 underline-offset-8">Restablecer Vista</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-campestre-50/50 border-b border-campestre-100 text-campestre-400 text-[9px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Carné ID</th>
                  <th className="px-8 py-6">Nombre y Categoría</th>
                  <th className="px-8 py-6">Sede / Disciplina</th>
                  <th className="px-8 py-6">Estado Maestro</th>
                  <th className="px-8 py-6 text-center">Servicios</th>
                  <th className="px-8 py-6 text-right">Opciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-campestre-50">
                {filteredCaddies.map((caddie) => {
                  const status = getStatusConfig(caddie.status, caddie.isActive);
                  return (
                    <tr key={caddie.id} className={`hover:bg-arena/50 transition-colors group ${!caddie.isActive ? 'bg-slate-50/30 grayscale-[0.5]' : ''}`}>
                      <td className="px-8 py-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-inner border-2 border-white ring-1 ring-campestre-100 ${caddie.isActive ? 'bg-campestre-800' : 'bg-slate-400'}`}>
                          {caddie.number}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div>
                          <p className={`font-extrabold text-sm uppercase tracking-tight leading-none ${caddie.isActive ? 'text-campestre-800' : 'text-slate-400 line-through'}`}>{caddie.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                             <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                               !caddie.isActive ? 'bg-slate-100 text-slate-400 border-slate-200' :
                               caddie.category === 'Primera' ? 'bg-campestre-500/10 text-campestre-600 border-campestre-500/20' :
                               caddie.category === 'Segunda' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                               'bg-slate-500/10 text-slate-600 border-slate-500/20'
                             }`}>
                               Categoría {caddie.category || 'N/A'}
                             </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-campestre-400">
                            <MapPin size={10} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{caddie.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-campestre-400">
                            <Activity size={10} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{caddie.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="font-black text-campestre-800 text-sm">{caddie.historyCount}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onUpdateCaddie(caddie.id, { isActive: !caddie.isActive })}
                            className={`p-3 rounded-xl transition-all ${caddie.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:text-emerald-500 hover:bg-slate-50'}`}
                            title={caddie.isActive ? "Desactivar de Listas" : "Activar en Listas"}
                          >
                            <Power size={18} />
                          </button>
                          <button 
                            onClick={() => setEditingCaddie(caddie)}
                            className="p-3 text-campestre-300 hover:text-campestre-800 hover:bg-campestre-50 rounded-xl transition-all" 
                            title="Editar Perfil"
                          >
                            <Pencil size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(editingCaddie || isAddingCaddie) && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-end bg-campestre-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="h-full w-full max-w-xl bg-white shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto custom-scrollbar flex flex-col">
            <div className="sticky top-0 bg-white z-10 border-b border-campestre-100 p-8 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-campestre-800 tracking-tight">{isAddingCaddie ? 'Nuevo Registro' : 'Editar Perfil'}</h3>
                <p className="text-[10px] font-black text-campestre-400 uppercase tracking-widest mt-1">Operaciones Club Campestre</p>
              </div>
              <button 
                onClick={() => { setEditingCaddie(null); setIsAddingCaddie(false); setError(null); }}
                className="p-3 bg-arena rounded-2xl text-campestre-400 hover:text-campestre-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-10 flex-1">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={18} />
                  <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                </div>
              )}

              {!isAddingCaddie && editingCaddie && (
                <div className="bg-arena p-6 rounded-3xl border border-campestre-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${editingCaddie.isActive ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-400 grayscale'} shadow-lg`}>
                      <Power size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-campestre-400 uppercase tracking-widest">Estado Maestro</p>
                      <p className={`text-sm font-black uppercase ${editingCaddie.isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {editingCaddie.isActive ? 'Caddie Activo en Sistema' : 'Caddie Inactivo (Oculto)'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingCaddie({...editingCaddie, isActive: !editingCaddie.isActive})}
                    className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${editingCaddie.isActive ? 'bg-white text-rose-500 border border-rose-100 hover:bg-rose-50' : 'bg-emerald-500 text-white shadow-lg'}`}
                  >
                    {editingCaddie.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-campestre-800 mb-2">
                  <User size={18} className="text-campestre-500" />
                  <h4 className="text-xs font-black uppercase tracking-[0.2em]">Información General</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[9px] font-black text-campestre-400 uppercase tracking-widest px-1">Nombre Completo <span className="text-rose-400">*</span></label>
                    <input 
                      type="text" 
                      value={isAddingCaddie ? newCaddie.name : editingCaddie?.name || ''}
                      onChange={e => {
                        setError(null);
                        isAddingCaddie ? setNewCaddie({...newCaddie, name: e.target.value}) : setEditingCaddie({...editingCaddie!, name: e.target.value});
                      }}
                      placeholder="Ej: Juan Pérez"
                      className="w-full p-4 bg-arena border border-campestre-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-campestre-500/5 transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-[9px] font-black text-campestre-400 uppercase tracking-widest px-1">Número de Carné <span className="text-rose-400">*</span></label>
                    <input 
                      type="number" 
                      value={isAddingCaddie ? newCaddie.number : editingCaddie?.number || 0}
                      onChange={e => {
                        setError(null);
                        const val = parseInt(e.target.value) || 0;
                        isAddingCaddie ? setNewCaddie({...newCaddie, number: val}) : setEditingCaddie({...editingCaddie!, number: val});
                      }}
                      className="w-full p-4 bg-arena border border-campestre-100 rounded-2xl font-bold text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-campestre-400 uppercase tracking-widest px-1">Categoría Técnica</label>
                    <div className="relative">
                      <select 
                        value={isAddingCaddie ? newCaddie.category : editingCaddie?.category || 'Primera'}
                        onChange={e => isAddingCaddie ? setNewCaddie({...newCaddie, category: e.target.value as any}) : setEditingCaddie({...editingCaddie!, category: e.target.value as any})}
                        className="w-full p-4 bg-arena border border-campestre-100 rounded-2xl font-bold text-sm outline-none appearance-none pr-10"
                      >
                        <option value="Primera">Primera Categoría</option>
                        <option value="Segunda">Segunda Categoría</option>
                        <option value="Tercera">Tercera Categoría</option>
                      </select>
                      <Trophy size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-campestre-300 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-campestre-800 mb-2">
                  <Calendar size={18} className="text-campestre-500" />
                  <h4 className="text-xs font-black uppercase tracking-[0.2em]">Disponibilidad Semanal</h4>
                </div>
                <div className="space-y-3">
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => {
                    const currentObj = isAddingCaddie ? newCaddie : editingCaddie;
                    const dayAvail = currentObj?.availability.find(a => a.day === day) || { day, isAvailable: false } as DayAvailability;
                    const availIndex = currentObj?.availability.findIndex(a => a.day === day) ?? -1;
                    
                    return (
                      <div key={day} className={`p-4 rounded-3xl border transition-all ${dayAvail.isAvailable ? 'bg-white border-campestre-500/30' : 'bg-arena border-campestre-100'}`}>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => {
                                  if (availIndex >= 0) {
                                    updateAvailability(isAddingCaddie, availIndex, { isAvailable: !dayAvail.isAvailable });
                                  } else {
                                    const baseAvails = isAddingCaddie ? [...newCaddie.availability] : [...editingCaddie!.availability];
                                    const newAvail: DayAvailability[] = [...baseAvails, { 
                                      day: day as any, 
                                      isAvailable: true, 
                                      range: { type: 'full' as const } 
                                    } as DayAvailability];
                                    if (isAddingCaddie) setNewCaddie({...newCaddie, availability: newAvail});
                                    else setEditingCaddie({...editingCaddie!, availability: newAvail});
                                  }
                                }}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${dayAvail.isAvailable ? 'bg-campestre-500 text-white' : 'bg-white border border-campestre-200 text-transparent'}`}
                              >
                                <Check size={14} />
                              </button>
                              <span className={`text-xs font-black uppercase tracking-widest ${dayAvail.isAvailable ? 'text-campestre-800' : 'text-campestre-300'}`}>{day}</span>
                            </div>
                            
                            {dayAvail.isAvailable && (
                              <div className="flex items-center gap-2 bg-arena px-3 py-1.5 rounded-xl border border-campestre-100">
                                <Clock size={12} className="text-campestre-400" />
                                <select 
                                  value={dayAvail.range?.type || 'full'}
                                  onChange={e => updateAvailability(isAddingCaddie, availIndex, { 
                                    range: { 
                                      ...(dayAvail.range || { type: 'full' }), 
                                      type: e.target.value as any,
                                      time: (dayAvail.range?.time || '08:00 AM')
                                    } 
                                  })}
                                  className="bg-transparent text-[10px] font-black uppercase outline-none text-campestre-600"
                                >
                                  <option value="full">Todo el día</option>
                                  <option value="before">Antes de</option>
                                  <option value="after">Desde</option>
                                </select>
                              </div>
                            )}
                          </div>

                          {dayAvail.isAvailable && dayAvail.range?.type !== 'full' && (
                            <div className="flex items-center gap-4 bg-arena/50 p-4 rounded-2xl border border-campestre-50 animate-in slide-in-from-top-2">
                               <label className="text-[8px] font-black text-campestre-400 uppercase tracking-widest">Ajustar Hora:</label>
                               <input 
                                 type="text"
                                 placeholder="Ej: 09:30 AM"
                                 value={dayAvail.range?.time || ''}
                                 onChange={(e) => updateAvailability(isAddingCaddie, availIndex, { 
                                   range: { ...dayAvail.range!, time: e.target.value } 
                                 })}
                                 className="flex-1 bg-white border border-campestre-100 px-3 py-1.5 rounded-lg text-[10px] font-black text-campestre-800 outline-none focus:ring-2 focus:ring-campestre-500/20"
                               />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-campestre-100 p-8 flex gap-4">
              <button 
                onClick={() => { setEditingCaddie(null); setIsAddingCaddie(false); setError(null); }}
                className="flex-1 py-4 bg-arena text-campestre-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={isAddingCaddie ? handleSaveNew : handleSaveEdit}
                className="flex-[2] py-4 bg-campestre-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-campestre-900/20 active:scale-95 transition-all"
              >
                <Save size={16} />
                {isAddingCaddie ? 'Crear Caddie' : 'Actualizar Perfil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaddieManager;