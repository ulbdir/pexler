import type { Tool } from "./Tool";
import { editorState } from "./EditorState.svelte";
import { addColor, getAutoAddColor } from "./Palette.svelte";

export class DrawTool implements Tool {

    hoverX: number = 0;
    hoverY: number = 0;
    hoverColor = "rgba(120,160,120, 0.5)";

    onActivate(): void {
        // empty
    }
    onDeactivate(): void {
        // empty
    }

    onStartMove(x: number, y: number): void {

    }

    onMove(x: number, y: number): void {
        const ctx = editorState.image.getContext("2d");
        if (ctx) {
            ctx.clearRect(Math.floor(x), Math.floor(y), 1, 1);
            ctx.fillStyle = editorState.drawingColor.toCssRgba();
            ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
        }
    }

    onEndMove(x: number, y: number): void {
        if (getAutoAddColor()) {
            addColor(editorState.drawingColor);
        }
    }

    onHover(x: number, y: number): boolean {
        this.hoverX = Math.floor(x);
        this.hoverY = Math.floor(y);
        return true;
    }

    draw(ctx: CanvasRenderingContext2D, pixelSize) {
        ctx.fillStyle = editorState.drawingColor.setAlpha(0.3).toCssRgba();
        ctx.fillRect(
            this.hoverX * pixelSize,
            this.hoverY * pixelSize,
            pixelSize,
            pixelSize,
        );

    }

}