'use client';

import React from 'react';
import { 
  Users, 
  Calendar, 
  Scissors, 
  MessageCircle, 
  Award, 
  Plus, 
  Search,
  CheckCircle2,
  Bot,
  DollarSign
} from 'lucide-react';
import { InstitutoJackLogo } from './InstitutoJackLogo';

interface NavbarProps {
  activeTab: 'dashboard' | 'clientes' | 'agenda' | 'servicos' | 'marketing' | 'profissionais' | 'financeiro' | 'agente';
  setActiveTab: (tab: 'dashboard' | 'clientes' | 'agenda' | 'servicos' | 'marketing' | 'profissionais' | 'financeiro' | 'agente') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenNewAppointment: () => void;
  onOpenNewClient: () => void;
  todayCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenNewAppointment,
  onOpenNewClient,
  todayCount,
}) => {
  return (
    <header className="bg-[#15803D] text-white border-b border-[#16A34A] sticky top-0 z-40 shadow-md">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <InstitutoJackLogo size={50} variant="horizontal" showSlogan={true} />
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100" />
              <input
                id="global-client-search"
                type="text"
                placeholder="Buscar cliente por nome, telefone ou especialidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-[#166534] border border-[#22C55E]/60 text-white placeholder-emerald-100/70 focus:outline-none focus:border-white focus:ring-2 focus:ring-emerald-300 transition"
              />
            </div>
          </div>

          {/* Status & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#166534] border border-[#22C55E]/50 text-xs text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="font-semibold">Instituto Aberto</span>
              <span className="text-emerald-300/80">•</span>
              <span className="text-emerald-100 font-medium">{todayCount} agendamentos hoje</span>
            </div>

            <button
              id="btn-quick-new-client"
              onClick={onOpenNewClient}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white hover:text-white bg-[#166534] hover:bg-[#14532D] border border-emerald-300/40 transition cursor-pointer active:scale-98 shadow-xs"
            >
              <Users className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">+ Nova Cliente</span>
              <span className="sm:hidden">+ Cliente</span>
            </button>

            <button
              id="btn-quick-new-appointment"
              onClick={onOpenNewAppointment}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl text-[#14532D] bg-white hover:bg-emerald-50 shadow-md transition cursor-pointer active:scale-98 border border-white"
            >
              <Plus className="w-4 h-4 stroke-[2.5] text-[#15803D]" />
              <span className="hidden sm:inline">Novo Agendamento</span>
              <span className="sm:hidden">Agendar</span>
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#14532D] border-t border-[#16A34A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-2 no-scrollbar" aria-label="Navegação Principal">
            
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#15803D] font-bold shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-[#166534]'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-[#15803D]' : 'text-emerald-300'}`} />
              Visão Geral
            </button>

            <button
              id="nav-tab-clientes"
              onClick={() => setActiveTab('clientes')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                activeTab === 'clientes'
                  ? 'bg-white text-[#15803D] font-bold shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-[#166534]'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'clientes' ? 'text-[#15803D]' : 'text-emerald-300'}`} />
              Clientes (CRM 360°)
            </button>

            <button
              id="nav-tab-agenda"
              onClick={() => setActiveTab('agenda')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                activeTab === 'agenda'
                  ? 'bg-white text-[#15803D] font-bold shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-[#166534]'
              }`}
            >
              <Calendar className={`w-4 h-4 ${activeTab === 'agenda' ? 'text-[#15803D]' : 'text-emerald-300'}`} />
              Agenda do Dia
            </button>

            <button
              id="nav-tab-marketing"
              onClick={() => setActiveTab('marketing')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                activeTab === 'marketing'
                  ? 'bg-white text-[#15803D] font-bold shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-[#166534]'
              }`}
            >
              <MessageCircle className={`w-4 h-4 ${activeTab === 'marketing' ? 'text-[#15803D]' : 'text-emerald-300'}`} />
              Campanhas & WhatsApp
            </button>

            <button
              id="nav-tab-servicos"
              onClick={() => setActiveTab('servicos')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                activeTab === 'servicos'
                  ? 'bg-white text-[#15803D] font-bold shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-[#166534]'
              }`}
            >
              <Scissors className={`w-4 h-4 ${activeTab === 'servicos' ? 'text-[#15803D]' : 'text-emerald-300'}`} />
              Catálogo de Serviços
            </button>

            <button
              id="nav-tab-profissionais"
              onClick={() => setActiveTab('profissionais')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                activeTab === 'profissionais'
                  ? 'bg-white text-[#15803D] font-bold shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-[#166534]'
              }`}
            >
              <Award className={`w-4 h-4 ${activeTab === 'profissionais' ? 'text-[#15803D]' : 'text-emerald-300'}`} />
              Equipe & Comissões
            </button>

            <button
              id="nav-tab-financeiro"
              onClick={() => setActiveTab('financeiro')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                activeTab === 'financeiro'
                  ? 'bg-white text-[#15803D] font-bold shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-[#166534]'
              }`}
            >
              <DollarSign className={`w-4 h-4 ${activeTab === 'financeiro' ? 'text-[#15803D]' : 'text-emerald-300'}`} />
              Financeiro & Caixa
            </button>

            <button
              id="nav-tab-agente"
              onClick={() => setActiveTab('agente')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'agente'
                  ? 'bg-emerald-300 text-[#14532D] font-bold shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-[#166534]'
              }`}
            >
              <Bot className={`w-4 h-4 ${activeTab === 'agente' ? 'text-[#14532D]' : 'text-emerald-200'}`} />
              <span>Agente Jack</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full uppercase tracking-wider font-bold ${
                activeTab === 'agente' ? 'bg-[#14532D] text-emerald-200' : 'bg-white/20 text-white'
              }`}>
                IA CRM
              </span>
            </button>

          </nav>
        </div>
      </div>
    </header>
  );
};
