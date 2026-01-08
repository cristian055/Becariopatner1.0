import { useState, useCallback } from 'react';
import type { Caddie, ListConfig, CaddieLocation, CaddieRole, WeeklyShift, WeeklyAssignment } from '../types';
import { CaddieStatus } from '../types';

const INITIAL_CADDIES: Caddie[] = Array.from({ length: 120 }, (_, i) => {
  const num = i + 1;
  let category: 'Primera' | 'Segunda' | 'Tercera' = 'Primera';
  if (num > 40 && num <= 80) category = 'Segunda';
  if (num > 80) category = 'Tercera';

  return {
    id: `c-${num}`,
    name: `Caddie ${num}`,
    number: num,
    status: CaddieStatus.AVAILABLE,
    isActive: true,
    listId: num <= 40 ? 'list-1' : num <= 80 ? 'list-2' : 'list-3',
    historyCount: 0,
    absencesCount: 0,
    lateCount: 0,
    leaveCount: 0,
    lastActionTime: '08:00 AM',
    category,
    location: 'Llanogrande' as CaddieLocation,
    role: (num % 5 === 0 ? 'Híbrido' : 'Golf') as CaddieRole,
    weekendPriority: num,
    availability: [
      { day: 'Friday', isAvailable: true, range: { type: 'after', time: '09:30 AM' } },
      { day: 'Saturday', isAvailable: true, range: { type: 'full' } },
      { day: 'Sunday', isAvailable: true, range: { type: 'full' } }
    ]
  };
});

const INITIAL_LISTS: ListConfig[] = [
  { id: 'list-1', name: 'Primera Categoría', order: 'ASC', rangeStart: 1, rangeEnd: 40, category: 'Primera' },
  { id: 'list-2', name: 'Segunda Categoría', order: 'ASC', rangeStart: 41, rangeEnd: 80, category: 'Segunda' },
  { id: 'list-3', name: 'Tercera Categoría', order: 'ASC', rangeStart: 81, rangeEnd: 120, category: 'Tercera' },
];

/**
 * Convierte una cadena de hora (HH:mm o HH:mm AM/PM) a minutos totales desde medianoche
 */
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  
  const is12h = timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM');
  
  if (is12h) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (hours === 12) hours = 0;
    if (modifier.toUpperCase() === 'PM') hours += 12;
    return hours * 60 + minutes;
  } else {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }
};

export const useCaddieSystem = () => {
  const [caddies, setCaddies] = useState<Caddie[]>(INITIAL_CADDIES);
  const [lists, setLists] = useState<ListConfig[]>(INITIAL_LISTS);
  const [weeklyShifts, setWeeklyShifts] = useState<WeeklyShift[]>([]);
  const [weeklyAssignments, setWeeklyAssignments] = useState<WeeklyAssignment[]>([]);
  const [lastDispatchBatch, setLastDispatchBatch] = useState<{ ids: string[], timestamp: number } | null>(null);

  const addCaddie = useCallback((newCaddie: Omit<Caddie, 'id' | 'lastActionTime' | 'historyCount' | 'absencesCount' | 'lateCount' | 'leaveCount' | 'status' | 'listId'>) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = `c-${Math.random().toString(36).substr(2, 9)}`;
    
    const caddie: Caddie = {
      ...newCaddie,
      id,
      status: CaddieStatus.AVAILABLE,
      listId: null,
      historyCount: 0,
      absencesCount: 0,
      lateCount: 0,
      leaveCount: 0,
      lastActionTime: time
    };
    
    setCaddies(prev => [...prev, caddie]);
  }, []);

  const updateCaddie = useCallback((id: string, updates: Partial<Caddie>) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCaddies(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, ...updates, lastActionTime: time };
    }));
  }, []);

  const randomizeList = useCallback((listId: string) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return;
    setCaddies(prev => {
      const listCaddies = prev.filter(c => c.isActive && c.number >= list.rangeStart && c.number <= list.rangeEnd);
      const otherCaddies = prev.filter(c => !(c.isActive && c.number >= list.rangeStart && c.number <= list.rangeEnd));
      const priorities = listCaddies.map((_, i) => i + 1).sort(() => Math.random() - 0.5);
      const shuffledList = listCaddies.map((c, i) => ({ ...c, weekendPriority: priorities[i] }));
      return [...otherCaddies, ...shuffledList];
    });
    setLists(prev => prev.map(l => l.id === listId ? { ...l, order: 'RANDOM' } : l));
  }, [lists]);

  const reorderCaddie = useCallback((listId: string, caddieId: string, newIndex: number) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return;
    setCaddies(prev => {
      const listCaddies = prev.filter(c => c.isActive && c.number >= list.rangeStart && c.number <= list.rangeEnd).sort((a, b) => a.weekendPriority - b.weekendPriority);
      const otherCaddies = prev.filter(c => !(c.isActive && c.number >= list.rangeStart && c.number <= list.rangeEnd));
      const caddieIndex = listCaddies.findIndex(c => c.id === caddieId);
      if (caddieIndex === -1) return prev;
      const [movedCaddie] = listCaddies.splice(caddieIndex, 1);
      listCaddies.splice(newIndex, 0, movedCaddie);
      const updatedList = listCaddies.map((c, i) => ({ ...c, weekendPriority: i + 1 }));
      return [...otherCaddies, ...updatedList];
    });
    setLists(prev => prev.map(l => l.id === listId ? { ...l, order: 'MANUAL' } : l));
  }, [lists]);

  const addWeeklyShift = (shift: WeeklyShift) => {
    setWeeklyShifts(prev => [...prev, shift]);
  };

  const removeWeeklyShift = (id: string) => {
    setWeeklyShifts(prev => prev.filter(s => s.id !== id));
    setWeeklyAssignments(prev => prev.filter(a => a.shiftId !== id));
  };

  const generateWeeklyDraw = (day: string) => {
    const dayShifts = [...weeklyShifts]
      .filter(s => s.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));

    const newAssignments: WeeklyAssignment[] = [];
    
    // Lista de caddies inicialmente disponibles (activos y con el día marcado como disponible)
    const initialPool = caddies.filter(c => {
      if (!c.isActive) return false;
      const avail = c.availability.find(a => a.day === day);
      return avail && avail.isAvailable;
    });

    // Caddies para procesar en este sorteo, ordenados por prioridad (salteados primero, luego prioridad semanal)
    const availableCaddies = [...initialPool].sort((a, b) => {
      if (a.isSkippedNextWeek !== b.isSkippedNextWeek) return a.isSkippedNextWeek ? -1 : 1;
      return a.weekendPriority - b.weekendPriority;
    });

    dayShifts.forEach(shift => {
      const shiftMinutes = timeToMinutes(shift.time);
      
      shift.requirements.forEach(req => {
        let countAssigned = 0;
        while (countAssigned < req.count) {
          const eligibleIndex = availableCaddies.findIndex(c => {
            if (c.category !== req.category) return false;
            
            const avail = c.availability.find(a => a.day === day);
            if (!avail || !avail.isAvailable) return false;
            
            // Validación de rango horario
            if (avail.range && avail.range.type !== 'full') {
              const restrictionMinutes = timeToMinutes(avail.range.time || '00:00 AM');
              
              if (avail.range.type === 'after') {
                // "Desde" las 09:00 -> Solo puede salir a las 09:00 o después
                if (shiftMinutes < restrictionMinutes) return false;
              } else if (avail.range.type === 'before') {
                // "Hasta" las 08:00 -> Solo puede salir antes de las 08:00
                if (shiftMinutes >= restrictionMinutes) return false;
              }
            }
            return true;
          });

          if (eligibleIndex !== -1) {
            const assigned = availableCaddies[eligibleIndex];
            newAssignments.push({
              shiftId: shift.id,
              caddieId: assigned.id,
              caddieName: assigned.name,
              caddieNumber: assigned.number,
              category: assigned.category!,
              time: shift.time
            });
            availableCaddies.splice(eligibleIndex, 1);
            countAssigned++;
          } else {
            break;
          }
        }
      });
    });

    // Actualizar estados maestros:
    // Un caddie se marca como "Salteado" (isSkippedNextWeek) si:
    // 1. Estaba en el pool inicial para el día.
    // 2. NO fue asignado en este sorteo.
    // Esto incluye a los que no salieron por falta de cupo Y a los que no salieron por restricción horaria.
    const updatedCaddies = caddies.map(c => {
      const inInitialPool = initialPool.some(poolC => poolC.id === c.id);
      if (!inInitialPool) return c;

      const wasAssigned = newAssignments.some(a => a.caddieId === c.id);
      
      return { 
        ...c, 
        isSkippedNextWeek: !wasAssigned // Si estaba disponible hoy y no salió, tiene prioridad la próxima vez
      };
    });

    setWeeklyAssignments(prev => [
      ...prev.filter(a => !dayShifts.some(s => s.id === a.shiftId)), 
      ...newAssignments
    ]);
    setCaddies(updatedCaddies);
  };

  const bulkUpdateCaddies = useCallback((bulkUpdates: { id: string, status: CaddieStatus, listId?: string }[]) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const ids = bulkUpdates.map(u => u.id);
    setLastDispatchBatch({ ids, timestamp: Date.now() });
    
    setCaddies(prev => prev.map(c => {
      const update = bulkUpdates.find(u => u.id === c.id);
      if (!update) return c;
      return { ...c, ...update, lastActionTime: time };
    }));
  }, []);

  const resetSystem = useCallback(() => {
    setCaddies(prev => prev.map(c => ({
      ...c,
      status: CaddieStatus.AVAILABLE,
      historyCount: 0,
      absencesCount: 0,
      lateCount: 0,
      leaveCount: 0,
      lastActionTime: '08:00 AM',
      weekendPriority: c.number,
      isSkippedNextWeek: false
    })));
    setWeeklyAssignments([]);
    setLists(prev => prev.map(l => ({ ...l, order: 'ASC' })));
  }, []);

  const updateList = useCallback((id: string, updates: Partial<ListConfig>) => {
    setLists(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  return {
    caddies,
    lists,
    weeklyShifts,
    weeklyAssignments,
    lastDispatchBatch,
    addCaddie,
    updateCaddie,
    bulkUpdateCaddies,
    updateList,
    resetSystem,
    randomizeList,
    reorderCaddie,
    addWeeklyShift,
    removeWeeklyShift,
    generateWeeklyDraw
  };
};