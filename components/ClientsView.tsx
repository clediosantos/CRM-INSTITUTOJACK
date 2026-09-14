'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MessageCircle, 
  Calendar, 
  Phone, 
  Coffee, 
  AlertTriangle, 
  Sparkles, 
  Filter, 
  DollarSign,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Client, ClientStatus } from '@/lib/types';

interface ClientsViewProps {
  clients: Client[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectClient: (client: Client) => void;
  onOpenWhatsApp: (client: Client, customMessage?: string) => void;
  onBookAppointment: (client: Client) => void;
  onOpenNewClient: () => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  searchQuery,
  setSearchQuery,
  onSelectClient,
  onOpenWhatsApp,
  onBookAppointment,
  onOpenNewClient,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = 
      selectedStatusFilter === 'todos' || 
      client.status.toLowerCase() === selectedStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case 'VIP':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-semibold';
      case 'Recorrente':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Em Risco':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
      case 'Nova':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-800 font-bold">
            <Users className="w-4 h-4 text-amber-700" />
            CRM & Relacionamento 360°
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
            Gestão de Clientes & Fichas Técnicas
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Acompanhe histórico de colorimetria, anamnese capilar, preferências sensoriais e LTV.
          </p>
        </div>

        <button
          id="btn-add-client-page"
          onClick={onOpenNewClient}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Cadastrar Nova Cliente
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'todos', label: 'Todas', count: clients.length },
            { id: 'vip', label: 'VIP Diamond', count: clients.filter((c) => c.status === 'VIP').length },
            { id: 'recorrente', label: 'Recorrentes', count: clients.filter((c) => c.status === 'Recorrente').length },
            { id: 'em risco', label: 'Em Risco (> 45d)', count: clients.filter((c) => c.status === 'Em Risco').length },
            { id: 'nova', label: 'Novas', count: clients.filter((c) => c.status === 'Nova').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                selectedStatusFilter === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedStatusFilter === tab.id ? 'bg-stone-700 text-stone-200' : 'bg-stone-200 text-stone-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Input Search on Page */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Filtrar por nome, telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500"
          />
        </div>

      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-400">
            Nenhuma cliente encontrada com os filtros selecionados.
          </div>
        ) : (
          filteredClients.map((client) => {
            const hasAllergy = Boolean(client.preferences.allergies);

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md hover:border-amber-300 transition flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top / Header */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={client.avatar}
                        alt={client.name}
                        className="w-13 h-13 rounded-2xl object-cover ring-2 ring-stone-100 group-hover:ring-amber-300 transition"
                      />
                      <div>
                        <h3 
                          onClick={() => onSelectClient(client)}
                          className="font-serif font-bold text-stone-900 group-hover:text-amber-800 transition cursor-pointer text-base"
                        >
                          {client.name}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border inline-block mt-0.5 ${getStatusBadge(client.status)}`}>
                          {client.status}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenWhatsApp(client)}
                      className="p-2 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-stone-200 transition cursor-pointer"
                      title="Chamar no WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>

                  {/* Contact row */}
                  <div className="flex items-center gap-3 text-xs text-stone-600 mt-3">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-stone-500" />
                      {client.phone}
                    </span>
                    {client.birthday && (
                      <span className="text-stone-600 text-[11px]">
                        🎂 {client.birthday}
                      </span>
                    )}
                  </div>

                  {/* Allergy Alert Badge if present */}
                  {hasAllergy && (
                    <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800 flex items-start gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">Alergia: {client.preferences.allergies}</span>
                    </div>
                  )}

                  {/* Preference Drink */}
                  {client.preferences.drink && (
                    <div className="mt-2 text-xs text-stone-600 flex items-center gap-1.5">
                      <Coffee className="w-3 h-3 text-amber-700 shrink-0" />
                      <span className="text-[11px] truncate">{client.preferences.drink}</span>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {client.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Middle: Financial & Technical Records count */}
                <div className="px-5 py-3 border-t border-stone-150 bg-stone-50/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-stone-600 uppercase font-medium block">Total Gasto (LTV)</span>
                    <span className="font-bold text-stone-900">R$ {client.totalSpent.toLocaleString('pt-BR')}</span>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] text-stone-600 uppercase font-medium block">Visitas</span>
                    <span className="font-bold text-stone-900">{client.visitsCount}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-stone-600 uppercase font-medium block">Fichas Técnicas</span>
                    <span className="font-bold text-amber-800 flex items-center gap-1 justify-end">
                      <FileText className="w-3 h-3" />
                      {client.technicalRecords.length}
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Actions */}
                <div className="p-3 border-t border-stone-200 bg-white grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectClient(client)}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition cursor-pointer text-center"
                  >
                    Ver Ficha Completa
                  </button>

                  <button
                    onClick={() => onBookAppointment(client)}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 transition cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <Calendar className="w-3 h-3 stroke-[2.5]" />
                    Agendar
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
