
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Monitor, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  onBackToPublic: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBackToPublic }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1000);
  };

  const containerStyle = {
    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
    backgroundSize: '32px 32px'
  };

  return (
    <div 
      className="fixed inset-0 bg-campestre-900 flex items-center justify-center p-6 font-sans"
      style={containerStyle}
    >
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-campestre-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-campestre-500/20 mb-6">
            <span className="font-extrabold text-2xl">C</span>
          </div>
          <h1 className="text-3xl font-black text-campestre-800 tracking-tight mb-2">CaddiePro Admin</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-campestre-400">Acceso Restringido a Operaciones</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-campestre-500 px-1">Usuario Operativo</label>
            <input 
              type="text" 
              placeholder="admin@campestre.com" 
              defaultValue="admin@campestre.com" 
              readOnly 
              className="w-full px-5 py-4 bg-arena border border-campestre-100 rounded-2xl outline-none font-bold text-campestre-800 placeholder:text-campestre-200 transition-all focus:border-campestre-500 focus:ring-4 focus:ring-campestre-500/5 cursor-not-allowed"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-campestre-500 px-1">Contraseña</label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••••" 
                defaultValue="123456" 
                readOnly 
                className="w-full px-5 py-4 bg-arena border border-campestre-100 rounded-2xl outline-none font-bold text-campestre-800 placeholder:text-campestre-200 transition-all focus:border-campestre-500 focus:ring-4 focus:ring-campestre-500/5 cursor-not-allowed"
              />
              <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-campestre-200" />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-5 bg-campestre-800 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest shadow-xl shadow-campestre-900/20 active:scale-[0.98] transition-all hover:bg-campestre-900 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Ingresar al Panel</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-6">
          <button onClick={onBackToPublic} className="flex items-center gap-2 text-campestre-400 hover:text-campestre-600 transition-colors text-xs font-bold">
            <Monitor size={16} />
            <span>Volver al Monitor Público</span>
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>Conexión Encriptada SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
