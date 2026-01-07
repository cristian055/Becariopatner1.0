
import { useState, useEffect, useRef } from 'react';
import { Caddie } from '../types';

export const useDispatchMonitor = (
  lastDispatchBatch: { ids: string[], timestamp: number } | null | undefined, 
  caddies: Caddie[]
) => {
  const [showPopup, setShowPopup] = useState(false);
  const [callingCaddies, setCallingCaddies] = useState<Caddie[]>([]);
  const timerRef = useRef<number | null>(null);
  
  const lastProcessedTimestampRef = useRef<number>(
    lastDispatchBatch && (Date.now() - lastDispatchBatch.timestamp < 3000) 
      ? lastDispatchBatch.timestamp - 1 
      : (lastDispatchBatch?.timestamp || 0)
  );

  useEffect(() => {
    if (lastDispatchBatch) {
      const { ids, timestamp } = lastDispatchBatch;

      if (timestamp > lastProcessedTimestampRef.current) {
        const currentBatch = caddies.filter(c => ids.includes(c.id));
        
        if (currentBatch.length > 0) {
          setCallingCaddies(currentBatch);
          setShowPopup(true);
          lastProcessedTimestampRef.current = timestamp;

          if (timerRef.current) window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            setShowPopup(false);
          }, 8000);
        }
      }
    }
  }, [lastDispatchBatch, caddies]);

  const getPopupLayout = (count: number) => {
    if (count === 1) return { 
      grid: 'grid-cols-1', 
      card: 'p-6 md:p-14 gap-6 md:gap-20', 
      circle: 'w-28 h-28 md:w-72 md:h-72 text-5xl md:text-[160px]', 
      name: 'text-3xl md:text-9xl', 
      badge: 'text-lg md:text-5xl' 
    };
    if (count === 2) return { 
      grid: 'grid-cols-1 lg:grid-cols-2', 
      card: 'p-4 md:p-10 gap-4 md:gap-10', 
      circle: 'w-20 h-20 md:w-48 md:h-48 text-3xl md:text-[100px]', 
      name: 'text-2xl md:text-6xl', 
      badge: 'text-sm md:text-3xl' 
    };
    return { 
      grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', 
      card: 'p-3 md:p-6 gap-3 md:gap-6', 
      circle: 'w-16 h-16 md:w-28 md:h-28 text-2xl md:text-[50px]', 
      name: 'text-xl md:text-3xl', 
      badge: 'text-[10px] md:text-xl' 
    };
  };

  return {
    showPopup,
    callingCaddies,
    layout: getPopupLayout(callingCaddies.length)
  };
};
