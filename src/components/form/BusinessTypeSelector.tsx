import { BusinessType } from '@/types/accounting-form';
import { Briefcase, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessTypeSelectorProps {
  onSelect: (type: BusinessType) => void;
}

const options = [
  {
    type: 'professional' as BusinessType,
    icon: Briefcase,
    title: 'Profissional Liberal',
    description: 'Advogados, médicos, dentistas, coaches, freelancers e outros profissionais independentes.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    type: 'accounting' as BusinessType,
    icon: Calculator,
    title: 'Contabilidade',
    description: 'Escritórios de contabilidade, contadores e empresas do segmento contábil.',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

export function BusinessTypeSelector({ onSelect }: BusinessTypeSelectorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-3xl w-full relative z-10">
        {/* Decorative orbs */}
        <div className="orb orb-primary" />
        <div className="orb orb-accent" />

        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Kenkya Sites</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground leading-tight">
            Qual o tipo do seu <span className="gradient-text">negócio</span>?
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Selecione abaixo para personalizar o briefing ideal para você
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((option, index) => (
            <button
              key={option.type}
              onClick={() => onSelect(option.type)}
              className={cn(
                'glass-card rounded-3xl p-8 text-left transition-all duration-500 group',
                'hover:scale-[1.03] hover:shadow-2xl hover:border-primary/30',
                'border border-border/30',
                'animate-slide-up'
              )}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div
                className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center mb-6',
                  'bg-gradient-to-br',
                  option.gradient,
                  'shadow-lg group-hover:scale-110 transition-transform duration-300'
                )}
              >
                <option.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {option.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {option.description}
              </p>

              <div className="mt-6 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm font-medium">Começar</span>
                <span className="text-lg">→</span>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground/40 font-medium tracking-wider uppercase">
            Powered by Kenkya
          </p>
        </div>
      </div>
    </div>
  );
}
