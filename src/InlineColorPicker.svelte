<script lang="ts">
    import { Color } from "./lib/Color";

    let { color, onColorChanged }: { color: Color; onColorChanged: (color: Color) => void } = $props();

    let boxCanvas: HTMLCanvasElement;
    let sliderCanvas: HTMLCanvasElement;
    let boxCtx: CanvasRenderingContext2D;
    let sliderCtx: CanvasRenderingContext2D;

    let hue: number = $derived(color.toHsv().h);
    let saturation: number = $derived(color.toHsv().s);
    let value: number = $derived(color.toHsv().v);
    let alpha: number = $derived(color.toHsv().a);

    const boxWidth = 200;
    const boxHeight = 120;
    const sliderHeight = 24;
    const sliderWidth = 200;

    function drawBox() {
        if (!boxCtx) return;
        const image = boxCtx.createImageData(boxWidth, boxHeight);
        const data = image.data;

        for (let y = 0; y < boxHeight; y++) {
            const selectedSaturation = y / boxHeight;
            for (let x = 0; x < boxWidth; x++) {
                const selectedValue = x / boxWidth;
                const pixelColor = Color.fromHsv(hue, selectedSaturation, selectedValue, 1);
                const i = (y * boxWidth + x) * 4;
                data[i] = pixelColor.r;
                data[i + 1] = pixelColor.g;
                data[i + 2] = pixelColor.b;
                data[i + 3] = 255;
            }
        }

        boxCtx.putImageData(image, 0, 0);
        drawBoxHandle();
    }

    function drawBoxHandle() {
        const x = value * boxWidth;
        const y = saturation * boxHeight;
        const borderColor = getComputedStyle(boxCanvas).borderColor;

        boxCtx.beginPath();
        boxCtx.arc(x, y, 6, 0, 2 * Math.PI);
        boxCtx.strokeStyle = "white";
        boxCtx.lineWidth = 2;
        boxCtx.stroke();

        boxCtx.beginPath();
        boxCtx.arc(x, y, 6, 0, 2 * Math.PI);
        boxCtx.strokeStyle = borderColor;
        boxCtx.lineWidth = 2;
        boxCtx.stroke();
    }

    function drawSlider() {
        if (!sliderCtx) return;
        const gradient = sliderCtx.createLinearGradient(0, 0, sliderWidth, 0);
        for (let i = 0; i <= 360; i += 10) {
            const c = Color.fromHsv(i, 1, 1);
            gradient.addColorStop(i / 360, c.toCssRgba());
        }
        sliderCtx.fillStyle = gradient;
        sliderCtx.fillRect(0, 0, sliderWidth, sliderHeight);

        const handleX = (hue / 360) * sliderWidth;
        const borderColor = getComputedStyle(sliderCanvas).borderColor;

        sliderCtx.beginPath();
        sliderCtx.moveTo(handleX, 0);
        sliderCtx.lineTo(handleX, sliderHeight);
        sliderCtx.strokeStyle = "white";
        sliderCtx.lineWidth = 3;
        sliderCtx.stroke();

        sliderCtx.beginPath();
        sliderCtx.moveTo(handleX, 0);
        sliderCtx.lineTo(handleX, sliderHeight);
        sliderCtx.strokeStyle = borderColor;
        sliderCtx.lineWidth = 1;
        sliderCtx.stroke();
    }

    function updateFromBox(event: MouseEvent) {
        const rect = boxCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const newValue = Math.max(0, Math.min(1, x / rect.width));
        const newSaturation = Math.max(0, Math.min(1, y / rect.height));

        onColorChanged(Color.fromHsv(hue, newSaturation, newValue, alpha));
    }

    function updateFromSlider(event: MouseEvent) {
        const rect = sliderCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const newHue = (x / rect.width) * 360;
        const clampedHue = Math.max(0, Math.min(360, newHue));

        onColorChanged(Color.fromHsv(clampedHue, saturation, value, alpha));
    }

    let isDraggingBox = $state(false);
    let isDraggingSlider = $state(false);

    function handleBoxDown(event: MouseEvent) {
        isDraggingBox = true;
        updateFromBox(event);
    }

    function handleSliderDown(event: MouseEvent) {
        isDraggingSlider = true;
        updateFromSlider(event);
    }

    function handleMouseMove(event: MouseEvent) {
        if (isDraggingBox) {
            updateFromBox(event);
        }
        if (isDraggingSlider) {
            updateFromSlider(event);
        }
    }

    function handleMouseUp() {
        isDraggingBox = false;
        isDraggingSlider = false;
    }

    $effect(() => {
        boxCtx = boxCanvas.getContext("2d")!;
        sliderCtx = sliderCanvas.getContext("2d")!;
        drawBox();
        drawSlider();
    });

    $effect(() => {
        drawBox();
    });

    $effect(() => {
        drawSlider();
    });

    $effect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    });

    let previewColor = $derived(color.toCssRgba());
</script>

<div class="flex flex-col gap-2 w-full">
    <canvas
        bind:this={boxCanvas}
        width={boxWidth}
        height={boxHeight}
        onmousedown={handleBoxDown}
        class="border border-base-300 cursor-crosshair w-full"
        style="image-rendering: pixelated;"
    ></canvas>

    <canvas
        bind:this={sliderCanvas}
        width={sliderWidth}
        height={sliderHeight}
        onmousedown={handleSliderDown}
        class="border border-base-300 cursor-crosshair w-full"
    ></canvas>

    <div class="flex items-center gap-2">
        <div
            class="w-8 h-8 rounded border border-base-300"
            style="background-color: {previewColor};"
        ></div>
        <span class="text-sm">{color.toHex()}</span>
    </div>
</div>
