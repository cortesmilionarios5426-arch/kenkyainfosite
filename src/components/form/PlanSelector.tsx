import { PlanType, planInfo } from '@/types/form';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface PlanSelectorProps {
  selectedPlan: PlanType;
  onSelectPlan: (plan: PlanType) => void;
}

export function PlanSelector({ selectedPlan, onSelectPlan }: PlanSelectorProps) {
  const plans: PlanType[] = ['presenca', 'conversao', 'autoridade'];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => {
        const info = planInfo[plan];
        const isSelected = selectedPlan === plan;

        return (
          <button
            key={plan}
            type="button"
            onClick={() => onSelectPlan(plan)}
            className={cn(
              'relative p-6 rounded-xl text-left transition-all duration-300 group',
              'border-2',
              isSelected
                ? 'border-primary bg-primary/10 shadow-lg'
                : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
            )}
          >
            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}

            {/* Icon */}
            <div className="text-3xl mb-3">{info.icon}</div>

            {/* Plan name with gradient */}
            <h3
              className={cn(
                'text-xl font-bold mb-1 bg-gradient-to-r bg-clip-text',
                info.color,
                isSelected ? 'text-transparent' : 'text-foreground'
              )}
            >
              {info.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4">{info.description}</p>

            {/* Features */}
            <ul className="space-y-2">
              {info.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full bg-gradient-to-r',
                      info.color
                    )}
                  />
                  {feature}
                </li>
              ))}
            </ul>

            {/* Hover glow effect */}
            <div
              className={cn(
                'absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none',
                'group-hover:opacity-100',
                isSelected && 'opacity-100'
              )}
              style={{
                background: `radial-gradient(circle at center, hsla(var(--primary), 0.1) 0%, transparent 70%)`,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
