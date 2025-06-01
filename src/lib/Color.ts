export class Color {
    r: number; // range[0,255]
    g: number; // range[0,255]
    b: number; // range[0,255]
    a: number; // range[0,1]

    constructor(r: number, g: number, b: number, a: number = 1.0) {
        this.r = Color.clamp(r, 0, 255);
        this.g = Color.clamp(g, 0, 255);
        this.b = Color.clamp(b, 0, 255);
        this.a = Color.clamp(a, 0, 1);
    }

    private static clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    static fromHex(hex: string): Color {
        hex = hex.replace('#', '');
        let r: number, g: number, b: number, a: number = 1;

        if (hex.length === 3) {
            // #rgb
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            // #rrggbb
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        } else if (hex.length === 8) {
            // #rrggbbaa
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
            a = parseInt(hex.slice(6, 8), 16) / 255;
        } else {
            throw new Error('Invalid hex color format');
        }

        return new Color(r, g, b, a);
    }

    toCssRgba(): string {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    toHex(includeAlpha = true): string {
        const r = this.r.toString(16).padStart(2, '0');
        const g = this.g.toString(16).padStart(2, '0');
        const b = this.b.toString(16).padStart(2, '0');
        const a = Math.round(this.a * 255).toString(16).padStart(2, '0');
        return `#${r}${g}${b}${includeAlpha ? a : ''}`;
    }

    // Convert RGBA to HSV (values in range, h in range [0-360], s, v and a in range [0-1])
    toHsv(): { h: number; s: number; v: number; a: number } {
        const r = this.r / 255;
        const g = this.g / 255;
        const b = this.b / 255;
        const a = this.a;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let h = 0;
        if (delta !== 0) {
            if (max === r) {
                h = 60 * (((g - b) / delta) % 6);
            } else if (max === g) {
                h = 60 * ((b - r) / delta + 2);
            } else if (max === b) {
                h = 60 * ((r - g) / delta + 4);
            }
        }
        if (h < 0) h += 360;

        const s = max === 0 ? 0 : delta / max;
        const v = max;

        return { h, s, v, a };
    }

    // Create a Color from HSV (values in range [0-1] for s, v, and a, and h in [0–360])
    static fromHsv(h: number, s: number, v: number, a: number = 1): Color {
        const c = v * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = v - c;

        let r = 0, g = 0, b = 0;

        if (h >= 0 && h < 60) {
            r = c; g = x; b = 0;
        } else if (h < 120) {
            r = x; g = c; b = 0;
        } else if (h < 180) {
            r = 0; g = c; b = x;
        } else if (h < 240) {
            r = 0; g = x; b = c;
        } else if (h < 300) {
            r = x; g = 0; b = c;
        } else {
            r = c; g = 0; b = x;
        }

        return new Color(
            Math.round((r + m) * 255),
            Math.round((g + m) * 255),
            Math.round((b + m) * 255),
            a
        );
    }

    setAlpha(a: number): Color {
        return new Color(this.r, this.g, this.b, Math.min(Math.max(a, 0), 1));
    }

    equals(other: Color, tolerance = 0): boolean {
        return (
            this.r === other.r &&
            this.g === other.g &&
            this.b === other.b &&
            Math.abs(this.a - other.a) <= tolerance
        );
    }
}
