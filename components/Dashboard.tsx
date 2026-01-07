
import React from 'react';
import { Users, CheckCircle, MapPin, CalendarX } from 'lucide-react';
import { Caddie, ListConfig, CaddieStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  caddies: Caddie[];
  lists: ListConfig[];
}

const Dashboard: React.FC<DashboardProps> = ({ caddies, lists }) => {
  const stats = [
    { label: 'Total Flota', value: caddies.length, icon: Users, color: '#739c8f' },
    { label: 'Disponibles', value: caddies.filter(c => c.status === CaddieStatus.AVAILABLE).length, icon: CheckCircle, color: '#2d4a3e' },
    { label: 'En Campo', value: caddies.filter(c => c.status === CaddieStatus.IN_FIELD).length, icon: MapPin, color: '#c5d1cb' },
    { label: 'No Vino', value: caddies.filter(c => c.status === CaddieStatus.ABSENT).length, icon: CalendarX, color: '#f43f5e' },
  ];

  const distribution = lists.map(l => ({
    name: l.name,
    count: caddies.filter(c => c.number >= l.rangeStart && c.number <= l.rangeEnd && (c.status === CaddieStatus.AVAILABLE || c.status === CaddieStatus.LATE)).length
  }));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] border border-campestre-100 shadow-sm flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-arena text-campestre-500">
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-campestre-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-campestre-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-campestre-100 shadow-sm">
          <h3 className="text-xl font-extrabold text-campestre-800 mb-10 tracking-tight">Ocupación por Listas</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8ca99e', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8ca99e', fontSize: 10 }} />
                <Tooltip cursor={{ fill: '#fcfaf7' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {distribution.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={i === 0 ? '#739c8f' : i === 1 ? '#5c8074' : '#2d4a3e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-campestre-100 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-xl font-extrabold text-campestre-800 mb-10 tracking-tight w-full">Composición del Equipo</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Disponibles', value: caddies.filter(c => c.status === CaddieStatus.AVAILABLE).length, color: '#739c8f' },
                    { name: 'En Campo', value: caddies.filter(c => c.status === CaddieStatus.IN_FIELD).length, color: '#2d4a3e' },
                    { name: 'Incidencias', value: caddies.filter(c => c.status !== CaddieStatus.AVAILABLE && c.status !== CaddieStatus.IN_FIELD).length, color: '#e2e8e4' }
                  ]}
                  innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none"
                >
                  {[0,1,2].map((_, i) => <Cell key={i} fill={['#739c8f', '#2d4a3e', '#e2e8e4'][i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-10 mt-10 w-full text-center">
             <div>
               <p className="text-[10px] font-black text-campestre-400 uppercase mb-1">Activos</p>
               <p className="text-xl font-black text-campestre-800">82%</p>
             </div>
             <div>
               <p className="text-[10px] font-black text-campestre-400 uppercase mb-1">Demora</p>
               <p className="text-xl font-black text-campestre-800">12m</p>
             </div>
             <div>
               <p className="text-[10px] font-black text-campestre-400 uppercase mb-1">Rotación</p>
               <p className="text-xl font-black text-campestre-800">4.2</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
