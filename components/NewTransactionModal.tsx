'use client';

import React, { useState } from 'react';
import { X, Plus, DollarSign, Calendar, Tag, CreditCard, User, FileText } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod, Professional } from '@/lib/types';
import { generateUniqueId } from '@/lib/utils';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Transaction) => void;
  professionals: Professional[];
}

const CATEGORIES_RECEITA = [
  'Serviços de Cabelo',
  'Unhas & Nail Art',
  'Estética Facial & Corporal',
  'Sobrancelhas & Cílios',
  'Venda de Produtos (Home Care)',
  'Cursos & Workshops',
  'Outras Entradas',
];

const CATEGORIES_DESPESA = [
  'Comissões Profissionais',
  'Produtos & Químicas (Estoque)',
  'Aluguel & Condomínio',
  'Água & Luz & Internet',
  'Marketing & Tráfego Pago',
  'Taxas Bancárias / Cartão',
  'Manutenção & Infraestrutura',
  'Pró-labore & Salários',
  'Outras Despesas',
];

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  professionals,
}) => {
  const [type, setType] = useState<TransactionType>('receita');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES_RECEITA[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [status, setStatus] = useState<'pago' | 'pendente'>('pago');
  const [date, setDate] = useState('2026-09-14');
  const [clientOrSupplier, setClientOrSupplier] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'receita' ? CATEGORIES_RECEITA[0] : CATEGORIES_DESPESA[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0 || !description.trim()) {
      return;
    }

    const selectedProf = professionals.find((p) => p.id === professionalId);

    const newTx: Transaction = {
      id: generateUniqueId('tx'),
      type,
      description: description.trim(),
      amount: numAmount,
      category,
      paymentMethod,
      status,
      date,
      clientOrSupplier: clientOrSupplier.trim() || undefined,
      professionalId: professionalId || undefined,
      professionalName: selectedProf?.name || undefined,
      notes: notes.trim() || undefined,
    };

    onAddTransaction(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
              type === 'receita' ? 'bg-emerald-400 text-stone-950' : 'bg-rose-400 text-stone-950'
            }`}>
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold font-serif text-amber-200">
                Lançar Nova Transação
              </h3>
              <p className="text-xs text-stone-300">Registro financeiro no fluxo de caixa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-stone-800 text-sm">
          
          {/* Transaction Type Tabs */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Tipo de Movimentação</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('receita')}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  type === 'receita'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Receita (Entrada)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('despesa')}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  type === 'despesa'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Despesa (Saída)
              </button>
            </div>
          </div>

          {/* Value and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-medium">R$</span>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-sm font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Data *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Descrição / Identificação *
            </label>
            <input
              type="text"
              required
              placeholder={type === 'receita' ? 'Ex: Mechas + Kit Home Care' : 'Ex: Reposição de Descolorantes Wella'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-stone-400" />
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-amber-500 bg-white"
              >
                {(type === 'receita' ? CATEGORIES_RECEITA : CATEGORIES_DESPESA).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-amber-500 bg-white"
              >
                <option value="pix">Pix Instantâneo</option>
                <option value="credito">Cartão de Crédito</option>
                <option value="debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro Físico (Caixa)</option>
                <option value="boleto">Boleto Bancário</option>
              </select>
            </div>
          </div>

          {/* Client / Supplier & Professional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-400" />
                {type === 'receita' ? 'Cliente' : 'Fornecedor / Favorecido'}
              </label>
              <input
                type="text"
                placeholder={type === 'receita' ? 'Nome da cliente' : 'Distribuidora, Enel, etc.'}
                value={clientOrSupplier}
                onChange={(e) => setClientOrSupplier(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Profissional Associado (Opcional)
              </label>
              <select
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-amber-500 bg-white"
              >
                <option value="">Nenhum / Salão Geral</option>
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Status do Lançamento
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pago' | 'pendente')}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-amber-500 bg-white font-medium"
              >
                <option value="pago">✅ Liquidado / Pago</option>
                <option value="pendente">⏳ Pendente / A Vencer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Observações
              </label>
              <input
                type="text"
                placeholder="Ex: NF 1042 ou autorização Stone"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-sm font-medium transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg text-white text-sm font-bold shadow-md transition cursor-pointer ${
                type === 'receita' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Confirmar Lançamento
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
