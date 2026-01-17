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
    <div className="space-y-4">
      <div className="grid gap-3">
        {plans.map((plan) => {
          const info = planInfo[plan];
          const isSelected = selectedPlan === plan;

          return (
            <button
              key={plan}
              type="button"
              onClick={() => onSelectPlan(plan)}
              className={cn(
                'relative p-4 sm:p-5 rounded-xl text-left transition-all duration-300',
                'border-2 flex items-center gap-4',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-lg'
                  : 'border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/80'
              )}
            >
              {/* Radio indicator */}
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/40'
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                  {info.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {info.shortDescription}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Details of selected plan */}
      <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/50">
        <p className="text-sm font-medium text-foreground mb-2">
          O que está incluso no {planInfo[selectedPlan].name}:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {planInfo[selectedPlan].features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="truncate">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
