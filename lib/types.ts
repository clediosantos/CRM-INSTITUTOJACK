export type ClientStatus = 'VIP' | 'Recorrente' | 'Em Risco' | 'Nova';

export interface TechnicalRecord {
  id: string;
  date: string;
  service: string;
  professional: string;
  formula: string;
  observations: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  birthday: string; // "DD/MM"
  status: ClientStatus;
  totalSpent: number;
  visitsCount: number;
  lastVisitDate: string;
  nextAppointmentDate?: string;
  tags: string[];
  preferences: {
    drink: string;
    conversationStyle: string;
    allergies: string;
    scalpCondition: string;
    notes: string;
  };
  technicalRecords: TechnicalRecord[];
}

export type AppointmentStatus = 'agendado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado';

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAvatar: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  price: number;
  status: AppointmentStatus;
  paymentStatus: 'pendente' | 'pago';
  notes?: string;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  avatar: string;
  colorBadge: string;
  specialties: string[];
  commissionRate: number; // e.g. 45%
  rating: number;
  phone: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'Cabelo' | 'Unhas' | 'Unha' | 'Podologia' | 'Depilação' | 'Sobrancelhas' | 'Sobrancelhas & Cílios' | 'Estética' | 'Spa';
  durationMinutes: number;
  price: number;
  description: string;
  popular?: boolean;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  category: 'Retoque' | 'Aniversário' | 'Reativação' | 'Pós-Venda';
  targetAudience: string;
  estimatedReach: number;
  templateMessage: string;
  suggestedAction: string;
}

// ================= FINANCIAL SYSTEM TYPES =================
export type TransactionType = 'receita' | 'despesa';

export type PaymentMethod = 'pix' | 'credito' | 'debito' | 'dinheiro' | 'boleto';

export type TransactionStatus = 'pago' | 'pendente' | 'cancelado';

export interface Transaction {
  id: string;
  description: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  dueDate?: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  clientOrSupplier?: string;
  professionalId?: string;
  professionalName?: string;
  appointmentId?: string;
  notes?: string;
}

export interface DailyCashRegister {
  id: string;
  date: string; // YYYY-MM-DD
  openingBalance: number; // fundo de troco
  status: 'aberto' | 'fechado';
  cashIn: number;
  pixIn: number;
  cardIn: number;
  withdrawals: number; // sangrias
  closingBalance?: number;
  openedAt: string;
  closedAt?: string;
  notes?: string;
}

export interface CommissionPayout {
  id: string;
  professionalId: string;
  professionalName: string;
  professionalAvatar?: string;
  period: string; // e.g. "01/09 - 15/09"
  totalServicesAmount: number;
  commissionRate: number; // in %
  grossCommission: number;
  productDeduction: number;
  cardFeeDeduction: number;
  netCommission: number;
  status: 'pendente' | 'pago';
  paidAt?: string;
}

// ================= AGENT CRM CRUD MUTATION TYPES =================
export type AgentMutationType =
  | 'UPDATE_CLIENT'
  | 'DELETE_CLIENT'
  | 'CREATE_CLIENT'
  | 'UPDATE_APPOINTMENT'
  | 'DELETE_APPOINTMENT'
  | 'CREATE_APPOINTMENT'
  | 'ADD_TECHNICAL_RECORD'
  | 'DELETE_TECHNICAL_RECORD'
  | 'UPDATE_SERVICE'
  | 'DELETE_SERVICE'
  | 'CREATE_SERVICE'
  | 'UPDATE_TRANSACTION'
  | 'DELETE_TRANSACTION'
  | 'CREATE_TRANSACTION'
  | 'CASH_OPERATION'
  | 'PAY_COMMISSION';

export interface AgentMutationAction {
  id: string;
  type: AgentMutationType;
  description: string;
  payload: any;
  executed?: boolean;
}

