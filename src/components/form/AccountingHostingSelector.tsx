import { AcctHostingMode } from '@/types/accounting-form';
import { cn } from '@/lib/utils';
import { Settings, UserCheck, Check } from 'lucide-react';

interface AccountingHostingSelectorProps {
  selectedMode: AcctHostingMode;
  onSelectMode: (mode: AcctHostingMode) => void;
}

const options = [
  {
    id: 'full_config' as const,
    title: 'Configuração completa por nossa conta',
    description: 'Cuidamos de tudo: registro do domínio, hospedagem, DNS e configurações técnicas. Precisaremos dos seus dados (CNPJ/CPF) para o registro.',
    icon: Settings,
    badge: 'Recomendado',
  },
  {
    id: 'tech_responsible' as const,
    title: 'Nos denominar responsável técnico',
    description: 'Você mantém o controle do domínio e nos adiciona como responsável técnico. O trâmite fica por sua conta.',
    icon: UserCheck,
    badge: null,
  },
];

export function AccountingHostingSelector({ selectedMode, onSelectMode }: AccountingHostingSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground">Como deseja configurar o domínio?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option, index) => {
          const isSelected = selectedMode === option.id;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectMode(option.id)}
              className={cn(
                'group relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-500 text-left',
                'animate-slide-up',
                isSelected
                  ? 'border-primary bg-gradient-to-br from-primary/15 via-accent/5 to-transparent shadow-xl shadow-primary/15'
                  : 'border-border/30 bg-card/30 hover:border-primary/40 hover:bg-card/60 hover:shadow-lg'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {option.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-xs font-semibold text-white shadow-lg">
                  {option.badge}
                </div>
              )}

              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}

              <div className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300',
                isSelected
                  ? 'bg-gradient-to-br from-primary to-accent shadow-lg'
                  : 'bg-muted/50 group-hover:bg-muted'
              )}>
                <Icon className={cn(
                  'w-8 h-8 transition-colors',
                  isSelected ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                )} />
              </div>

              <h3 className="text-lg font-bold mb-2 text-center">{option.title}</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                {option.description}
              </p>

              {isSelected && (
                <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/40 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
