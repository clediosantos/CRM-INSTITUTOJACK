'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Scissors, User, DollarSign, Check, Sparkles } from 'lucide-react';
import { Client, Professional, ServiceItem, Appointment } from '@/lib/types';

interface NewAppointmentModalProps {
  clients: Client[];
  professionals: Professional[];
  services: ServiceItem[];
  preSelectedClient?: Client | null;
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, 'id'>) => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  clients,
  professionals,
  services,
  preSelectedClient,
  onClose,
  onSave,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    preSelectedClient ? preSelectedClient.id : clients[0]?.id || ''
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>(professionals[0]?.id || '');
  const [date, setDate] = useState<string>('2026-09-14');
  const [time, setTime] = useState<string>('14:30');
  const [notes, setNotes] = useState<string>('');

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const currentProf = professionals.find((p) => p.id === selectedProfessionalId) || professionals[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient || !currentService || !currentProf) return;

    onSave({
      clientId: currentClient.id,
      clientName: currentClient.name,
      clientPhone: currentClient.phone,
      clientAvatar: currentClient.avatar,
      serviceId: currentService.id,
      serviceName: currentService.name,
      professionalId: currentProf.id,
      professionalName: currentProf.name,
      date,
      time,
      durationMinutes: currentService.durationMinutes,
      price: currentService.price,
      status: 'confirmado',
      paymentStatus: 'pendente',
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white text-stone-900 rounded-2xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-modal-title"
      >
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 id="appointment-modal-title" className="font-serif font-semibold text-lg text-white">
                Novo Agendamento
              </h3>
              <p className="text-xs text-stone-400">Reserva de horário & profissional</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          
          {/* Select Client */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" />
              Cliente
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              required
              className="w-full text-sm p-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              {clients.map((cli) => (
                <option key={cli.id} value={cli.id}>
                  {cli.name} ({cli.status}) - {cli.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Select Service */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-amber-600" />
              Procedimento / Serviço
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              required
              className="w-full text-sm p-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              {services.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.name} • {srv.durationMinutes} min • R$ {srv.price}
                </option>
              ))}
            </select>
          </div>

          {/* Select Professional */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Especialista Responsável
            </label>
            <select
              value={selectedProfessionalId}
              onChange={(e) => setSelectedProfessionalId(e.target.value)}
              required
              className="w-full text-sm p-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              {professionals.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name} — {prof.role}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-sm p-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                Horário
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full text-sm p-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Summary Box */}
          {currentService && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs sm:text-sm">
              <div>
                <span className="font-semibold text-amber-950 block">{currentService.name}</span>
                <span className="text-amber-800 text-xs">Duração prevista: {currentService.durationMinutes} minutos</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-amber-700 font-bold block">Valor</span>
                <span className="text-base font-bold text-amber-950">R$ {currentService.price}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Observações Especiais / Cuidados
            </label>
            <input
              type="text"
              placeholder="Ex: Cliente tem reunião às 16h; prefere cappuccino com canela"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm transition cursor-pointer active:scale-98"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Confirmar Agendamento
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
