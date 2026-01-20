import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { Palette, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BrandingPdfGeneratorProps {
  businessName: string;
  businessColors: string;
  logoUrl?: string | null;
}

interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

// Convert HEX to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Convert RGB to HEX
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// Generate color info from hex
function getColorInfo(hex: string): ColorInfo {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return { hex: hex.trim().toUpperCase(), rgb, hsl };
}

// Generate variation 2: Complementary / Analogous palette shift
function generateVariation2(colors: ColorInfo[]): ColorInfo[] {
  return colors.map((color) => {
    const newH = (color.hsl.h + 30) % 360; // Shift hue by 30 degrees (analogous)
    const newS = Math.min(100, color.hsl.s + 10);
    const newL = color.hsl.l;
    const rgb = hslToRgb(newH, newS, newL);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    return getColorInfo(hex);
  });
}

// Generate variation 3: Softer / Muted palette
function generateVariation3(colors: ColorInfo[]): ColorInfo[] {
  return colors.map((color) => {
    const newS = Math.max(20, color.hsl.s - 25);
    const newL = Math.min(85, color.hsl.l + 15);
    const rgb = hslToRgb(color.hsl.h, newS, newL);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    return getColorInfo(hex);
  });
}

// Draw a color swatch with info
function drawColorSwatch(
  doc: jsPDF,
  x: number,
  y: number,
  color: ColorInfo,
  swatchSize: number = 25
) {
  // Draw swatch
  doc.setFillColor(color.rgb.r, color.rgb.g, color.rgb.b);
  doc.roundedRect(x, y, swatchSize, swatchSize, 3, 3, 'F');

  // Draw border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, swatchSize, swatchSize, 3, 3, 'S');

  // Color codes
  const textX = x + swatchSize + 5;
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text(color.hex, textX, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(`RGB: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`, textX, y + 12);
  doc.text(`HSL: ${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%`, textX, y + 18);
}

// Draw a palette section
function drawPaletteSection(
  doc: jsPDF,
  title: string,
  subtitle: string,
  colors: ColorInfo[],
  startY: number,
  pageWidth: number
): number {
  const marginLeft = 25;
  const swatchSize = 28;
  const swatchSpacing = 70;

  // Section title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(title, marginLeft, startY);

  // Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(subtitle, marginLeft, startY + 7);

  // Draw divider line
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, startY + 12, pageWidth - marginLeft, startY + 12);

  // Draw swatches
  let currentX = marginLeft;
  const swatchY = startY + 20;

  colors.forEach((color) => {
    drawColorSwatch(doc, currentX, swatchY, color, swatchSize);
    currentX += swatchSpacing;
  });

  // Color harmony bar
  const barY = swatchY + swatchSize + 12;
  const barHeight = 8;
  const barWidth = (pageWidth - marginLeft * 2) / colors.length;

  colors.forEach((color, index) => {
    doc.setFillColor(color.rgb.r, color.rgb.g, color.rgb.b);
    if (index === 0) {
      doc.roundedRect(marginLeft + index * barWidth, barY, barWidth, barHeight, 2, 0, 'F');
    } else if (index === colors.length - 1) {
      doc.roundedRect(marginLeft + index * barWidth, barY, barWidth, barHeight, 0, 2, 'F');
    } else {
      doc.rect(marginLeft + index * barWidth, barY, barWidth, barHeight, 'F');
    }
  });

  return barY + barHeight + 20;
}

export function BrandingPdfGenerator({
  businessName,
  businessColors,
  logoUrl,
}: BrandingPdfGeneratorProps) {
  const { toast } = useToast();

  const generatePdf = async () => {
    try {
      const colors = businessColors.split(',').map((c) => getColorInfo(c.trim()));
      
      if (colors.length === 0) {
        toast({
          title: 'Nenhuma cor encontrada',
          description: 'Este cliente não definiu cores de marca.',
          variant: 'destructive',
        });
        return;
      }

      const variation2 = generateVariation2(colors);
      const variation3 = generateVariation3(colors);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginLeft = 25;

      // Background
      doc.setFillColor(252, 252, 253);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Header section
      let currentY = 25;

      // Brand name
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 25, 25);
      doc.text(businessName.toUpperCase(), marginLeft, currentY);

      currentY += 10;

      // Document title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('GUIA DE CORES DA MARCA', marginLeft, currentY);

      currentY += 5;

      // Header divider
      doc.setDrawColor(colors[0].rgb.r, colors[0].rgb.g, colors[0].rgb.b);
      doc.setLineWidth(2);
      doc.line(marginLeft, currentY, marginLeft + 50, currentY);

      currentY += 20;

      // Load logo if available
      if (logoUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = logoUrl;
          });

          const maxLogoWidth = 40;
          const maxLogoHeight = 40;
          const aspectRatio = img.width / img.height;
          let logoWidth = maxLogoWidth;
          let logoHeight = maxLogoWidth / aspectRatio;

          if (logoHeight > maxLogoHeight) {
            logoHeight = maxLogoHeight;
            logoWidth = maxLogoHeight * aspectRatio;
          }

          doc.addImage(img, 'PNG', pageWidth - marginLeft - logoWidth, 15, logoWidth, logoHeight);
        } catch (error) {
          console.log('Could not load logo:', error);
        }
      }

      // Date
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
        marginLeft,
        currentY - 5
      );

      // Palette 1: Original
      currentY = drawPaletteSection(
        doc,
        'PALETA PRINCIPAL',
        'Cores originais definidas pelo cliente',
        colors,
        currentY,
        pageWidth
      );

      // Palette 2: Variation (Analogous shift)
      currentY = drawPaletteSection(
        doc,
        'VARIAÇÃO VIBRANTE',
        'Tons análogos com saturação elevada',
        variation2,
        currentY,
        pageWidth
      );

      // Palette 3: Variation (Softer)
      currentY = drawPaletteSection(
        doc,
        'VARIAÇÃO SUAVE',
        'Tons dessaturados e mais claros',
        variation3,
        currentY,
        pageWidth
      );

      // Usage recommendations section
      currentY += 5;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text('RECOMENDAÇÕES DE USO', marginLeft, currentY);

      currentY += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);

      const recommendations = [
        '• Paleta Principal: Identidade visual primária, logotipos, headers',
        '• Variação Vibrante: CTAs, destaques, elementos de ação',
        '• Variação Suave: Backgrounds, cards, elementos secundários',
      ];

      recommendations.forEach((rec) => {
        doc.text(rec, marginLeft, currentY);
        currentY += 6;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text('Documento gerado automaticamente • Kenkya Sites', pageWidth / 2, pageHeight - 15, {
        align: 'center',
      });

      // Save PDF
      const fileName = `branding-${businessName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      doc.save(fileName);

      toast({
        title: 'PDF gerado com sucesso!',
        description: `Arquivo "${fileName}" baixado.`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={generatePdf}>
      <Palette className="w-4 h-4 mr-2" />
      PDF Branding
    </Button>
  );
}
