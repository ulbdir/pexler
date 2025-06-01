import { Color } from "./Color"

export class Image {

    pixels: Color[][] | undefined = undefined;
    width: number = 0;
    height: number = 0;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.pixels = Array.from({ length: height }, () =>
            Array.from({ length: width }, () => new Color(0, 0, 0, 0))
        );
    }

    getPixel(x: number, y: number): Color | undefined {
        if (this.pixels !== undefined && x>= 0 && x<this.width && y>=0 && y<this.height) {
            return this.pixels[y][x];
        }
        return undefined;
    }

    setPixel(x: number, y: number, color: Color): void {
        if (this.pixels !== undefined && x>= 0 && x<this.width && y>=0 && y<this.height) {
            this.pixels[y][x] = color;
        }
    }
}
