import { AccountingFormData, AccountingFormStep } from '@/types/accounting-form';
import { initialDomainRegistration } from '@/types/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SocialNetworkInput } from './SocialNetworkInput';
import { ColorSelector } from './ColorSelector';
import { AccountingHostingSelector } from './AccountingHostingSelector';
import { DomainRegistrationForm } from './DomainRegistrationForm';
import { Image, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AccountingFormStepContentProps {
  step: AccountingFormStep;
  formData: AccountingFormData;
  updateField: <K extends keyof AccountingFormData>(field: K, value: AccountingFormData[K]) => void;
}

const fieldLabels: Partial<Record<keyof AccountingFormData, string>> = {
  businessName: 'Nome do escritório',
  mainService: 'Principal serviço do escritório',
  businessColors: 'Cores do seu negócio',
  whatsappNumber: 'Número do WhatsApp',
  socialNetworks: 'Redes sociais',
  logoUrl: 'Logo da sua marca',
  domainOption1: '1ª opção de domínio',
  domainOption2: '2ª opção de domínio',
  acctHostingMode: 'Modo de configuração',
  domainRegistration: 'Dados para registro',
  acctMainService: 'Qual serviço você mais quer vender?',
  acctServiceArea: 'Área de atendimento',
  acctMonthlyClients: 'Novos clientes por mês (média)',
  acctIdealClient: 'Quem é o cliente ideal?',
  acctAvgTicket: 'Ticket médio de honorário mensal',
  acctClientVolumePreference: 'Volume ou clientes de maior porte?',
  acctWhoAnswers: 'Quem atende o WhatsApp?',
  acctHasScript: 'Tem roteiro comercial?',
  acctMainObjection: 'Principal objeção que recebe',
  acctClosingTime: 'Tempo para fechar um novo cliente',
  acctYearsInMarket: 'Anos de mercado',
  acctCompaniesServed: 'Nº aproximado de empresas atendidas',
  acctNichesServed: 'Nichos que já atende',
  acctCertifications: 'Diferenciais técnicos (CRC, especializações)',
  acctDifferentials: 'Por que uma empresa escolheria você?',
};

const fieldPlaceholders: Partial<Record<keyof AccountingFormData, string>> = {
  businessName: 'EXEMPLO: Contabilidade Silva & Associados',
  mainService: 'EXEMPLO: Abertura de empresas e gestão contábil',
  domainOption1: 'EXEMPLO: suacontabilidade.com.br',
  domainOption2: 'EXEMPLO: contabilidadesilva.com.br',
  acctMainService: '',
  acctServiceArea: 'EXEMPLO: São Paulo capital e região metropolitana',
  acctMonthlyClients: 'EXEMPLO: 5 a 10 novos clientes',
  acctIdealClient: 'EXEMPLO: Empresas do Simples Nacional com faturamento até R$ 300k/mês',
  acctAvgTicket: 'EXEMPLO: R$ 800 a R$ 1.500',
  acctClientVolumePreference: 'EXEMPLO: Prefiro clientes de maior porte com ticket mais alto',
  acctWhoAnswers: 'EXEMPLO: Eu mesmo ou minha secretária',
  acctHasScript: 'EXEMPLO: Sim, tenho um roteiro básico / Não, atendo no improviso',
  acctMainObjection: 'EXEMPLO: Preço alto em relação à concorrência',
  acctClosingTime: 'EXEMPLO: Em média 3 a 7 dias',
  acctYearsInMarket: 'EXEMPLO: 12 anos',
  acctCompaniesServed: 'EXEMPLO: Mais de 200 empresas',
  acctNichesServed: 'EXEMPLO: Médicos, advogados, e-commerce',
  acctCertifications: 'EXEMPLO: CRC ativo, MBA em Gestão Tributária',
  acctDifferentials: 'EXEMPLO: Atendimento humanizado, reuniões mensais de resultado, dashboard online para o cliente',
};

const fieldDescriptions: Partial<Record<keyof AccountingFormData, string>> = {
  businessName: 'Este nome aparecerá em destaque na sua página',
  mainService: 'O serviço pelo qual seu escritório quer ser conhecido',
  businessColors: 'Usaremos para personalizar o design da sua página',
  whatsappNumber: 'Incluiremos botões de WhatsApp na página',
  domainOption1: 'Sua primeira opção de domínio .com.br',
  domainOption2: 'Caso a primeira não esteja disponível',
  acctMainService: 'Escolha o serviço foco da sua campanha de captação',
  acctServiceArea: 'Você atende apenas sua cidade ou todo Brasil?',
  acctMonthlyClients: 'Nos ajuda a definir a intensidade da estratégia',
  acctIdealClient: 'Descreva o perfil que você mais quer atrair',
  acctAvgTicket: 'Nos ajuda a posicionar sua oferta corretamente',
  acctClientVolumePreference: 'Isso define a estratégia de precificação na página',
  acctWhoAnswers: 'Influencia o tom e velocidade do funil',
  acctHasScript: 'Caso não tenha, podemos sugerir melhorias no fluxo',
  acctMainObjection: 'Vamos endereçar isso diretamente na página',
  acctClosingTime: 'Ajuda a calibrar o tipo de CTA e urgência',
  acctYearsInMarket: 'Contabilidade vende confiança — anos importam',
  acctCompaniesServed: 'Prova social essencial para gerar credibilidade',
  acctNichesServed: 'Especialização em nichos gera autoridade',
  acctCertifications: 'Certificações reforçam credibilidade técnica',
  acctDifferentials: 'A resposta mais importante: por que você e não um mais barato?',
};

const acctMainServiceOptions = [
  'Abertura de empresa',
  'Troca de contador',
  'MEI',
  'Empresas do Simples',
  'Médicos',
  'E-commerce',
  'Outro',
];

export function AccountingFormStepContent({ step, formData, updateField }: AccountingFormStepContentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(formData.logoUrl);
  const { toast } = useToast();

  const handleLogoUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 2MB.', variant: 'destructive' });
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Formato inválido', description: 'Envie PNG, JPG ou SVG.', variant: 'destructive' });
      return;
    }
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('logos').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(data.path);
      updateField('logoUrl', publicUrl);
      setPreviewUrl(publicUrl);
      toast({ title: 'Logo enviada!' });
    } catch {
      toast({ title: 'Erro no upload', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const removeLogo = () => {
    updateField('logoUrl', null);
    setPreviewUrl(null);
  };

  const renderField = (field: keyof AccountingFormData, index: number) => {
    const label = fieldLabels[field] || field;
    const placeholder = fieldPlaceholders[field] || '';
    const description = fieldDescriptions[field];

    // Accounting hosting mode selector
    if (field === 'acctHostingMode') {
      return (
        <div key={field} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <AccountingHostingSelector
            selectedMode={formData.acctHostingMode}
            onSelectMode={(mode) => updateField('acctHostingMode', mode)}
          />
        </div>
      );
    }

    // Domain options
    if (field === 'domainOption1' || field === 'domainOption2') {
      return (
        <div key={field} className="space-y-2 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <Label htmlFor={field} className="text-base font-medium flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            {label}
          </Label>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <Input
            id={field}
            value={(formData[field] as string) || ''}
            onChange={(e) => updateField(field, e.target.value as any)}
            placeholder={placeholder}
            className="form-input-animated form-input-tall"
          />
        </div>
      );
    }

    // Domain registration
    if (field === 'domainRegistration') {
      return (
        <div key={field} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <DomainRegistrationForm
            data={formData.domainRegistration || initialDomainRegistration}
            onChange={(data) => updateField('domainRegistration', data)}
          />
        </div>
      );
    }

    // Social networks
    if (field === 'socialNetworks') {
      return (
        <div key={field} className="space-y-2 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <Label className="text-base font-medium">{label}</Label>
          <SocialNetworkInput
            networks={formData.socialNetworks}
            onChange={(networks) => updateField('socialNetworks', networks)}
          />
        </div>
      );
    }

    // Logo upload
    if (field === 'logoUrl') {
      return (
        <div key={field} className="space-y-3 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <Label className="text-base font-medium">{label}</Label>
          {previewUrl ? (
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-border bg-card">
                <img src={previewUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <button type="button" onClick={removeLogo} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()} className={cn('border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer hover:border-primary/50 hover:bg-primary/5 border-border bg-card/30', isUploading && 'opacity-50 pointer-events-none')}>
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm text-muted-foreground">Enviando...</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Image className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Clique para enviar sua logo</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG ou SVG • Máx. 2MB</p>
                </>
              )}
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleLogoUpload(file); }} />
        </div>
      );
    }

    // Colors
    if (field === 'businessColors') {
      return (
        <div key={field} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <ColorSelector value={formData.businessColors} onChange={(v) => updateField('businessColors', v)} logoUrl={formData.logoUrl} />
        </div>
      );
    }

    // Accounting main service - checkboxes
    if (field === 'acctMainService') {
      const selected = formData.acctMainService ? formData.acctMainService.split(',').map(s => s.trim()) : [];
      const toggle = (option: string) => {
        const newSelected = selected.includes(option)
          ? selected.filter(s => s !== option)
          : [...selected, option];
        updateField('acctMainService', newSelected.join(', '));
      };

      return (
        <div key={field} className="space-y-3 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <Label className="text-base font-medium">{label}</Label>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <div className="grid grid-cols-2 gap-3">
            {acctMainServiceOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                className={cn(
                  'px-4 py-3 rounded-xl text-sm font-medium text-left transition-all duration-200 border',
                  selected.includes(option)
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-card/30 border-border/30 text-muted-foreground hover:border-primary/30'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Textarea for longer fields
    const textareaFields: (keyof AccountingFormData)[] = [
      'acctIdealClient', 'acctMainObjection', 'acctNichesServed', 'acctCertifications', 'acctDifferentials',
    ];

    if (textareaFields.includes(field)) {
      return (
        <div key={field} className="space-y-2 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <Label htmlFor={field} className="text-base font-medium">{label}</Label>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <Textarea
            id={field}
            value={(formData[field] as string) || ''}
            onChange={(e) => updateField(field, e.target.value as any)}
            placeholder={placeholder}
            className="form-input-animated form-textarea-tall resize-none"
            rows={4}
          />
        </div>
      );
    }

    // Default: input
    return (
      <div key={field} className="space-y-2 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
        <Label htmlFor={field} className="text-base font-medium">{label}</Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        <Input
          id={field}
          value={(formData[field] as string) || ''}
          onChange={(e) => updateField(field, e.target.value as any)}
          placeholder={placeholder}
          className="form-input-animated form-input-tall"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 gradient-text">{step.title}</h2>
        <p className="text-muted-foreground">{step.description}</p>
      </div>
      <div className="space-y-6">
        {step.fields.map((field, index) => renderField(field, index))}
      </div>
    </div>
  );
}
