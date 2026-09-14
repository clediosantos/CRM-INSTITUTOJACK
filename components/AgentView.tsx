'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  MessageCircle,
  Calendar,
  FileText,
  TrendingUp,
  AlertTriangle,
  Cake,
  RefreshCw,
  Scissors,
  CheckCircle2,
  Zap,
  Info,
  DollarSign,
  Edit3,
  Trash2,
  PlusCircle,
  Database,
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

interface AgentViewProps {
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
  onGoToFinancial?: () => void;
  onExecuteMutation?: (mutation: AgentMutationAction) => { success: boolean; message: string };
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  actions?: ParsedAction[];
  mutations?: AgentMutationAction[];
}

interface ParsedAction {
  type: 'WHATSAPP' | 'AGENDAR' | 'FICHA' | 'FINANCEIRO';
  clientId?: string;
  clientName?: string;
  payload?: string;
}

export const AgentView: React.FC<AgentViewProps> = ({
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
  onGoToFinancial,
  onExecuteMutation,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'agent',
      content: `Olá! Sou o **Agente Instituto Jack**, o copiloto executivo com **Acesso Total ao CRM** do nosso espaço de beleza & bem-estar. 🌿

Especialidades ativas: **Unha**, **Depilação**, **Cabelo**, **Podologia** e **Sobrancelhas**.
*“Cuidado que transforma, beleza que realça.”*

Tenho permissão completa para:
- 🔍 **Consultar**: fichas técnicas, fórmulas de colorimetria, clientes, agenda, faturamento, caixa e comissões.
- ✏️ **Editar**: atualizar telefones, preferências, status de agendamentos, preços de serviços e lançamentos.
- 🗑️ **Deletar**: cancelar agendamentos, excluir lançamentos indevidos ou fichas no sistema.
- ➕ **Criar**: cadastrar novas clientes, novos procedimentos, agendamentos e despesas no financeiro.

O que gostaria de consultar, editar ou lançar hoje?`,
      timestamp: 'Agora',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Comprehensive context payload for the backend agent
  const getContextPayload = () => {
    return {
      clients,
      appointments,
      professionals,
      services,
      transactions,
      cashRegisters,
      commissions,
    };
  };

  // Helper to parse actions and mutations
  const parseAgentResponse = (rawText: string): {
    cleanedText: string;
    actions: ParsedAction[];
    mutations: AgentMutationAction[];
  } => {
    const actions: ParsedAction[] = [];
    const mutations: AgentMutationAction[] = [];

    // 1. Match [MUTATION:TYPE|JSON]
    const mutationRegex = /\[MUTATION:([A-Z_]+)\|([^\]]+)\]/g;
    let mutMatch;
    while ((mutMatch = mutationRegex.exec(rawText)) !== null) {
      const mutType = mutMatch[1] as AgentMutationType;
      const rawJson = mutMatch[2]?.trim();
      try {
        const payload = JSON.parse(rawJson);
        let description = 'Alteração executada no CRM';
        if (mutType === 'UPDATE_CLIENT') description = 'Cadastro de cliente atualizado';
        if (mutType === 'DELETE_CLIENT') description = 'Cliente excluída do CRM';
        if (mutType === 'CREATE_CLIENT') description = `Nova cliente cadastrada: ${payload.name || ''}`;
        if (mutType === 'UPDATE_APPOINTMENT') description = 'Agendamento atualizado na agenda';
        if (mutType === 'DELETE_APPOINTMENT') description = 'Agendamento cancelado/excluído';
        if (mutType === 'CREATE_APPOINTMENT') description = `Horário agendado para ${payload.clientName || ''}`;
        if (mutType === 'ADD_TECHNICAL_RECORD') description = 'Ficha técnica / colorimetria registrada';
        if (mutType === 'DELETE_TECHNICAL_RECORD') description = 'Ficha técnica removida do histórico';
        if (mutType === 'UPDATE_SERVICE') description = 'Serviço/preço atualizado';
        if (mutType === 'DELETE_SERVICE') description = 'Serviço removido do catálogo';
        if (mutType === 'CREATE_TRANSACTION') description = `Lançamento financeiro: ${payload.description || ''}`;
        if (mutType === 'UPDATE_TRANSACTION') description = 'Lançamento financeiro atualizado';
        if (mutType === 'DELETE_TRANSACTION') description = 'Lançamento financeiro excluído';
        if (mutType === 'CASH_OPERATION') description = `Operação de caixa: ${payload.type === 'sangria' ? 'Sangria' : 'Suprimento'}`;
        if (mutType === 'PAY_COMMISSION') description = 'Comissão profissional liquidada';

        const mutationObj: AgentMutationAction = {
          id: generateUniqueId('mut'),
          type: mutType,
          description,
          payload,
          executed: true,
        };
        mutations.push(mutationObj);

        // Execute directly via state mutation callback
        if (onExecuteMutation) {
          onExecuteMutation(mutationObj);
        }
      } catch (err) {
        console.error('Erro ao interpretar mutação do agente:', err);
      }
    }

    // 2. Match [AÇÃO:FINANCEIRO]
    const finRegex = /\[AÇÃO:FINANCEIRO\]/g;
    if (finRegex.test(rawText)) {
      actions.push({ type: 'FINANCEIRO' });
    }

    // 3. Match [AÇÃO:WHATSAPP|id|mensagem] / AGENDAR / FICHA
    const actionRegex = /\[AÇÃO:(WHATSAPP|AGENDAR|FICHA)\|([^|\]]+)(?:\|([^\]]+))?\]/g;
    let match;
    while ((match = actionRegex.exec(rawText)) !== null) {
      const type = match[1] as 'WHATSAPP' | 'AGENDAR' | 'FICHA';
      const clientId = match[2]?.trim();
      const payload = match[3]?.trim();
      
      const targetClient = clients.find((c) => c.id === clientId);

      actions.push({
        type,
        clientId,
        clientName: targetClient?.name || 'Cliente',
        payload,
      });
    }

    const cleanedText = rawText
      .replace(mutationRegex, '')
      .replace(finRegex, '')
      .replace(actionRegex, '')
      .trim();

    return { cleanedText, actions, mutations };
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: generateUniqueId('user'),
      role: 'user',
      content: textToSend,
      timestamp: 'Agora',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          contextData: getContextPayload(),
        }),
      });

      const data = await response.json();
      const rawReply = data.reply || 'Não foi possível processar a resposta.';

      const { cleanedText, actions, mutations } = parseAgentResponse(rawReply);

      const agentMsg: Message = {
        id: generateUniqueId('agent'),
        role: 'agent',
        content: cleanedText,
        timestamp: 'Agora',
        actions,
        mutations,
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error('Erro ao comunicar com o agente:', err);
      const errorMsg: Message = {
        id: generateUniqueId('agent-err'),
        role: 'agent',
        content: 'Desculpe, tive uma instabilidade momentânea na conexão. Por favor, tente novamente.',
        timestamp: 'Agora',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = (action: ParsedAction) => {
    if (action.type === 'FINANCEIRO') {
      onGoToFinancial?.();
      return;
    }

    const client = clients.find((c) => c.id === action.clientId);
    if (!client) return;

    if (action.type === 'WHATSAPP') {
      onOpenWhatsApp(client, action.payload);
    } else if (action.type === 'AGENDAR') {
      onBookAppointment(client);
    } else if (action.type === 'FICHA') {
      onSelectClient(client);
    }
  };

  const quickPrompts = [
    {
      label: '🔍 Consultar Ficha Técnica',
      prompt: 'Consulte a ficha técnica de colorimetria, fórmula usada e preferências da cliente Camila Silva.',
      icon: Scissors,
    },
    {
      label: '✏️ Editar Cliente no CRM',
      prompt: 'Atualize o telefone da cliente Helena Souza para (11) 98888-7777 e adicione nas observações que ela prefere café expresso sem açúcar.',
      icon: Edit3,
    },
    {
      label: '🗑️ Cancelar / Excluir Horário',
      prompt: 'Localize o agendamento da Camila Silva de hoje e exclua da agenda.',
      icon: Trash2,
    },
    {
      label: '➕ Lançar Despesa Financeira',
      prompt: 'Lance uma nova despesa de R$ 180 em "Produtos de Hidratação & Tonalizantes" paga via Pix.',
      icon: PlusCircle,
    },
    {
      label: '💰 DRE, Caixa & Comissões',
      prompt: 'Faça um diagnóstico financeiro completo: faturamento, despesas, lucro líquido, caixa de hoje e comissões da equipe.',
      icon: DollarSign,
    },
    {
      label: '⚠️ Clientes em Risco de Evasão',
      prompt: 'Quais clientes estão em risco por falta de visita e quais mensagens de WhatsApp personalizadas podemos mandar?',
      icon: AlertTriangle,
    },
    {
      label: '🎂 Aniversariantes do Mês VIP',
      prompt: 'Identifique as clientes aniversariantes e redija uma mensagem irresistível com presente para enviar no WhatsApp.',
      icon: Cake,
    },
    {
      label: '⚡ Preencher Horários Vagos',
      prompt: 'Crie uma estratégia de promoção relâmpago para preencher horários livres de hoje e amanhã.',
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#15803D] via-[#16A34A] to-[#15803D] text-white rounded-3xl p-6 border border-emerald-400/50 relative overflow-hidden shadow-lg">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0 p-1 rounded-2xl border-2 border-emerald-200 bg-white shadow-md">
              <InstitutoJackLogo variant="icon" size={60} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  Agente Instituto Jack • Copiloto com Acesso Total ao CRM
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping" />
                  CRUD Conectado
                </span>
              </div>
              <p className="text-emerald-50 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
                O agente tem permissão para <strong>consultar</strong> histórico e fichas, <strong>editar</strong> cadastros e status, <strong>deletar</strong> registros e <strong>criar</strong> novos lançamentos no CRM do Instituto Jack.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-[#14532D] border border-emerald-300/40 text-xs text-emerald-100 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-emerald-300" />
              <span><strong>{clients.length}</strong> clientes • <strong>{appointments.length}</strong> agendamentos</span>
            </div>
            <button
              onClick={() => setMessages([messages[0]])}
              title="Reiniciar conversa"
              className="p-2 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white border border-emerald-300/40 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat + Context Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chat Stream (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
          
          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-stone-50/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.role === 'user'
                      ? 'bg-stone-200 text-stone-700'
                      : 'bg-stone-900 text-amber-300 border border-stone-800 shadow-sm'
                  }`}
                >
                  {msg.role === 'user' ? 'Você' : <Sparkles className="w-4 h-4 text-amber-300" />}
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber-400 text-stone-950 font-medium rounded-tr-none shadow-sm'
                      : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Content with basic markdown formatting */}
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.content.split('\n\n').map((paragraph, i) => (
                      <p key={i} dangerouslySetInnerHTML={{
                        __html: paragraph
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-amber-400 pl-3 italic text-stone-600 my-1.5">$1</blockquote>')
                      }} />
                    ))}
                  </div>

                  {/* Render Mutation Confirmation Badges if any */}
                  {msg.mutations && msg.mutations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-stone-100 flex flex-col gap-2">
                      {msg.mutations.map((mut, mutIdx) => (
                        <div
                          key={mutIdx}
                          className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-xs flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-emerald-950 flex items-center gap-2">
                                <span>{mut.description}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-mono">
                                  {mut.type}
                                </span>
                              </div>
                              <p className="text-[11px] text-emerald-800/80 mt-0.5">
                                Alteração gravada e refletida imediatamente no CRM.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {mut.type.includes('CLIENT') && mut.payload?.clientId && (
                              <button
                                onClick={() => {
                                  const client = clients.find((c) => c.id === mut.payload.clientId);
                                  if (client) onSelectClient(client);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-white text-emerald-800 border border-emerald-300 font-medium hover:bg-emerald-100 transition shadow-2xs text-[11px] cursor-pointer flex items-center gap-1"
                              >
                                <span>Ver Ficha</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                            {(mut.type.includes('TRANSACTION') || mut.type.includes('CASH') || mut.type.includes('COMMISSION')) && (
                              <button
                                onClick={onGoToFinancial}
                                className="px-2.5 py-1 rounded-lg bg-white text-emerald-800 border border-emerald-300 font-medium hover:bg-emerald-100 transition shadow-2xs text-[11px] cursor-pointer flex items-center gap-1"
                              >
                                <span>Ver Financeiro</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Action Buttons if any */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap gap-2">
                      {msg.actions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          onClick={() => executeAction(act)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition shadow-xs cursor-pointer active:scale-95"
                        >
                          {act.type === 'WHATSAPP' && <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />}
                          {act.type === 'AGENDAR' && <Calendar className="w-3.5 h-3.5 text-amber-700" />}
                          {act.type === 'FICHA' && <FileText className="w-3.5 h-3.5 text-indigo-700" />}
                          {act.type === 'FINANCEIRO' && <DollarSign className="w-3.5 h-3.5 text-emerald-600" />}
                          
                          <span>
                            {act.type === 'WHATSAPP' && `Abrir WhatsApp para ${act.clientName}`}
                            {act.type === 'AGENDAR' && `Agendar com ${act.clientName}`}
                            {act.type === 'FICHA' && `Ver Ficha de ${act.clientName}`}
                            {act.type === 'FINANCEIRO' && 'Acessar Gestão Financeira & Caixa'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-1.5 text-[10px] text-stone-400 text-right">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Loader */}
            {isLoading && (
              <div className="flex gap-3 max-w-xl mr-auto items-center">
                <div className="w-8 h-8 rounded-full bg-[#183025] text-emerald-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-300" />
                </div>
                <div className="bg-white border border-stone-200 text-stone-600 rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Agente Instituto Jack consultando o banco de dados e preparando resposta...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2.5 bg-white border-t border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider shrink-0 px-2 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              Comandos Rápidos:
            </span>
            {quickPrompts.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-amber-50 hover:text-amber-900 border border-stone-200/80 text-xs font-medium text-stone-700 whitespace-nowrap transition cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Icon className="w-3.5 h-3.5 text-amber-600" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ex: 'Qual a fórmula da Camila?', 'Mude o telefone da Helena', 'Cancele o horário de hoje'..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/60 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-semibold text-sm transition flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Enviar</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Knowledge Base & Live Insights (Right 1 col) */}
        <div className="space-y-6">
          
          {/* Agent Capabilities Card */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif font-medium text-stone-900 flex items-center gap-2 text-base">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Controle Total do CRM
            </h3>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2.5">
                <Scissors className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block">🔍 Consulta Técnica & Histórico</strong>
                  Acessa fórmulas de colorimetria, fichas capilares, histórico de visitas, aniversários e preferências.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2.5">
                <Edit3 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block">✏️ Edição em Tempo Real</strong>
                  Altera contatos, status de atendimentos, observações, catálogo de serviços e despesas no sistema.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2.5">
                <Trash2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block">🗑️ Exclusão e Cancelamentos</strong>
                  Remove agendamentos cancelados, lançamentos errados e registros do histórico por instrução direta.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2.5">
                <DollarSign className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block">💰 Gestão Financeira Integrada</strong>
                  Controla DRE, sangrias, suprimentos de caixa, comissões profissionais e contas a pagar/receber.
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Salon Snapshot */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif font-medium text-stone-900 flex items-center gap-2 text-base">
              <Info className="w-4 h-4 text-amber-600" />
              Dados Conectados em Tempo Real
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <span className="text-xs text-stone-500 block">Base de Clientes</span>
                <span className="text-lg font-bold text-amber-900 font-serif">{clients.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                <span className="text-xs text-stone-500 block">Hoje na Agenda</span>
                <span className="text-lg font-bold text-emerald-900 font-serif">
                  {appointments.filter((a) => a.date === '2026-09-14').length}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/60">
                <span className="text-xs text-stone-500 block">Em Risco de Evasão</span>
                <span className="text-lg font-bold text-rose-900 font-serif">
                  {clients.filter((c) => c.status === 'Em Risco').length}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/60">
                <span className="text-xs text-stone-500 block">Lançamentos Financeiros</span>
                <span className="text-lg font-bold text-indigo-900 font-serif">{transactions.length}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-100 text-stone-600 text-xs flex items-center justify-between">
              <span>Status do Agente:</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Operando Local + Gemini
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
