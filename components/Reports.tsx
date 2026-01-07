
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Caddie, CaddieStatus } from '../types';
import { 
  TrendingUp, 
  Clock, 
  CalendarX, 
  FileText, 
  Download, 
  AlertCircle,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface ReportsProps {
  caddies: Caddie[];
  onReset?: () => void;
}

const Reports: React.FC<ReportsProps> = ({ caddies, onReset }) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const totalAbsences = caddies.reduce((acc, c) => acc + (c.absencesCount || 0), 0);
  const totalLeaves = caddies.reduce((acc, c) => acc + (c.leaveCount || 0), 0);
  const totalLates = caddies.reduce((acc, c) => acc + (c.lateCount || 0), 0);
  const totalServices = caddies.reduce((acc, c) => acc + (c.historyCount || 0), 0);

  const handleDownloadReport = () => {
    const headers = ['Número', 'Nombre', 'Categoría', 'Estado Actual', 'Servicios Hoy', 'Ausencias', 'Permisos', 'Tardanzas'];
    const rows = caddies.map(c => [
      c.number,
      c.name,
      c.category || 'N/A',
      c.status,
      c.historyCount,
      c.absencesCount,
      c.leaveCount,
      c.lateCount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `CaddiePro_Reporte_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseDay = () => {
    handleDownloadReport();
    if (onReset) onReset();
    setShowConfirmReset(false);
  };

  const serviceData = [
    { hour: '07:00', servicios: 12 },
    { hour: '08:00', servicios: 25 },
    { hour: '09:00', servicios: totalServices > 50 ? totalServices - 10 : totalServices },
    { hour: '10:00', servicios: totalServices },
  ];

  const topIncidents = [...caddies]
    .filter(c => (c.absencesCount || 0) > 0 || (c.leaveCount || 0) > 0 || (c.lateCount || 0) > 0)
    .sort((a, b) => (b.absencesCount + b.leaveCount + b.lateCount) - (a.absencesCount + a.leaveCount + a.lateCount))
    .slice(0, 8);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-campestre-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-campestre-800 tracking-tight">Reporte Operativo Diario</h2>
          <p className="text-sm font-bold text-campestre-400 mt-1">Gestión de cierres y descargas de trazabilidad</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-6 py-3 bg-arena border border-campestre-200 text-campestre-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-campestre-50 transition-all"
          >
            <Download size={16} />
            Descargar CSV
          </button>
          <button 
            onClick={() => setShowConfirmReset(true)}
            className="flex items-center gap-2 px-8 py-3 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
          >
            <Trash2 size={16} />
            Cerrar Jornada
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-[600] bg-campestre-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-8">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-2xl font-black text-campestre-800 mb-4 tracking-tight">¿Cerrar la jornada laboral?</h3>
            <p className="text-campestre-400 text-sm leading-relaxed mb-10 font-medium">
              Esta acción generará automáticamente un reporte detallado y <strong>reiniciará todos los contadores</strong> de los caddies a cero para el próximo día. Esta operación es irreversible.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleCloseDay}
                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest"
              >
                Confirmar y Descargar Reporte
              </button>
              <button 
                onClick={() => setShowConfirmReset(false)}
                className="w-full py-4 bg-arena text-campestre-400 rounded-2xl font-black text-[11px] uppercase tracking-widest"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-campestre-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-campestre-400 uppercase tracking-widest mb-1">Total Salidas</p>
              <h3 className="text-3xl font-black text-campestre-800">{totalServices}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <p className="text-[9px] font-bold text-emerald-600 uppercase mt-6 tracking-widest">Servicios Realizados</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-campestre-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-campestre-400 uppercase tracking-widest mb-1">Ausencias</p>
              <h3 className="text-3xl font-black text-rose-600">{totalAbsences}</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <CalendarX size={24} />
            </div>
          </div>
          <p className="text-[9px] font-bold text-rose-400 uppercase mt-6 tracking-widest">Caddies "No Vino"</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-campestre-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-campestre-400 uppercase tracking-widest mb-1">Permisos</p>
              <h3 className="text-3xl font-black text-sky-600">{totalLeaves}</h3>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
              <FileText size={24} />
            </div>
          </div>
          <p className="text-[9px] font-bold text-sky-400 uppercase mt-6 tracking-widest">Caddies con Permiso</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-campestre-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-campestre-400 uppercase tracking-widest mb-1">Tardanzas</p>
              <h3 className="text-3xl font-black text-amber-500">{totalLates}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-[9px] font-bold text-amber-500 uppercase mt-6 tracking-widest">Llegadas Retrasadas</p>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-campestre-100 shadow-sm">
          <h3 className="text-xl font-extrabold text-campestre-800 mb-10 tracking-tight">Proyección de Servicios</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serviceData}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#739c8f" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#739c8f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#8ca99e', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8ca99e', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="servicios" 
                  stroke="#739c8f" 
                  fillOpacity={1} 
                  fill="url(#colorInc)" 
                  strokeWidth={4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-campestre-100 shadow-sm">
          <h3 className="text-xl font-extrabold text-campestre-800 mb-10 tracking-tight">Detalle de Incidencias</h3>
          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {topIncidents.map((caddie) => (
              <div key={caddie.id} className="flex items-center justify-between p-5 bg-arena rounded-3xl border border-campestre-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-campestre-100 font-black text-campestre-400 text-sm shadow-sm">
                    {caddie.number}
                  </div>
                  <div>
                    <p className="font-black text-campestre-800 text-sm uppercase tracking-tight">{caddie.name}</p>
                    <div className="flex gap-2 mt-1">
                      {caddie.absencesCount > 0 && <span className="text-[8px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">Ausente</span>}
                      {caddie.lateCount > 0 && <span className="text-[8px] font-black uppercase text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Tarde</span>}
                      {caddie.leaveCount > 0 && <span className="text-[8px] font-black uppercase text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full">Permiso</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-campestre-800 leading-none">
                    {caddie.absencesCount + caddie.leaveCount + caddie.lateCount}
                  </p>
                  <p className="text-[8px] font-black uppercase text-campestre-300 tracking-widest mt-1">Total</p>
                </div>
              </div>
            ))}
            {topIncidents.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-campestre-200">
                <TrendingUp size={48} className="mb-2 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest opacity-40">Día sin incidencias</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
