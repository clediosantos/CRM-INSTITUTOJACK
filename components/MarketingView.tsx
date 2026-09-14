'use client';

import React, { useState } from 'react';
import { 
  MessageCircle, 
  Sparkles, 
  Cake, 
  Clock, 
  UserX, 
  Send, 
  Users, 
  CheckCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  Heart
} from 'lucide-react';
import { MarketingCampaign, Client } from '@/lib/types';

interface MarketingViewProps {
  campaigns: MarketingCampaign[];
  clients: Client[];
  onOpenWhatsApp: (client: Client, customMessage?: string) => void;
  onSelectClient: (client: Client) => void;
}

export const MarketingView: React.FC<MarketingViewProps> = ({
  campaigns,
  clients,
  onOpenWhatsApp,
  onSelectClient,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [customMsg, setCustomMsg] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  const handleCopyTemplate = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Get matching clients based on campaign category
  const getEligibleClients = (campaign: MarketingCampaign) => {
    if (campaign.category === 'Aniversário') {
      return clients.filter((c) => c.birthday.includes('09') || c.status === 'Em Risco');
    }
    if (campaign.category === 'Retoque') {
      return clients.filter((c) => c.tags.some((t) => t.toLowerCase().includes('loira') || t.toLowerCase().includes('mecha') || t.toLowerCase().includes('gel')));
    }
    if (campaign.category === 'Reativação') {
      return clients.filter((c) => c.status === 'Em Risco' || c.visitsCount <= 2);
    }
    return clients.slice(0, 3);
  };

  const eligibleClients = activeCampaign ? getEligibleClients(activeCampaign) : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-800 font-bold">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            Régua de Relacionamento & Automação WhatsApp
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
            Campanhas & Retenção de Clientes
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Aumente o faturamento do salão recuperando clientes sumidas e antecipando retoques de mechas e unhas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-stone-600 block font-medium">Alcance Total Estimado</span>
            <span className="text-base font-bold text-stone-900">
              {campaigns.reduce((acc, c) => acc + c.estimatedReach, 0)} clientes impactadas
            </span>
          </div>
        </div>
      </div>

      {/* Campaigns Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {campaigns.map((camp) => {
          const isSelected = camp.id === activeCampaign.id;

          const getIcon = () => {
            switch (camp.category) {
              case 'Aniversário':
                return <Cake className="w-5 h-5 text-amber-700" />;
              case 'Retoque':
                return <Clock className="w-5 h-5 text-purple-700" />;
              case 'Reativação':
                return <UserX className="w-5 h-5 text-rose-700" />;
              case 'Pós-Venda':
              default:
                return <Heart className="w-5 h-5 text-emerald-700" />;
            }
          };

          return (
            <button
              key={camp.id}
              onClick={() => setSelectedCampaignId(camp.id)}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-800 shadow-md ring-2 ring-amber-400/60'
                  : 'bg-white text-stone-900 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-stone-800' : 'bg-stone-100'}`}>
                    {getIcon()}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-amber-400 text-stone-950' : 'bg-stone-100 text-stone-700'
                  }`}>
                    {camp.category}
                  </span>
                </div>

                <h3 className={`font-serif font-bold text-sm sm:text-base leading-tight ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                  {camp.title}
                </h3>
              </div>

              <div className={`mt-4 pt-3 border-t text-xs flex items-center justify-between ${isSelected ? 'border-stone-800 text-stone-400' : 'border-stone-150 text-stone-500'}`}>
                <span>Público Alvo:</span>
                <span className={`font-bold ${isSelected ? 'text-amber-300' : 'text-stone-800'}`}>
                  ~{camp.estimatedReach} clientes
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Campaign Workspace */}
      {activeCampaign && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Message Copy & Strategy */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-amber-800 font-bold">
                  Template Estratégico de Disparo
                </span>
                <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
                  {activeCampaign.title}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Público-alvo: {activeCampaign.targetAudience}
                </p>
              </div>

              <button
                onClick={() => handleCopyTemplate(activeCampaign.templateMessage, activeCampaign.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer self-start sm:self-auto"
              >
                {copiedId === activeCampaign.id ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiedId === activeCampaign.id ? 'Texto Copiado!' : 'Copiar Texto'}
              </button>
            </div>

            {/* Strategy Benefit Box */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-amber-900">Ação Recomendada pelo CRM:</strong>
                <span>{activeCampaign.suggestedAction}</span>
              </div>
            </div>

            {/* Message Template Display (WhatsApp Styled Bubble) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                Texto Personalizado com Tags Dinâmicas:
              </label>
              <div className="bg-[#EFEAE2] p-4 rounded-xl border border-stone-300 relative">
                <div className="bg-[#D9FDD3] p-3.5 rounded-xl rounded-tr-none text-stone-900 text-sm leading-relaxed shadow-xs max-w-xl">
                  <p className="whitespace-pre-wrap">{activeCampaign.templateMessage}</p>
                  <div className="text-[10px] text-stone-500 text-right mt-2 flex items-center justify-end gap-1">
                    <span>10:45</span>
                    <span className="text-blue-500 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                * As tags <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">{`{NOME}`}</code> são preenchidas automaticamente ao clicar na cliente.
              </p>
            </div>

          </div>

          {/* Right 1 Col: List of Target Clients to Message */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <div>
                  <h4 className="font-serif font-bold text-stone-900 text-sm">
                    Clientes Sugeridas
                  </h4>
                  <p className="text-[11px] text-stone-500">Prontas para envio direto</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  {eligibleClients.length} prioritárias
                </span>
              </div>

              <div className="space-y-3">
                {eligibleClients.map((client) => {
                  const firstName = client.name.split(' ')[0];
                  const personalizedMsg = activeCampaign.templateMessage.replace('{NOME}', firstName);

                  return (
                    <div
                      key={client.id}
                      className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 transition flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={client.avatar}
                          alt={client.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 
                            onClick={() => onSelectClient(client)}
                            className="font-bold text-xs text-stone-900 hover:text-amber-800 cursor-pointer truncate"
                          >
                            {client.name}
                          </h5>
                          <p className="text-[10px] text-stone-500 truncate">
                            {client.birthday ? `Aniv: ${client.birthday} • ` : ''}
                            {client.status}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenWhatsApp(client, personalizedMsg)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition cursor-pointer shadow-xs active:scale-95"
                        title="Enviar mensagem personalizada no WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Enviar</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-200 text-center text-xs text-stone-400">
              <span>Disparos respeitam as diretrizes de privacidade e opt-in das clientes.</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
