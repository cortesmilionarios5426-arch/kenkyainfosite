export type PlanType = 'presenca' | 'conversao' | 'autoridade';
export type HostingOption = 'with' | 'without' | null;

export interface SocialNetwork {
  platform: string;
  url: string;
}

export interface DomainRegistrationData {
  fullName: string;
  cpf: string;
  email: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  state: string;
  city: string;
  ddd: string;
  phone: string;
  extension: string;
}

export interface FormData {
  // Common fields (all plans)
  businessName: string;
  mainService: string;
  businessColors: string;
  whatsappNumber: string;
  socialNetworks: SocialNetwork[];
  logoUrl: string | null;
  chosenPlan: PlanType;
  
  // Hosting option
  hostingOption: HostingOption;
  domainOption1: string;
  domainOption2: string;
  domainRegistration: DomainRegistrationData | null;
  
  // Presença fields
  professionalSummary: string;
  services: string;
  locationHours: string;
  mainObjective: string;
  
  // Conversão fields (includes gallery for up to 2 photos)
  painSolutions: string;
  competitiveDifferentials: string;
  testimonialsSection: string;
  visualProcess: string;
  conversionGallery: string;
  
  // Autoridade fields
  faq: string;
  resultsGallery: string;
  premiumVisualStyle: string;
  advancedFooterMap: string;
}

export const initialDomainRegistration: DomainRegistrationData = {
  fullName: '',
  cpf: '',
  email: '',
  cep: '',
  address: '',
  number: '',
  complement: '',
  state: '',
  city: '',
  ddd: '',
  phone: '',
  extension: '',
};

export const initialFormData: FormData = {
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
  domainRegistration: null,
  professionalSummary: '',
  services: '',
  locationHours: '',
  mainObjective: '',
  painSolutions: '',
  competitiveDifferentials: '',
  testimonialsSection: '',
  visualProcess: '',
  conversionGallery: '',
  faq: '',
  resultsGallery: '',
  premiumVisualStyle: '',
  advancedFooterMap: '',
};

export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: (keyof FormData)[];
  plans?: PlanType[];
  condition?: (formData: FormData) => boolean;
}

export const formSteps: FormStep[] = [
  {
    id: 'basics',
    title: 'Informações Básicas',
    description: 'Vamos começar com os dados essenciais do seu negócio',
    fields: ['businessName', 'mainService'],
  },
  {
    id: 'branding',
    title: 'Identidade Visual',
    description: 'Cores e logo que representam sua marca',
    fields: ['businessColors', 'logoUrl'],
  },
  {
    id: 'contact',
    title: 'Contato & Redes',
    description: 'Como seus clientes vão te encontrar',
    fields: ['whatsappNumber', 'socialNetworks'],
  },
  {
    id: 'plan',
    title: 'Escolha seu Plano',
    description: 'Qual nível de página você precisa?',
    fields: ['chosenPlan'],
  },
  {
    id: 'hosting',
    title: 'Hospedagem e Domínio',
    description: 'Escolha como deseja hospedar sua página',
    fields: ['hostingOption', 'domainOption1', 'domainOption2'],
  },
  {
    id: 'domainRegistration',
    title: 'Dados para Registro do Domínio',
    description: 'Informações necessárias para registrar seu domínio .com.br',
    fields: ['domainRegistration'],
    condition: (formData) => formData.hostingOption === 'with',
  },
  {
    id: 'professional',
    title: 'Perfil Profissional',
    description: 'Conte sobre você e seus serviços',
    fields: ['professionalSummary', 'services', 'locationHours', 'mainObjective'],
    plans: ['presenca', 'conversao', 'autoridade'],
  },
  {
    id: 'conversion',
    title: 'Estratégia de Conversão',
    description: 'Elementos que transformam visitantes em clientes',
    fields: ['painSolutions', 'competitiveDifferentials', 'testimonialsSection', 'visualProcess'],
    plans: ['conversao', 'autoridade'],
  },
  {
    id: 'conversionGallery',
    title: 'Galeria de Fotos',
    description: 'Adicione até 2 fotos para destacar seu trabalho',
    fields: ['conversionGallery'],
    plans: ['conversao'],
  },
  {
    id: 'authorityContent',
    title: 'Conteúdo de Autoridade',
    description: 'FAQ e detalhes premium',
    fields: ['faq', 'premiumVisualStyle', 'advancedFooterMap'],
    plans: ['autoridade'],
  },
  {
    id: 'authorityGallery',
    title: 'Galeria de Resultados',
    description: 'Adicione até 8 fotos de trabalhos, antes/depois, certificados',
    fields: ['resultsGallery'],
    plans: ['autoridade'],
  },
];

export const planInfo = {
  presenca: {
    name: 'Presença',
    shortDescription: 'Informações essenciais do seu negócio',
    description: 'Página profissional com as informações essenciais do seu negócio.',
    color: 'from-blue-500 to-cyan-500',
    features: ['Resumo Profissional', 'Lista de Serviços', 'Local e Horário', 'Objetivo Principal'],
  },
  conversao: {
    name: 'Conversão',
    shortDescription: 'Foco em transformar visitantes em clientes',
    description: 'Página estratégica focada em transformar visitantes em clientes.',
    color: 'from-purple-500 to-pink-500',
    features: [
      'Tudo do Presença',
      'Dores & Soluções',
      'Diferenciais',
      'Depoimentos',
      'Processo de Atendimento',
      'Galeria (até 2 fotos)',
    ],
  },
  autoridade: {
    name: 'Autoridade',
    shortDescription: 'Posiciona você como referência no mercado',
    description: 'Página completa que posiciona você como referência no mercado.',
    color: 'from-amber-500 to-orange-500',
    features: [
      'Tudo do Conversão',
      'FAQ Completo',
      'Galeria (até 8 fotos)',
      'Design Premium',
      'Rodapé com Mapa',
    ],
  },
};
