'use client';

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  Receipt, 
  Plus, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  FileSpreadsheet, 
  Filter, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  PiggyBank,
  Percent,
  Scissors,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { 
  Transaction, 
  DailyCashRegister, 
  CommissionPayout, 
  Professional, 
  Client, 
  PaymentMethod 
} from '@/lib/types';
import { NewTransactionModal } from './NewTransactionModal';
import { generateUniqueId } from '@/lib/utils';

interface FinancialViewProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  cashRegisters: DailyCashRegister[];
  onUpdateCashRegister: (reg: DailyCashRegister) => void;
  commissions: CommissionPayout[];
  onPayCommission: (commissionId: string) => void;
  professionals: Professional[];
  clients: Client[];
}

export const FinancialView: React.FC<FinancialViewProps> = ({
  transactions,
  onAddTransaction,
  cashRegisters,
  onUpdateCashRegister,
  commissions,
  onPayCommission,
  professionals,
}) => {
  const [subTab, setSubTab] = useState<'visao-geral' | 'fluxo-caixa' | 'fechamento-caixa' | 'comissoes' | 'contas'>('visao-geral');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txFilterType, setTxFilterType] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [txSearch, setTxSearch] = useState('');

  // Sangria modal state
  const [isSangriaModalOpen, setIsSangriaModalOpen] = useState(false);
  const [sangriaAmount, setSangriaAmount] = useState('');
  const [sangriaReason, setSangriaReason] = useState('');

  // Active today register
  const todayRegister = cashRegisters.find((c) => c.date === '2026-09-14') || cashRegisters[0];

  // Financial Calculations (DRE & KPIs)
  const stats = useMemo(() => {
    let totalReceitas = 0;
    let receitasServicos = 0;
    let receitasProdutos = 0;
    let totalDespesas = 0;
    let despesasComissoes = 0;
    let despesasInsumos = 0;
    let despesasFixas = 0;
    let contasPendentesPagar = 0;

    const paymentMethodsSummary: Record<PaymentMethod, number> = {
      pix: 0,
      credito: 0,
      debito: 0,
      dinheiro: 0,
      boleto: 0,
    };

    transactions.forEach((tx) => {
      if (tx.status === 'pago') {
        if (tx.type === 'receita') {
          totalReceitas += tx.amount;
          if (tx.category.includes('Produto')) {
            receitasProdutos += tx.amount;
          } else {
            receitasServicos += tx.amount;
          }
          if (paymentMethodsSummary[tx.paymentMethod] !== undefined) {
            paymentMethodsSummary[tx.paymentMethod] += tx.amount;
          }
        } else if (tx.type === 'despesa') {
          totalDespesas += tx.amount;
          if (tx.category.includes('Comiss')) {
            despesasComissoes += tx.amount;
          } else if (tx.category.includes('Produto') || tx.category.includes('Estoque')) {
            despesasInsumos += tx.amount;
          } else {
            despesasFixas += tx.amount;
          }
        }
      } else if (tx.status === 'pendente' && tx.type === 'despesa') {
        contasPendentesPagar += tx.amount;
      }
    });

    const lucroLiquido = totalReceitas - totalDespesas;
    const margemLucro = totalReceitas > 0 ? ((lucroLiquido / totalReceitas) * 100).toFixed(1) : '0';
    const totalTransactionsCount = transactions.filter((t) => t.type === 'receita').length;
    const ticketMedio = totalTransactionsCount > 0 ? (totalReceitas / totalTransactionsCount).toFixed(2) : '0';

    return {
      totalReceitas,
      receitasServicos,
      receitasProdutos,
      totalDespesas,
      despesasComissoes,
      despesasInsumos,
      despesasFixas,
      lucroLiquido,
      margemLucro,
      contasPendentesPagar,
      paymentMethodsSummary,
      ticketMedio,
    };
  }, [transactions]);

  // Filtered transactions for the ledger
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (txFilterType !== 'todos' && tx.type !== txFilterType) return false;
      if (txSearch.trim()) {
        const query = txSearch.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(query);
        const matchesCat = tx.category.toLowerCase().includes(query);
        const matchesName = (tx.clientOrSupplier || '').toLowerCase().includes(query);
        const matchesProf = (tx.professionalName || '').toLowerCase().includes(query);
        if (!matchesDesc && !matchesCat && !matchesName && !matchesProf) return false;
      }
      return true;
    });
  }, [transactions, txFilterType, txSearch]);

  // Handle Sangria submission
  const handleConfirmSangria = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(sangriaAmount.replace(',', '.'));
    if (isNaN(val) || val <= 0 || !todayRegister) return;

    const updated: DailyCashRegister = {
      ...todayRegister,
      withdrawals: (todayRegister.withdrawals || 0) + val,
      notes: (todayRegister.notes || '') + ` | Sangria de R$ ${val.toFixed(2)}: ${sangriaReason || 'Retirada'}`,
    };

    // Also record transaction in ledger
    const tx: Transaction = {
      id: generateUniqueId('tx-sangria'),
      type: 'despesa',
      description: `Sangria de Caixa: ${sangriaReason || 'Despesa emergencial'}`,
      amount: val,
      category: 'Outras Despesas',
      paymentMethod: 'dinheiro',
      status: 'pago',
      date: '2026-09-14',
      notes: 'Retirada efetuada diretamente da gaveta de dinheiro',
    };

    onUpdateCashRegister(updated);
    onAddTransaction(tx);
    setIsSangriaModalOpen(false);
    setSangriaAmount('');
    setSangriaReason('');
  };

  // Toggle cash register closing
  const handleToggleCloseRegister = () => {
    if (!todayRegister) return;
    if (todayRegister.status === 'aberto') {
      const closingTotal =
        todayRegister.openingBalance +
        todayRegister.cashIn -
        todayRegister.withdrawals;
      onUpdateCashRegister({
        ...todayRegister,
        status: 'fechado',
        closingBalance: closingTotal,
        closedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else {
      onUpdateCashRegister({
        ...todayRegister,
        status: 'aberto',
        closedAt: undefined,
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Módulo Financeiro Integrado</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 mt-0.5">
            Gestão Financeira & Caixa
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            DRE Gerencial, Fluxo de Caixa, Fechamento de Gaveta e Comissões de Especialistas
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSangriaModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-xs sm:text-sm font-semibold transition cursor-pointer shadow-2xs"
          >
            <ArrowDownLeft className="w-4 h-4 text-rose-600" />
            <span>Sangria / Retirada</span>
          </button>
          
          <button
            id="btn-nova-transacao"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs sm:text-sm font-bold transition cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Nova Movimentação</span>
          </button>
        </div>
      </div>

      {/* Main KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Receita Bruta */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Receita Total Realizada</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-stone-900">
              R$ {stats.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between border-t border-stone-100 pt-2">
            <span>Serviços: R$ {stats.receitasServicos.toLocaleString('pt-BR')}</span>
            <span>Produtos: R$ {stats.receitasProdutos.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Despesas Operacionais</span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-stone-900">
              R$ {stats.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between border-t border-stone-100 pt-2">
            <span>Comissões: R$ {stats.despesasComissoes.toLocaleString('pt-BR')}</span>
            <span>Fixas: R$ {stats.despesasFixas.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Lucro Líquido Real */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Lucro Líquido do Salão</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <PiggyBank className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-serif ${stats.lucroLiquido >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              R$ {stats.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between border-t border-stone-100 pt-2">
            <span className="font-semibold text-stone-700">Margem: {stats.margemLucro}%</span>
            <span>Ticket Médio: R$ {stats.ticketMedio}</span>
          </div>
        </div>

        {/* Caixa Físico de Hoje */}
        <div className="bg-stone-900 text-white p-5 rounded-2xl border border-stone-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-300">Caixa de Hoje (Gaveta + Mov.)</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              todayRegister?.status === 'aberto' ? 'bg-emerald-400 text-stone-950' : 'bg-stone-700 text-stone-300'
            }`}>
              {todayRegister?.status === 'aberto' ? 'ABERTO' : 'FECHADO'}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-serif text-amber-300">
              R$ {(todayRegister ? todayRegister.openingBalance + todayRegister.cashIn - todayRegister.withdrawals : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between border-t border-stone-800 pt-2">
            <span>Pix: R$ {(todayRegister?.pixIn || 0).toLocaleString('pt-BR')}</span>
            <span>Cartões: R$ {(todayRegister?.cardIn || 0).toLocaleString('pt-BR')}</span>
          </div>
        </div>

      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-200/70 rounded-xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSubTab('visao-geral')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            subTab === 'visao-geral'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          📊 DRE & Indicadores
        </button>
        <button
          onClick={() => setSubTab('fluxo-caixa')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            subTab === 'fluxo-caixa'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          📑 Fluxo de Caixa ({transactions.length})
        </button>
        <button
          onClick={() => setSubTab('fechamento-caixa')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            subTab === 'fechamento-caixa'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          🔐 Fechamento de Caixa
        </button>
        <button
          onClick={() => setSubTab('comissoes')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            subTab === 'comissoes'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          ✂️ Repasse de Comissões ({commissions.filter((c) => c.status === 'pendente').length} pendentes)
        </button>
        <button
          onClick={() => setSubTab('contas')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            subTab === 'contas'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          📅 Contas a Pagar & Receber
        </button>
      </div>

      {/* TAB 1: DRE GERENCIAL & INDICADORES */}
      {subTab === 'visao-geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* DRE Structure Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <h2 className="text-base font-bold text-stone-900 font-serif">
                  DRE Gerencial • Setembro de 2026
                </h2>
                <p className="text-xs text-stone-500">Demonstrativo de Resultados estruturado do salão</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 rounded-md text-stone-700">
                Regime de Competência & Caixa
              </span>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              
              {/* (+) Receita Bruta */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60 font-semibold">
                <div className="flex items-center gap-2 text-stone-900">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  <span>(+) Faturamento Bruto</span>
                </div>
                <span className="font-serif text-emerald-700 font-bold">
                  R$ {stats.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Breakdown de Receita */}
              <div className="pl-6 pr-3 space-y-1.5 text-xs text-stone-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-amber-700" />
                    Receita de Serviços de Salão
                  </span>
                  <span className="font-medium">R$ {stats.receitasServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-rose-700" />
                    Venda de Produtos (Home Care / Boutique)
                  </span>
                  <span className="font-medium">R$ {stats.receitasProdutos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* (-) Deduções / Taxas */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                <span className="text-stone-700">(-) Taxas de Meios de Pagamento (Cartões & Maquininha)</span>
                <span className="font-serif text-rose-700 font-semibold">- R$ 310,00</span>
              </div>

              {/* (=) Receita Líquida */}
              <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-stone-800 border-b border-stone-200">
                <span>(=) Receita Líquida Operacional</span>
                <span className="font-serif">R$ {(stats.totalReceitas - 310).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              {/* (-) Custos Variáveis */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                <div>
                  <span className="text-stone-800 font-medium">(-) Custos Operacionais Variáveis</span>
                  <span className="block text-[11px] text-stone-500">Comissões de especialistas + Produtos químicos de consumo</span>
                </div>
                <span className="font-serif text-rose-700 font-semibold">
                  - R$ {(stats.despesasComissoes + stats.despesasInsumos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* (=) Margem de Contribuição */}
              <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-stone-800 border-b border-stone-200">
                <span>(=) Margem de Contribuição Bruta</span>
                <span className="font-serif font-bold text-amber-800">
                  R$ {(stats.totalReceitas - 310 - (stats.despesasComissoes + stats.despesasInsumos)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* (-) Custos Fixos */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                <div>
                  <span className="text-stone-800 font-medium">(-) Despesas Fixas & Administrativas</span>
                  <span className="block text-[11px] text-stone-500">Aluguel, Condomínio, Energia, Água, Internet e Marketing</span>
                </div>
                <span className="font-serif text-rose-700 font-semibold">
                  - R$ {stats.despesasFixas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* (=) Resultado Líquido */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-stone-900 text-white font-bold">
                <div>
                  <span className="text-sm text-amber-300 font-serif">(=) LUCRO LÍQUIDO FINAL (EBITDA)</span>
                  <span className="block text-xs text-stone-400 font-normal">Resultado disponível para sócios e reinvestimento</span>
                </div>
                <span className="text-xl font-serif text-amber-300">
                  R$ {stats.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

            </div>
          </div>

          {/* Payment Methods & Cash Health Column */}
          <div className="space-y-6">
            
            {/* Formas de Pagamento */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 font-serif mb-1">
                Faturamento por Meio de Pagamento
              </h3>
              <p className="text-xs text-stone-500 mb-4">Divisão das entradas registradas</p>

              <div className="space-y-3">
                
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span>💠 Pix Instantâneo</span>
                    </span>
                    <span>R$ {stats.paymentMethodsSummary.pix.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${stats.totalReceitas > 0 ? (stats.paymentMethodsSummary.pix / stats.totalReceitas) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1 text-indigo-700">
                      <span>💳 Cartão de Crédito</span>
                    </span>
                    <span>R$ {stats.paymentMethodsSummary.credito.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{
                        width: `${stats.totalReceitas > 0 ? (stats.paymentMethodsSummary.credito / stats.totalReceitas) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1 text-blue-700">
                      <span>💳 Cartão de Débito</span>
                    </span>
                    <span>R$ {stats.paymentMethodsSummary.debito.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${stats.totalReceitas > 0 ? (stats.paymentMethodsSummary.debito / stats.totalReceitas) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1 text-amber-700">
                      <span>💵 Dinheiro Físico (Gaveta)</span>
                    </span>
                    <span>R$ {stats.paymentMethodsSummary.dinheiro.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${stats.totalReceitas > 0 ? (stats.paymentMethodsSummary.dinheiro / stats.totalReceitas) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

              </div>

              <div className="mt-5 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs text-stone-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>O Pix representa <strong>{stats.totalReceitas > 0 ? Math.round((stats.paymentMethodsSummary.pix / stats.totalReceitas) * 100) : 0}%</strong> das entradas, reduzindo taxas de máquina.</span>
              </div>
            </div>

            {/* Quick Diagnostic Card */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 rounded-2xl border border-stone-700 shadow-sm">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Percent className="w-4 h-4" />
                <span>Saúde Operacional do Salão</span>
              </div>
              <h4 className="text-base font-bold font-serif text-white">
                Margem Líquida em {stats.margemLucro}%
              </h4>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                Salões de alto padrão sustentam margens saudáveis entre 20% e 35%. Seu salão está operando com alta eficiência graças ao ticket médio de <strong>R$ {stats.ticketMedio}</strong>.
              </p>
              
              <div className="mt-4 pt-4 border-t border-stone-700/60 flex items-center justify-between text-xs">
                <span className="text-stone-400">Contas a Vencer no Mês:</span>
                <span className="font-bold text-amber-300">R$ {stats.contasPendentesPagar.toLocaleString('pt-BR')}</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: FLUXO DE CAIXA & EXTRATO DE TRANSAÇÕES */}
      {subTab === 'fluxo-caixa' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          
          {/* Controls bar */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/70">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-xl text-xs w-full sm:w-auto">
              <button
                onClick={() => setTxFilterType('todos')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  txFilterType === 'todos' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                }`}
              >
                Todas ({transactions.length})
              </button>
              <button
                onClick={() => setTxFilterType('receita')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  txFilterType === 'receita' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-stone-600'
                }`}
              >
                Entradas
              </button>
              <button
                onClick={() => setTxFilterType('despesa')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  txFilterType === 'despesa' ? 'bg-rose-600 text-white shadow-2xs' : 'text-stone-600'
                }`}
              >
                Saídas
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por descrição, cliente ou categoria..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-amber-400 bg-white"
              />
            </div>

          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-100/80 text-stone-500 uppercase text-[10px] font-semibold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Favorecido / Cliente</th>
                  <th className="py-3 px-4">Forma</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-stone-500">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900 max-w-xs truncate">
                      {tx.description}
                      {tx.notes && <span className="block text-[10px] font-normal text-stone-400">{tx.notes}</span>}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-stone-600">
                      {tx.clientOrSupplier || tx.professionalName || 'Salão'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap uppercase text-[11px] font-medium text-stone-500">
                      {tx.paymentMethod}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'pago'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'pendente'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {tx.status === 'pago' && <CheckCircle2 className="w-3 h-3" />}
                        {tx.status === 'pendente' && <Clock className="w-3 h-3" />}
                        {tx.status === 'pago' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right font-serif font-bold text-sm">
                      <span className={tx.type === 'receita' ? 'text-emerald-700' : 'text-rose-700'}>
                        {tx.type === 'receita' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer of Table */}
          <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
            <span>Exibindo {filteredTransactions.length} movimentações</span>
            <div className="flex items-center gap-4 font-semibold text-stone-800">
              <span className="text-emerald-700">Entradas: R$ {stats.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span className="text-rose-700">Saídas: R$ {stats.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: FECHAMENTO DE CAIXA DIÁRIO */}
      {subTab === 'fechamento-caixa' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Register Control Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-800 font-bold">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900 font-serif">
                    Frente de Caixa • {todayRegister?.date || 'Hoje'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Aberto às {todayRegister?.openedAt || '08:00'} • Responsável: Recepção Instituto Jack
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleCloseRegister}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                    todayRegister?.status === 'aberto'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {todayRegister?.status === 'aberto' ? '🔒 Fechar Caixa do Dia' : '🔓 Reabrir Caixa'}
                </button>
              </div>
            </div>

            {/* Balances Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-xs text-stone-500 block">Fundo de Troco Inicial</span>
                <span className="text-xl font-bold font-serif text-stone-900 mt-1 block">
                  R$ {(todayRegister?.openingBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-stone-400">Contado na abertura</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
                <span className="text-xs text-emerald-800 block">Entradas em Dinheiro</span>
                <span className="text-xl font-bold font-serif text-emerald-900 mt-1 block">
                  + R$ {(todayRegister?.cashIn || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-600">Dinheiro físico recebido</span>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/70">
                <span className="text-xs text-rose-800 block">Sangrias / Retiradas</span>
                <span className="text-xl font-bold font-serif text-rose-900 mt-1 block">
                  - R$ {(todayRegister?.withdrawals || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-rose-600">Saídas da gaveta</span>
              </div>

            </div>

            {/* Total Físico em Gaveta */}
            <div className="p-5 rounded-xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-stone-400 block">Saldo Atual em Dinheiro na Gaveta:</span>
                <span className="text-2xl font-bold font-serif text-amber-300">
                  R$ {((todayRegister?.openingBalance || 0) + (todayRegister?.cashIn || 0) - (todayRegister?.withdrawals || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <button
                onClick={() => setIsSangriaModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-white border border-stone-700 transition cursor-pointer"
              >
                + Registrar Sangria
              </button>
            </div>

            {/* Digital Payments Accordion */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                Recebimentos Digitais do Dia (Direto em Conta / Maquininha)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                  <span className="font-medium text-stone-700">💠 Pix em Conta</span>
                  <span className="font-bold text-emerald-700 font-serif">
                    R$ {(todayRegister?.pixIn || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                  <span className="font-medium text-stone-700">💳 Cartões (Stone)</span>
                  <span className="font-bold text-indigo-700 font-serif">
                    R$ {(todayRegister?.cardIn || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Past Registers / History */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 font-serif">
              Histórico de Fechamentos Recentes
            </h3>
            <div className="space-y-3">
              {cashRegisters.map((cr) => (
                <div key={cr.id} className="p-3.5 rounded-xl border border-stone-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800">{cr.date}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      cr.status === 'fechado' ? 'bg-stone-100 text-stone-600' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {cr.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-500 text-[11px]">
                    <span>Fundo: R$ {cr.openingBalance}</span>
                    <span>Dinheiro: +R$ {cr.cashIn}</span>
                    <span>Sangrias: -R$ {cr.withdrawals}</span>
                  </div>
                  {cr.closingBalance && (
                    <div className="pt-1.5 border-t border-stone-100 flex justify-between font-semibold text-stone-900">
                      <span>Saldo Fechamento:</span>
                      <span className="font-serif">R$ {cr.closingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: REPASSE DE COMISSÕES */}
      {subTab === 'comissoes' && (
        <div className="space-y-4">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-stone-900 font-serif">
                Demonstrativo de Comissões por Profissional
              </h2>
              <p className="text-xs text-stone-500">
                Cálculo automatizado conforme contrato: Faturamento Bruto × % Comissão - Deduções (Insumos/Taxas)
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-500 block">Total a Liquidar:</span>
              <span className="text-xl font-bold font-serif text-rose-700">
                R$ {commissions
                  .filter((c) => c.status === 'pendente')
                  .reduce((acc, c) => acc + c.netCommission, 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commissions.map((comm) => (
              <div
                key={comm.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between hover:border-amber-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-200 border border-stone-300">
                        {comm.professionalAvatar ? (
                          <img
                            src={comm.professionalAvatar}
                            alt={comm.professionalName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-5 h-5 text-stone-500 m-auto mt-2" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-stone-900">{comm.professionalName}</h3>
                        <span className="text-[11px] text-stone-400">Período: {comm.period}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        comm.status === 'pago'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {comm.status === 'pago' ? '✅ Liquidado' : '⏳ A Pagar'}
                    </span>
                  </div>

                  {/* Calculations Details */}
                  <div className="py-3 space-y-2 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>Faturamento Total Gerado:</span>
                      <span className="font-semibold text-stone-800 font-serif">
                        R$ {comm.totalServicesAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Percentual Contratual:</span>
                      <span className="font-bold text-amber-700">{comm.commissionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comissão Bruta:</span>
                      <span className="font-semibold text-stone-800 font-serif">
                        R$ {comm.grossCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>(-) Dedução de Taxa de Cartão / Insumos:</span>
                      <span>- R$ {(comm.productDeduction + comm.cardFeeDeduction).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase font-bold">Valor Líquido:</span>
                    <span className="text-lg font-bold font-serif text-stone-950">
                      R$ {comm.netCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {comm.status === 'pendente' ? (
                    <button
                      onClick={() => onPayCommission(comm.id)}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      Dar Baixa / Pagar Pix
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Pago em {comm.paidAt}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 5: CONTAS A PAGAR & RECEBER */}
      {subTab === 'contas' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">Contas Vencidas</span>
              <span className="text-2xl font-bold font-serif text-rose-600 block mt-1">R$ 0,00</span>
              <span className="text-[11px] text-emerald-600 mt-1 block">✅ Nenhuma conta em atraso</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">A Vencer Esta Semana</span>
              <span className="text-2xl font-bold font-serif text-amber-700 block mt-1">
                R$ {stats.contasPendentesPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-stone-500 mt-1 block">Enel Energia & Manutenção Preventiva</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">Previsão de Entradas da Agenda</span>
              <span className="text-2xl font-bold font-serif text-emerald-700 block mt-1">R$ 1.340,00</span>
              <span className="text-[11px] text-stone-500 mt-1 block">Agendamentos confirmados para hoje</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
            <h3 className="text-base font-bold text-stone-900 font-serif mb-4">
              Cronograma de Contas a Pagar
            </h3>

            <div className="space-y-3">
              {transactions
                .filter((tx) => tx.type === 'despesa')
                .map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                          tx.status === 'pago'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-stone-900">{tx.description}</h4>
                        <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                          <span>Favorecido: {tx.clientOrSupplier || 'Geral'}</span>
                          <span>•</span>
                          <span>Vencimento: {tx.dueDate || tx.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="font-serif font-bold text-base text-rose-700">
                        R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          tx.status === 'pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tx.status === 'pago' ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

          </div>

        </div>
      )}

      {/* Modal Nova Transação */}
      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTransaction={onAddTransaction}
        professionals={professionals}
      />

      {/* Modal Sangria de Caixa */}
      {isSangriaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-stone-800">
            <h3 className="text-base font-bold font-serif text-stone-900 mb-1">
              Sangria de Caixa (Retirada)
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Retirada de dinheiro físico diretamente da gaveta do salão.
            </p>

            <form onSubmit={handleConfirmSangria} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Valor da Retirada (R$) *</label>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  value={sangriaAmount}
                  onChange={(e) => setSangriaAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Motivo / Justificativa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Motoboy entrega produtos, almoço equipe"
                  value={sangriaReason}
                  onChange={(e) => setSangriaReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSangriaModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 cursor-pointer font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  Confirmar Retirada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
