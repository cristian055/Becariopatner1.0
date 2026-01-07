import React, { useState, useMemo } from 'react';
import { 
  ArrowUpCircle, 
  RotateCcw, 
  CalendarX,
  FileText,
  ClockAlert,
  Zap,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Dices,
  MapPin,
  Activity,
  GripVertical,
  MoveVertical,
  Hash
} from 'lucide-react';
import { Caddie, ListConfig, CaddieStatus } from '../types';

interface ListManagerProps {
  caddies: Caddie[];
  lists: ListConfig[];
  onUpdateCaddie: (id: string, updates: Partial<Caddie>) => void;
  onUpdateList: (id: string, updates: Partial<ListConfig>) => void;
  onBulkUpdateCaddies: (bulkUpdates: { id: string, status: CaddieStatus, listId?: string }[]) => void;
  onRandomizeList?: (listId: string) => void;
  onReorderCaddie?: (listId: string, caddieId: string, newIndex: number) => void;
}

const ListManager: React.FC<ListManagerProps> = ({ 
  caddies, 
  lists, 
  onUpdateCaddie, 
  onUpdateList, 
  onBulkUpdateCaddies,
  onRandomizeList,
  onReorderCaddie
}) => {
  const [activeTabId, setActiveTabId] = useState<string>(lists[0]?.id || 'list-1');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [isManualReorderMode, setIsManualReorderMode] = useState(false);
  const [bulkCounts, setBulkCounts] = useState<Record<string, number>>({'list-1': 0, 'list-2': 0, 'list-3': 0});
  const [draggedCaddieId, setDraggedCaddieId] = useState<string | null>(null);

  const getQueue = useMemo(() => (listId: string) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return [];
    return caddies
      .filter(c => c.isActive && c.number >= list.rangeStart && c.number <= list.rangeEnd && (c.status === CaddieStatus.AVAILABLE || c.status === CaddieStatus.LATE))
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === CaddieStatus.AVAILABLE ? -1 : 1;
        if (list.order === 'RANDOM' || list.order === 'MANUAL') {
          return a.weekendPriority - b.weekendPriority;
        }
        return list.order === 'ASC' ? a.number - b.number : b.number - a.number;
      });
  }, [caddies, lists]);

  const getReturns = useMemo(() => (listId: string) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return [];
    return caddies.filter(c => c.isActive && c.number >= list.rangeStart && c.number <= list.rangeEnd && (c.status === CaddieStatus.IN_FIELD || c.status === CaddieStatus.IN_PREP));
  }, [caddies, lists]);

  const handleBulkDispatch = () => {
    const updates: { id: string, status: CaddieStatus, listId?: string }[] = [];
    
    lists.forEach(list => {
      const count = bulkCounts[list.id] || 0;
      if (count > 0) {
        const queue = getQueue(list.id);
        const toDispatch = queue.slice(0, count);
        toDispatch.forEach(c => {
          updates.push({ id: c.id, status: CaddieStatus.IN_PREP, listId: list.id });
        });
      }
    });

    if (updates.length > 0) {
      onBulkUpdateCaddies(updates);
      setBulkCounts({'list-1': 0, 'list-2': 0, 'list-3': 0});
      setIsQuickOpen(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isManualReorderMode) return;
    setDraggedCaddieId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    if (!isManualReorderMode || !draggedCaddieId || draggedCaddieId === targetId) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!isManualReorderMode || !draggedCaddieId || draggedCaddieId === targetId) return;
    e.preventDefault();

    const queue = getQueue(activeTabId);
    const targetIndex = queue.findIndex(c => c.id === targetId);
    if (targetIndex !== -1 && onReorderCaddie) {
      onReorderCaddie(activeTabId, draggedCaddieId, targetIndex);
    }
    setDraggedCaddieId(null);
  };

  const handlePositionChange = (caddieId: string, newPos: number) => {
    if (onReorderCaddie) {
      const queue = getQueue(activeTabId);
      const newIndex = Math.max(0, Math.min(queue.length - 1, newPos - 1));
      onReorderCaddie(activeTabId, caddieId, newIndex);
    }
  };

  const activeList = lists.find(l => l.id === activeTabId);

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      <div className="bg-white rounded-3xl border border-campestre-100 shadow-sm overflow-hidden shrink-0">
        <button 
          onClick={() => setIsQuickOpen(!isQuickOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-campestre-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-campestre-200" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-campestre-800">Despacho Masivo</span>
          </div>
          {isQuickOpen ? <ChevronUp size={20} className="text-campestre-200" /> : <ChevronDown size={20} className="text-campestre-200" />}
        </button>
        {isQuickOpen && (
          <div className="px-6 pb-6 pt-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {lists.map(list => (
                <div key={list.id} className="bg-arena p-4 rounded-2xl border border-campestre-100 flex flex-col items-center">
                  <span className="text-[9px] font-black text-campestre-400 uppercase mb-3 tracking-widest">{list.name}</span>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setBulkCounts(p => ({...p, [list.id]: Math.max(0, p[list.id]-1)}))} 
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-campestre-100 active:scale-90 transition-transform"
                    >
                      <Minus size={14}/>
                    </button>
                    <span className="text-lg font-extrabold text-campestre-800">{bulkCounts[list.id]}</span>
                    <button 
                      onClick={() => setBulkCounts(p => ({...p, [list.id]: Math.min(getQueue(list.id).length, p[list.id]+1)}))} 
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-campestre-100 active:scale-90 transition-transform"
                    >
                      <Plus size={14}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={handleBulkDispatch}
              disabled={Object.values(bulkCounts).every(v => v === 0)}
              className="w-full py-4 bg-campestre-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-campestre-500/20 active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none"
            >
              Confirmar Despacho
            </button>
          </div>
        )}
      </div>

      <div className="flex p-1 bg-white border border-campestre-100 rounded-2xl shadow-sm shrink-0 overflow-x-auto no-scrollbar">
        {lists.map(list => (
          <button
            key={list.id}
            onClick={() => setActiveTabId(list.id)}
            className={`flex-none sm:flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTabId === list.id ? 'bg-campestre-800 text-white shadow-md' : 'text-campestre-400 hover:text-campestre-600'
            }`}
          >
            {list.name}
            <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${activeTabId === list.id ? 'bg-campestre-500/30 text-campestre-100' : 'bg-campestre-50 text-campestre-400'}`}>
              {getQueue(list.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex flex-col space-y-6 pb-20">
        {activeList && (
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col">
                <h3 className="text-2xl font-extrabold text-campestre-800 tracking-tight">{activeList.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-campestre-300 uppercase tracking-[0.2em]">Starter Medellín</span>
                  <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${activeList.order === 'RANDOM' ? 'bg-indigo-100 text-indigo-600' : activeList.order === 'MANUAL' ? 'bg-emerald-100 text-emerald-600' : 'bg-campestre-100 text-campestre-600'}`}>
                    {activeList.order === 'RANDOM' ? 'Sorteo Aleatorio' : activeList.order === 'MANUAL' ? 'Orden Manual' : 'Orden Numérico'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsManualReorderMode(!isManualReorderMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${isManualReorderMode ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`}
                  title="Activar Reordenamiento Manual"
                >
                  <MoveVertical size={14} />
                  Reordenar
                </button>
                <button 
                  onClick={() => onRandomizeList?.(activeList.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[9px] uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all"
                  title="Sortear Lista"
                >
                  <Dices size={14} />
                  Sortear
                </button>
                <button 
                  onClick={() => setEditingListId(editingListId === activeList.id ? null : activeList.id)}
                  className="p-3 bg-campestre-50 rounded-2xl text-campestre-500 transition-colors"
                >
                  <SlidersHorizontal size={18} />
                </button>
              </div>
            </div>

            {editingListId === activeList.id && (
              <div className="bg-white p-6 rounded-[2rem] border border-campestre-100 shadow-sm grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-campestre-400 uppercase tracking-widest px-1">Rango Inicial</label>
                  <input type="number" value={activeList.rangeStart} onChange={e => onUpdateList(activeList.id, {rangeStart: parseInt(e.target.value) || 0})} className="w-full p-3 bg-arena border border-campestre-100 rounded-xl font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-campestre-400 uppercase tracking-widest px-1">Rango Final</label>
                  <input type="number" value={activeList.rangeEnd} onChange={e => onUpdateList(activeList.id, {rangeEnd: parseInt(e.target.value) || 0})} className="w-full p-3 bg-arena border border-campestre-100 rounded-xl font-bold outline-none" />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-campestre-400 px-2 uppercase text-[9px] font-black tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-campestre-500"></div>
                {isManualReorderMode ? 'Modo Reordenamiento Activo' : 'Cola de Turnos por Categoría'}
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {getQueue(activeList.id).map((caddie, idx) => (
                  <div 
                    key={caddie.id} 
                    draggable={isManualReorderMode}
                    onDragStart={(e) => handleDragStart(e, caddie.id)}
                    onDragOver={(e) => handleDragOver(e, caddie.id)}
                    onDrop={(e) => handleDrop(e, caddie.id)}
                    className={`bg-white p-6 rounded-[2.5rem] border shadow-sm transition-all ${draggedCaddieId === caddie.id ? 'opacity-40 border-dashed border-campestre-500' : isManualReorderMode ? 'border-emerald-200 cursor-move hover:border-emerald-500' : 'border-campestre-500/30 hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-6 mb-6">
                      {isManualReorderMode && (
                        <div className="text-emerald-300">
                          <GripVertical size={24} />
                        </div>
                      )}
                      
                      <div className="w-20 h-20 rounded-full flex items-center justify-center bg-campestre-800 text-white font-black text-2xl shadow-inner border-4 border-white ring-1 ring-campestre-100 relative">
                        {idx + 1}
                        <div className="absolute -top-1 -right-1 bg-campestre-500 text-white text-[8px] px-1.5 py-0.5 rounded-md font-black">
                          POS
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex flex-col">
                            <p className="font-extrabold text-lg text-campestre-800 uppercase tracking-tight leading-none">{caddie.name}</p>
                            <div className="flex items-center gap-1.5 mt-2">
                               <div className="flex items-center gap-1 px-2 py-0.5 bg-campestre-100/50 text-campestre-600 rounded-md border border-campestre-200">
                                 <Hash size={10} className="text-campestre-400" />
                                 <span className="text-[9px] font-black uppercase tracking-widest">Carné: {caddie.number}</span>
                               </div>
                               <span className="text-[10px] text-campestre-300 font-bold uppercase tracking-widest">|</span>
                               <span className="text-[9px] text-campestre-400 font-black uppercase tracking-widest">Cat. {caddie.category}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                             {isManualReorderMode ? (
                               <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                 <span className="text-[9px] font-black text-emerald-600 uppercase">Cambiar Turno</span>
                                 <input 
                                   type="number" 
                                   value={idx + 1}
                                   min={1}
                                   max={getQueue(activeList.id).length}
                                   onChange={(e) => handlePositionChange(caddie.id, parseInt(e.target.value) || 1)}
                                   className="w-12 bg-white text-emerald-800 font-black text-xs text-center border-none outline-none rounded-lg focus:ring-2 focus:ring-emerald-500"
                                 />
                               </div>
                             ) : (
                               <>
                                 <div className="flex items-center gap-1 px-2 py-1 bg-campestre-50 rounded-lg text-campestre-400">
                                   <MapPin size={10} />
                                   <span className="text-[8px] font-black uppercase">{caddie.location}</span>
                                 </div>
                                 <div className="flex items-center gap-1 px-2 py-1 bg-arena border border-campestre-100 rounded-lg text-campestre-600">
                                   <Activity size={10} />
                                   <span className="text-[8px] font-black uppercase">{caddie.role}</span>
                                 </div>
                               </>
                             )}
                          </div>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${idx === 0 ? 'text-campestre-500' : 'text-campestre-300'}`}>
                          {idx === 0 ? 'LISTO PARA SALIDA' : `TURNO #${idx + 1} EN COLA`}
                        </p>
                      </div>
                    </div>

                    {!isManualReorderMode && (
                      <div className="space-y-4">
                        <button 
                          onClick={() => onUpdateCaddie(caddie.id, { status: CaddieStatus.IN_PREP, listId: activeList.id })}
                          className="w-full flex items-center justify-center gap-3 py-4 bg-campestre-500 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-campestre-500/20 active:scale-[0.98] transition-all"
                        >
                          <ArrowUpCircle size={18} />
                          Autorizar Salida
                        </button>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <button onClick={() => onUpdateCaddie(caddie.id, { status: CaddieStatus.ABSENT })} className="bg-arena p-4 rounded-2xl flex flex-col items-center justify-center text-rose-400 hover:bg-rose-50 transition-colors border border-campestre-50">
                            <CalendarX size={20} />
                            <span className="text-[9px] font-black uppercase mt-2 tracking-tighter">Ausencia</span>
                          </button>
                          <button onClick={() => onUpdateCaddie(caddie.id, { status: CaddieStatus.ON_LEAVE })} className="bg-arena p-4 rounded-2xl flex flex-col items-center justify-center text-sky-400 hover:bg-sky-50 transition-colors border border-campestre-50">
                            <FileText size={20} />
                            <span className="text-[9px] font-black uppercase mt-2 tracking-tighter">Permiso</span>
                          </button>
                          <button onClick={() => onUpdateCaddie(caddie.id, { status: caddie.status === CaddieStatus.LATE ? CaddieStatus.AVAILABLE : CaddieStatus.LATE })} className="bg-arena p-4 rounded-2xl flex flex-col items-center justify-center text-amber-500 hover:bg-amber-50 transition-colors border border-campestre-50">
                            <ClockAlert size={20} />
                            <span className="text-[9px] font-black uppercase mt-2 tracking-tighter">Tarde</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-10 border-t border-campestre-100">
              <div className="flex items-center gap-2 text-campestre-300 px-2 uppercase text-[9px] font-black tracking-widest">
                <RotateCcw size={12} className="text-campestre-400" />
                Control de Retornos
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {getReturns(activeList.id).map(caddie => (
                  <div key={caddie.id} className="bg-white p-5 rounded-[2rem] border border-campestre-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full border border-campestre-50 flex items-center justify-center bg-arena mb-3 relative">
                      <span className="text-base font-extrabold text-campestre-800">{caddie.number}</span>
                      <div className="absolute -bottom-1 -right-1 bg-campestre-200 text-campestre-700 text-[6px] px-1 py-0.5 rounded font-black uppercase">Carné</div>
                      <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${caddie.status === CaddieStatus.IN_PREP ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                    </div>
                    <p className="text-[9px] font-extrabold text-campestre-600 uppercase mb-4 tracking-tighter truncate w-full px-2">{caddie.name}</p>
                    <button 
                      onClick={() => onUpdateCaddie(caddie.id, { status: CaddieStatus.AVAILABLE })}
                      className="w-full py-3 bg-campestre-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm"
                    >
                      Retorno
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListManager;