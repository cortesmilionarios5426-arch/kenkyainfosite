import { useState, useMemo } from 'react';
import { FormData, initialFormData, formSteps, PlanType } from '@/types/form';
import { ProgressIndicator } from './ProgressIndicator';
import { FormCard } from './FormCard';
import { FormStepContent } from './FormStepContent';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function MultiStepForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  // Filter steps based on selected plan
  const visibleSteps = useMemo(() => {
    return formSteps.filter((step) => {
      if (!step.plans) return true;
      return step.plans.includes(formData.chosenPlan);
    });
  }, [formData.chosenPlan]);

  const currentStep = visibleSteps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === visibleSteps.length - 1;

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const goToNextStep = () => {
    if (!isLastStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const goToPreviousStep = () => {
    if (!isFirstStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStepIndex((prev) => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('form_responses').insert([{
        business_name: formData.businessName,
        main_service: formData.mainService,
        business_colors: formData.businessColors,
        whatsapp_number: formData.whatsappNumber,
        social_networks: formData.socialNetworks as any,
        logo_url: formData.logoUrl,
        chosen_plan: formData.chosenPlan,
        professional_summary: formData.professionalSummary,
        services: formData.services,
        location_hours: formData.locationHours,
        main_objective: formData.mainObjective,
        pain_solutions: formData.painSolutions,
        competitive_differentials: formData.competitiveDifferentials,
        testimonials_section: formData.testimonialsSection,
        visual_process: formData.visualProcess,
        faq: formData.faq,
        results_gallery: formData.resultsGallery,
        premium_visual_style: formData.premiumVisualStyle,
        advanced_footer_map: formData.advancedFooterMap,
      }]);

      if (error) throw error;

      setIsComplete(true);
      toast({
        title: 'Formulário enviado! 🎉',
        description: 'Recebemos suas informações com sucesso.',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Erro ao enviar',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <FormCard className="text-center">
          <div className="animate-scale-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 gradient-text">Pronto!</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Suas informações foram enviadas com sucesso.
              <br />
              Em breve entraremos em contato!
            </p>
            <Button
              onClick={() => {
                setFormData(initialFormData);
                setCurrentStepIndex(0);
                setIsComplete(false);
              }}
              variant="outline"
              className="mt-4"
            >
              Preencher novamente
            </Button>
          </div>
        </FormCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Crie sua <span className="gradient-text">página profissional</span>
          </h1>
          <p className="text-muted-foreground">
            Responda algumas perguntas e deixe a mágica acontecer ✨
          </p>
        </div>

        {/* Progress */}
        <ProgressIndicator
          currentStep={currentStepIndex}
          totalSteps={visibleSteps.length}
          stepTitles={visibleSteps.map((s) => s.title)}
        />

        {/* Form Card */}
        <FormCard isAnimating={isAnimating}>
          <FormStepContent
            step={currentStep}
            formData={formData}
            updateField={updateField}
          />

          {/* Navigation */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={goToPreviousStep}
              disabled={isFirstStep}
              className={cn(
                'transition-all duration-300',
                isFirstStep && 'opacity-0 pointer-events-none'
              )}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>

            <div className="text-sm text-muted-foreground">
              {currentStepIndex + 1} de {visibleSteps.length}
            </div>

            {isLastStep ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity animate-pulse-glow"
              >
                {isSubmitting ? (
                  'Enviando...'
                ) : (
                  <>
                    Enviar
                    <Send className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goToNextStep}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </FormCard>
      </div>
    </div>
  );
}
