import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export function ProgressIndicator({ currentStep, totalSteps, stepTitles }: ProgressIndicatorProps) {
  return (
    <div className="w-full py-8">
      {/* Progress bar */}
      <div className="relative mb-6">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-700 ease-out rounded-full"
            style={{
              width: `${((currentStep + 1) / totalSteps) * 100}%`,
              background: 'var(--gradient-primary)',
            }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-between items-start">
        {stepTitles.map((title, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div
              key={index}
              className={cn(
                'flex flex-col items-center gap-2 flex-1',
                index === 0 && 'items-start',
                index === totalSteps - 1 && 'items-end'
              )}
            >
              <div
                className={cn(
                  'step-indicator',
                  isCompleted && 'completed',
                  isActive && 'active',
                  isPending && 'pending'
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs text-center max-w-[80px] transition-colors duration-300 hidden sm:block',
                  isActive && 'text-primary font-medium',
                  isPending && 'text-muted-foreground',
                  isCompleted && 'text-green-400'
                )}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
