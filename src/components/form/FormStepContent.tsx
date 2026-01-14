import { FormData, FormStep } from '@/types/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlanSelector } from './PlanSelector';
import { SocialNetworkInput } from './SocialNetworkInput';
import { Upload, Palette, Image, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(formData.logoUrl);
  const { toast } = useToast();

  const handleLogoUpload = async (file: File) => {
    if (!file) return;

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo permitido é 2MB.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
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
      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
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
        <div key={field} className="space-y-3 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
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
          <div className="flex gap-2 flex-wrap">
            {[
              { hex: '#E91E63', name: 'Rosa' },
              { hex: '#9C27B0', name: 'Roxo' },
              { hex: '#2196F3', name: 'Azul' },
              { hex: '#4CAF50', name: 'Verde' },
              { hex: '#FF9800', name: 'Laranja' },
              { hex: '#795548', name: 'Marrom' },
              { hex: '#000000', name: 'Preto' },
              { hex: '#FFFFFF', name: 'Branco' },
            ].map((color) => (
              <button
                key={color.hex}
                type="button"
                title={color.name}
                className={cn(
                  'w-9 h-9 rounded-lg border-2 hover:scale-110 transition-all duration-200 shadow-sm',
                  formData.businessColors.includes(color.name)
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border/50'
                )}
                style={{ backgroundColor: color.hex }}
                onClick={() => {
                  const currentColors = formData.businessColors;
                  if (!currentColors.includes(color.name)) {
                    updateField('businessColors', currentColors ? `${currentColors}, ${color.name}` : color.name);
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
