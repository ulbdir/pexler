import { Color } from './Color';

export const palette: Color[] = $state([
  new Color(139, 0, 0, 1),      // dark red
  new Color(178, 34, 34, 1),    // firebrick red
  new Color(205, 92, 92, 1),    // indian red
  new Color(218, 165, 32, 1),   // goldenrod (yellow-ish)
  new Color(255, 215, 0, 1),    // gold
  new Color(240, 230, 140, 1),  // khaki (yellow)
  new Color(85, 107, 47, 1),    // dark olive green
  new Color(107, 142, 35, 1),   // olive drab (green-yellow)
  new Color(34, 139, 34, 1),    // forest green
  new Color(60, 179, 113, 1),   // medium sea green
  new Color(0, 128, 128, 1),    // teal (cyan-green)
  new Color(64, 224, 208, 1),   // turquoise
  new Color(0, 191, 255, 1),    // deep sky blue
  new Color(30, 144, 255, 1),   // dodger blue
  new Color(65, 105, 225, 1),   // royal blue
  new Color(138, 43, 226, 1),   // blue violet
  new Color(147, 112, 219, 1),  // medium purple
  new Color(186, 85, 211, 1),   // medium orchid
  new Color(199, 21, 133, 1),   // medium violet red
  new Color(219, 112, 147, 1),  // pale violet red
  new Color(255, 105, 180, 1),  // hot pink
  new Color(255, 20, 147, 1),   // deep pink
  new Color(255, 0, 0, 1),      // red (pure)
  new Color(255, 69, 0, 1),     // orange red
  new Color(255, 140, 0, 1),    // dark orange
  new Color(255, 165, 0, 1),    // orange
  new Color(154, 205, 50, 1),   // yellow green
  new Color(0, 100, 0, 1),      // dark green
  new Color(0, 255, 127, 1),    // spring green
  new Color(0, 255, 255, 1),    // cyan
  new Color(70, 130, 180, 1),   // steel blue
  new Color(128, 0, 128, 1),    // purple
]);

const _autoAddColor: { value: boolean } = $state({ value: true });

export function getAutoAddColor(): boolean {
  return _autoAddColor.value;
}

export function toggleAutoAddColor(): void {
  _autoAddColor.value = !_autoAddColor.value;
}

export function hasColor(color: Color): boolean {
  return palette.some(existingColor => existingColor.equals(color));
}

export function addColor(color: Color): void {
  if (!hasColor(color)) {
    palette.push(color);
  }
}

export function clearPalette(): void {
  palette.length = 0;
}

export type SortOrder = 'hue' | 'value' | 'saturation' | 'luminance';

export function sortPalette(order: SortOrder): void {
  palette.sort((a, b) => {
    const hsvA = a.toHsv();
    const hsvB = b.toHsv();

    switch (order) {
      case 'hue':
        if (Math.abs(hsvA.h - hsvB.h) > 0.001) return hsvA.h - hsvB.h;
        if (Math.abs(hsvA.s - hsvB.s) > 0.001) return hsvA.s - hsvB.s;
        return hsvA.v - hsvB.v;

      case 'value':
        if (Math.abs(hsvA.v - hsvB.v) > 0.001) return hsvB.v - hsvA.v;
        if (Math.abs(hsvA.h - hsvB.h) > 0.001) return hsvB.h - hsvA.h;
        return hsvB.s - hsvA.s;

      case 'saturation':
        if (Math.abs(hsvA.s - hsvB.s) > 0.001) return hsvB.s - hsvA.s;
        if (Math.abs(hsvA.v - hsvB.v) > 0.001) return hsvB.v - hsvA.v;
        return hsvA.h - hsvB.h;

      case 'luminance':
        const lumA = 0.299 * a.r + 0.587 * a.g + 0.114 * a.b;
        const lumB = 0.299 * b.r + 0.587 * b.g + 0.114 * b.b;
        return lumB - lumA;

      default:
        return 0;
    }
  });
}

export function generatePaletteFromImage(imageCanvas: HTMLCanvasElement): number {
  const ctx = imageCanvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get canvas context');
    return 0;
  }

  const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
  const data = imageData.data;
  const colorSet = new Set<string>();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 10) continue;

    const key = `${r},${g},${b},${Math.round(a)}`;
    colorSet.add(key);
  }

  const newColors: Color[] = [];
  for (const key of colorSet) {
    const [r, g, b, a] = key.split(',').map(Number);
    newColors.push(new Color(r, g, b, a / 255));
  }

  palette.length = 0;
  palette.push(...newColors);

  console.log(`Generated palette with ${newColors.length} colors from image`);
  return newColors.length;
}

export function loadFromGpl(content: string): boolean {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  if (!lines.length || !lines[0].startsWith('GIMP Palette')) {
    console.error('Invalid GPL file: Missing GIMP Palette header');
    return false;
  }
  
  let hasRGBA = false;
  let startIndex = 1;
  
  for (let i = 1; i < Math.min(5, lines.length); i++) {
    if (lines[i].startsWith('Channels: RGBA')) {
      hasRGBA = true;
      startIndex = i + 1;
      break;
    } else if (lines[i].startsWith('Channels:')) {
      startIndex = i + 1;
      break;
    }
  }
  
  const newColors: Color[] = [];
  let colorCount = 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('#') || !line) continue;
    
    const parts = line.split(/\s+/).filter(part => part);
    if (parts.length < 3) continue;
    
    try {
      const r = Math.max(0, Math.min(255, parseInt(parts[0])));
      const g = Math.max(0, Math.min(255, parseInt(parts[1])));
      const b = Math.max(0, Math.min(255, parseInt(parts[2])));
      
      let a = 1.0;
      if (hasRGBA && parts.length >= 4) {
        a = Math.max(0, Math.min(255, parseInt(parts[3]))) / 255;
      }
      
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        newColors.push(new Color(r, g, b, a));
        colorCount++;
      }
    } catch (error) {
      console.warn(`Failed to parse line ${i + 1}: "${line}"`, error);
    }
  }
  
  if (colorCount === 0) {
    console.error('No valid colors found in GPL file');
    return false;
  }
  
  palette.length = 0;
  palette.push(...newColors);
  
  console.log(`Loaded ${colorCount} colors from GPL file`);
  return true;
}
