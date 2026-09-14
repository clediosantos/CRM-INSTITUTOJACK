'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  X,
  Send,
  Maximize2,
  MessageCircle,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle2,
  Edit3,
  Trash2,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import {
  Client,
  Appointment,
  Professional,
  ServiceItem,
  Transaction,
  DailyCashRegister,
  CommissionPayout,
  AgentMutationAction,
  AgentMutationType
} from '@/lib/types';
import { generateUniqueId } from '@/lib/utils';
import { InstitutoJackLogo } from './InstitutoJackLogo';

interface AgentFloatingWidgetProps {
  clients: Client[];
  appointments: Appointment[];
  professionals: Professional[];
  services: ServiceItem[];
  transactions?: Transaction[];
  cashRegisters?: DailyCashRegister[];
  commissions?: CommissionPayout[];
  onOpenWhatsApp: (client: Client, message?: string) => void;
  onBookAppointment: (client: Client) => void;
  onSelectClient: (client: Client) => void;
  onOpenFullView: () => void;
  onGoToFinancial?: () => void;
  onExecuteMutation?: (mutation: AgentMutationAction) => { success: boolean; message: string };
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  actions?: Array<{
    type: 'WHATSAPP' | 'AGENDAR' | 'FICHA' | 'FINANCEIRO';
    clientId?: string;
    clientName?: string;
    payload?: string;
  }>;
  mutations?: AgentMutationAction[];
}

export const AgentFloatingWidget: React.FC<AgentFloatingWidgetProps> = ({
  clients,
  appointments,
  professionals,
  services,
  transactions = [],
  cashRegisters = [],
  commissions = [],
  onOpenWhatsApp,
  onBookAppointment,
  onSelectClient,
  onOpenFullView,
  onGoToFinancial,
  onExecuteMutation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'fw-1',
      role: 'agent',
      content: 'Olá! Sou o **Agente Instituto Jack**. Tenho acesso total ao CRM para **consultar**, **editar**, **deletar** e **criar** clientes, horários e financeiro. Como posso ajudar?',
      timestamp: 'Agora',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: generateUniqueId('user-fw'),
      role: 'user',
      content: text,
      timestamp: 'Agora',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
          contextData: {
            clients,
            appointments,
            professionals,
            services,
            transactions,
            cashRegisters,
            commissions,
          },
        }),
      });

      const data = await response.json();
      const rawReply = data.reply || 'Não consegui obter resposta no momento.';

      // Parse mutations
      const mutationRegex = /\[MUTATION:([A-Z_]+)\|([^\]]+)\]/g;
      let mutMatch;
      const mutations: AgentMutationAction[] = [];

      while ((mutMatch = mutationRegex.exec(rawReply)) !== null) {
        const mutType = mutMatch[1] as AgentMutationType;
        const rawJson = mutMatch[2]?.trim();
        try {
          const payload = JSON.parse(rawJson);
          let description = 'Alteração no CRM aplicada';
          if (mutType === 'UPDATE_CLIENT') description = 'Cliente atualizada';
          if (mutType === 'DELETE_CLIENT') description = 'Cliente excluída';
          if (mutType === 'CREATE_CLIENT') description = `Nova cliente: ${payload.name || ''}`;
          if (mutType === 'UPDATE_APPOINTMENT') description = 'Agendamento modificado';
          if (mutType === 'DELETE_APPOINTMENT') description = 'Agendamento cancelado';
          if (mutType === 'CREATE_APPOINTMENT') description = `Horário agendado para ${payload.clientName || ''}`;
          if (mutType === 'ADD_TECHNICAL_RECORD') description = 'Ficha técnica salva';
          if (mutType === 'DELETE_TECHNICAL_RECORD') description = 'Ficha técnica removida';
          if (mutType === 'UPDATE_SERVICE') description = 'Serviço atualizado';
          if (mutType === 'DELETE_SERVICE') description = 'Serviço removido';
          if (mutType === 'CREATE_TRANSACTION') description = `Despesa/Receita lançada`;
          if (mutType === 'UPDATE_TRANSACTION') description = 'Transação atualizada';
          if (mutType === 'DELETE_TRANSACTION') description = 'Transação removida';
          if (mutType === 'CASH_OPERATION') description = 'Caixa atualizado';
          if (mutType === 'PAY_COMMISSION') description = 'Comissão paga';

          const mutationObj: AgentMutationAction = {
            id: generateUniqueId('mut-fw'),
            type: mutType,
            description,
            payload,
            executed: true,
          };
          mutations.push(mutationObj);

          if (onExecuteMutation) {
            onExecuteMutation(mutationObj);
          }
        } catch (e) {
          console.error('Erro no payload de mutação:', e);
        }
      }

      // Parse action tags
      const actions: Array<{ type: 'WHATSAPP' | 'AGENDAR' | 'FICHA' | 'FINANCEIRO'; clientId?: string; clientName?: string; payload?: string }> = [];
      
      const finRegex = /\[AÇÃO:FINANCEIRO\]/g;
      if (finRegex.test(rawReply)) {
        actions.push({ type: 'FINANCEIRO' });
      }

      const actionRegex = /\[AÇÃO:(WHATSAPP|AGENDAR|FICHA)\|([^|\]]+)(?:\|([^\]]+))?\]/g;
      let match;
      while ((match = actionRegex.exec(rawReply)) !== null) {
        const type = match[1] as 'WHATSAPP' | 'AGENDAR' | 'FICHA';
        const clientId = match[2]?.trim();
        const payload = match[3]?.trim();
        const client = clients.find((c) => c.id === clientId);
        actions.push({ type, clientId, clientName: client?.name || 'Cliente', payload });
      }

      const cleanedText = rawReply
        .replace(mutationRegex, '')
        .replace(finRegex, '')
        .replace(actionRegex, '')
        .trim();

      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId('agent-fw'),
          role: 'agent',
          content: cleanedText,
          timestamp: 'Agora',
          actions,
          mutations,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId('agent-fw-err'),
          role: 'agent',
          content: 'Desculpe, tive uma instabilidade temporária. Tente novamente!',
          timestamp: 'Agora',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-[#15803D] text-white rounded-full shadow-2xl hover:bg-[#16a34a] border-2 border-white/60 transition hover:scale-105 active:scale-95 group cursor-pointer"
        >
          <div className="shrink-0 p-0.5 rounded-full border border-white bg-white shadow-md">
            <InstitutoJackLogo variant="icon" size={32} />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Agente Jack</span>
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
            </div>
            <div className="text-[10px] text-emerald-100 font-medium">CRUD & Copiloto Ativo</div>
          </div>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] bg-white rounded-3xl shadow-2xl border border-stone-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-[#15803D] via-[#16A34A] to-[#15803D] text-white flex items-center justify-between border-b border-emerald-400/40">
            <div className="flex items-center gap-2.5">
              <div className="shrink-0 p-0.5 rounded-full border border-white bg-white shadow-xs">
                <InstitutoJackLogo variant="icon" size={34} />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <span>Agente Instituto Jack</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white border border-white/40">
                    CRUD CRM
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-100 font-medium">Cuidado que transforma, beleza que realça</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullView();
                }}
                title="Expandir para tela cheia"
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Fechar"
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="px-3 py-2 bg-stone-100 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => handleSend('Consulte a fórmula técnica e histórico da Camila Silva')}
              className="px-2.5 py-1 rounded-md bg-white border border-stone-200 text-stone-700 whitespace-nowrap hover:bg-amber-50 hover:text-amber-900 transition cursor-pointer text-[11px]"
            >
              🔍 Ficha Camila
            </button>
            <button
              onClick={() => handleSend('Atualize o telefone da Helena Souza para (11) 98888-7777')}
              className="px-2.5 py-1 rounded-md bg-white border border-stone-200 text-stone-700 whitespace-nowrap hover:bg-amber-50 hover:text-amber-900 transition cursor-pointer text-[11px]"
            >
              ✏️ Editar Helena
            </button>
            <button
              onClick={() => handleSend('Cancele o agendamento da Camila Silva de hoje')}
              className="px-2.5 py-1 rounded-md bg-white border border-stone-200 text-stone-700 whitespace-nowrap hover:bg-amber-50 hover:text-amber-900 transition cursor-pointer text-[11px]"
            >
              🗑️ Cancelar Horário
            </button>
            <button
              onClick={() => handleSend('Como está o faturamento, caixa de hoje e comissões?')}
              className="px-2.5 py-1 rounded-md bg-white border border-stone-200 text-stone-700 whitespace-nowrap hover:bg-amber-50 hover:text-amber-900 transition cursor-pointer text-[11px]"
            >
              💰 Finanças & DRE
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[88%] ${
                  m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`rounded-xl p-3 leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-amber-400 text-stone-950 font-medium'
                      : 'bg-white border border-stone-200 text-stone-800 shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>

                  {/* Render Mutation Confirmation */}
                  {m.mutations && m.mutations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-stone-100 flex flex-col gap-1.5">
                      {m.mutations.map((mut, idx) => (
                        <div
                          key={idx}
                          className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-[11px] text-emerald-950 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{mut.description}</span>
                          </div>
                          {mut.type.includes('CLIENT') && mut.payload?.clientId && (
                            <button
                              onClick={() => {
                                const client = clients.find((c) => c.id === mut.payload.clientId);
                                if (client) {
                                  onSelectClient(client);
                                  setIsOpen(false);
                                }
                              }}
                              className="px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-300 text-[10px] font-medium"
                            >
                              Ver
                            </button>
                          )}
                          {(mut.type.includes('TRANSACTION') || mut.type.includes('CASH') || mut.type.includes('COMMISSION')) && (
                            <button
                              onClick={() => {
                                onGoToFinancial?.();
                                setIsOpen(false);
                              }}
                              className="px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-300 text-[10px] font-medium"
                            >
                              Financeiro
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-stone-100 flex flex-col gap-1.5">
                      {m.actions.map((act, i) => {
                        if (act.type === 'FINANCEIRO') {
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                onGoToFinancial?.();
                                setIsOpen(false);
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold transition cursor-pointer"
                            >
                              <DollarSign className="w-3 h-3 text-emerald-600" />
                              <span>Acessar Gestão Financeira & Caixa</span>
                            </button>
                          );
                        }

                        const target = clients.find((c) => c.id === act.clientId);
                        if (!target) return null;
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              if (act.type === 'WHATSAPP') onOpenWhatsApp(target, act.payload);
                              if (act.type === 'AGENDAR') onBookAppointment(target);
                              if (act.type === 'FICHA') onSelectClient(target);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold transition cursor-pointer"
                          >
                            {act.type === 'WHATSAPP' && <MessageCircle className="w-3 h-3 text-emerald-600" />}
                            {act.type === 'AGENDAR' && <Calendar className="w-3 h-3 text-amber-700" />}
                            {act.type === 'FICHA' && <FileText className="w-3 h-3 text-indigo-700" />}
                            <span>
                              {act.type === 'WHATSAPP' && `WhatsApp para ${target.name}`}
                              {act.type === 'AGENDAR' && `Agendar ${target.name}`}
                              {act.type === 'FICHA' && `Ver ficha de ${target.name}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <span className="block mt-1 text-[9px] text-stone-400 text-right">{m.timestamp}</span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-stone-600 text-xs p-2 bg-[#F8F6F0] rounded-xl border border-stone-200 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                <span>Agente Instituto Jack processando...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Consulte, edite ou delete algo..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 bg-stone-900 text-amber-300 rounded-xl hover:bg-stone-800 transition disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
