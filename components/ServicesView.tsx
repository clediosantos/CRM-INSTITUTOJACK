'use client';

import React, { useState } from 'react';
import { Scissors, Clock, DollarSign, Plus, Sparkles, Check, Filter } from 'lucide-react';
import { ServiceItem } from '@/lib/types';

interface ServicesViewProps {
  services: ServiceItem[];
  onOpenNewAppointment: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  onOpenNewAppointment,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todos os Procedimentos', icon: '✨' },
    { id: 'Unha', label: 'Unha', icon: '💅' },
    { id: 'Depilação', label: 'Depilação', icon: '🍯' },
    { id: 'Cabelo', label: 'Cabelo', icon: '💇‍♀️' },
    { id: 'Podologia', label: 'Podologia', icon: '🦶' },
    { id: 'Sobrancelhas', label: 'Sobrancelhas', icon: '👁️' },
  ];

  const filteredServices = services.filter((srv) => {
    if (selectedCategory === 'todos') return true;
    if (selectedCategory === 'Unha') return srv.category === 'Unha' || srv.category === 'Unhas';
    if (selectedCategory === 'Sobrancelhas') return srv.category === 'Sobrancelhas' || srv.category === 'Sobrancelhas & Cílios';
    return srv.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#E0D9CE] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#2D5A43] font-bold">
            <Scissors className="w-4 h-4 text-[#2D5A43]" />
            Menu Oficial • Instituto Jack
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
            Catálogo de Serviços & Especialidades
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Unha • Depilação • Cabelo • Podologia • Sobrancelhas — &ldquo;Cuidado que transforma, beleza que realça.&rdquo;
          </p>
        </div>

        <button
          onClick={onOpenNewAppointment}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#16A34A] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Agendar Atendimento
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-[#15803D] text-white shadow-sm'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-emerald-50 hover:text-[#15803D]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((srv) => (
          <div
            key={srv.id}
            className="bg-white rounded-3xl border border-[#E4DED4] p-5 shadow-xs hover:border-[#16A34A] transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#15803D] border border-emerald-200">
                  {srv.category}
                </span>
                {srv.popular && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#15803D] border border-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#16A34A]" />
                    Destaque Jack
                  </span>
                )}
              </div>

              <h3 className="font-serif font-bold text-base text-stone-900 leading-snug group-hover:text-[#15803D] transition">
                {srv.name}
              </h3>

              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                {srv.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-stone-150 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{srv.durationMinutes} min</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-serif text-[#1E3A2F]">
                  R$ {srv.price.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
