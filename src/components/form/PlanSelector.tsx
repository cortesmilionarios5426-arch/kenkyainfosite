import { PlanType, planInfo } from '@/types/form';
import { cn } from '@/lib/utils';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';

interface PlanSelectorProps {
  selectedPlan: PlanType;
  onSelectPlan: (plan: PlanType) => void;
}

const planIcons = {
  presenca: Zap,
  conversao: Sparkles,
  autoridade: Crown,
};

const planGradients = {
  presenca: 'from-blue-500 to-cyan-400',
  conversao: 'from-purple-500 to-pink-500',
  autoridade: 'from-amber-500 to-orange-400',
};

export function PlanSelector({ selectedPlan, onSelectPlan }: PlanSelectorProps) {
  const plans: PlanType[] = ['presenca', 'conversao', 'autoridade'];

  return (
    <div className="space-y-5">
      <div className="grid gap-4">
        {plans.map((plan, index) => {
          const info = planInfo[plan];
          const isSelected = selectedPlan === plan;
          const Icon = planIcons[plan];
          const gradient = planGradients[plan];

          return (
            <button
              key={plan}
              type="button"
              onClick={() => onSelectPlan(plan)}
              className={cn(
                'group relative p-5 sm:p-6 rounded-2xl text-left transition-all duration-500',
                'border-2 flex items-start gap-4',
                'animate-slide-up',
                isSelected
                  ? 'border-primary bg-gradient-to-br from-primary/10 via-accent/5 to-transparent shadow-lg shadow-primary/10'
                  : 'border-border/30 bg-card/30 hover:border-primary/40 hover:bg-card/60 hover:shadow-md'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300',
                  isSelected
                    ? `bg-gradient-to-br ${gradient} shadow-lg`
                    : 'bg-muted/50 group-hover:bg-muted'
                )}
              >
                <Icon className={cn(
                  'w-6 h-6 transition-colors',
                  isSelected ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                )} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {info.name}
                  </h3>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {info.shortDescription}
                </p>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/50 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Details of selected plan */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/30">
        <div className="flex items-center gap-2 mb-4">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br', planGradients[selectedPlan])}>
            {(() => {
              const Icon = planIcons[selectedPlan];
              return <Icon className="w-4 h-4 text-white" />;
            })()}
          </div>
          <p className="font-semibold text-foreground">
            O que está incluso no {planInfo[selectedPlan].name}
          </p>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {planInfo[selectedPlan].features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
