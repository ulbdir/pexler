export interface Tool {
    onActivate(): void;
    onDeactivate(): void;

    // called when a mouse button is pressed on the canvas
    onStartMove(x: number, y: number): void;
    
    // called when the mouse moves on the canvas while a mouse button is pressed
    onMove(x: number, y: number): void;

    // called when the mouse button is released
    onEndMove(x: number, y: number): void;

    /**
     * called when the mouse moves over the canvas without any button pressed
     * 
     * return true to indicate that a redraw of the canvas is needed
     */
    onHover(x: number, y: number): boolean;

    // draw any temporary tool guides on the canvas
    draw(ctx: CanvasRenderingContext2D, pixelSize: number);
}
