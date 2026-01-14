import { PlanType, planInfo } from '@/types/form';
import { cn } from '@/lib/utils';
import { Check, Star, Zap, Crown } from 'lucide-react';

interface PlanSelectorProps {
  selectedPlan: PlanType;
  onSelectPlan: (plan: PlanType) => void;
}

const planIcons = {
  presenca: Star,
  conversao: Zap,
  autoridade: Crown,
};

export function PlanSelector({ selectedPlan, onSelectPlan }: PlanSelectorProps) {
  const plans: PlanType[] = ['presenca', 'conversao', 'autoridade'];

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-muted-foreground">
          Selecione o plano que melhor atende às necessidades do seu negócio
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const info = planInfo[plan];
          const isSelected = selectedPlan === plan;
          const Icon = planIcons[plan];

          return (
            <button
              key={plan}
              type="button"
              onClick={() => onSelectPlan(plan)}
              className={cn(
                'relative p-6 rounded-2xl text-left transition-all duration-300 group overflow-hidden',
                'border-2',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-xl shadow-primary/20 scale-[1.02]'
                  : 'border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg'
              )}
            >
              {/* Background gradient on hover/selected */}
              <div
                className={cn(
                  'absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none',
                  'bg-gradient-to-br',
                  info.color,
                  isSelected ? 'opacity-5' : 'group-hover:opacity-5'
                )}
              />

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-primary flex items-center justify-center animate-scale-in shadow-lg">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300',
                  'bg-gradient-to-br',
                  info.color,
                  isSelected ? 'shadow-lg' : 'opacity-80 group-hover:opacity-100'
                )}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>

              {/* Plan name */}
              <h3 className="text-xl font-bold mb-2 text-foreground">
                {info.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {info.description}
              </p>

              {/* Features */}
              <ul className="space-y-2">
                {info.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <div
                      className={cn(
                        'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-gradient-to-r',
                        info.color
                      )}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Selection hint */}
              <div
                className={cn(
                  'mt-5 pt-4 border-t border-border/50 text-center text-sm font-medium transition-all duration-300',
                  isSelected
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              >
                {isSelected ? '✓ Plano selecionado' : 'Clique para selecionar'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
