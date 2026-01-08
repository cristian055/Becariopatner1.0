import React, { useState } from 'react'
import {
  ListOrdered,
  Users,
  BarChart3,
  Menu,
  X,
  Monitor,
  LogOut,
  CalendarDays,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ViewType } from '../types'
import ListManager from '../components/features/ListManager/ListManager'
import CaddieManager from '../components/features/CaddieManager/CaddieManager'
import Reports from '../components/features/Reports/Reports'
import WeeklyDraw from '../components/features/WeeklyDraw/WeeklyDraw'

interface AdminPageProps {
  onLogout: () => void
}

const AdminPage: React.FC<AdminPageProps> = ({ onLogout }) => {
  const navigate = useNavigate()
  const [activeAdminView, setActiveAdminView] = useState<ViewType>('lists')
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { id: 'lists', label: 'Turn Management', icon: ListOrdered },
    { id: 'weekly-draw', label: 'Weekly Draw', icon: CalendarDays },
    { id: 'caddies', label: 'Caddie Master', icon: Users },
    { id: 'reports', label: 'Statistics', icon: BarChart3 },
  ]

  return (
    <div className="flex h-screen bg-arena overflow-hidden font-sans">
      <aside
        className={`hidden md:flex flex-col bg-campestre-800 text-white transition-all duration-500 ${
          isSidebarOpen ? 'w-72' : 'w-24'
        } z-30`}
      >
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
              {isSidebarOpen && (
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 space-y-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-colors"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="font-bold text-sm">Logout</span>}
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
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-campestre-400">
              Operations Panel
            </h2>
            <p className="text-sm font-extrabold text-campestre-800">Fundación Club Campestre</p>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/monitor')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-campestre-600 hover:bg-campestre-50 rounded-xl transition-all text-xs font-bold"
            >
              <Monitor size={16} /> Go to Monitor
            </button>
            <div className="w-px h-6 bg-campestre-100"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-campestre-800">Administrator</p>
                <p className="text-[10px] text-campestre-400">Llanogrande Branch</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-campestre-50 border-2 border-campestre-100 p-0.5">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  className="rounded-full"
                  alt="User"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-arena/50">
          {activeAdminView === 'lists' && <ListManager />}
          {activeAdminView === 'weekly-draw' && <WeeklyDraw />}
          {activeAdminView === 'caddies' && <CaddieManager />}
          {activeAdminView === 'reports' && <Reports />}
        </main>

        <nav className="md:hidden h-20 bg-white border-t border-campestre-100 flex items-center justify-around px-4 shadow-lg shrink-0">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveAdminView(item.id as ViewType)}
              className={`flex flex-col items-center gap-1 ${
                activeAdminView === item.id ? 'text-campestre-500' : 'text-campestre-400'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[9px] font-black uppercase tracking-tighter">
                {item.id.split('-')[0]}
              </span>
            </button>
          ))}
          <button onClick={() => navigate('/monitor')} className="text-campestre-400">
            <Monitor size={20} />
          </button>
        </nav>
      </div>
    </div>
  )
}

export default AdminPage
