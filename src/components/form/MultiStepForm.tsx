import { useState, useMemo } from 'react';
import { FormData, initialFormData, formSteps, PlanType } from '@/types/form';
import { BusinessType, AccountingFormData, initialAccountingFormData, accountingFormSteps } from '@/types/accounting-form';
import { BusinessTypeSelector } from './BusinessTypeSelector';
import { ProgressIndicator } from './ProgressIndicator';
import { FormCard } from './FormCard';
import { FormStepContent } from './FormStepContent';
import { AccountingFormStepContent } from './AccountingFormStepContent';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Send, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function MultiStepForm() {
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [acctFormData, setAcctFormData] = useState<AccountingFormData>(initialAccountingFormData);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  // Professional flow steps
  const visibleProfessionalSteps = useMemo(() => {
    return formSteps.filter((step) => {
      if (step.plans && !step.plans.includes(formData.chosenPlan)) return false;
      if (step.condition && !step.condition(formData)) return false;
      return true;
    });
  }, [formData.chosenPlan, formData.hostingOption]);

  // Accounting flow steps
  const visibleAccountingSteps = useMemo(() => {
    return accountingFormSteps.filter((step) => {
      if (step.condition && !step.condition(acctFormData)) return false;
      return true;
    });
  }, [acctFormData.acctHostingMode]);

  const isAccounting = businessType === 'accounting';
  const visibleSteps = isAccounting ? visibleAccountingSteps : visibleProfessionalSteps;
  const currentStep = visibleSteps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === visibleSteps.length - 1;

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateAcctField = <K extends keyof AccountingFormData>(field: K, value: AccountingFormData[K]) => {
    setAcctFormData((prev) => ({ ...prev, [field]: value }));
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
      if (isAccounting) {
        const { error } = await supabase.from('form_responses').insert([{
          business_type: 'accounting',
          business_name: acctFormData.businessName,
          main_service: acctFormData.mainService,
          business_colors: acctFormData.businessColors,
          whatsapp_number: acctFormData.whatsappNumber,
          acct_landline_number: acctFormData.landlineNumber || null,
          social_networks: acctFormData.socialNetworks as any,
          logo_url: acctFormData.logoUrl,
          chosen_plan: 'presenca' as const,
          hosting_option: acctFormData.acctHostingMode,
          domain_option_1: acctFormData.domainOption1,
          domain_option_2: acctFormData.domainOption2,
          domain_registration: acctFormData.domainRegistration as any,
          acct_hosting_mode: acctFormData.acctHostingMode,
          acct_main_service: acctFormData.acctMainService,
          acct_service_area: acctFormData.acctServiceArea,
          acct_monthly_clients: acctFormData.acctMonthlyClients,
          acct_ideal_client: acctFormData.acctIdealClient,
          acct_avg_ticket: acctFormData.acctAvgTicket,
          acct_client_volume_preference: acctFormData.acctClientVolumePreference,
          acct_who_answers: acctFormData.acctWhoAnswers,
          acct_has_script: acctFormData.acctHasScript,
          acct_main_objection: acctFormData.acctMainObjection,
          acct_closing_time: acctFormData.acctClosingTime,
          acct_years_in_market: acctFormData.acctYearsInMarket,
          acct_companies_served: acctFormData.acctCompaniesServed,
          acct_niches_served: acctFormData.acctNichesServed,
          acct_certifications: acctFormData.acctCertifications,
          acct_differentials: acctFormData.acctDifferentials,
        }]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('form_responses').insert([{
          business_type: 'professional',
          business_name: formData.businessName,
          main_service: formData.mainService,
          business_colors: formData.businessColors,
          whatsapp_number: formData.whatsappNumber,
          social_networks: formData.socialNetworks as any,
          logo_url: formData.logoUrl,
          chosen_plan: formData.chosenPlan,
          hosting_option: formData.hostingOption,
          domain_option_1: formData.domainOption1,
          domain_option_2: formData.domainOption2,
          domain_registration: formData.domainRegistration as any,
          professional_summary: formData.professionalSummary,
          services: formData.services,
          location_hours: formData.locationHours,
          main_objective: formData.mainObjective,
          pain_solutions: formData.painSolutions,
          competitive_differentials: formData.competitiveDifferentials,
          testimonials_section: formData.testimonialsSection,
          visual_process: formData.visualProcess,
          conversion_gallery: formData.conversionGallery,
          faq: formData.faq,
          results_gallery: formData.resultsGallery,
          premium_visual_style: formData.premiumVisualStyle,
          advanced_footer_map: formData.advancedFooterMap,
        }]);
        if (error) throw error;
      }

      setIsComplete(true);
      toast({ title: 'Formulário enviado!', description: 'Recebemos suas informações com sucesso.' });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({ title: 'Erro ao enviar', description: 'Tente novamente em alguns instantes.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setAcctFormData(initialAccountingFormData);
    setCurrentStepIndex(0);
    setIsComplete(false);
    setBusinessType(null);
  };

  // Show business type selector first
  if (!businessType) {
    return <BusinessTypeSelector onSelect={setBusinessType} />;
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <FormCard className="text-center max-w-lg">
          <div className="animate-scale-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 gradient-text">Recebemos tudo!</h2>
            <p className="text-lg text-muted-foreground mb-2">Suas informações foram enviadas com sucesso.</p>
            <p className="text-muted-foreground mb-8">A equipe Kenkya entrará em contato em breve para os próximos passos.</p>
            <Button onClick={handleReset} variant="outline">Preencher novamente</Button>
          </div>
        </FormCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 relative overflow-hidden">
      <div className="orb orb-primary" />
      <div className="orb orb-accent" />

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Kenkya Sites</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground leading-tight">
            Briefing para sua <span className="gradient-text">Página Profissional</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            {isAccounting
              ? 'Preencha as informações do seu escritório para criarmos sua página estratégica'
              : 'Preencha as informações abaixo para criarmos sua página sob medida'}
          </p>
          <button
            onClick={handleReset}
            className="mt-3 text-xs text-muted-foreground/60 hover:text-primary transition-colors underline underline-offset-2"
          >
            ← Trocar tipo de negócio
          </button>
        </div>

        <ProgressIndicator
          currentStep={currentStepIndex}
          totalSteps={visibleSteps.length}
          stepTitles={visibleSteps.map((s) => s.title)}
        />

        <FormCard isAnimating={isAnimating}>
          {isAccounting ? (
            <AccountingFormStepContent
              step={currentStep as any}
              formData={acctFormData}
              updateField={updateAcctField}
            />
          ) : (
            <FormStepContent
              step={currentStep as any}
              formData={formData}
              updateField={updateField}
            />
          )}

          <div className="flex justify-between items-center mt-12 pt-8 border-t border-border/30">
            <Button
              type="button"
              variant="ghost"
              onClick={goToPreviousStep}
              disabled={isFirstStep}
              className={cn('transition-all duration-300 hover:bg-muted/50', isFirstStep && 'opacity-0 pointer-events-none')}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>

            <div className="flex items-center gap-2">
              {visibleSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    idx === currentStepIndex ? 'w-6 bg-primary' : idx < currentStepIndex ? 'bg-primary/50' : 'bg-muted'
                  )}
                />
              ))}
            </div>

            {isLastStep ? (
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="btn-gradient px-6">
                {isSubmitting ? 'Enviando...' : (<>Enviar<Send className="w-4 h-4 ml-2" /></>)}
              </Button>
            ) : (
              <Button type="button" onClick={goToNextStep} className="btn-gradient px-6">
                Próximo<ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </FormCard>

        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground/40 font-medium tracking-wider uppercase">Powered by Kenkya</p>
        </div>
      </div>
    </div>
  );
}
