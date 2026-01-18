import { FormData, FormStep } from '@/types/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlanSelector } from './PlanSelector';
import { SocialNetworkInput } from './SocialNetworkInput';
import { TestimonialInput, Testimonial } from './TestimonialInput';
import { ColorSelector } from './ColorSelector';
import { GalleryUpload } from './GalleryUpload';
import { Image, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  locationHours: 'Local e horário',
  mainObjective: 'Objetivo da página',
  painSolutions: 'Dores & Soluções',
  competitiveDifferentials: 'Seus diferenciais',
  testimonialsSection: 'Depoimentos de clientes',
  visualProcess: 'Como funciona seu atendimento',
  faq: 'Perguntas frequentes',
  resultsGallery: 'Galeria de resultados (até 8 fotos)',
  premiumVisualStyle: 'Estilo visual da página',
  advancedFooterMap: 'Endereço para o mapa',
};

// Placeholders claros que reforçam ser EXEMPLOS
const fieldPlaceholders: Record<keyof FormData, string> = {
  businessName: 'EXEMPLO: Kenkya Sites',
  mainService: 'EXEMPLO: Criação de sites profissionais',
  businessColors: '',
  whatsappNumber: 'EXEMPLO: (11) 99999-9999',
  socialNetworks: '',
  logoUrl: '',
  chosenPlan: '',
  professionalSummary: 'EXEMPLO: Sou especialista em X há Y anos. Minha missão é ajudar empresas a...',
  services: `EXEMPLO:
• Landing Page - R$ 497
• Site Institucional - R$ 997
• E-commerce - sob consulta`,
  locationHours: `EXEMPLO:
Atendimento: Online ou Presencial
Horário: Segunda a Sexta, 9h às 18h`,
  mainObjective: 'EXEMPLO: Fazer o visitante agendar uma reunião pelo WhatsApp',
  painSolutions: `EXEMPLO:
PROBLEMA: Não tem presença online
SOLUÇÃO: Site profissional em 7 dias`,
  competitiveDifferentials: `EXEMPLO:
• Entrega rápida em 7 dias
• Suporte incluso por 30 dias
• Design 100% exclusivo`,
  testimonialsSection: '',
  visualProcess: `EXEMPLO:
1º Briefing inicial
2º Criação do design
3º Revisão e ajustes
4º Entrega final`,
  faq: `EXEMPLO:
Pergunta: Qual é o prazo de entrega?
Resposta: Entre 7 a 15 dias úteis`,
  resultsGallery: '',
  premiumVisualStyle: 'EXEMPLO: Moderno e minimalista, com cores sóbrias e tipografia elegante',
  advancedFooterMap: `EXEMPLO:
Rua das Flores, 123 - Centro
São Paulo - SP`,
};

const fieldDescriptions: Record<string, string> = {
  businessName: 'Este nome aparecerá em destaque na sua página',
  mainService: 'O serviço pelo qual você quer ser conhecido',
  businessColors: 'Usaremos para personalizar o design da sua página',
  whatsappNumber: 'Incluiremos botões de WhatsApp na página',
  professionalSummary: 'Uma breve apresentação sobre você e seu trabalho',
  services: 'Liste seus serviços com preços (se quiser divulgar)',
  locationHours: 'Onde e quando você atende',
  mainObjective: 'A ação principal que visitantes devem realizar',
  painSolutions: 'Conecte os problemas dos clientes às suas soluções',
  competitiveDifferentials: 'Por que escolher você e não a concorrência?',
  testimonialsSection: 'Adicione depoimentos reais de clientes satisfeitos',
  visualProcess: 'Descreva passo a passo como funciona seu atendimento',
  faq: 'Responda as perguntas que você mais recebe',
  resultsGallery: 'Descreva as imagens/provas que gostaria de incluir',
  premiumVisualStyle: 'Descreva o estilo visual desejado e referências',
  advancedFooterMap: 'Endereço completo para mostrar no mapa',
};

export function FormStepContent({ step, formData, updateField }: FormStepContentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(formData.logoUrl);
  const { toast } = useToast();

  // Parse testimonials from string or use as array
  const parseTestimonials = (): Testimonial[] => {
    const section = formData.testimonialsSection;
    if (!section) return [];
    try {
      const parsed = JSON.parse(section);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Not JSON, return empty
    }
    return [];
  };

  const [testimonials, setTestimonials] = useState<Testimonial[]>(parseTestimonials);

  useEffect(() => {
    // Sync testimonials to form field as JSON
    updateField('testimonialsSection', JSON.stringify(testimonials));
  }, [testimonials]);

  const handleLogoUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo permitido é 2MB.',
        variant: 'destructive',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, envie uma imagem (PNG, JPG ou SVG).',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(data.path);

      updateField('logoUrl', publicUrl);
      setPreviewUrl(publicUrl);

      toast({
        title: 'Logo enviada!',
        description: 'Sua logo foi carregada com sucesso.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar a imagem. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeLogo = () => {
    updateField('logoUrl', null);
    setPreviewUrl(null);
  };

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

    // Special case: Testimonials
    if (field === 'testimonialsSection') {
      return (
        <div key={field} className="space-y-2 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <Label className="text-base font-medium">{label}</Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <TestimonialInput
            testimonials={testimonials}
            onChange={setTestimonials}
            maxTestimonials={4}
          />
        </div>
      );
    }

    // Special case: Logo upload
    if (field === 'logoUrl') {
      return (
        <div key={field} className="space-y-3 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <Label className="text-base font-medium">{label}</Label>
          
          {previewUrl ? (
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-border bg-card">
                <img
                  src={previewUrl}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <button
                type="button"
                onClick={removeLogo}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer',
                'hover:border-primary/50 hover:bg-primary/5',
                'border-border bg-card/30',
                isUploading && 'opacity-50 pointer-events-none'
              )}
            >
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
                  <p className="text-sm font-medium text-foreground mb-1">
                    Clique para enviar sua logo
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG ou SVG • Máx. 2MB</p>
                </>
              )}
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleLogoUpload(file);
            }}
          />
        </div>
      );
    }

    // Special case: Colors
    if (field === 'businessColors') {
      return (
        <div key={field} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <ColorSelector
            value={formData.businessColors}
            onChange={(value) => updateField('businessColors', value)}
            logoUrl={formData.logoUrl}
          />
        </div>
      );
    }

    // Special case: Gallery upload
    if (field === 'resultsGallery') {
      return (
        <div key={field} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <GalleryUpload
            value={formData.resultsGallery}
            onChange={(value) => updateField('resultsGallery', value)}
            maxPhotos={8}
          />
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
      'visualProcess',
      'faq',
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
            className="form-input-animated form-textarea-tall resize-none"
            rows={6}
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
