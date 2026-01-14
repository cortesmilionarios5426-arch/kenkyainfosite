import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Clean progress bar */}
      <div className="relative">
        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out rounded-full bg-gradient-to-r from-primary via-accent to-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Step counter */}
        <div className="flex justify-between items-center mt-3">
          <span className="text-sm font-medium text-muted-foreground">
            Etapa {currentStep + 1} de {totalSteps}
          </span>
          <span className="text-sm font-semibold text-primary">
            {Math.round(progress)}% concluído
          </span>
        </div>
      </div>
    </div>
  );
}
