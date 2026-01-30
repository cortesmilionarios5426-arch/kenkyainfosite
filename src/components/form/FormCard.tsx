import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormCardProps {
  children: ReactNode;
  className?: string;
  isAnimating?: boolean;
  direction?: 'left' | 'right';
}

export function FormCard({ children, className, isAnimating, direction = 'right' }: FormCardProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-3xl p-6 sm:p-8 md:p-12 w-full max-w-2xl mx-auto',
        'border-t border-t-white/5',
        isAnimating && direction === 'right' && 'animate-slide-up',
        isAnimating && direction === 'left' && 'animate-fade-in',
        className
      )}
    >
      {children}
    </div>
  );
}
