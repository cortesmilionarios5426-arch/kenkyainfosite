import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, Phone, Building2, PhoneCall } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WhatsAppEntry {
  sector: string;
  number: string;
}

interface WhatsAppMultiInputProps {
  value: string;
  onChange: (value: string) => void;
  landlineValue?: string;
  onLandlineChange?: (value: string) => void;
}

const parseEntries = (value: string): WhatsAppEntry[] => {
  if (!value) return [{ sector: '', number: '' }];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    if (value.trim()) return [{ sector: 'Principal', number: value.trim() }];
  }
  return [{ sector: '', number: '' }];
};

export function WhatsAppMultiInput({ value, onChange, landlineValue, onLandlineChange }: WhatsAppMultiInputProps) {
  const [entries, setEntries] = useState<WhatsAppEntry[]>(parseEntries(value));
  const [showLandline, setShowLandline] = useState(!!landlineValue);

  const updateEntries = (newEntries: WhatsAppEntry[]) => {
    setEntries(newEntries);
    const filtered = newEntries.filter(e => e.number.trim());
    if (filtered.length === 0) {
      onChange('');
    } else if (filtered.length === 1 && !filtered[0].sector.trim()) {
      onChange(filtered[0].number);
    } else {
      onChange(JSON.stringify(filtered));
    }
  };

  const updateEntry = (index: number, field: keyof WhatsAppEntry, val: string) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: val };
    updateEntries(newEntries);
  };

  const addEntry = () => {
    if (entries.length >= 5) return;
    updateEntries([...entries, { sector: '', number: '' }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length <= 1) return;
    updateEntries(entries.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium flex items-center gap-2">
        <Phone className="w-4 h-4 text-primary" />
        Telefones do escritório
      </Label>
      <p className="text-sm text-muted-foreground">
        Adicione os números de WhatsApp. Se tiver mais de um setor, identifique cada um.
      </p>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={index}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border border-border/40 bg-card/30 animate-slide-up',
              'transition-all duration-200'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input
                  value={entry.sector}
                  onChange={(e) => updateEntry(index, 'sector', e.target.value)}
                  placeholder={index === 0 ? 'EXEMPLO: Comercial' : 'EXEMPLO: Financeiro'}
                  className="form-input-animated h-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input
                  value={entry.number}
                  onChange={(e) => updateEntry(index, 'number', e.target.value)}
                  placeholder="EXEMPLO: (11) 99999-9999"
                  className="form-input-animated h-9 text-sm"
                />
              </div>
            </div>

            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(index)}
                className="mt-1 w-7 h-7 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {entries.length < 5 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEntry}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar outro WhatsApp
          </Button>
        )}

        {onLandlineChange && !showLandline && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowLandline(true)}
            className="flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            Adicionar telefone fixo
          </Button>
        )}
      </div>

      {/* Telefone fixo */}
      {showLandline && onLandlineChange && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-border/40 bg-card/30 animate-slide-up">
          <div className="flex-1 space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <PhoneCall className="w-4 h-4" />
              Telefone fixo (opcional)
            </Label>
            <Input
              value={landlineValue || ''}
              onChange={(e) => onLandlineChange(e.target.value)}
              placeholder="EXEMPLO: (11) 3456-7890"
              className="form-input-animated h-9 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => { setShowLandline(false); onLandlineChange(''); }}
            className="mt-6 w-7 h-7 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {entries.length}/5 WhatsApp • Identifique o setor para facilitar o direcionamento
      </p>
    </div>
  );
}
