'use client';

import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  MessageCircle, 
  Calendar, 
  AlertTriangle, 
  Coffee, 
  Sparkles, 
  Clock, 
  Plus, 
  FileText, 
  DollarSign,
  Heart,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Client, TechnicalRecord } from '@/lib/types';

interface ClientProfileModalProps {
  client: Client | null;
  onClose: () => void;
  onOpenWhatsApp: (client: Client, customMessage?: string) => void;
  onBookAppointment: (client: Client) => void;
  onAddTechnicalRecord: (clientId: string, record: Omit<TechnicalRecord, 'id'>) => void;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
  client,
  onClose,
  onOpenWhatsApp,
  onBookAppointment,
  onAddTechnicalRecord,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'anamnese' | 'historico' | 'preferencias'>('anamnese');
  const [showAddRecordForm, setShowAddRecordForm] = useState(false);

  // New Record Form State
  const [newService, setNewService] = useState('');
  const [newProfessional, setNewProfessional] = useState('Camila Meirelles');
  const [newFormula, setNewFormula] = useState('');
  const [newObservations, setNewObservations] = useState('');

  if (!client) return null;

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.trim() || !newFormula.trim()) return;

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

    onAddTechnicalRecord(client.id, {
      date: formattedDate,
      service: newService,
      professional: newProfessional,
      formula: newFormula,
      observations: newObservations,
    });

    setNewService('');
    setNewFormula('');
    setNewObservations('');
    setShowAddRecordForm(false);
  };

  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
      case 'VIP':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-semibold';
      case 'Recorrente':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Em Risco':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold animate-pulse';
      case 'Nova':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white text-stone-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-profile-name"
      >
        {/* Modal Header */}
        <div className="bg-stone-900 text-stone-100 p-5 sm:p-6 border-b border-stone-800 relative">
          <button
            id="close-client-profile-btn"
            onClick={onClose}
            className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition cursor-pointer"
            aria-label="Fechar ficha"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={client.avatar}
              alt={client.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-amber-400/40 shadow-md"
            />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="client-profile-name" className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                  {client.name}
                </h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getStatusBadge(client.status)}`}>
                  {client.status}
                </span>
                {client.birthday && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-amber-300 border border-stone-700">
                    🎂 Aniversário: {client.birthday}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs sm:text-sm text-stone-300">
                <span className="flex items-center gap-1.5 text-stone-300">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  {client.phone}
                </span>
                <span className="flex items-center gap-1.5 text-stone-300">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  {client.email}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {client.tags.map((tag, idx) => (
                  <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Bar inside header */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-4 border-t border-stone-800">
            <button
              id="action-whatsapp-client"
              onClick={() => onOpenWhatsApp(client)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Chamar no WhatsApp
            </button>

            <button
              id="action-book-appointment-client"
              onClick={() => onBookAppointment(client)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-sm transition cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Novo Agendamento
            </button>
          </div>
        </div>

        {/* Financial & Loyalty Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-200 border-b border-stone-200 bg-stone-50">
          <div className="p-3.5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-stone-600 font-medium block">Total Investido (LTV)</span>
            <span className="text-base sm:text-lg font-bold text-stone-900">
              R$ {client.totalSpent.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="p-3.5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-stone-600 font-medium block">Atendimentos</span>
            <span className="text-base sm:text-lg font-bold text-stone-900">
              {client.visitsCount} visitas
            </span>
          </div>

          <div className="p-3.5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-stone-600 font-medium block">Ticket Médio</span>
            <span className="text-base sm:text-lg font-bold text-stone-900">
              R$ {Math.round(client.totalSpent / (client.visitsCount || 1)).toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="p-3.5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-stone-600 font-medium block">Última Visita</span>
            <span className="text-sm sm:text-base font-semibold text-stone-800">
              {client.lastVisitDate ? new Date(client.lastVisitDate).toLocaleDateString('pt-BR') : 'Primeira'}
            </span>
          </div>
        </div>

        {/* Navigation SubTabs */}
        <div className="flex border-b border-stone-200 px-6 bg-white">
          <button
            onClick={() => setActiveSubTab('anamnese')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'anamnese'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Fórmulas & Anamnese Técnica ({client.technicalRecords.length})
          </button>

          <button
            onClick={() => setActiveSubTab('preferencias')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'preferencias'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            Preferências & Cuidados
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-white space-y-6">

          {/* SubTab: ANAMNESE & TECHNICAL RECORDS */}
          {activeSubTab === 'anamnese' && (
            <div className="space-y-4">
              
              {/* Allergy / Security Warning if exists */}
              {client.preferences.allergies && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs uppercase font-bold text-rose-900 tracking-wider">Atenção Crítica / Alergia</h4>
                    <p className="text-xs sm:text-sm text-rose-800 mt-0.5 font-medium">
                      {client.preferences.allergies}
                    </p>
                  </div>
                </div>
              )}

              {/* Add New Record Toggle */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  Histórico de Fórmulas & Colorimetria
                </h3>

                <button
                  onClick={() => setShowAddRecordForm(!showAddRecordForm)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddRecordForm ? 'Cancelar' : '+ Nova Anotação de Procedimento'}
                </button>
              </div>

              {/* Add Record Form Box */}
              {showAddRecordForm && (
                <form onSubmit={handleSaveRecord} className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">Registrar Nova Fórmula Química / Procedimento</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Procedimento / Serviço</label>
                      <input
                        type="text"
                        placeholder="Ex: Mechas Criativas + Glossing"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        required
                        className="w-full text-xs sm:text-sm p-2 rounded-lg bg-white border border-stone-300 focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Profissional Responsável</label>
                      <select
                        value={newProfessional}
                        onChange={(e) => setNewProfessional(e.target.value)}
                        className="w-full text-xs sm:text-sm p-2 rounded-lg bg-white border border-stone-300 focus:outline-none focus:border-amber-600"
                      >
                        <option value="Camila Meirelles">Camila Meirelles (Master Colorista)</option>
                        <option value="Lucas Antunes">Lucas Antunes (Hair Stylist)</option>
                        <option value="Bruna Sato">Bruna Sato (Nail Artist)</option>
                        <option value="Mariana Duarte">Mariana Duarte (Lash & Brow)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Fórmula Exata & Produtos (Marca, Gramatura, Oxigenada, Tempo de Pausa)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: 30g Pó 9 tons + 45g Ox 20v. Matização com 9.12 (10min no lavatório com água fria)."
                      value={newFormula}
                      onChange={(e) => setNewFormula(e.target.value)}
                      required
                      className="w-full text-xs sm:text-sm p-2 rounded-lg bg-white border border-stone-300 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Observações Técnicas & Reação do Cabelo/Pele</label>
                    <input
                      type="text"
                      placeholder="Ex: Teste de mecha com elasticidade saudável; recomendar máscara lipídica no pós."
                      value={newObservations}
                      onChange={(e) => setNewObservations(e.target.value)}
                      className="w-full text-xs sm:text-sm p-2 rounded-lg bg-white border border-stone-300 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddRecordForm(false)}
                      className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm cursor-pointer"
                    >
                      Salvar na Ficha Técnica
                    </button>
                  </div>
                </form>
              )}

              {/* Records Timeline */}
              <div className="space-y-3">
                {client.technicalRecords.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-4 text-center">Nenhum registro técnico cadastrado ainda.</p>
                ) : (
                  client.technicalRecords.map((record) => (
                    <div key={record.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900">{record.service}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                            {record.professional}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-stone-600 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-500" />
                          {record.date}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-xs font-mono text-stone-900 leading-relaxed">
                        <span className="font-bold text-amber-900 uppercase font-sans text-[10px] block mb-0.5">Fórmula & Química:</span>
                        {record.formula}
                      </div>

                      {record.observations && (
                        <p className="text-xs text-stone-600 mt-2 italic flex items-start gap-1.5">
                          <span className="font-medium not-italic text-stone-800">Nota:</span> {record.observations}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SubTab: PREFERENCES & COMFORT */}
          {activeSubTab === 'preferencias' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-600" />
                  Bebida & Mimos Favoritos
                </h4>
                <p className="text-sm font-medium text-stone-900">
                  {client.preferences.drink || 'Não informado'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Estilo de Conversa & Conforto
                </h4>
                <p className="text-sm font-medium text-stone-900">
                  {client.preferences.conversationStyle || 'Sem restrições'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  Condição do Couro & Sensibilidade
                </h4>
                <p className="text-sm font-medium text-stone-900">
                  {client.preferences.scalpCondition || 'Couro normal, sem lesões aparentes'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-stone-500" />
                  Observações de Atendimento
                </h4>
                <p className="text-sm font-medium text-stone-900">
                  {client.preferences.notes || 'Sem observações especiais.'}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 p-4 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
          <span>Cadastrada no sistema • ID: {client.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 transition cursor-pointer"
          >
            Fechar Ficha
          </button>
        </div>

      </div>
    </div>
  );
};
