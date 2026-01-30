import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export function ProgressIndicator({ currentStep, totalSteps, stepTitles }: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentTitle = stepTitles[currentStep] || '';

  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      {/* Current step title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
            {currentStep + 1}
          </div>
          <span className="text-sm font-medium text-foreground">
            {currentTitle}
          </span>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          {currentStep + 1} de {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-700 ease-out rounded-full"
          style={{ 
            width: `${progress}%`,
            background: 'var(--gradient-primary)'
          }}
        />
        {/* Shimmer effect */}
        <div 
          className="absolute inset-y-0 left-0 rounded-full opacity-60"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite'
          }}
        />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
