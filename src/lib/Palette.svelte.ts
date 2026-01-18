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

export function hasColor(color: Color): boolean {
  return palette.some(existingColor => existingColor.equals(color));
}

export function addColor(color: Color): void {
  if (!hasColor(color)) {
    palette.push(color);
  }
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

export function saveToGpl(): string {
  let content = "GIMP Palette\n";
  content += "Channels: RGBA\n";
  content += "Name: Pexler Palette\n";
  content += "#\n";
  
  palette.forEach((color, index) => {
    const r = Math.round(color.r);
    const g = Math.round(color.g);
    const b = Math.round(color.b);
    const a = Math.round(color.a * 255);
    const name = `Color ${index + 1}`;
    content += `${r.toString().padStart(3)} ${g.toString().padStart(3)} ${b.toString().padStart(3)} ${a.toString().padStart(3)} ${name}\n`;
  });
  
  return content;
}

export function loadFromGpl(content: string): boolean {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  // Check header
  if (!lines.length || !lines[0].startsWith('GIMP Palette')) {
    console.error('Invalid GPL file: Missing GIMP Palette header');
    return false;
  }
  
  let hasRGBA = false;
  let startIndex = 1;
  
  // Check for RGBA channels
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
    
    // Skip comments and empty lines
    if (line.startsWith('#') || !line) continue;
    
    // Parse color line: r g b [a] [name]
    const parts = line.split(/\s+/).filter(part => part);
    if (parts.length < 3) continue;
    
    try {
      const r = Math.max(0, Math.min(255, parseInt(parts[0])));
      const g = Math.max(0, Math.min(255, parseInt(parts[1])));
      const b = Math.max(0, Math.min(255, parseInt(parts[2])));
      
      let a = 1.0; // Default alpha
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
  
  // Replace palette with loaded colors
  palette.length = 0;
  palette.push(...newColors);
  
  console.log(`Loaded ${colorCount} colors from GPL file`);
  return true;
}

export function triggerDownload(content: string, filename: string = "palette.gpl"): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}
