'use client';

import React, { useState } from 'react';
import { X, UserPlus, Phone, Mail, Calendar, Coffee, AlertTriangle, Check, Sparkles } from 'lucide-react';
import { Client, ClientStatus } from '@/lib/types';

interface NewClientModalProps {
  onClose: () => void;
  onSave: (client: Client) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('5511');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [status, setStatus] = useState<ClientStatus>('Nova');
  const [drink, setDrink] = useState('Café com água com gás');
  const [conversationStyle, setConversationStyle] = useState('Tranquila / Equilibrada');
  const [allergies, setAllergies] = useState('');
  const [scalpCondition, setScalpCondition] = useState('Normal');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('Nova Cliente');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Pick a clean random female avatar placeholder
    const avatarIds = [
      '1534528741775-53994a69daeb',
      '1517841905240-472988babdf9',
      '1524504388940-b1c1722653e1',
      '1573497019940-1c28c88b4f3e',
      '1508214751196-bcfd4ca60f91',
      '1531746020798-e6953c6e8e04',
      '1544005313-94ddf0286df2',
    ];
    const randomAvatar = avatarIds[Math.floor(Math.random() * avatarIds.length)];

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      avatar: `https://images.unsplash.com/photo-${randomAvatar}?w=150&auto=format&fit=crop&q=80`,
      birthday: birthday.trim() || '15/10',
      status,
      totalSpent: 0,
      visitsCount: 0,
      lastVisitDate: '',
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      preferences: {
        drink: drink.trim(),
        conversationStyle: conversationStyle.trim(),
        allergies: allergies.trim(),
        scalpCondition: scalpCondition.trim(),
        notes: notes.trim(),
      },
      technicalRecords: [],
    };

    onSave(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white text-stone-900 rounded-2xl w-full max-w-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-client-modal-title"
      >
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 id="new-client-modal-title" className="font-serif font-semibold text-lg text-white">
                Cadastrar Nova Cliente
              </h3>
              <p className="text-xs text-stone-400">Ficha cadastral e preferências de atendimento</p>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                placeholder="Ex: Amanda Silveira"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600" />
                WhatsApp (com DDD) *
              </label>
              <input
                type="text"
                placeholder="5511999998888"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-stone-500" />
                E-mail
              </label>
              <input
                type="email"
                placeholder="cliente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-stone-500" />
                Aniversário
              </label>
              <input
                type="text"
                placeholder="DD/MM (ex: 18/09)"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Classificação Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:border-amber-500"
              >
                <option value="Nova">Nova Cliente</option>
                <option value="Recorrente">Frequente / Recorrente</option>
                <option value="VIP">Cliente VIP</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Tags / Marcadores (separados por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: Loiras, Unhas em Gel, Indicação"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Preferences Section */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Preferências Sensoriais & Hospitalidade
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1 flex items-center gap-1">
                  <Coffee className="w-3 h-3 text-amber-700" />
                  Bebida Predileta
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cappuccino com canela, Chá de hortelã"
                  value={drink}
                  onChange={(e) => setDrink(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">
                  Estilo de Conversa
                </label>
                <input
                  type="text"
                  placeholder="Ex: Discreta, Adora bater papo, Silêncio no lavatório"
                  value={conversationStyle}
                  onChange={(e) => setConversationStyle(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white border border-stone-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-rose-900 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                Alergias ou Sensibilidades (Amônia, Fragrâncias, Esmaltes...)
              </label>
              <input
                type="text"
                placeholder="Ex: Sensível a pó descolorante com amônia forte (ou deixe em branco se nenhuma)"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white border border-rose-300 text-rose-950"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Anotações Gerais
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Veio por indicação da médica; prefere horários no final da tarde."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs sm:text-sm p-2 rounded-xl bg-stone-50 border border-stone-300"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-200">
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
              Salvar Cliente no CRM
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
