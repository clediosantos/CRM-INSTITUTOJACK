'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Plus, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  MessageCircle,
  Scissors
} from 'lucide-react';
import { Appointment, Professional, Client, AppointmentStatus } from '@/lib/types';

interface AgendaViewProps {
  appointments: Appointment[];
  professionals: Professional[];
  clients: Client[];
  onOpenNewAppointment: () => void;
  onSelectClient: (client: Client) => void;
  onOpenWhatsApp: (client: Client) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  appointments,
  professionals,
  clients,
  onOpenNewAppointment,
  onSelectClient,
  onOpenWhatsApp,
  onUpdateStatus,
}) => {
  const [selectedProfFilter, setSelectedProfFilter] = useState<string>('todos');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-14');

  // Filtered list
  const filteredAppointments = appointments.filter((apt) => {
    const matchesDate = apt.date === selectedDate;
    const matchesProf = selectedProfFilter === 'todos' || apt.professionalId === selectedProfFilter;
    return matchesDate && matchesProf;
  });

  // Time slots from 09:00 to 18:00
  const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '13:00', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'em_atendimento':
        return 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-400/50';
      case 'confirmado':
        return 'bg-emerald-50 text-emerald-900 border-emerald-300';
      case 'concluido':
        return 'bg-stone-100 text-stone-600 border-stone-300 opacity-75';
      case 'cancelado':
        return 'bg-rose-50 text-rose-800 border-rose-200 line-through opacity-60';
      default:
        return 'bg-blue-50 text-blue-900 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-800 font-bold">
            <CalendarIcon className="w-4 h-4 text-amber-700" />
            Programação Diária
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
            Grade de Horários & Ocupação
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Segunda-feira, 14 de Setembro de 2026 • 4 Especialistas escalados
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Professional Selector Filter */}
          <select
            value={selectedProfFilter}
            onChange={(e) => setSelectedProfFilter(e.target.value)}
            className="text-xs sm:text-sm p-2 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="todos">Todos os Profissionais</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.role.split('&')[0]})
              </option>
            ))}
          </select>

          <button
            onClick={onOpenNewAppointment}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            + Agendar Horário
          </button>
        </div>
      </div>

      {/* Grid: Columns by Professional (or Timeline) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {professionals
          .filter((p) => selectedProfFilter === 'todos' || p.id === selectedProfFilter)
          .map((prof) => {
            const profApts = filteredAppointments
              .filter((a) => a.professionalId === prof.id)
              .sort((a, b) => a.time.localeCompare(b.time));

            return (
              <div
                key={prof.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col overflow-hidden"
              >
                {/* Column Professional Header */}
                <div className="p-4 bg-stone-900 text-white flex items-center gap-3 border-b border-stone-800">
                  <img
                    src={prof.avatar}
                    alt={prof.name}
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-amber-400/40"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-white truncate">{prof.name}</h3>
                    <p className="text-[11px] text-stone-300 truncate">{prof.role}</p>
                    <span className="text-[10px] text-amber-300 font-medium block mt-0.5">
                      {profApts.length} atendimentos
                    </span>
                  </div>
                </div>

                {/* Body: Appointments for this professional */}
                <div className="p-3.5 space-y-3 flex-1 bg-stone-50/50 min-h-[360px]">
                  {profApts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                      <Clock className="w-8 h-8 text-stone-300 mb-2" />
                      <p className="text-xs font-medium">Nenhum horário marcado hoje para {prof.name.split(' ')[0]}.</p>
                      <button
                        onClick={onOpenNewAppointment}
                        className="mt-3 text-xs text-amber-800 hover:text-amber-900 font-semibold cursor-pointer"
                      >
                        + Preencher agenda
                      </button>
                    </div>
                  ) : (
                    profApts.map((apt) => {
                      const client = clients.find((c) => c.id === apt.clientId);

                      return (
                        <div
                          key={apt.id}
                          className={`p-3 rounded-xl border shadow-xs transition flex flex-col justify-between ${getStatusColor(apt.status)}`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/10">
                                {apt.time} ({apt.durationMinutes}m)
                              </span>
                              
                              <select
                                value={apt.status}
                                onChange={(e) => onUpdateStatus(apt.id, e.target.value as AppointmentStatus)}
                                className="text-[10px] font-bold uppercase rounded border border-current bg-transparent py-0.5 px-1 cursor-pointer focus:outline-none"
                              >
                                <option value="agendado">Agendado</option>
                                <option value="confirmado">Confirmado</option>
                                <option value="em_atendimento">Em Atendimento</option>
                                <option value="concluido">Concluído</option>
                                <option value="cancelado">Cancelado</option>
                              </select>
                            </div>

                            <button
                              onClick={() => client && onSelectClient(client)}
                              className="text-left w-full group cursor-pointer"
                            >
                              <h4 className="font-bold text-sm group-hover:underline text-current">
                                {apt.clientName}
                              </h4>
                              <p className="text-xs mt-0.5 opacity-90 line-clamp-1">
                                {apt.serviceName}
                              </p>
                            </button>

                            {apt.notes && (
                              <p className="text-[11px] mt-2 italic opacity-85 bg-black/5 p-1.5 rounded">
                                Obs: {apt.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/10 text-xs">
                            <span className="font-bold">R$ {apt.price}</span>
                            
                            <div className="flex items-center gap-1">
                              {client && (
                                <button
                                  onClick={() => onOpenWhatsApp(client)}
                                  className="p-1 rounded hover:bg-black/10 transition cursor-pointer"
                                  title="WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                                </button>
                              )}
                              {client && (
                                <button
                                  onClick={() => onSelectClient(client)}
                                  className="text-[11px] font-semibold underline hover:opacity-80 cursor-pointer"
                                >
                                  Ficha
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Add Slot footer */}
                <div className="p-3 bg-white border-t border-stone-200 text-center">
                  <button
                    onClick={onOpenNewAppointment}
                    className="w-full py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium hover:bg-stone-50 rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Encaixe
                  </button>
                </div>

              </div>
            );
          })}
      </div>

    </div>
  );
};
