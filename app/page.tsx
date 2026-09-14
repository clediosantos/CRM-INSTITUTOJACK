'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { DashboardView } from '@/components/DashboardView';
import { ClientsView } from '@/components/ClientsView';
import { AgendaView } from '@/components/AgendaView';
import { ServicesView } from '@/components/ServicesView';
import { MarketingView } from '@/components/MarketingView';
import { ProfessionalsView } from '@/components/ProfessionalsView';
import { FinancialView } from '@/components/FinancialView';
import { AgentView } from '@/components/AgentView';
import { AgentFloatingWidget } from '@/components/AgentFloatingWidget';
import { ClientProfileModal } from '@/components/ClientProfileModal';
import { WhatsAppModal } from '@/components/WhatsAppModal';
import { NewAppointmentModal } from '@/components/NewAppointmentModal';
import { NewClientModal } from '@/components/NewClientModal';
import { 
  INITIAL_CLIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_PROFESSIONALS, 
  INITIAL_SERVICES, 
  MARKETING_CAMPAIGNS,
  INITIAL_TRANSACTIONS,
  INITIAL_CASH_REGISTERS,
  INITIAL_COMMISSIONS
} from '@/lib/initial-data';
import { 
  Client, 
  Appointment, 
  Professional, 
  ServiceItem, 
  MarketingCampaign, 
  AppointmentStatus, 
  TechnicalRecord,
  Transaction,
  DailyCashRegister,
  CommissionPayout,
  AgentMutationAction
} from '@/lib/types';
import { generateUniqueId } from '@/lib/utils';
import { Check, Sparkles } from 'lucide-react';

export default function SalonCrmPage() {
  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clientes' | 'agenda' | 'servicos' | 'marketing' | 'profissionais' | 'financeiro' | 'agente'>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core CRM Data State
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [professionals, setProfessionals] = useState<Professional[]>(INITIAL_PROFESSIONALS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [campaigns] = useState<MarketingCampaign[]>(MARKETING_CAMPAIGNS);

  // Financial Data State
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [cashRegisters, setCashRegisters] = useState<DailyCashRegister[]>(INITIAL_CASH_REGISTERS);
  const [commissions, setCommissions] = useState<CommissionPayout[]>(INITIAL_COMMISSIONS);

  // Modals State
  const [selectedClientForProfile, setSelectedClientForProfile] = useState<Client | null>(null);
  const [selectedClientForWhatsApp, setSelectedClientForWhatsApp] = useState<Client | null>(null);
  const [whatsAppCustomMessage, setWhatsAppCustomMessage] = useState<string | undefined>(undefined);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState<boolean>(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState<boolean>(false);
  const [preSelectedClientForBooking, setPreSelectedClientForBooking] = useState<Client | null>(null);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Actions
  const handleUpdateAppointmentStatus = (id: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          // If completing an appointment, auto-record revenue in finance if not already recorded
          if (newStatus === 'concluido' && apt.status !== 'concluido') {
            const tx: Transaction = {
              id: generateUniqueId('tx-apt'),
              type: 'receita',
              description: `${apt.serviceName} - ${apt.clientName}`,
              category: 'Serviços de Salão',
              amount: apt.price,
              date: apt.date,
              dueDate: apt.date,
              paymentMethod: 'pix',
              status: 'pago',
              clientOrSupplier: apt.clientName,
              professionalId: apt.professionalId,
              professionalName: apt.professionalName,
              appointmentId: apt.id,
              notes: 'Entrada registrada via conclusão de atendimento',
            };
            setTransactions((tPrev) => [tx, ...tPrev]);
          }
          return { ...apt, status: newStatus };
        }
        return apt;
      })
    );
    showToast(`Status atualizado para "${newStatus.replace('_', ' ')}"!`);
  };

  const handleAddAppointment = (newAptData: Omit<Appointment, 'id'>) => {
    const newApt: Appointment = {
      ...newAptData,
      id: generateUniqueId('apt'),
    };

    setAppointments((prev) => [newApt, ...prev]);

    // Update client visits and spent if completed or scheduled
    setClients((prev) =>
      prev.map((c) =>
        c.id === newApt.clientId
          ? {
              ...c,
              totalSpent: c.totalSpent + newApt.price,
              visitsCount: c.visitsCount + 1,
              lastVisitDate: newApt.date,
              nextAppointmentDate: newApt.date,
            }
          : c
      )
    );

    showToast(`Agendamento de ${newApt.clientName} confirmado com sucesso!`);
  };

  const handleAddClient = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
    showToast(`Cliente ${newClient.name} cadastrada com sucesso no CRM!`);
  };

  const handleAddTechnicalRecord = (clientId: string, record: Omit<TechnicalRecord, 'id'>) => {
    const newRecord: TechnicalRecord = {
      ...record,
      id: generateUniqueId('rec'),
    };

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const updated = {
            ...c,
            technicalRecords: [newRecord, ...c.technicalRecords],
          };
          // Also update the active modal if open
          if (selectedClientForProfile?.id === clientId) {
            setSelectedClientForProfile(updated);
          }
          return updated;
        }
        return c;
      })
    );

    showToast('Ficha técnica e colorimetria atualizadas com sucesso!');
  };

  // Financial Handlers
  const handleAddTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
    // Auto-update today's cash register if paid today
    if (tx.status === 'pago' && tx.date === '2026-09-14') {
      setCashRegisters((prev) =>
        prev.map((cr) => {
          if (cr.date === '2026-09-14' && cr.status === 'aberto') {
            if (tx.type === 'receita') {
              if (tx.paymentMethod === 'dinheiro') return { ...cr, cashIn: cr.cashIn + tx.amount };
              if (tx.paymentMethod === 'pix') return { ...cr, pixIn: cr.pixIn + tx.amount };
              if (tx.paymentMethod === 'credito' || tx.paymentMethod === 'debito') return { ...cr, cardIn: cr.cardIn + tx.amount };
            }
          }
          return cr;
        })
      );
    }
    showToast(`Lançamento "${tx.description}" adicionado com sucesso!`);
  };

  const handleUpdateCashRegister = (updated: DailyCashRegister) => {
    setCashRegisters((prev) => prev.map((cr) => (cr.id === updated.id ? updated : cr)));
    showToast(updated.status === 'fechado' ? 'Caixa fechado com sucesso!' : 'Caixa atualizado!');
  };

  const handlePayCommission = (commissionId: string) => {
    const target = commissions.find((c) => c.id === commissionId);
    if (!target) return;

    setCommissions((prev) =>
      prev.map((c) =>
        c.id === commissionId
          ? { ...c, status: 'pago', paidAt: '2026-09-14 17:00' }
          : c
      )
    );

    // Auto-record expense in ledger
    const tx: Transaction = {
      id: generateUniqueId('tx-comissao'),
      type: 'despesa',
      description: `Pagamento de Comissão: ${target.professionalName} (${target.period})`,
      amount: target.netCommission,
      category: 'Comissões Profissionais',
      paymentMethod: 'pix',
      status: 'pago',
      date: '2026-09-14',
      professionalId: target.professionalId,
      professionalName: target.professionalName,
      notes: `Liquidado via Pix. Faturamento base gerado: R$ ${target.totalServicesAmount.toFixed(2)}`,
    };
    setTransactions((prev) => [tx, ...prev]);

    showToast(`Comissão de ${target.professionalName} (R$ ${target.netCommission.toFixed(2)}) liquidada via Pix!`);
  };

  // Agent Direct CRM CRUD Executor
  const handleExecuteAgentMutation = (mutation: AgentMutationAction): { success: boolean; message: string } => {
    const { type, payload } = mutation;
    try {
      switch (type) {
        case 'UPDATE_CLIENT': {
          const { clientId, changes } = payload;
          setClients((prev) =>
            prev.map((c) => (c.id === clientId ? { ...c, ...changes } : c))
          );
          showToast('Cliente atualizada com sucesso pelo Agente Instituto Jack!');
          return { success: true, message: 'Cadastro da cliente atualizado com sucesso no CRM.' };
        }
        case 'DELETE_CLIENT': {
          const { clientId } = payload;
          const target = clients.find((c) => c.id === clientId);
          setClients((prev) => prev.filter((c) => c.id !== clientId));
          showToast(`Cliente ${target?.name || ''} excluída do CRM!`);
          return { success: true, message: `Cliente ${target?.name || ''} removida da base.` };
        }
        case 'CREATE_CLIENT': {
          const newClient: Client = {
            id: generateUniqueId('c'),
            name: payload.name || 'Nova Cliente',
            phone: payload.phone || '(11) 90000-0000',
            email: payload.email || '',
            avatar: payload.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            birthday: payload.birthday || '01/01',
            status: payload.status || 'Nova',
            totalSpent: payload.totalSpent || 0,
            visitsCount: payload.visitsCount || 0,
            lastVisitDate: payload.lastVisitDate || '2026-09-14',
            tags: payload.tags || ['Nova Cliente'],
            preferences: {
              drink: payload.preferences?.drink || 'Água com gás e limão',
              conversationStyle: payload.preferences?.conversationStyle || 'Tranquila / Relaxante',
              allergies: payload.preferences?.allergies || 'Nenhuma informada',
              scalpCondition: payload.preferences?.scalpCondition || 'Saudável',
              notes: payload.preferences?.notes || 'Cadastrada pelo Agente Instituto Jack',
            },
            technicalRecords: payload.technicalRecords || [],
          };
          setClients((prev) => [newClient, ...prev]);
          showToast(`Cliente ${newClient.name} cadastrada com sucesso!`);
          return { success: true, message: `Cliente ${newClient.name} criada com sucesso.` };
        }
        case 'UPDATE_APPOINTMENT': {
          const { appointmentId, changes } = payload;
          setAppointments((prev) =>
            prev.map((a) => (a.id === appointmentId ? { ...a, ...changes } : a))
          );
          showToast('Agendamento atualizado com sucesso no calendário!');
          return { success: true, message: 'Agendamento atualizado.' };
        }
        case 'DELETE_APPOINTMENT': {
          const { appointmentId } = payload;
          const target = appointments.find((a) => a.id === appointmentId);
          setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
          showToast(`Agendamento de ${target?.clientName || ''} cancelado e removido da agenda!`);
          return { success: true, message: `Agendamento de ${target?.clientName || ''} excluído da agenda.` };
        }
        case 'CREATE_APPOINTMENT': {
          const newApt: Appointment = {
            id: generateUniqueId('apt'),
            clientId: payload.clientId || 'c1',
            clientName: payload.clientName || 'Cliente Instituto Jack',
            clientPhone: payload.clientPhone || '(11) 98888-0000',
            clientAvatar: payload.clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            serviceId: payload.serviceId || 's1',
            serviceName: payload.serviceName || 'Procedimento',
            professionalId: payload.professionalId || 'p1',
            professionalName: payload.professionalName || 'Especialista',
            date: payload.date || '2026-09-14',
            time: payload.time || '14:00',
            durationMinutes: payload.durationMinutes || 60,
            price: Number(payload.price) || 150,
            status: payload.status || 'agendado',
            paymentStatus: payload.paymentStatus || 'pendente',
            notes: payload.notes || 'Agendado pelo Agente Instituto Jack',
          };
          setAppointments((prev) => [newApt, ...prev]);
          showToast(`Agendamento de ${newApt.clientName} criado para ${newApt.date} às ${newApt.time}!`);
          return { success: true, message: `Horário reservado com sucesso.` };
        }
        case 'ADD_TECHNICAL_RECORD': {
          const { clientId, record, service, professional, formula, observations } = payload;
          const newRec: TechnicalRecord = {
            id: generateUniqueId('rec'),
            date: record?.date || '2026-09-14',
            service: record?.service || service || 'Colorimetria & Tratamento',
            professional: record?.professional || professional || 'Especialista Instituto Jack',
            formula: record?.formula || formula || 'Fórmula padrão',
            observations: record?.observations || observations || 'Registrado pelo Agente Instituto Jack',
          };
          setClients((prev) =>
            prev.map((c) =>
              c.id === clientId
                ? { ...c, technicalRecords: [newRec, ...c.technicalRecords] }
                : c
            )
          );
          showToast('Ficha técnica e colorimetria registradas no CRM!');
          return { success: true, message: 'Ficha técnica salva com sucesso.' };
        }
        case 'DELETE_TECHNICAL_RECORD': {
          const { clientId, recordId } = payload;
          setClients((prev) =>
            prev.map((c) =>
              c.id === clientId
                ? { ...c, technicalRecords: c.technicalRecords.filter((r) => r.id !== recordId) }
                : c
            )
          );
          showToast('Ficha técnica excluída do histórico!');
          return { success: true, message: 'Ficha técnica removida com sucesso.' };
        }
        case 'UPDATE_SERVICE': {
          const { serviceId, changes } = payload;
          setServices((prev) =>
            prev.map((s) => (s.id === serviceId ? { ...s, ...changes } : s))
          );
          showToast('Serviço atualizado no catálogo!');
          return { success: true, message: 'Serviço atualizado com sucesso.' };
        }
        case 'DELETE_SERVICE': {
          const { serviceId } = payload;
          setServices((prev) => prev.filter((s) => s.id !== serviceId));
          showToast('Serviço excluído do catálogo!');
          return { success: true, message: 'Serviço removido com sucesso.' };
        }
        case 'CREATE_TRANSACTION': {
          const newTx: Transaction = {
            id: generateUniqueId('tx'),
            description: payload.description || 'Lançamento Agente Instituto Jack',
            type: payload.type || 'despesa',
            category: payload.category || 'Geral',
            amount: Number(payload.amount) || 0,
            date: payload.date || '2026-09-14',
            dueDate: payload.dueDate || payload.date || '2026-09-14',
            paymentMethod: payload.paymentMethod || 'pix',
            status: payload.status || 'pago',
            clientOrSupplier: payload.clientOrSupplier,
            notes: payload.notes || 'Lançado pelo Agente Instituto Jack',
          };
          handleAddTransaction(newTx);
          return { success: true, message: `Lançamento "${newTx.description}" registrado.` };
        }
        case 'UPDATE_TRANSACTION': {
          const { transactionId, changes } = payload;
          setTransactions((prev) =>
            prev.map((t) => (t.id === transactionId ? { ...t, ...changes } : t))
          );
          showToast('Lançamento financeiro atualizado!');
          return { success: true, message: 'Lançamento atualizado.' };
        }
        case 'DELETE_TRANSACTION': {
          const { transactionId } = payload;
          const target = transactions.find((t) => t.id === transactionId);
          setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
          showToast(`Lançamento "${target?.description || ''}" excluído!`);
          return { success: true, message: `Lançamento "${target?.description || ''}" removido.` };
        }
        case 'CASH_OPERATION': {
          const { type, amount, reason } = payload;
          const numAmount = Number(amount) || 0;
          setCashRegisters((prev) =>
            prev.map((cr) => {
              if (cr.date === '2026-09-14' && cr.status === 'aberto') {
                if (type === 'sangria') {
                  return {
                    ...cr,
                    withdrawals: cr.withdrawals + numAmount,
                    notes: `${cr.notes || ''} | Sangria R$ ${numAmount}: ${reason || ''}`,
                  };
                } else {
                  return {
                    ...cr,
                    cashIn: cr.cashIn + numAmount,
                    notes: `${cr.notes || ''} | Suprimento R$ ${numAmount}: ${reason || ''}`,
                  };
                }
              }
              return cr;
            })
          );
          showToast(`${type === 'sangria' ? 'Sangria' : 'Suprimento'} de R$ ${numAmount.toFixed(2)} registrado na gaveta!`);
          return { success: true, message: 'Operação de caixa executada com sucesso.' };
        }
        case 'PAY_COMMISSION': {
          const { commissionId } = payload;
          handlePayCommission(commissionId);
          return { success: true, message: 'Comissão quitada com sucesso.' };
        }
        default:
          return { success: false, message: 'Comando não reconhecido.' };
      }
    } catch (err) {
      console.error('Erro na mutação do agente:', err);
      return { success: false, message: 'Falha ao aplicar alteração no CRM.' };
    }
  };

  const handleOpenWhatsApp = (client: Client, customMessage?: string) => {
    setSelectedClientForWhatsApp(client);
    setWhatsAppCustomMessage(customMessage);
  };

  const handleBookAppointmentForClient = (client: Client) => {
    setPreSelectedClientForBooking(client);
    setIsNewAppointmentOpen(true);
    // If profile modal is open, close it to avoid nested modal stack
    setSelectedClientForProfile(null);
  };

  const handleCloseAppointmentModal = () => {
    setIsNewAppointmentOpen(false);
    setPreSelectedClientForBooking(null);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 1 && activeTab !== 'clientes' && activeTab !== 'dashboard') {
      setActiveTab('clientes');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-stone-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-5 z-50 bg-[#162D23] text-emerald-50 px-4 py-3 rounded-2xl shadow-2xl border border-[#2F5E48] flex items-center gap-2.5 text-xs sm:text-sm animate-bounce">
          <div className="w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
        onOpenNewClient={() => setIsNewClientOpen(true)}
        todayCount={appointments.filter((a) => a.date === '2026-09-14').length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {activeTab === 'dashboard' && (
          <DashboardView
            appointments={appointments}
            clients={clients}
            professionals={professionals}
            onSelectClient={(c) => setSelectedClientForProfile(c)}
            onOpenWhatsApp={handleOpenWhatsApp}
            onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onGoToClients={() => setActiveTab('clientes')}
            onGoToMarketing={() => setActiveTab('marketing')}
            onGoToFinancial={() => setActiveTab('financeiro')}
          />
        )}

        {activeTab === 'clientes' && (
          <ClientsView
            clients={clients}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectClient={(c) => setSelectedClientForProfile(c)}
            onOpenWhatsApp={handleOpenWhatsApp}
            onBookAppointment={handleBookAppointmentForClient}
            onOpenNewClient={() => setIsNewClientOpen(true)}
          />
        )}

        {activeTab === 'agenda' && (
          <AgendaView
            appointments={appointments}
            professionals={professionals}
            clients={clients}
            onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
            onSelectClient={(c) => setSelectedClientForProfile(c)}
            onOpenWhatsApp={handleOpenWhatsApp}
            onUpdateStatus={handleUpdateAppointmentStatus}
          />
        )}

        {activeTab === 'servicos' && (
          <ServicesView
            services={services}
            onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
          />
        )}

        {activeTab === 'marketing' && (
          <MarketingView
            campaigns={campaigns}
            clients={clients}
            onOpenWhatsApp={handleOpenWhatsApp}
            onSelectClient={(c) => setSelectedClientForProfile(c)}
          />
        )}

        {activeTab === 'profissionais' && (
          <ProfessionalsView
            professionals={professionals}
            appointments={appointments}
            onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
          />
        )}

        {activeTab === 'financeiro' && (
          <FinancialView
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            cashRegisters={cashRegisters}
            onUpdateCashRegister={handleUpdateCashRegister}
            commissions={commissions}
            onPayCommission={handlePayCommission}
            professionals={professionals}
            clients={clients}
          />
        )}

        {activeTab === 'agente' && (
          <AgentView
            clients={clients}
            appointments={appointments}
            professionals={professionals}
            services={services}
            transactions={transactions}
            cashRegisters={cashRegisters}
            commissions={commissions}
            onOpenWhatsApp={handleOpenWhatsApp}
            onBookAppointment={handleBookAppointmentForClient}
            onSelectClient={(c) => setSelectedClientForProfile(c)}
            onGoToFinancial={() => setActiveTab('financeiro')}
            onExecuteMutation={handleExecuteAgentMutation}
          />
        )}

      </main>

      {/* Floating Agent Copilot Widget (always available across all screens) */}
      <AgentFloatingWidget
        clients={clients}
        appointments={appointments}
        professionals={professionals}
        services={services}
        transactions={transactions}
        cashRegisters={cashRegisters}
        commissions={commissions}
        onOpenWhatsApp={handleOpenWhatsApp}
        onBookAppointment={handleBookAppointmentForClient}
        onSelectClient={(c) => setSelectedClientForProfile(c)}
        onOpenFullView={() => setActiveTab('agente')}
        onGoToFinancial={() => setActiveTab('financeiro')}
        onExecuteMutation={handleExecuteAgentMutation}
      />

      {/* Footer */}
      <footer className="border-t border-[#E2DBD0] bg-white py-8 text-stone-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 px-2 rounded-xl border border-stone-200 overflow-hidden bg-white shadow-2xs flex items-center justify-center">
              <img src="/instituto-jack-logo.svg" alt="Instituto Jack" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <p className="font-semibold text-stone-900 font-serif">Instituto Jack • Beleza & Bem-Estar</p>
              <p className="text-[11px] text-stone-500 italic">&ldquo;Cuidado que transforma, beleza que realça.&rdquo;</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-stone-600 font-medium">
            <span>💅 Unha</span>
            <span>•</span>
            <span>🍯 Depilação</span>
            <span>•</span>
            <span>💇‍♀️ Cabelo</span>
            <span>•</span>
            <span>🦶 Podologia</span>
            <span>•</span>
            <span>👁️ Sobrancelhas</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400 text-[11px]">
            <span>Segurança & LGPD</span>
            <span>•</span>
            <span>CRM Instituto Jack v4.0</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedClientForProfile && (
        <ClientProfileModal
          client={selectedClientForProfile}
          onClose={() => setSelectedClientForProfile(null)}
          onOpenWhatsApp={handleOpenWhatsApp}
          onBookAppointment={handleBookAppointmentForClient}
          onAddTechnicalRecord={handleAddTechnicalRecord}
        />
      )}

      {selectedClientForWhatsApp && (
        <WhatsAppModal
          key={selectedClientForWhatsApp.id + (whatsAppCustomMessage || '')}
          client={selectedClientForWhatsApp}
          defaultMessage={whatsAppCustomMessage}
          onClose={() => {
            setSelectedClientForWhatsApp(null);
            setWhatsAppCustomMessage(undefined);
          }}
        />
      )}

      {isNewAppointmentOpen && (
        <NewAppointmentModal
          clients={clients}
          professionals={professionals}
          services={services}
          preSelectedClient={preSelectedClientForBooking}
          onClose={handleCloseAppointmentModal}
          onSave={handleAddAppointment}
        />
      )}

      {isNewClientOpen && (
        <NewClientModal
          onClose={() => setIsNewClientOpen(false)}
          onSave={handleAddClient}
        />
      )}

    </div>
  );
}
