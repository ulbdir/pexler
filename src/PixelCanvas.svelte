<script lang="ts">
    import type { Color } from "./lib/Color";
    import { editorState } from "./lib/EditorState.svelte";

    let {
        grid = true,
        gridColor = "#cccccc",
        backgroundColor = "#ffffff",
        pixels,
    } = $props<{
        grid?: boolean;
        gridColor?: Color;
        backgroundColor?: Color;
        pixels: HTMLCanvasElement;
    }>();

    let pixelSize: number = $state(20);

    let canvasWidth = $derived(pixels.width * pixelSize);
    let canvasHeight = $derived(pixels.height * pixelSize);

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let isDrawing: boolean = false;
    let lastX: number = 0;
    let lastY: number = 0;

    let isHovering = $state(true);

    let offset = $state({ x: 0, y: 0 });
    let isPanning = false;

    $effect(() => {
        ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        draw();
    });

    $effect(() => {
        if (
            ctx &&
            (pixels.width ||
                pixels.height ||
                pixelSize ||
                grid ||
                gridColor ||
                backgroundColor ||
                pixels ||
                isHovering ||
                isDrawing)
        ) {
            draw();
        }
    });

    $effect(()=>{
        if(pixels) {
            pixelSize = 20;
            offset.x = 0;
            offset.y = 0;
        }
    })

    function draw() {
        if (!ctx) return;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(pixels, 0, 0, pixels.width, pixels.height, 0, 0, canvasWidth, canvasHeight);

        // Hover-Effekt zeichnen
        if (isHovering) {
            const tool = editorState.tool;
            if (tool !== undefined) {
                tool.draw(ctx, pixelSize);
            }
        }

        // Grid zeichnen
        if (grid && pixelSize > 8) {
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;

            // Vertikale Linien
            for (let x = 0; x <= pixels.width; x++) {
                ctx.beginPath();
                ctx.moveTo(x * pixelSize, 0);
                ctx.lineTo(x * pixelSize, canvasHeight);
                ctx.stroke();
            }

            // Horizontale Linien
            for (let y = 0; y <= pixels.height; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * pixelSize);
                ctx.lineTo(canvasWidth, y * pixelSize);
                ctx.stroke();
            }
        }
    }

    // Hilfsfunktion, um Mausposition in Grid-Koordinaten umzuwandeln
    function getPixelCoordinates(event) {
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / pixelSize;
        const y = (event.clientY - rect.top) / pixelSize;
        return { x, y };
    }

    // Maus-Event-Handler
    function handleMouseDown(event) {
        if (event.button === 1) {
            isPanning = true;
            lastX = event.clientX;
            lastY = event.clientY;
            event.preventDefault();
            return;
        }

        isDrawing = true;
        isHovering = false;
        const { x, y } = getPixelCoordinates(event);

        const tool = editorState.tool;
        if (tool !== undefined) {
            tool.onStartMove(x, y);
            tool.onMove(x, y);
        }
    }

    function handleMouseMove(event) {
        if (isPanning) {
            const dx = event.clientX - lastX;
            const dy = event.clientY - lastY;
            offset.x += dx;
            offset.y += dy;
            lastX = event.clientX;
            lastY = event.clientY;
            return;
        }

        const { x, y } = getPixelCoordinates(event);

        const tool = editorState.tool;
        if (tool === undefined) return;

        if (isDrawing) {
            tool.onMove(x, y);
            draw();
        } else {
            const redraw = tool.onHover(x, y);
            if (redraw) draw();
        }
    }

    function handleMouseUp(event) {
        isPanning = false;

        if (isDrawing) {
            isDrawing = false;
            isHovering = true;
            const tool = editorState.tool;
            if (tool !== undefined) {
                const { x, y } = getPixelCoordinates(event);
                tool.onEndMove(x, y);
                tool.onHover(x, y);
            }
        }
    }

    function handleMouseLeave() {
        isDrawing = false;
        isHovering = false;
    }

    function handleMouseEnter() {
        isHovering = true;
    }

    // Zoom-Funktionalität mit Mausrad
    function handleWheel(event) {
        event.preventDefault();

        // Zoom-Richtung bestimmen
        const zoomDirection = event.deltaY < 0 ? 1 : -1;

        // Zoom-Faktor
        const zoomFactor = 1.1;

        // Neue Pixelgröße berechnen
        let newPixelSize = pixelSize;

        if (zoomDirection > 0) {
            newPixelSize = pixelSize * zoomFactor;
        } else {
            newPixelSize = pixelSize / zoomFactor;
        }

        pixelSize = newPixelSize;
    }
</script>

<canvas
    bind:this={canvas}
    width={canvasWidth}
    height={canvasHeight}
    style="transform: translate({offset.x}px, {offset.y}px);"
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    onwheel={handleWheel}
></canvas>

<style>
    canvas {
        cursor: crosshair;
    }
</style>
