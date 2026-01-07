import React, { useState, useEffect } from 'react';
import { 
  ListOrdered, 
  Users, 
  BarChart3, 
  Menu, 
  X, 
  Monitor,
  LogOut,
  CalendarDays
} from 'lucide-react';
import { ViewType } from './types';
import ListManager from './components/ListManager';
import CaddieManager from './components/CaddieManager';
import Reports from './components/Reports';
import PublicQueue from './components/PublicQueue';
import Login from './components/Login';
import WeeklyDraw from './components/WeeklyDraw';
import WeeklyMonitor from './components/WeeklyMonitor';
import { useCaddieSystem } from './hooks/useCaddieSystem';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/monitor');
  const [activeAdminView, setActiveAdminView] = useState<ViewType>('lists');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const { 
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
  } = useCaddieSystem();

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = '#/monitor';
    }

    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#/monitor');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const menuItems = [
    { id: 'lists', label: 'Gestión Turnos', icon: ListOrdered },
    { id: 'weekly-draw', label: 'Sorteo Semanal', icon: CalendarDays },
    { id: 'caddies', label: 'Maestro Caddies', icon: Users },
    { id: 'reports', label: 'Estadísticas', icon: BarChart3 },
  ];

  if (currentPath === '#/monitor') {
    return (
      <PublicQueue 
        caddies={caddies} 
        lists={lists} 
        lastDispatchBatch={lastDispatchBatch}
        onBack={() => navigate('#/admin')}
      />
    );
  }

  if (currentPath === '#/weekly-monitor') {
    return (
      <WeeklyMonitor 
        caddies={caddies}
        shifts={weeklyShifts}
        assignments={weeklyAssignments}
        onBack={() => navigate('#/admin')}
      />
    );
  }

  if (currentPath.startsWith('#/admin') && !isAdmin) {
    return <Login onLogin={() => setIsAdmin(true)} onBackToPublic={() => navigate('#/monitor')} />;
  }

  if (currentPath.startsWith('#/admin') && isAdmin) {
    return (
      <div className="flex h-screen bg-arena overflow-hidden font-sans">
        <aside className={`hidden md:flex flex-col bg-campestre-800 text-white transition-all duration-500 ${isSidebarOpen ? 'w-72' : 'w-24'} z-30`}>
          <div className="p-8 flex items-center gap-4">
            <div className="w-10 h-10 bg-campestre-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <span className="font-extrabold text-xl">C</span>
            </div>
            {isSidebarOpen && <span className="font-extrabold text-xl tracking-tight">CaddiePro</span>}
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveAdminView(item.id as ViewType)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                  activeAdminView === item.id 
                    ? 'bg-campestre-500 text-white shadow-xl shadow-campestre-900/40' 
                    : 'text-campestre-200 hover:bg-white/5'
                }`}
              >
                <item.icon size={22} strokeWidth={activeAdminView === item.id ? 2.5 : 2} />
                {isSidebarOpen && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-6 space-y-4">
            <button 
              onClick={() => {
                setIsAdmin(false);
                navigate('#/monitor');
              }}
              className="w-full flex items-center gap-4 px-4 py-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-colors"
            >
              <LogOut size={22} />
              {isSidebarOpen && <span className="font-bold text-sm">Cerrar Sesión</span>}
            </button>
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center justify-center py-4 text-campestre-400 hover:text-white transition-colors border-t border-white/10"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-20 bg-white border-b border-campestre-100 px-8 flex items-center justify-between shrink-0">
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-campestre-400">Panel Operativo</h2>
              <p className="text-sm font-extrabold text-campestre-800"> Fundación Club Campestre</p>
            </div>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('#/monitor')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-campestre-600 hover:bg-campestre-50 rounded-xl transition-all text-xs font-bold"
              >
                <Monitor size={16} /> Ir al Monitor
              </button>
              <div className="w-px h-6 bg-campestre-100"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-campestre-800">Administrador</p>
                  <p className="text-[10px] text-campestre-400">Sede Llanogrande</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-campestre-50 border-2 border-campestre-100 p-0.5">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="rounded-full" alt="User" />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-arena/50">
            {activeAdminView === 'lists' && (
              <ListManager 
                caddies={caddies} 
                lists={lists} 
                onUpdateCaddie={updateCaddie} 
                onUpdateList={updateList} 
                onBulkUpdateCaddies={bulkUpdateCaddies}
                onRandomizeList={randomizeList}
                onReorderCaddie={reorderCaddie}
              />
            )}
            {activeAdminView === 'weekly-draw' && (
              <WeeklyDraw 
                caddies={caddies}
                shifts={weeklyShifts}
                assignments={weeklyAssignments}
                onAddShift={addWeeklyShift}
                onRemoveShift={removeWeeklyShift}
                onGenerate={generateWeeklyDraw}
              />
            )}
            {activeAdminView === 'caddies' && (
              <CaddieManager 
                caddies={caddies} 
                onUpdateCaddie={updateCaddie}
                onAddCaddie={addCaddie}
              />
            )}
            {activeAdminView === 'reports' && <Reports caddies={caddies} onReset={resetSystem} />}
          </main>

          <nav className="md:hidden h-20 bg-white border-t border-campestre-100 flex items-center justify-around px-4 shadow-lg shrink-0">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveAdminView(item.id as ViewType)}
                className={`flex flex-col items-center gap-1 ${activeAdminView === item.id ? 'text-campestre-500' : 'text-campestre-400'}`}
              >
                <item.icon size={20} />
                <span className="text-[9px] font-black uppercase tracking-tighter">{item.id.split('-')[0]}</span>
              </button>
            ))}
            <button onClick={() => navigate('#/monitor')} className="text-campestre-400"><Monitor size={20} /></button>
          </nav>
        </div>
      </div>
    );
  }

  return (
    <PublicQueue 
      caddies={caddies} 
      lists={lists} 
      lastDispatchBatch={lastDispatchBatch}
      onBack={() => navigate('#/admin')}
    />
  );
};

export default App;