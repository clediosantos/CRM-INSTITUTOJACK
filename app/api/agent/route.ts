import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], contextData } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensagem inválida ou ausente.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Format full CRM data for the AI system instruction
    const clientsData = contextData?.clients || [];
    const appointmentsData = contextData?.appointments || [];
    const professionalsData = contextData?.professionals || [];
    const servicesData = contextData?.services || [];
    const transactionsData = contextData?.transactions || [];
    const cashRegistersData = contextData?.cashRegisters || [];
    const commissionsData = contextData?.commissions || [];

    const salonContextPrompt = `
Você é o "Agente Instituto Jack", o assistente e copiloto executivo com inteligência artificial com CONTROLE E ACESSO TOTAL ao CRM do Instituto Jack (Especialidades: Unha, Depilação, Cabelo, Podologia, Sobrancelhas • Slogan: "Cuidado que transforma, beleza que realça.").
Você tem permissão para CONSULTAR, EDITAR, DELETAR e CRIAR qualquer informação em todo o sistema (Clientes, Fichas Técnicas, Agendamentos, Serviços, Transações Financeiras, Caixa Diário e Comissões).

### BASE DE DADOS COMPLETA DO CRM EM TEMPO REAL:

1. CLIENTES CADASTRADAS (${clientsData.length} no total):
${JSON.stringify(
  clientsData.map((c: any) => ({
    id: c.id,
    nome: c.name,
    telefone: c.phone,
    email: c.email,
    aniversario: c.birthday,
    status: c.status,
    totalGasto: c.totalSpent,
    visitas: c.visitsCount,
    ultimaVisita: c.lastVisitDate,
    proximoAgendamento: c.nextAppointmentDate,
    tags: c.tags,
    preferencias: c.preferences,
    fichasTecnicas: c.technicalRecords?.map((r: any) => ({
      id: r.id,
      data: r.date,
      servico: r.service,
      profissional: r.professional,
      formula: r.formula,
      observacoes: r.observations,
    })),
  })),
  null,
  1
)}

2. AGENDAMENTOS E AGENDA (${appointmentsData.length} no total):
${JSON.stringify(
  appointmentsData.map((a: any) => ({
    id: a.id,
    cliente: a.clientName,
    clientId: a.clientId,
    telefone: a.clientPhone,
    servico: a.serviceName,
    serviceId: a.serviceId,
    profissional: a.professionalName,
    professionalId: a.professionalId,
    data: a.date,
    horario: a.time,
    duracaoMin: a.durationMinutes,
    preco: a.price,
    status: a.status,
    pagamento: a.paymentStatus,
    notas: a.notes,
  })),
  null,
  1
)}

3. SERVIÇOS DO SALÃO:
${JSON.stringify(
  servicesData.map((s: any) => ({
    id: s.id,
    nome: s.name,
    categoria: s.category,
    preco: s.price,
    duracaoMin: s.durationMinutes,
    descricao: s.description,
  })),
  null,
  1
)}

4. PROFISSIONAIS DA EQUIPE:
${JSON.stringify(
  professionalsData.map((p: any) => ({
    id: p.id,
    nome: p.name,
    cargo: p.role,
    especialidades: p.specialties,
    comissaoPercentual: p.commissionRate,
    telefone: p.phone,
  })),
  null,
  1
)}

5. TRANSAÇÕES FINANCEIRAS (DRE & CONTAS A PAGAR/RECEBER):
${JSON.stringify(
  transactionsData.map((t: any) => ({
    id: t.id,
    descricao: t.description,
    tipo: t.type,
    categoria: t.category,
    valor: t.amount,
    data: t.date,
    vencimento: t.dueDate,
    metodo: t.paymentMethod,
    status: t.status,
    clienteOuFornecedor: t.clientOrSupplier,
    notas: t.notes,
  })),
  null,
  1
)}

6. CAIXA DIÁRIO & GAVETA:
${JSON.stringify(cashRegistersData, null, 1)}

7. COMISSÕES DE PROFISSIONAIS:
${JSON.stringify(commissionsData, null, 1)}

---

### INSTRUÇÕES OPERACIONAIS:
Quando o usuário pedir para:
- **CONSULTAR**: Procure e detalhe com precisão nomes, telefones, horários de agendamento, fórmulas químicas de colorimetria, despesas, valores faturados ou saldos.
- **EDITAR**: Confirme a alteração realizada e emita a respectiva tag de mutação:
  * Exemplo: [MUTATION:UPDATE_CLIENT|{"clientId":"c1","changes":{"phone":"(11) 98888-7777"}}]
  * Exemplo: [MUTATION:UPDATE_APPOINTMENT|{"appointmentId":"apt-1","changes":{"status":"concluido"}}] ou {"status":"cancelado"} ou {"time":"16:00","date":"2026-09-15"}
  * Exemplo: [MUTATION:UPDATE_SERVICE|{"serviceId":"s2","changes":{"price":160}}]
  * Exemplo: [MUTATION:UPDATE_TRANSACTION|{"transactionId":"tx-1","changes":{"status":"pago"}}]
- **DELETAR / EXCLUIR**: Informe que o registro foi excluído do CRM e emita a tag:
  * Exemplo: [MUTATION:DELETE_APPOINTMENT|{"appointmentId":"apt-1"}]
  * Exemplo: [MUTATION:DELETE_CLIENT|{"clientId":"c1"}]
  * Exemplo: [MUTATION:DELETE_TRANSACTION|{"transactionId":"tx-1"}]
  * Exemplo: [MUTATION:DELETE_TECHNICAL_RECORD|{"clientId":"c1","recordId":"rec-1"}]
  * Exemplo: [MUTATION:DELETE_SERVICE|{"serviceId":"s1"}]
- **CRIAR / CADASTRAR**:
  * Exemplo: [MUTATION:CREATE_CLIENT|{"name":"Fernanda Dias","phone":"(11) 97777-1111","email":"fernanda@email.com","birthday":"18/05","tags":["Loiros"]}]
  * Exemplo: [MUTATION:CREATE_APPOINTMENT|{"clientId":"c1","clientName":"Camila Silva","serviceId":"s1","serviceName":"Mechas & Iluminação","professionalId":"p1","professionalName":"Sofia Ribeiro","date":"2026-09-15","time":"14:00","durationMinutes":180,"price":580,"status":"agendado"}]
  * Exemplo: [MUTATION:ADD_TECHNICAL_RECORD|{"clientId":"c1","service":"Mechas & Iluminação","professional":"Sofia Ribeiro","formula":"Pó descolorante 1:2 com ox 20vol + tonalizante 9.02","observations":"Fios responderam perfeitamente."}]
  * Exemplo: [MUTATION:CREATE_TRANSACTION|{"type":"despesa","description":"Produtos de Limpeza","category":"Insumos & Produtos","amount":120,"paymentMethod":"pix","status":"pago","date":"2026-09-14"}]
  * Exemplo: [MUTATION:CASH_OPERATION|{"type":"sangria","amount":50,"reason":"Troco para entrega"}]
  * Exemplo: [MUTATION:PAY_COMMISSION|{"commissionId":"com-1"}]

- **TAGS DE AÇÃO DE INTERFACE**:
  * WhatsApp: [AÇÃO:WHATSAPP|ID_DA_CLIENTE|Mensagem sugerida]
  * Agendar: [AÇÃO:AGENDAR|ID_DA_CLIENTE]
  * Ver Ficha: [AÇÃO:FICHA|ID_DA_CLIENTE]
  * Acessar Financeiro: [AÇÃO:FINANCEIRO]

Responda sempre em Português do Brasil com postura executiva, atenciosa e ágil. Destaque com clareza os dados consultados ou a ação realizada no CRM.
`;

    // If API Key is available, use Gemini 3.8 Flash via @google/genai
    if (apiKey) {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const formattedContents = [
        ...history.slice(-8).map((h: { role: string; content: string }) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }],
        })),
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction: salonContextPrompt,
          temperature: 0.5,
        },
      });

      const replyText = response.text || 'Não consegui formular uma resposta no momento. Por favor, tente novamente.';

      return NextResponse.json({
        reply: replyText,
        source: 'gemini',
      });
    }

    // Fallback: rule-based engine with complete CRUD capability across full CRM data
    const fallbackReply = generateFallbackSalonAgentReply(message, contextData);
    return NextResponse.json({
      reply: fallbackReply,
      source: 'local_agent',
    });
  } catch (error: unknown) {
    console.error('Erro no Agente Instituto Jack:', error);
    return NextResponse.json(
      { 
        reply: 'Ocorreu um problema ao conectar com o serviço de inteligência. Por favor, verifique a chave de API nas configurações ou tente novamente em instantes.',
        error: String(error) 
      },
      { status: 500 }
    );
  }
}

// Full offline fallback logic with CONSULTAR, EDITAR, DELETAR, CRIAR
function generateFallbackSalonAgentReply(message: string, contextData: any): string {
  const lower = message.toLowerCase();
  const clients = contextData?.clients || [];
  const appointments = contextData?.appointments || [];
  const transactions = contextData?.transactions || [];
  const services = contextData?.services || [];

  // ================= 1. DELEÇÃO (DELETE) =================
  if (lower.includes('delet') || lower.includes('exclu') || lower.includes('remov') || lower.includes('cancel')) {
    // Delete/Cancel Appointment
    if (lower.includes('agendament') || lower.includes('horario') || lower.includes('agenda')) {
      const targetApt = appointments.find((a: any) => 
        lower.includes(a.clientName.toLowerCase().split(' ')[0]) || 
        (a.time && lower.includes(a.time.replace(':', 'h'))) ||
        (a.time && lower.includes(a.time))
      ) || appointments[0];

      if (targetApt) {
        return `🗑️ **Agendamento Excluído do CRM**:
Localizei o agendamento de **${targetApt.clientName}** para o serviço de **${targetApt.serviceName}** no dia **${targetApt.date} às ${targetApt.time}**.

O agendamento foi removido com sucesso da sua grade de horários.

[MUTATION:DELETE_APPOINTMENT|{"appointmentId":"${targetApt.id}"}]`;
      }
    }

    // Delete Transaction / Expense
    if (lower.includes('despesa') || lower.includes('transa') || lower.includes('lançamento') || lower.includes('lancamento') || lower.includes('conta')) {
      const targetTx = transactions.find((t: any) => 
        lower.includes(t.description.toLowerCase()) || 
        lower.includes(t.category.toLowerCase())
      ) || transactions[0];

      if (targetTx) {
        return `🗑️ **Lançamento Financeiro Removido**:
O lançamento **"${targetTx.description}"** no valor de **R$ ${targetTx.amount.toFixed(2)}** foi excluído do seu fluxo financeiro com sucesso.

[MUTATION:DELETE_TRANSACTION|{"transactionId":"${targetTx.id}"}]`;
      }
    }

    // Delete Client
    if (lower.includes('cliente')) {
      const targetClient = clients.find((c: any) => 
        lower.includes(c.name.toLowerCase().split(' ')[0])
      );
      if (targetClient) {
        return `🗑️ **Cliente Removida do CRM**:
O cadastro de **${targetClient.name}** (${targetClient.phone}) foi excluído da base de dados do salão.

[MUTATION:DELETE_CLIENT|{"clientId":"${targetClient.id}"}]`;
      }
    }
  }

  // ================= 2. EDIÇÃO (EDIT / UPDATE) =================
  if (lower.includes('atualiz') || lower.includes('alter') || lower.includes('mud') || lower.includes('troc') || lower.includes('edit')) {
    // Edit Appointment Status to Concluído
    if (lower.includes('conclu') && (lower.includes('agendament') || lower.includes('atendimento'))) {
      const targetApt = appointments.find((a: any) => 
        lower.includes(a.clientName.toLowerCase().split(' ')[0])
      ) || appointments[0];

      if (targetApt) {
        return `✅ **Status do Atendimento Atualizado**:
O atendimento de **${targetApt.clientName}** (${targetApt.serviceName}) foi marcado como **Concluído** no CRM e o faturamento foi computado.

[MUTATION:UPDATE_APPOINTMENT|{"appointmentId":"${targetApt.id}","changes":{"status":"concluido"}}]`;
      }
    }

    // Edit Client Phone / Information
    if (lower.includes('telefone') || lower.includes('celular') || lower.includes('contato')) {
      const targetClient = clients.find((c: any) => 
        lower.includes(c.name.toLowerCase().split(' ')[0])
      ) || clients[0];

      // Extract new phone if present or use standard
      const phoneMatch = message.match(/\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}/);
      const newPhone = phoneMatch ? phoneMatch[0] : '(11) 98877-6655';

      return `✏️ **Dados da Cliente Atualizados**:
Atualizei o telefone de **${targetClient.name}** para **${newPhone}** no CRM.

[MUTATION:UPDATE_CLIENT|{"clientId":"${targetClient.id}","changes":{"phone":"${newPhone}"}}]
[AÇÃO:FICHA|${targetClient.id}]`;
    }

    // Edit Service Price
    if (lower.includes('preço') || lower.includes('preco') || lower.includes('valor')) {
      const targetService = services.find((s: any) => 
        lower.includes(s.name.toLowerCase().split(' ')[0])
      ) || services[0];

      const priceMatch = message.match(/\d+([.,]\d+)?/);
      const newPrice = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 160;

      return `💰 **Preço do Serviço Atualizado**:
O valor do serviço **"${targetService.name}"** foi ajustado para **R$ ${newPrice.toFixed(2)}** na tabela do salão.

[MUTATION:UPDATE_SERVICE|{"serviceId":"${targetService.id}","changes":{"price":${newPrice}}}]`;
    }
  }

  // ================= 3. CRIAÇÃO (CREATE) =================
  if (lower.includes('cadastr') || lower.includes('adicion') || lower.includes('cri') || lower.includes('novo') || lower.includes('nova')) {
    // Add Expense / Transaction
    if (lower.includes('despesa') || lower.includes('pagamento') || lower.includes('gasto')) {
      const amountMatch = message.match(/\d+([.,]\d+)?/);
      const amount = amountMatch ? parseFloat(amountMatch[0].replace(',', '.')) : 150;

      return `📝 **Nova Despesa Registrada no CRM**:
Lancei no sistema financeiro:
- **Descrição**: Despesa Operacional lançada pelo Agente Instituto Jack
- **Valor**: R$ ${amount.toFixed(2)}
- **Categoria**: Insumos & Produtos
- **Status**: Pago (via Pix)

[MUTATION:CREATE_TRANSACTION|{"type":"despesa","description":"Despesa Operacional - Insumos","category":"Insumos & Produtos","amount":${amount},"paymentMethod":"pix","status":"pago","date":"2026-09-14"}]
[AÇÃO:FINANCEIRO]`;
    }

    // Cash Sangria / Suprimento
    if (lower.includes('sangria') || lower.includes('retirada')) {
      const amountMatch = message.match(/\d+([.,]\d+)?/);
      const amount = amountMatch ? parseFloat(amountMatch[0].replace(',', '.')) : 50;

      return `💸 **Sangria de Caixa Realizada**:
Registrada a retirada de **R$ ${amount.toFixed(2)}** da gaveta física de hoje com sucesso.

[MUTATION:CASH_OPERATION|{"type":"sangria","amount":${amount},"reason":"Sangria solicitada via Agente Instituto Jack"}]
[AÇÃO:FINANCEIRO]`;
    }

    // Add Client
    if (lower.includes('cliente')) {
      return `✨ **Nova Cliente Cadastrada**:
Cadastrei a nova cliente no CRM com ficha inicial pronta para agendamento!

[MUTATION:CREATE_CLIENT|{"name":"Fernanda Dias","phone":"(11) 97777-2233","email":"fernanda.dias@email.com","birthday":"22/10","tags":["Nova Cliente","Coloração"]}]`;
    }
  }

  // ================= 4. CONSULTAS (QUERY / CONSULT) =================
  // Consulta de Ficha Técnica / Fórmula de Colorimetria
  if (lower.includes('formula') || lower.includes('ficha') || lower.includes('colorimetr') || lower.includes('loiro') || lower.includes('mecha')) {
    const targetClient = clients.find((c: any) => 
      lower.includes(c.name.toLowerCase().split(' ')[0])
    ) || clients[0];

    const records = targetClient.technicalRecords || [];
    if (records.length > 0) {
      const lastRec = records[0];
      return `🔍 **Consulta da Ficha Técnica - ${targetClient.name}**:
- **Último Procedimento**: ${lastRec.service} (${lastRec.date})
- **Especialista**: ${lastRec.professional}
- **Fórmula de Colorimetria Utilizada**: 
  > \`${lastRec.formula}\`
- **Observações Técnicas**: ${lastRec.observations}
- **Condição do Couro & Fios**: ${targetClient.preferences?.scalpCondition || 'Saudável'} | Alergias: ${targetClient.preferences?.allergies || 'Nenhuma informada'}

[AÇÃO:FICHA|${targetClient.id}]
[AÇÃO:WHATSAPP|${targetClient.id}|Olá ${targetClient.name}! Como estão seus fios após o procedimento de ${lastRec.service}?]`;
    }
  }

  // Consulta de Agenda / Agendamentos
  if (lower.includes('agenda') || lower.includes('agendament') || lower.includes('hoje') || lower.includes('atendimento')) {
    const todayApts = appointments.filter((a: any) => a.date === '2026-09-14');
    return `📅 **Consulta de Agenda de Hoje (14/09)**:
Temos **${todayApts.length} atendimentos** agendados:

${todayApts.map((a: any) => `- **${a.time}**: ${a.clientName} → *${a.serviceName}* com ${a.professionalName} (R$ ${a.price}) [Status: ${a.status}]`).join('\n')}

Deseja que eu remarque, altere o status ou cancele algum horário? Basta me pedir!`;
  }

  // Consulta Financeira & DRE
  if (lower.includes('faturamento') || lower.includes('financeir') || lower.includes('caixa') || lower.includes('dre') || lower.includes('lucro') || lower.includes('comiss')) {
    const totalReceitas = transactions.filter((t: any) => t.type === 'receita' && t.status === 'pago').reduce((s: number, t: any) => s + t.amount, 0);
    const totalDespesas = transactions.filter((t: any) => t.type === 'despesa' && t.status === 'pago').reduce((s: number, t: any) => s + t.amount, 0);
    const lucro = totalReceitas - totalDespesas;

    return `💰 **Consulta Financeira em Tempo Real**:
- **Receita Total Realizada**: R$ ${totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- **Despesas Operacionais**: R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- **Lucro Líquido**: R$ ${lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- **Transações Cadastradas**: ${transactions.length} lançamentos disponíveis para consulta, edição e baixa.

Você pode me pedir: "Delete a despesa X", "Adicione uma receita de R$ 300", ou "Faça uma sangria de R$ 50 no caixa".
[AÇÃO:FINANCEIRO]`;
  }

  // Fallback geral
  return `🌿 **Agente Instituto Jack - Acesso Total ao CRM**:
Tenho permissão de **Consulta**, **Edição**, **Exclusão** e **Criação** em todo o sistema (Unha, Depilação, Cabelo, Podologia e Sobrancelhas).

Você pode me pedir, por exemplo:
- 🔍 **Consultar**: *"Qual a fórmula de colorimetria da Camila Silva?"* ou *"Mostre os agendamentos de hoje"*
- ✏️ **Editar**: *"Atualize o telefone da Helena para (11) 98888-7777"* ou *"Altere o preço do Corte para R$ 160"*
- 🗑️ **Deletar**: *"Exclua o agendamento da Camila"* ou *"Delete o lançamento da despesa de café"*
- ➕ **Criar**: *"Cadastre a cliente Paula Mendes"* ou *"Lance uma despesa de R$ 150 em produtos"*`;
}
