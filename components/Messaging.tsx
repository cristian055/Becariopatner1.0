
import React, { useState } from 'react';
import { Send, User, Search, Paperclip } from 'lucide-react';
import { Message } from '../types';

interface MessagingProps {
  messages: Message[];
}

const Messaging: React.FC<MessagingProps> = ({ messages }) => {
  const [inputText, setInputText] = useState('');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-[calc(100vh-12rem)] flex overflow-hidden">
      {/* Sidebar Contacts */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar chat..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {['Operadores Hoy', 'Recepción Hoy', 'Soporte General', 'Jefe de Campo'].map((group, idx) => (
            <div key={idx} className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white transition-all ${idx === 0 ? 'bg-white border-l-4 border-emerald-500 shadow-sm' : ''}`}>
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 relative">
                <User size={20} />
                {idx === 0 && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{group}</h4>
                  <span className="text-[10px] text-slate-400">12:30</span>
                </div>
                <p className="text-xs text-slate-500 truncate">Actualización de listas realizada.</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <h4 className="font-bold text-sm">Operadores Hoy</h4>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">En Línea</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col items-start max-w-[80%]">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-bold text-slate-700">{msg.sender}</span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
              </div>
              <div className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-800">
                {msg.text}
              </div>
            </div>
          ))}

          {/* Example User Reply */}
          <div className="flex flex-col items-end self-end max-w-[80%]">
             <div className="flex items-baseline gap-2 mb-1 justify-end">
                <span className="text-[10px] text-slate-400">Hace un momento</span>
                <span className="text-xs font-bold text-emerald-700">Tú</span>
              </div>
              <div className="px-4 py-2.5 bg-emerald-600 text-white rounded-2xl rounded-tr-none shadow-md shadow-emerald-200 text-sm">
                Recibido. Estamos monitoreando la Lista 2 por el pico de demanda.
              </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 pr-2">
            <button className="p-2 text-slate-400 hover:text-slate-600">
              <Paperclip size={20} />
            </button>
            <input 
              type="text" 
              placeholder="Escribe un mensaje..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent py-2.5 px-3 text-sm outline-none"
            />
            <button className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messaging;
