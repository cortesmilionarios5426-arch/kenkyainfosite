import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette, Plus, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorSelectorProps {
  value: string;
  onChange: (value: string) => void;
  logoUrl: string | null;
}

interface SelectedColor {
  hex: string;
  name: string;
}

export function ColorSelector({ value, onChange, logoUrl }: ColorSelectorProps) {
  const [colorMode, setColorMode] = useState<'extract' | 'manual'>('manual');
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>([]);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const colorInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);

  // Parse existing colors on mount
  useEffect(() => {
    if (value) {
      const colors = value.split(',').map(c => c.trim()).filter(Boolean);
      const parsed = colors.map(c => ({ hex: c, name: c }));
      setSelectedColors(parsed.slice(0, 3));
    }
  }, []);

  // Extract colors from logo (simple extraction simulation)
  const extractColorsFromLogo = async () => {
    if (!logoUrl) return;
    
    // Create canvas to extract colors
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Sample colors from different parts of the image
      const colors: string[] = [];
      const samplePoints = [
        { x: img.width / 4, y: img.height / 4 },
        { x: img.width / 2, y: img.height / 2 },
        { x: (img.width * 3) / 4, y: (img.height * 3) / 4 },
      ];

      samplePoints.forEach(point => {
        const data = ctx.getImageData(point.x, point.y, 1, 1).data;
        const hex = `#${[data[0], data[1], data[2]].map(x => x.toString(16).padStart(2, '0')).join('')}`;
        if (!colors.includes(hex)) colors.push(hex);
      });

      setExtractedColors(colors);
      const newColors = colors.map(hex => ({ hex, name: hex }));
      setSelectedColors(newColors);
      onChange(colors.join(', '));
    };
    img.src = logoUrl;
  };

  const addColor = (hex: string, index: number) => {
    const newColors = [...selectedColors];
    if (index < newColors.length) {
      newColors[index] = { hex, name: hex };
    } else {
      newColors.push({ hex, name: hex });
    }
    setSelectedColors(newColors.slice(0, 3));
    onChange(newColors.slice(0, 3).map(c => c.hex).join(', '));
  };

  const removeColor = (index: number) => {
    const newColors = selectedColors.filter((_, i) => i !== index);
    setSelectedColors(newColors);
    onChange(newColors.map(c => c.hex).join(', '));
  };

  const openColorPicker = (index: number) => {
    colorInputRefs.current[index]?.click();
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium flex items-center gap-2">
        <Palette className="w-4 h-4 text-primary" />
        Cores do seu negócio
      </Label>
      <p className="text-sm text-muted-foreground">
        Escolha até 3 cores ou extraia da sua logo (após enviar)
      </p>

      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={colorMode === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setColorMode('manual')}
          className="flex items-center gap-2"
        >
          <Palette className="w-4 h-4" />
          <span>Escolher cores</span>
        </Button>
        
        <Button
          type="button"
          variant={colorMode === 'extract' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setColorMode('extract');
            if (logoUrl) {
              extractColorsFromLogo();
            }
          }}
          disabled={!logoUrl}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Extrair da logo</span>
        </Button>
      </div>

      {/* Hint when no logo */}
      {!logoUrl && colorMode === 'extract' && (
        <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
          Envie sua logo na etapa anterior para extrair as cores automaticamente
        </p>
      )}

      {/* Color display and picker */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Selected colors */}
        {selectedColors.map((color, index) => (
          <div key={index} className="relative group">
            <button
              type="button"
              onClick={() => openColorPicker(index)}
              className="w-12 h-12 rounded-xl border-2 border-border shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg"
              style={{ backgroundColor: color.hex }}
              title={`Cor ${index + 1}: ${color.hex}`}
            />
            <button
              type="button"
              onClick={() => removeColor(index)}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
            <input
              ref={el => colorInputRefs.current[index] = el}
              type="color"
              value={color.hex}
              onChange={(e) => addColor(e.target.value, index)}
              className="sr-only"
            />
          </div>
        ))}

        {/* Add color button */}
        {selectedColors.length < 3 && colorMode === 'manual' && (
          <button
            type="button"
            onClick={() => openColorPicker(selectedColors.length)}
            className={cn(
              'w-12 h-12 rounded-xl border-2 border-dashed border-border',
              'flex items-center justify-center transition-all duration-200',
              'hover:border-primary hover:bg-primary/5 hover:scale-105'
            )}
          >
            <Plus className="w-5 h-5 text-muted-foreground" />
            <input
              ref={el => colorInputRefs.current[selectedColors.length] = el}
              type="color"
              defaultValue="#6366f1"
              onChange={(e) => addColor(e.target.value, selectedColors.length)}
              className="sr-only"
            />
          </button>
        )}
      </div>

      {/* Help text */}
      {selectedColors.length === 0 && colorMode === 'manual' && (
        <p className="text-xs text-muted-foreground">
          Clique em "+" para adicionar uma cor
        </p>
      )}
      
      {selectedColors.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedColors.length}/3 cores • Clique para alterar
        </p>
      )}
    </div>
  );
}
