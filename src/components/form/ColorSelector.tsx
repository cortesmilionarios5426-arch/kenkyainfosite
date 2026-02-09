import { useState, useRef, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette, Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorSelectorProps {
  value: string;
  onChange: (value: string) => void;
  logoUrl: string | null;
}

interface SelectedColor {
  hex: string;
}

// Get dominant colors using k-means-like sampling
function extractDominantColors(imageData: ImageData, count: number): string[] {
  const pixels: number[][] = [];
  const data = imageData.data;

  // Sample every 4th pixel for performance
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent/near-white/near-black pixels
    if (a < 128) continue;
    const brightness = (r + g + b) / 3;
    if (brightness > 245 || brightness < 10) continue;

    pixels.push([r, g, b]);
  }

  if (pixels.length === 0) return [];

  // Simple color bucketing
  const buckets = new Map<string, { sum: number[]; count: number }>();

  pixels.forEach(([r, g, b]) => {
    // Round to nearest 32 to create buckets
    const key = `${Math.round(r / 32) * 32},${Math.round(g / 32) * 32},${Math.round(b / 32) * 32}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.sum[0] += r;
      existing.sum[1] += g;
      existing.sum[2] += b;
      existing.count++;
    } else {
      buckets.set(key, { sum: [r, g, b], count: 1 });
    }
  });

  // Sort by frequency and pick top colors
  const sorted = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, count);

  return sorted.map(({ sum, count: c }) => {
    const r = Math.round(sum[0] / c);
    const g = Math.round(sum[1] / c);
    const b = Math.round(sum[2] / c);
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  });
}

export function ColorSelector({ value, onChange, logoUrl }: ColorSelectorProps) {
  const [colorMode, setColorMode] = useState<'extract' | 'manual'>('manual');
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const colorInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);

  // Parse existing colors on mount only
  useEffect(() => {
    if (value) {
      const colors = value.split(',').map(c => c.trim()).filter(Boolean);
      setSelectedColors(colors.slice(0, 3).map(hex => ({ hex })));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const syncToForm = useCallback((colors: SelectedColor[]) => {
    onChange(colors.map(c => c.hex).join(', '));
  }, [onChange]);

  // Extract colors from logo with better algorithm
  const extractColorsFromLogo = useCallback(async () => {
    if (!logoUrl) return;

    setIsExtracting(true);

    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject('No canvas context'); return; }

          // Scale down for performance
          const maxSize = 150;
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          canvas.width = Math.floor(img.width * scale);
          canvas.height = Math.floor(img.height * scale);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const colors = extractDominantColors(imageData, 3);

          if (colors.length > 0) {
            const newColors = colors.map(hex => ({ hex }));
            setSelectedColors(newColors);
            syncToForm(newColors);
          }
          resolve();
        };
        img.onerror = () => reject('Failed to load image');
        img.src = logoUrl;
      });
    } catch (err) {
      console.error('Erro ao extrair cores:', err);
    } finally {
      setIsExtracting(false);
    }
  }, [logoUrl, syncToForm]);

  const addColor = (hex: string, index: number) => {
    const newColors = [...selectedColors];
    if (index < newColors.length) {
      newColors[index] = { hex };
    } else {
      newColors.push({ hex });
    }
    const sliced = newColors.slice(0, 3);
    setSelectedColors(sliced);
    syncToForm(sliced);
  };

  const removeColor = (index: number) => {
    const newColors = selectedColors.filter((_, i) => i !== index);
    setSelectedColors(newColors);
    syncToForm(newColors);
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
            if (logoUrl) extractColorsFromLogo();
          }}
          disabled={!logoUrl || isExtracting}
          className="flex items-center gap-2"
        >
          {isExtracting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{isExtracting ? 'Extraindo...' : 'Extrair da logo'}</span>
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
        {/* Existing color slots */}
        {[0, 1, 2].map((index) => {
          const color = selectedColors[index];

          if (color) {
            return (
              <div key={index} className="relative group">
                <button
                  type="button"
                  onClick={() => openColorPicker(index)}
                  className="w-14 h-14 rounded-xl border-2 border-border shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer"
                  style={{ backgroundColor: color.hex }}
                  title={`Clique para editar: ${color.hex}`}
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeColor(index); }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <input
                  ref={el => { colorInputRefs.current[index] = el; }}
                  type="color"
                  value={color.hex}
                  onChange={(e) => addColor(e.target.value, index)}
                  className="sr-only"
                />
                <span className="block text-center text-[10px] text-muted-foreground mt-1 font-mono">
                  {color.hex}
                </span>
              </div>
            );
          }

          // Empty slot = add button
          return (
            <div key={index} className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => openColorPicker(index)}
                className={cn(
                  'w-14 h-14 rounded-xl border-2 border-dashed border-border',
                  'flex items-center justify-center transition-all duration-200',
                  'hover:border-primary hover:bg-primary/5 hover:scale-105'
                )}
                title="Adicionar cor"
              >
                <Plus className="w-5 h-5 text-muted-foreground" />
              </button>
              <input
                ref={el => { colorInputRefs.current[index] = el; }}
                type="color"
                defaultValue={['#6366f1', '#ec4899', '#10b981'][index]}
                onChange={(e) => addColor(e.target.value, index)}
                className="sr-only"
              />
              <span className="text-[10px] text-muted-foreground mt-1">
                Cor {index + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status text */}
      <p className="text-xs text-muted-foreground">
        {selectedColors.length === 0
          ? 'Clique nos slots acima para adicionar suas cores'
          : `${selectedColors.length}/3 cores selecionadas • Clique na cor para editar, ou no X para remover`}
      </p>
    </div>
  );
}
