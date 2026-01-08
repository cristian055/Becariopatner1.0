import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ShieldCheck, CalendarDays, Monitor, LayoutDashboard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';

interface MonitorNavBarProps {
  onBack: () => void;
}

const MonitorNavBar: React.FC<MonitorNavBarProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isWeekly = location.pathname.includes('/weekly');

  return (
    <nav className="sticky top-0 w-full z-[300] bg-white/80 backdrop-blur-md border-b border-border/40 px-4 md:px-10 h-16 flex items-center shadow-sm">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo & Status */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5 group cursor-default" onClick={() => navigate('/monitor')}>
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <LayoutDashboard size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-tighter text-foreground leading-none">
                Caddie<span className="text-primary">Pro</span>
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600/70">
                  Sistema Activo
                </span>
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-border/60 hidden lg:block"></div>

          {/* Sync Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full border border-border/50">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Sync: <span className="text-foreground">Online</span>
            </span>
          </div>
        </div>

        {/* View Toggle (Tabs) */}
        <div className="hidden md:flex items-center">
          <Tabs 
            value={isWeekly ? 'weekly' : 'daily'} 
            onValueChange={(val) => navigate(val === 'weekly' ? '/monitor/weekly' : '/monitor')}
          >
            <TabsList className="bg-muted/50 p-1 rounded-lg h-10 border border-border/20">
              <TabsTrigger 
                value="daily" 
                className="text-[11px] font-bold uppercase tracking-wider px-6 h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Monitor size={14} className="mr-2" />
                Monitor Hoy
              </TabsTrigger>
              <TabsTrigger 
                value="weekly" 
                className="text-[11px] font-bold uppercase tracking-wider px-6 h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <CalendarDays size={14} className="mr-2" />
                Sorteo Semanal
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Admin Access Button */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline"
            size="sm"
            onClick={onBack}
            className="group h-10 rounded-xl px-5 border-border hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm font-bold text-[11px] uppercase tracking-wider"
          >
            <Lock size={14} className="mr-2 text-muted-foreground group-hover:text-primary-foreground" />
            Acceso
          </Button>
        </div>

      </div>
    </nav>
  );
};

export default MonitorNavBar;

