import { HostingOption } from '@/types/form';
import { cn } from '@/lib/utils';
import { Globe, Server, Check } from 'lucide-react';

interface HostingSelectorProps {
  selectedOption: HostingOption;
  onSelectOption: (option: HostingOption) => void;
}

const options = [
  {
    id: 'without' as const,
    title: 'Sem Hospedagem',
    description: 'Apenas a página, você cuida do domínio',
    example: 'seusite.netlify.app',
    icon: Server,
    color: 'from-slate-500 to-slate-600',
  },
  {
    id: 'with' as const,
    title: 'Com Hospedagem e Domínio',
    description: 'Página completa com seu domínio .com.br',
    example: 'seusite.com.br',
    icon: Globe,
    color: 'from-primary to-accent',
  },
];

export function HostingSelector({ selectedOption, onSelectOption }: HostingSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const Icon = option.icon;
          
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectOption(option.id)}
              className={cn(
                'relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 text-left',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-border bg-card/50 hover:border-primary/50 hover:bg-card/80'
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              {/* Icon */}
              <div className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br',
                option.color
              )}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-bold mb-2">{option.title}</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                {option.description}
              </p>
              
              {/* Example */}
              <div className={cn(
                'px-4 py-2 rounded-lg text-sm font-mono',
                isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {option.example}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Info note when "with hosting" is selected */}
      {selectedOption === 'with' && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 animate-slide-up">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Ótima escolha!</span>{' '}
            Na próxima etapa, vamos coletar alguns dados pessoais necessários para o registro do domínio. 
            Essas informações garantem que o domínio seja registrado em seu nome, 
            assegurando seus direitos e propriedade sobre ele.
          </p>
        </div>
      )}
    </div>
  );
}