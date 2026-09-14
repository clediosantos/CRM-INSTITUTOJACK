'use client';

import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  MessageCircle, 
  ChevronRight, 
  Phone,
  Cake,
  AlertTriangle,
  Scissors,
  Heart
} from 'lucide-react';
import { Appointment, Client, Professional, AppointmentStatus } from '@/lib/types';
import { InstitutoJackLogo } from './InstitutoJackLogo';

interface DashboardViewProps {
  appointments: Appointment[];
  clients: Client[];
  professionals: Professional[];
  onSelectClient: (client: Client) => void;
  onOpenWhatsApp: (client: Client, customMessage?: string) => void;
  onOpenNewAppointment: () => void;
  onUpdateAppointmentStatus: (id: string, newStatus: AppointmentStatus) => void;
  onGoToClients: () => void;
  onGoToMarketing: () => void;
  onGoToFinancial?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  appointments,
  clients,
  professionals,
  onSelectClient,
  onOpenWhatsApp,
  onOpenNewAppointment,
  onUpdateAppointmentStatus,
  onGoToClients,
  onGoToMarketing,
  onGoToFinancial,
}) => {
  // Calculations
  const todayAppointments = appointments.filter((a) => a.date === '2026-09-14');
  const totalRevenueExpected = todayAppointments.reduce((acc, curr) => acc + (curr.status !== 'cancelado' ? curr.price : 0), 0);
  const completedRevenue = todayAppointments
    .filter((a) => a.status === 'concluido')
    .reduce((acc, curr) => acc + curr.price, 0);

  const inProgressCount = todayAppointments.filter((a) => a.status === 'em_atendimento').length;
  const confirmedCount = todayAppointments.filter((a) => a.status === 'confirmado').length;
  const scheduledCount = todayAppointments.filter((a) => a.status === 'agendado').length;

  const vipClientsCount = clients.filter((c) => c.status === 'VIP').length;
  const atRiskClients = clients.filter((c) => c.status === 'Em Risco');
  const birthdayToday = clients.find((c) => c.birthday === '14/09');

  const getStatusStyle = (status: AppointmentStatus) => {
    switch (status) {
      case 'em_atendimento':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-semibold animate-pulse';
      case 'confirmado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium';
      case 'concluido':
        return 'bg-stone-100 text-stone-600 border-stone-300 line-through';
      case 'cancelado':
        return 'bg-rose-100 text-rose-800 border-rose-300 line-through opacity-70';
      case 'agendado':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case 'em_atendimento':
        return 'Em Atendimento';
      case 'confirmado':
        return 'Confirmado';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      case 'agendado':
      default:
        return 'Agendado';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner with Instituto Jack Visual Identity */}
      <div className="bg-gradient-to-r from-[#15803D] via-[#16A34A] to-[#15803D] text-white rounded-3xl p-6 shadow-xl border border-emerald-400/50 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-lime-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Brand Seal & Titles */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="shrink-0 p-2 bg-white rounded-2xl shadow-lg border-2 border-emerald-200">
              <InstitutoJackLogo variant="seal" size={140} className="rounded-xl shadow-xs" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1 font-sans">
                <span className="w-2 h-2 rounded-full bg-lime-300 animate-pulse" />
                INSTITUTO JACK • CRM & GESTÃO DA BELEZA
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide drop-shadow-xs">
                Painel Geral • Segunda-feira, 14 de Setembro
              </h1>
              <p className="text-xs sm:text-sm text-emerald-50 font-medium italic mt-0.5 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-emerald-200 fill-emerald-200/40" />
                &ldquo;Cuidado que transforma, beleza que realça.&rdquo;
              </p>
            </div>
          </div>

          {/* Specialties Quick Badges & Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={onOpenNewAppointment}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-emerald-50 text-[#15803D] text-xs sm:text-sm font-bold shadow-lg transition cursor-pointer active:scale-98 border border-white"
            >
              <Calendar className="w-4 h-4 stroke-[2.5] text-[#15803D]" />
              Novo Agendamento
            </button>
          </div>
        </div>

        {/* 5 Specialties Row */}
        <div className="mt-5 pt-4 border-t border-emerald-500/60 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
            Especialidades Ativas:
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-[#11241C]/80 border border-[#2D5A43] text-emerald-200 font-medium flex items-center gap-1.5">
              <span>💅</span> Unha
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#11241C]/80 border border-[#2D5A43] text-emerald-200 font-medium flex items-center gap-1.5">
              <span>🍯</span> Depilação
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#11241C]/80 border border-[#2D5A43] text-emerald-200 font-medium flex items-center gap-1.5">
              <span>💇‍♀️</span> Cabelo
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#11241C]/80 border border-[#2D5A43] text-emerald-200 font-medium flex items-center gap-1.5">
              <span>🦶</span> Podologia
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#11241C]/80 border border-[#2D5A43] text-emerald-200 font-medium flex items-center gap-1.5">
              <span>👁️</span> Sobrancelhas
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Faturamento do Dia */}
        <div 
          onClick={onGoToFinancial}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-400/80 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 group-hover:text-amber-700 transition">
              Faturamento Previsto
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 group-hover:bg-amber-400 group-hover:text-stone-950 transition">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              R$ {totalRevenueExpected.toLocaleString('pt-BR')}
            </span>
            <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
              <span className="text-emerald-600 font-semibold">R$ {completedRevenue.toLocaleString('pt-BR')} concluído</span>
              {onGoToFinancial && (
                <span className="text-[11px] font-semibold text-amber-700 underline group-hover:text-amber-800">
                  Ver DRE & Caixa →
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Atendimentos Hoje */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-300/80 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Agenda de Hoje
            </span>
            <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {todayAppointments.length}
            </span>
            <p className="text-xs text-stone-500 mt-1">
              <span className="font-semibold text-amber-700">{inProgressCount} ativo</span> • {confirmedCount} confirmados
            </p>
          </div>
        </div>

        {/* Card 3: Clientes VIP & LTV Médio */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-300/80 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Base de Clientes
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {clients.length} <span className="text-base font-normal text-stone-500">cadastradas</span>
            </span>
            <p className="text-xs text-stone-500 mt-1">
              <span className="font-semibold text-purple-700">{vipClientsCount} VIPs</span> cadastradas
            </p>
          </div>
        </div>

        {/* Card 4: Retenção & Recorrência */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-300/80 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Taxa de Retorno
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              84%
            </span>
            <p className="text-xs text-emerald-700 mt-1 font-medium flex items-center gap-1">
              ↑ +4.2% em relação ao mês anterior
            </p>
          </div>
        </div>

      </div>

      {/* Smart Relationship Alerts (Birthdays & At-Risk Rescues) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Birthday Alert */}
        {birthdayToday && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center border border-amber-300">
                <Cake className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Aniversariante do Dia!</span>
                  <span className="text-[10px] bg-amber-200/60 text-amber-900 px-1.5 py-0.5 rounded font-semibold">Hoje</span>
                </div>
                <h4 className="text-sm font-bold text-stone-900 mt-0.5">{birthdayToday.name}</h4>
                <p className="text-xs text-amber-900/80">Envie os parabéns com o voucher de 20% OFF do salão.</p>
              </div>
            </div>

            <button
              onClick={() => onOpenWhatsApp(
                birthdayToday, 
                `Parabéns, ${birthdayToday.name.split(' ')[0]}! 🎂🌿 Toda a equipe do Instituto Jack deseja um dia iluminado para você! Preparamos um mimo exclusivo de 20% OFF para o seu momento de autocuidado esta semana. Cuidado que transforma, beleza que realça! Vamos agendar seu horário?`
              )}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Parabenizar
            </button>
          </div>
        )}

        {/* At-Risk Alert */}
        {atRiskClients.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-500/15 text-rose-800 flex items-center justify-center border border-rose-300">
                <AlertTriangle className="w-6 h-6 text-rose-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-900">Alerta de Retenção CRM</span>
                  <span className="text-[10px] bg-rose-200/80 text-rose-900 px-1.5 py-0.5 rounded font-semibold">Ausente &gt; 45 dias</span>
                </div>
                <h4 className="text-sm font-bold text-stone-900 mt-0.5">{atRiskClients[0].name}</h4>
                <p className="text-xs text-rose-900/80">Última visita há mais de 2 meses. Risco de perda da cliente.</p>
              </div>
            </div>

            <button
              onClick={() => onOpenWhatsApp(
                atRiskClients[0],
                `Oi ${atRiskClients[0].name.split(' ')[0]}, sentimos sua falta aqui no Instituto Jack! ✨ Estamos com uma condição super especial para seu retorno em Cabelo, Podologia ou Unhas. Quando podemos te receber?`
              )}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1E3A2F] hover:bg-[#284E3F] text-emerald-100 shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
              Reativar
            </button>
          </div>
        )}

      </div>

      {/* Today's Appointments Timeline & Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50/40">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Fluxo de Atendimentos do Dia (Hoje)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Clique no status para avançar o atendimento ou na cliente para abrir a ficha completa.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">Legenda de Status:</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-medium">Em Atendimento</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium">Confirmado</span>
          </div>
        </div>

        {/* Appointments List */}
        <div className="divide-y divide-stone-150">
          {todayAppointments.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-sm">
              Nenhum agendamento para o dia selecionado.
            </div>
          ) : (
            todayAppointments.map((apt) => {
              const matchedClient = clients.find((c) => c.id === apt.clientId) || null;
              const matchedProf = professionals.find((p) => p.id === apt.professionalId);

              return (
                <div 
                  key={apt.id} 
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                    apt.status === 'em_atendimento' ? 'bg-amber-50/40' : 'hover:bg-stone-50/70'
                  }`}
                >
                  {/* Left: Time & Client */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Time Slot Badge */}
                    <div className="w-16 text-center py-1.5 px-2 rounded-xl bg-stone-100 border border-stone-200 shrink-0">
                      <span className="text-sm font-bold text-stone-900 font-mono block leading-tight">{apt.time}</span>
                      <span className="text-[10px] text-stone-500 block leading-tight">{apt.durationMinutes} min</span>
                    </div>

                    {/* Client Photo & Info */}
                    <button
                      onClick={() => matchedClient && onSelectClient(matchedClient)}
                      className="flex items-center gap-3 text-left group cursor-pointer"
                    >
                      <img
                        src={apt.clientAvatar}
                        alt={apt.clientName}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-stone-200 group-hover:ring-amber-400 transition"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-amber-700 transition flex items-center gap-1">
                            {apt.clientName}
                            <ChevronRight className="w-3.5 h-3.5 text-stone-400 opacity-0 group-hover:opacity-100 transition" />
                          </h4>
                          {matchedClient && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                              {matchedClient.status}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5 flex items-center gap-1.5 font-medium">
                          <Scissors className="w-3 h-3 text-amber-600 shrink-0" />
                          {apt.serviceName}
                        </p>
                        {apt.notes && (
                          <p className="text-[11px] text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded mt-1 border border-amber-200/50 inline-block">
                            📌 {apt.notes}
                          </p>
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Middle: Professional & Price */}
                  <div className="flex items-center gap-6 pl-19 md:pl-0">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-stone-600 block">Profissional:</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border inline-block mt-0.5 ${matchedProf?.colorBadge || 'bg-stone-100 text-stone-800'}`}>
                        {apt.professionalName}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-stone-600 block">Valor:</span>
                      <span className="text-sm sm:text-base font-bold text-stone-900">
                        R$ {apt.price.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Right: Interactive Status Pill & Actions */}
                  <div className="flex items-center gap-2.5 pl-19 md:pl-0 justify-between md:justify-end">
                    {/* Status Dropdown/Selector */}
                    <div className="relative">
                      <select
                        value={apt.status}
                        onChange={(e) => onUpdateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)}
                        className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${getStatusStyle(apt.status)}`}
                      >
                        <option value="agendado">Agendado</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="em_atendimento">Em Atendimento</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>

                    {/* WhatsApp Shortcut */}
                    {matchedClient && (
                      <button
                        onClick={() => onOpenWhatsApp(matchedClient)}
                        title="Enviar mensagem WhatsApp para a cliente"
                        className="p-2 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-stone-200 transition cursor-pointer"
                        aria-label={`WhatsApp para ${apt.clientName}`}
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                      </button>
                    )}

                    {/* Open Client Profile */}
                    {matchedClient && (
                      <button
                        onClick={() => onSelectClient(matchedClient)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition cursor-pointer"
                      >
                        Ficha Técnica
                      </button>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
          <span>Horários atualizados em tempo real conforme a chegada das clientes.</span>
          <button
            onClick={onGoToClients}
            className="text-amber-800 hover:text-amber-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            Ver todos os clientes cadastrados ({clients.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Bottom Section: Team Chairs Occupancy & Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {professionals.map((prof) => {
          const profAppointments = todayAppointments.filter((a) => a.professionalId === prof.id);
          const isBusy = profAppointments.some((a) => a.status === 'em_atendimento');

          return (
            <div key={prof.id} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-3">
              <img
                src={prof.avatar}
                alt={prof.name}
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-stone-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900 truncate">{prof.name}</h4>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isBusy ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {isBusy ? 'Em Atendimento' : 'Disponível'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 truncate">{prof.role}</p>
                <p className="text-[11px] text-stone-700 font-medium mt-1">
                  {profAppointments.length} atendimentos hoje • {prof.rating} ★
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
