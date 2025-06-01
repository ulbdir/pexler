import type { Tool } from "./Tool";
import { Color } from "./Color";
import { editorState } from "./EditorState.svelte";

export class EraserTool implements Tool {

    hoverX: number = 0;
    hoverY: number = 0;
    hoverColor = "rgba(160,120,120, 0.5)";
    eraserColor = "rgba(0, 0, 0, 0)";

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
        ctx.clearRect(Math.floor(x), Math.floor(y), 1, 1);
    }

    onEndMove(x: number, y: number): void {

    }

    onHover(x: number, y: number): boolean {
        this.hoverX = Math.floor(x);
        this.hoverY = Math.floor(y);
        return true;
    }

    draw(ctx: CanvasRenderingContext2D, pixelSize) {
        ctx.fillStyle = this.hoverColor;
        ctx.fillRect(
            this.hoverX * pixelSize,
            this.hoverY * pixelSize,
            pixelSize,
            pixelSize,
        );
    }

}