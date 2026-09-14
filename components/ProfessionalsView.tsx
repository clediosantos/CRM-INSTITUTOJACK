'use client';

import React from 'react';
import { Award, Star, Phone, Scissors, Plus, CheckCircle, TrendingUp } from 'lucide-react';
import { Professional, Appointment } from '@/lib/types';

interface ProfessionalsViewProps {
  professionals: Professional[];
  appointments: Appointment[];
  onOpenNewAppointment: () => void;
}

export const ProfessionalsView: React.FC<ProfessionalsViewProps> = ({
  professionals,
  appointments,
  onOpenNewAppointment,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-800 font-bold">
            <Award className="w-4 h-4 text-amber-700" />
            Corpo de Especialistas
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
            Equipe Técnica & Comissões
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Acompanhe a escala, especialidades, avaliação dos clientes e repasse de comissões.
          </p>
        </div>

        <button
          onClick={onOpenNewAppointment}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Novo Agendamento na Equipe
        </button>
      </div>

      {/* Grid of Professionals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {professionals.map((prof) => {
          const profApts = appointments.filter((a) => a.professionalId === prof.id);
          const totalGenerated = profApts.reduce((sum, a) => sum + (a.status !== 'cancelado' ? a.price : 0), 0);
          const estimatedCommission = (totalGenerated * prof.commissionRate) / 100;

          return (
            <div
              key={prof.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={prof.avatar}
                    alt={prof.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-stone-200"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-lg text-stone-900 truncate">
                        {prof.name}
                      </h3>
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {prof.rating}
                      </span>
                    </div>

                    <p className="text-xs text-stone-500 mt-0.5">{prof.role}</p>

                    <div className="flex items-center gap-2 mt-2 text-xs text-stone-600">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{prof.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mt-4">
                  <span className="text-[11px] uppercase tracking-wider text-stone-600 font-bold block mb-1.5">
                    Especialidades Principais
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {prof.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Commission & Performance Box */}
              <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-stone-600 uppercase font-medium block">Comissão Base</span>
                  <span className="font-bold text-stone-900 text-sm">{prof.commissionRate}%</span>
                </div>

                <div>
                  <span className="text-[10px] text-stone-600 uppercase font-medium block">Atendimentos Hoje</span>
                  <span className="font-bold text-stone-900 text-sm">{profApts.length}</span>
                </div>

                <div>
                  <span className="text-[10px] text-stone-600 uppercase font-medium block">Comissão do Dia</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    R$ {estimatedCommission.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
