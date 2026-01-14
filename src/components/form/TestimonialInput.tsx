import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, X, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Testimonial {
  name: string;
  text: string;
}

interface TestimonialInputProps {
  testimonials: Testimonial[];
  onChange: (testimonials: Testimonial[]) => void;
  maxTestimonials?: number;
}

export function TestimonialInput({ 
  testimonials, 
  onChange, 
  maxTestimonials = 4 
}: TestimonialInputProps) {
  const [newName, setNewName] = useState('');
  const [newText, setNewText] = useState('');

  const addTestimonial = () => {
    if (newName.trim() && newText.trim() && testimonials.length < maxTestimonials) {
      onChange([...testimonials, { name: newName.trim(), text: newText.trim() }]);
      setNewName('');
      setNewText('');
    }
  };

  const removeTestimonial = (index: number) => {
    onChange(testimonials.filter((_, i) => i !== index));
  };

  const canAddMore = testimonials.length < maxTestimonials;

  return (
    <div className="space-y-4">
      {/* Existing testimonials */}
      {testimonials.length > 0 && (
        <div className="space-y-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-4 rounded-xl bg-secondary/50 border border-border/50 animate-scale-in"
            >
              <button
                type="button"
                onClick={() => removeTestimonial(index)}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex gap-3">
                <Quote className="w-5 h-5 text-primary/50 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-sm text-foreground mb-2 italic">"{testimonial.text}"</p>
                  <p className="text-xs font-medium text-primary">— {testimonial.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new testimonial */}
      {canAddMore ? (
        <div className="p-4 rounded-xl border-2 border-dashed border-border bg-card/30 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground">
              Adicionar depoimento ({testimonials.length}/{maxTestimonials})
            </Label>
          </div>
          
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do cliente (ex: Maria Silva)"
            className="form-input-animated"
          />
          
          <Textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="O que o cliente disse sobre você? (ex: Excelente profissional, superou minhas expectativas!)"
            className="form-input-animated min-h-[80px] resize-none"
            rows={3}
          />
          
          <Button
            type="button"
            onClick={addTestimonial}
            disabled={!newName.trim() || !newText.trim()}
            variant="secondary"
            className={cn(
              'w-full transition-all duration-300',
              newName.trim() && newText.trim() && 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar depoimento
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          ✓ Máximo de {maxTestimonials} depoimentos adicionados
        </p>
      )}
    </div>
  );
}
