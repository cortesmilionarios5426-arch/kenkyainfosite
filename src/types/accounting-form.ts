export type BusinessType = 'professional' | 'accounting';

export type AcctHostingMode = 'full_config' | 'tech_responsible' | null;

export interface AccountingFormData {
  // Basic info (shared)
  businessName: string;
  mainService: string;
  businessColors: string;
  whatsappNumber: string;
  socialNetworks: { platform: string; url: string }[];
  logoUrl: string | null;
  chosenPlan: 'presenca' | 'conversao' | 'autoridade';
  hostingOption: 'with' | 'without' | null;
  domainOption1: string;
  domainOption2: string;
  acctHostingMode: AcctHostingMode;
  domainRegistration: import('./form').DomainRegistrationData | null;

  // 1. Posicionamento e Foco de Captação
  acctMainService: string;
  acctServiceArea: string;
  acctMonthlyClients: string;

  // 2. Perfil do Cliente Ideal
  acctIdealClient: string;
  acctAvgTicket: string;
  acctClientVolumePreference: string;

  // 3. Estratégia Comercial
  acctWhoAnswers: string;
  acctHasScript: string;
  acctMainObjection: string;
  acctClosingTime: string;

  // 4. Prova e Autoridade
  acctYearsInMarket: string;
  acctCompaniesServed: string;
  acctNichesServed: string;
  acctCertifications: string;

  // 5. Diferencial Real
  acctDifferentials: string;
}

export const initialAccountingFormData: AccountingFormData = {
  businessName: '',
  mainService: '',
  businessColors: '',
  whatsappNumber: '',
  socialNetworks: [],
  logoUrl: null,
  chosenPlan: 'presenca',
  hostingOption: null,
  domainOption1: '',
  domainOption2: '',
  acctHostingMode: null,
  domainRegistration: null,
  acctMainService: '',
  acctServiceArea: '',
  acctMonthlyClients: '',
  acctIdealClient: '',
  acctAvgTicket: '',
  acctClientVolumePreference: '',
  acctWhoAnswers: '',
  acctHasScript: '',
  acctMainObjection: '',
  acctClosingTime: '',
  acctYearsInMarket: '',
  acctCompaniesServed: '',
  acctNichesServed: '',
  acctCertifications: '',
  acctDifferentials: '',
};

export interface AccountingFormStep {
  id: string;
  title: string;
  description: string;
  fields: (keyof AccountingFormData)[];
  condition?: (formData: AccountingFormData) => boolean;
}

export const accountingFormSteps: AccountingFormStep[] = [
  {
    id: 'acct-basics',
    title: 'Informações Básicas',
    description: 'Dados essenciais do seu escritório de contabilidade',
    fields: ['businessName', 'mainService'],
  },
  {
    id: 'acct-branding',
    title: 'Identidade Visual',
    description: 'Cores e logo que representam sua marca',
    fields: ['businessColors', 'logoUrl'],
  },
  {
    id: 'acct-contact',
    title: 'Contato & Redes',
    description: 'Como seus clientes vão te encontrar',
    fields: ['whatsappNumber', 'socialNetworks'],
  },
  {
    id: 'acct-hosting',
    title: 'Domínio e Configuração',
    description: 'Escolha suas opções de domínio e configuração',
    fields: ['domainOption1', 'domainOption2', 'acctHostingMode'],
  },
  {
    id: 'acct-domainRegistration',
    title: 'Dados para Registro do Domínio',
    description: 'Informações necessárias para registrar seu domínio .com.br',
    fields: ['domainRegistration'],
    condition: (formData) => formData.acctHostingMode === 'full_config',
  },
  {
    id: 'acct-positioning',
    title: 'Posicionamento e Captação',
    description: 'Qual serviço você mais quer vender e sua área de atuação',
    fields: ['acctMainService', 'acctServiceArea', 'acctMonthlyClients'],
  },
  {
    id: 'acct-ideal-client',
    title: 'Perfil do Cliente Ideal',
    description: 'Quem você quer atrair para seu escritório',
    fields: ['acctIdealClient', 'acctAvgTicket', 'acctClientVolumePreference'],
  },
  {
    id: 'acct-commercial',
    title: 'Estratégia Comercial',
    description: 'Como funciona seu processo de venda',
    fields: ['acctWhoAnswers', 'acctHasScript', 'acctMainObjection', 'acctClosingTime'],
  },
  {
    id: 'acct-authority',
    title: 'Prova e Autoridade',
    description: 'O que gera confiança no seu trabalho',
    fields: ['acctYearsInMarket', 'acctCompaniesServed', 'acctNichesServed', 'acctCertifications'],
  },
  {
    id: 'acct-differentials',
    title: 'Diferencial Real',
    description: 'Por que uma empresa escolheria você?',
    fields: ['acctDifferentials'],
  },
];
