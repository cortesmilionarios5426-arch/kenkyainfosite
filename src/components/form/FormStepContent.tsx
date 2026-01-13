import { FormData, FormStep, PlanType } from '@/types/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlanSelector } from './PlanSelector';
import { SocialNetworkInput } from './SocialNetworkInput';
import { Upload, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormStepContentProps {
  step: FormStep;
  formData: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

const fieldLabels: Record<keyof FormData, string> = {
  businessName: 'Nome do seu negócio',
  mainService: 'Principal serviço',
  businessColors: 'Cores do seu negócio',
  whatsappNumber: 'Número do WhatsApp',
  socialNetworks: 'Redes sociais',
  logoUrl: 'Logo da sua marca',
  chosenPlan: 'Plano escolhido',
  professionalSummary: 'Resumo profissional',
  services: 'Seus serviços',
  locationHours: 'Local e horário de funcionamento',
  mainObjective: 'Objetivo principal da página',
  painSolutions: 'Dores & Soluções',
  competitiveDifferentials: 'Diferenciais competitivos',
  testimonialsSection: 'Depoimentos',
  visualProcess: 'Processo de atendimento visual',
  faq: 'FAQ - Perguntas frequentes',
  resultsGallery: 'Galeria de resultados',
  premiumVisualStyle: 'Estilo visual premium',
  advancedFooterMap: 'Rodapé avançado com mapa',
};

const fieldPlaceholders: Record<keyof FormData, string> = {
  businessName: 'Ex: Studio Ana Makeup',
  mainService: 'Ex: Maquiagem profissional para noivas',
  businessColors: 'Ex: Rosa, dourado e branco',
  whatsappNumber: 'Ex: (11) 99999-9999',
  socialNetworks: '',
  logoUrl: '',
  chosenPlan: '',
  professionalSummary: 'Conte um pouco sobre você e sua experiência...',
  services: 'Liste seus principais serviços separados por vírgula...',
  locationHours: 'Ex: Av. Paulista, 1000 - Segunda a Sexta, 9h às 18h',
  mainObjective: 'O que você quer que os visitantes façam? Ex: Agendar consulta',
  painSolutions: 'Quais problemas você resolve? E como?',
  competitiveDifferentials: 'O que te diferencia da concorrência?',
  testimonialsSection: 'Copie e cole depoimentos de clientes satisfeitos...',
  visualProcess: 'Descreva as etapas do seu atendimento...',
  faq: 'Liste as perguntas mais frequentes e suas respostas...',
  resultsGallery: 'Descreva as imagens/provas que gostaria de incluir...',
  premiumVisualStyle: 'Descreva o estilo visual desejado...',
  advancedFooterMap: 'Endereço completo para o mapa...',
};

const fieldDescriptions: Record<string, string> = {
  businessName: 'Este nome aparecerá em destaque na sua página',
  mainService: 'O serviço pelo qual você quer ser conhecido',
  businessColors: 'Usaremos para personalizar o design da sua página',
  whatsappNumber: 'Incluiremos botões de WhatsApp na página',
  professionalSummary: 'Uma breve apresentação sobre você e seu trabalho',
  services: 'Detalhe os serviços que você oferece',
  locationHours: 'Onde e quando você atende',
  mainObjective: 'A ação principal que visitantes devem realizar',
  painSolutions: 'Conecte os problemas dos clientes às suas soluções',
  competitiveDifferentials: 'Por que escolher você e não a concorrência?',
  testimonialsSection: 'Provas sociais que geram confiança',
  visualProcess: 'Mostre como é trabalhar com você, passo a passo',
  faq: 'Responda dúvidas antes que elas surjam',
  resultsGallery: 'Imagens de antes/depois, certificados, prêmios',
  premiumVisualStyle: 'Preferências de design, referências visuais',
  advancedFooterMap: 'Facilitará que clientes te encontrem',
};

export function FormStepContent({ step, formData, updateField }: FormStepContentProps) {
  const renderField = (field: keyof FormData, index: number) => {
    const label = fieldLabels[field];
    const placeholder = fieldPlaceholders[field];
    const description = fieldDescriptions[field];

    // Special case: Plan selector
    if (field === 'chosenPlan') {
      return (
        <div key={field} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <PlanSelector
            selectedPlan={formData.chosenPlan}
            onSelectPlan={(plan) => updateField('chosenPlan', plan)}
          />
        </div>
      );
    }

    // Special case: Social networks
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

    // Special case: Logo upload
    if (field === 'logoUrl') {
      return (
        <div key={field} className="space-y-2 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <Label className="text-base font-medium">{label}</Label>
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300',
              'hover:border-primary/50 hover:bg-primary/5 cursor-pointer',
              'border-border'
            )}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">
              Arraste sua logo aqui ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG ou SVG (máx. 2MB)</p>
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // For now, we'll just store the file name
                  // Later we can implement actual upload
                  updateField('logoUrl', file.name);
                }
              }}
            />
          </div>
          {formData.logoUrl && (
            <p className="text-sm text-primary">✓ {formData.logoUrl}</p>
          )}
        </div>
      );
    }

    // Special case: Colors
    if (field === 'businessColors') {
      return (
        <div key={field} className="space-y-2 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <Label htmlFor={field} className="text-base font-medium flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            {label}
          </Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <Input
            id={field}
            value={formData[field] as string}
            onChange={(e) => updateField(field, e.target.value as FormData[typeof field])}
            placeholder={placeholder}
            className="form-input-animated"
          />
          <div className="flex gap-2 flex-wrap mt-2">
            {['#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800', '#795548', '#000000', '#FFFFFF'].map((color) => (
              <button
                key={color}
                type="button"
                className="w-8 h-8 rounded-full border-2 border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => {
                  const currentColors = formData.businessColors;
                  const colorName = color;
                  if (!currentColors.includes(colorName)) {
                    updateField('businessColors', currentColors ? `${currentColors}, ${colorName}` : colorName);
                  }
                }}
              />
            ))}
          </div>
        </div>
      );
    }

    // Text area for longer fields
    const isTextArea = [
      'professionalSummary',
      'services',
      'mainObjective',
      'painSolutions',
      'competitiveDifferentials',
      'testimonialsSection',
      'visualProcess',
      'faq',
      'resultsGallery',
      'premiumVisualStyle',
    ].includes(field);

    if (isTextArea) {
      return (
        <div key={field} className="space-y-2 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <Label htmlFor={field} className="text-base font-medium">{label}</Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <Textarea
            id={field}
            value={formData[field] as string}
            onChange={(e) => updateField(field, e.target.value as FormData[typeof field])}
            placeholder={placeholder}
            className="form-input-animated min-h-[120px] resize-none"
            rows={4}
          />
        </div>
      );
    }

    // Default: Input field
    return (
      <div key={field} className="space-y-2 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
        <Label htmlFor={field} className="text-base font-medium">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <Input
          id={field}
          value={formData[field] as string}
          onChange={(e) => updateField(field, e.target.value as FormData[typeof field])}
          placeholder={placeholder}
          className="form-input-animated"
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
