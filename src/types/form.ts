export type PlanType = 'presenca' | 'conversao' | 'autoridade';

export interface SocialNetwork {
  platform: string;
  url: string;
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
  
  // Presença fields
  professionalSummary: string;
  services: string;
  locationHours: string;
  mainObjective: string;
  
  // Conversão fields
  painSolutions: string;
  competitiveDifferentials: string;
  testimonialsSection: string;
  visualProcess: string;
  
  // Autoridade fields
  faq: string;
  resultsGallery: string;
  premiumVisualStyle: string;
  advancedFooterMap: string;
}

export const initialFormData: FormData = {
  businessName: '',
  mainService: '',
  businessColors: '',
  whatsappNumber: '',
  socialNetworks: [],
  logoUrl: null,
  chosenPlan: 'presenca',
  professionalSummary: '',
  services: '',
  locationHours: '',
  mainObjective: '',
  painSolutions: '',
  competitiveDifferentials: '',
  testimonialsSection: '',
  visualProcess: '',
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
    id: 'authority',
    title: 'Autoridade & Premium',
    description: 'Recursos avançados para máximo impacto',
    fields: ['faq', 'resultsGallery', 'premiumVisualStyle', 'advancedFooterMap'],
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
