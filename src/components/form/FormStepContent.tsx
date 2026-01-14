import { FormData, FormStep } from '@/types/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlanSelector } from './PlanSelector';
import { SocialNetworkInput } from './SocialNetworkInput';
import { TestimonialInput, Testimonial } from './TestimonialInput';
import { Image, X, Palette } from 'lucide-react';
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
  locationHours: 'Local e horário de funcionamento',
  mainObjective: 'Objetivo principal da página',
  painSolutions: 'Dores & Soluções',
  competitiveDifferentials: 'Diferenciais competitivos',
  testimonialsSection: 'Depoimentos de clientes',
  visualProcess: 'Processo de atendimento',
  faq: 'FAQ - Perguntas frequentes',
  resultsGallery: 'Galeria de resultados',
  premiumVisualStyle: 'Estilo visual premium',
  advancedFooterMap: 'Rodapé avançado com mapa',
};

const fieldPlaceholders: Record<keyof FormData, string> = {
  businessName: 'Ex: Studio Ana Makeup, Clínica Dr. João Silva, Barbearia Vintage',
  mainService: 'Ex: Maquiagem profissional para noivas e festas, Tratamento de acne, Corte masculino moderno',
  businessColors: 'Ex: Rosa claro, dourado e branco',
  whatsappNumber: 'Ex: (11) 99999-9999',
  socialNetworks: '',
  logoUrl: '',
  chosenPlan: '',
  professionalSummary: `Ex: Sou maquiadora profissional há 8 anos, especializada em noivas e formandas. Já atendi mais de 500 clientes e minha missão é realçar a beleza natural de cada mulher com técnicas atuais e produtos de alta qualidade.`,
  services: `Ex:
• Maquiagem para Noivas - R$ 350
• Maquiagem Social (festas/eventos) - R$ 180  
• Curso de Automaquiagem - R$ 250
• Pacote Noiva + Madrinhas (desconto especial)`,
  locationHours: `Ex: Atendo em estúdio próprio na Av. Paulista, 1000 - Sala 302
Seg a Sex: 9h às 19h | Sáb: 8h às 16h
Atendimento a domicílio sob consulta`,
  mainObjective: 'Ex: Quero que os visitantes agendem uma avaliação gratuita pelo WhatsApp',
  painSolutions: `Ex:
PROBLEMA: Cliente não sabe qual maquiagem combina com seu rosto
SOLUÇÃO: Ofereço consultoria de coloração pessoal incluída no serviço

PROBLEMA: Medo de parecer "muito maquiada" 
SOLUÇÃO: Técnica de maquiagem natural que realça sem exageros`,
  competitiveDifferentials: `Ex:
• 8 anos de experiência com noivas
• Produtos importados de alta durabilidade
• Prova de maquiagem incluída no pacote noiva
• Atendimento personalizado (máx. 2 noivas por dia)
• 100% de avaliações 5 estrelas no Google`,
  testimonialsSection: '',
  visualProcess: `Ex:
1º CONTATO: Conversamos pelo WhatsApp para entender o evento
2º PROVA: Agendamos uma prova de maquiagem 15 dias antes
3º GRANDE DIA: Chego 2h antes para garantir um resultado perfeito
4º PÓS: Envio kit retoque e dicas para a maquiagem durar toda a festa`,
  faq: `Ex:
P: A maquiagem dura o dia todo?
R: Sim! Uso primers e fixadores profissionais que garantem duração de 12h+

P: Vocês atendem a domicílio?
R: Sim, com taxa de deslocamento a partir de R$ 50 dependendo da região

P: Posso fazer prova antes do evento?
R: Para noivas, a prova está incluída. Para outros eventos, consulte disponibilidade`,
  resultsGallery: `Ex:
• 10 fotos de antes/depois de noivas
• Vídeos curtos de transformações
• Prints de avaliações do Google/Instagram
• Certificados de cursos que fiz
• Fotos minhas trabalhando (bastidores)`,
  premiumVisualStyle: `Ex:
Quero um visual elegante e romântico, com tons de rosa e dourado.
Fontes delicadas e femininas.
Fotos com filtro suave, estilo Pinterest.
Referência: @maquiadoresucesso no Instagram`,
  advancedFooterMap: `Ex: Rua das Flores, 123 - Sala 45
Bairro Jardim América, São Paulo - SP
CEP: 01234-567
(Próximo ao Metrô Consolação)`,
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
            className="form-input-animated min-h-[140px] resize-none"
            rows={5}
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
