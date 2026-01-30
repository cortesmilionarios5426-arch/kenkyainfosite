import { HostingOption } from '@/types/form';
import { cn } from '@/lib/utils';
import { Globe, Server, Check, ArrowRight } from 'lucide-react';

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
    badge: null,
  },
  {
    id: 'with' as const,
    title: 'Com Hospedagem e Domínio',
    description: 'Página completa com seu domínio .com.br profissional',
    example: 'seusite.com.br',
    icon: Globe,
    badge: 'Recomendado',
  },
];

export function HostingSelector({ selectedOption, onSelectOption }: HostingSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option, index) => {
          const isSelected = selectedOption === option.id;
          const Icon = option.icon;
          const isRecommended = option.id === 'with';
          
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectOption(option.id)}
              className={cn(
                'group relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-500 text-left',
                'animate-slide-up',
                isSelected
                  ? 'border-primary bg-gradient-to-br from-primary/15 via-accent/5 to-transparent shadow-xl shadow-primary/15'
                  : 'border-border/30 bg-card/30 hover:border-primary/40 hover:bg-card/60 hover:shadow-lg'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Badge */}
              {option.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-xs font-semibold text-white shadow-lg">
                  {option.badge}
                </div>
              )}

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              
              {/* Icon */}
              <div className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300',
                isSelected 
                  ? 'bg-gradient-to-br from-primary to-accent shadow-lg' 
                  : isRecommended
                    ? 'bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30'
                    : 'bg-muted/50 group-hover:bg-muted'
              )}>
                <Icon className={cn(
                  'w-8 h-8 transition-colors',
                  isSelected ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                )} />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-bold mb-2 text-center">{option.title}</h3>
              <p className="text-sm text-muted-foreground text-center mb-4 leading-relaxed">
                {option.description}
              </p>
              
              {/* Example */}
              <div className={cn(
                'px-4 py-2.5 rounded-xl text-sm font-mono transition-all duration-300',
                isSelected 
                  ? 'bg-primary/20 text-primary border border-primary/30' 
                  : 'bg-muted/50 text-muted-foreground group-hover:bg-muted'
              )}>
                {option.example}
              </div>

              {/* Selection ring */}
              {isSelected && (
                <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/40 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Info note when "with hosting" is selected */}
      {selectedOption === 'with' && (
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-primary/20 animate-slide-up">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Ótima escolha!</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Na próxima etapa, vamos coletar alguns dados pessoais necessários para o registro do domínio. 
              Essas informações garantem que o domínio seja registrado em seu nome.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}