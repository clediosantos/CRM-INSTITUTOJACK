'use client';

import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageCircle, Sparkles, Phone, ExternalLink } from 'lucide-react';
import { Client } from '@/lib/types';

interface WhatsAppModalProps {
  client: Client | null;
  defaultMessage?: string;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  client,
  defaultMessage,
  onClose,
}) => {
  const [message, setMessage] = useState(() => {
    if (!client) return '';
    return defaultMessage || 
      `Olá ${client.name.split(' ')[0]}! 🌿 Passando para saber como você está e se deseja agendar um momento de cuidado no Instituto Jack esta semana. Cuidado que transforma, beleza que realça! Podemos reservar seu horário?`;
  });
  const [copied, setCopied] = useState(false);

  if (!client) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = client.phone.replace(/\D/g, '');
    const encodedText = encodeURIComponent(message);
    const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white text-stone-900 rounded-2xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whatsapp-modal-title"
      >
        {/* Header styling mimics WhatsApp web bar with modern salon accent */}
        <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={client.avatar}
                alt={client.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/40"
              />
              <span className="w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full absolute bottom-0 right-0" />
            </div>
            <div>
              <h3 id="whatsapp-modal-title" className="font-semibold text-sm leading-tight text-white">
                {client.name}
              </h3>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {client.phone}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Chat Simulated Bubble */}
        <div className="p-4 bg-[#EFEAE2] flex-1 min-h-[220px] flex flex-col justify-end relative">
          <div className="text-[11px] text-stone-600 bg-white/80 backdrop-blur-sm self-center px-2.5 py-1 rounded-md shadow-xs mb-3 font-medium">
            Mensagem Direta • CRM Instituto Jack
          </div>

          {/* Outgoing Message bubble */}
          <div className="self-end max-w-[90%] bg-[#D9FDD3] text-stone-900 rounded-lg rounded-tr-none p-3 shadow-xs text-sm leading-relaxed relative">
            <p className="whitespace-pre-wrap">{message}</p>
            <div className="text-[10px] text-stone-500 text-right mt-1.5 flex items-center justify-end gap-1">
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-blue-500 font-bold">✓✓</span>
            </div>
          </div>
        </div>

        {/* Editor & Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span className="font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Editar texto da mensagem antes de enviar:
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-white border border-stone-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white shadow-md transition cursor-pointer active:scale-98"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir WhatsApp Web & Enviar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
