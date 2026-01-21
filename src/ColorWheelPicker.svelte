<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Color } from "./lib/Color";
  import TwoWayInput from "./TwoWayInput.svelte";
  let { startColor, onColorChanged } = $props<{
    startColor: Color;
    onColorChanged: (color: Color) => void;
  }>();

  let boxCanvasRef = $state<HTMLCanvasElement | null>(null);
  let boxMouseDown: boolean = false;

  let wheelCanvasRef = $state<HTMLCanvasElement | null>(null);
  let wheelMouseDown: boolean = false;

  let hue: number = $derived(startColor.toHsv().h);
  let saturation: number = $derived(startColor.toHsv().s);
  let value: number = $derived(startColor.toHsv().v);
  let alpha: number = $derived(startColor.toHsv().a);

  let red: number = $derived(Color.fromHsv(hue, saturation, value, alpha).r);
  let green: number = $derived(Color.fromHsv(hue, saturation, value, alpha).g);
  let blue: number = $derived(Color.fromHsv(hue, saturation, value, alpha).b);
  let hex: string = $derived(
    Color.fromHsv(hue, saturation, value, alpha).toHex(),
  );

  const wheelRadius = 175;
  const boxWidth = 175;
  const boxHeight = 175;

  $effect(() => {
    hue = Math.round(hue);
    saturation = Math.round(saturation * 100) / 100;
    value = Math.round(value * 100) / 100;
  });

  function drawWheel(ctx: CanvasRenderingContext2D) {
    const radius = wheelRadius / 2;
    const image = ctx.createImageData(wheelRadius, wheelRadius);
    const data = image.data;
    const color = getComputedStyle(wheelCanvasRef).borderColor;

    for (let y = 0; y < wheelRadius; y++) {
      for (let x = 0; x < wheelRadius; x++) {
        const dx = x - radius;
        const dy = y - radius;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius + 2 || dist < radius * 0.6) continue;

        const angle = Math.atan2(dy, dx);
        const hue = ((angle * 180) / Math.PI + 360) % 360;
        const pixelColor: Color = Color.fromHsv(hue, 1, 1);

        const i = (y * wheelRadius + x) * 4;
        data[i] = pixelColor.r;
        data[i + 1] = pixelColor.g;
        data[i + 2] = pixelColor.b;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);

    ctx.beginPath();
    ctx.arc(radius, radius, radius * 0.6, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    drawHueHandle(ctx, radius, radius, radius * 0.9, 0.75, hue);
  }

  function drawHueHandle(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number, // Full radius of the wheel
    innerRatio: number, // Inner edge as a ratio (e.g., 0.6)
    hue: number,
  ) {
    // New (aligned with ring)
    const angle = (hue / 360) * 2 * Math.PI;

    const innerRadius = radius * innerRatio;
    const handleLength = 16; // How far inward the triangle goes
    const baseWidth = 14; // Width of the triangle base

    // Tip of the triangle (on the inner edge of the ring)
    const tipX = centerX + innerRadius * Math.cos(angle);
    const tipY = centerY + innerRadius * Math.sin(angle);

    // Base center (a bit inward from the inner edge)
    const baseCenterX =
      centerX + (innerRadius - handleLength) * Math.cos(angle);
    const baseCenterY =
      centerY + (innerRadius - handleLength) * Math.sin(angle);

    // Perpendicular angle for base width
    const perpAngle = angle + Math.PI / 2;

    // Base corners
    const baseX1 = baseCenterX + (baseWidth / 2) * Math.cos(perpAngle);
    const baseY1 = baseCenterY + (baseWidth / 2) * Math.sin(perpAngle);

    const baseX2 = baseCenterX - (baseWidth / 2) * Math.cos(perpAngle);
    const baseY2 = baseCenterY - (baseWidth / 2) * Math.sin(perpAngle);

    // Draw triangle
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(baseX1, baseY1);
    ctx.lineTo(baseX2, baseY2);
    ctx.closePath();

    ctx.fillStyle = "white";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }

  function drawBox(ctx: CanvasRenderingContext2D, selectedHue: number) {
    const image = ctx.createImageData(boxWidth, boxHeight);
    const data = image.data;

    for (let y = 0; y < boxHeight; y++) {
      const selectedValue = 1.0 - y / boxHeight;

      for (let x = 0; x < boxWidth; x++) {
        const selectedSaturation = x / boxWidth;

        const pixelColor: Color = Color.fromHsv(
          selectedHue,
          selectedSaturation,
          selectedValue,
          1,
        );

        const i = (y * boxWidth + x) * 4;
        data[i] = pixelColor.r;
        data[i + 1] = pixelColor.g;
        data[i + 2] = pixelColor.b;
        data[i + 3] = pixelColor.a * 255;
      }
    }

    ctx.putImageData(image, 0, 0);
    drawBoxHandle(ctx);
  }

  function drawBoxHandle(ctx: CanvasRenderingContext2D) {
    const x = saturation * boxWidth;
    const y = (1 - value) * boxHeight;
    const color = getComputedStyle(boxCanvasRef).borderColor;

    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function handleBoxMouse(event: MouseEvent) {
    const canvas = boxCanvasRef;
    if (!canvas) return;

    if (boxMouseDown) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(event.clientX - rect.left);
      const y = Math.floor(event.clientY - rect.top);

      saturation = x / boxWidth;
      value = 1 - y / boxHeight;

      onColorChanged(Color.fromHsv(hue, saturation, value, alpha));
    }
  }

  function handleWheelMouse(event: MouseEvent) {
    const canvas = wheelCanvasRef;
    if (!canvas) return;

    if (wheelMouseDown) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(event.clientX - rect.left);
      const y = Math.floor(event.clientY - rect.top);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const radius = wheelRadius / 2;

      const dx = x - radius;
      const dy = y - radius;

      const angle = Math.atan2(dy, dx);
      hue = ((angle * 180) / Math.PI + 360) % 360;

      onColorChanged(Color.fromHsv(hue, saturation, value, alpha));
    }
  }

  function onHexChanged(valueText: string) {
    const c: Color = Color.fromHex(valueText);
    startColor = c;
  }

  // Auto draw when brightness changes
  $effect(() => {
    const canvas = boxCanvasRef;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) drawBox(ctx, hue);
  });

  // Initial draw
  let boxCtx: CanvasRenderingContext2D | null = null;
  $effect(() => {
    const canvas = boxCanvasRef;
    if (!canvas) return;
    boxCtx = canvas.getContext("2d");
    if (boxCtx) drawBox(boxCtx, hue);
  });

  let wheelCtx: CanvasRenderingContext2D | null = null;
  $effect(() => {
    const canvas = wheelCanvasRef;
    if (!canvas) return;
    wheelCtx = canvas.getContext("2d");
    if (wheelCtx) drawWheel(wheelCtx);
  });

  let saturationBackground: string = $state("");
  $effect(() => {
    const sourceColor = Color.fromHsv(hue, 0, value, 1);
    const targetColor = Color.fromHsv(hue, 1, value, 1);

    saturationBackground = `
      linear-gradient(
      to right,
      ${sourceColor.toCssRgba()} 0%,
      ${targetColor.toCssRgba()} 100%
    )`;
  });

  let valueBackground: string = $state("");
  $effect(() => {
    const targetColor = Color.fromHsv(hue, saturation, 1, 1);

    valueBackground = `
      linear-gradient(
      to right,
      black 0%,
      ${targetColor.toCssRgba()} 100%
    )`;
  });

  let opacityBackground: string = $state("");
  $effect(() => {
    const targetColor = Color.fromHsv(hue, saturation, value, 1);

    opacityBackground = `
      linear-gradient(
      to right,
      transparent 0%,
      ${targetColor.toCssRgba()} 100%
    )`;
  });
</script>

<div class="flex flex-row items-center gap-4">
  <canvas
    bind:this={wheelCanvasRef}
    width={wheelRadius}
    height={wheelRadius}
    onmousemove={handleWheelMouse}
    onmousedown={(event: MouseEvent) => {
      wheelMouseDown = true;
      handleWheelMouse(event);
    }}
    onmouseup={(event: MouseEvent) => {
      wheelMouseDown = false;
    }}
    class="rounded-full border-accent border-2 cursor-crosshair"
  ></canvas>

  <canvas
    bind:this={boxCanvasRef}
    width={boxWidth}
    height={boxHeight}
    onmousemove={handleBoxMouse}
    onmousedown={(event: MouseEvent) => {
      boxMouseDown = true;
      handleBoxMouse(event);
    }}
    onmouseup={(event: MouseEvent) => {
      boxMouseDown = false;
    }}
    class="border-accent border-2 cursor-crosshair"
  ></canvas>

  <div class="w-64 flex flex-col gap-5 h-full">
    <label class="form-control w-full flex-1">
      <span class="label-text">{$_("color-chooser.saturation")} {Math.round(saturation * 100)}%</span
      >
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={saturation}
        oninput={(e) => {
          saturation = parseFloat((e.target as HTMLInputElement).value);
          onColorChanged(Color.fromHsv(hue, saturation, value, alpha));
        }}
        class="range range-accent [--range-fill:0]"
        style="background: {saturationBackground};"
      />
    </label>

    <label class="form-control w-full flex-1">
      <span class="label-text">{$_("color-chooser.brightness")} {Math.round(value * 100)}%</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        {value}
        oninput={(e) => {
          value = parseFloat((e.target as HTMLInputElement).value);
          onColorChanged(Color.fromHsv(hue, saturation, value, alpha));
        }}
        class="range range-accent [--range-fill:0]"
        style="background: {valueBackground};"
      />
    </label>
    <label class="form-control w-full flex-1">
      <span class="label-text">{$_("color-chooser.opacity")} {Math.round(alpha * 100)}%</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={alpha}
        oninput={(e) => {
          alpha = parseFloat((e.target as HTMLInputElement).value);
          onColorChanged(Color.fromHsv(hue, saturation, value, alpha));
        }}
        class="range range-accent [--range-fill:0]"
        style="background: {opacityBackground};"
      />
    </label>
  </div>

  <div class="w-56 flex flex-col gap-3 h-full">
    <!-- RGB Group -->
    <div class="flex w-full gap-2">
      <TwoWayInput
        value={red.toString()}
        label={$_("color-chooser.red")}
        type="number"
        onCommit={(redValue) => {
          const c: Color = new Color(parseInt(redValue), green, blue, alpha);
          const {h, s, v, a} = c.toHsv();
          hue = h;
          saturation = s;
          value = v;
        }}
        className="input input-sm input-bordered w-full"
        min="0"
        max="255"
        step="1"
      />

      <TwoWayInput
        value={green.toString()}
        label={$_("color-chooser.green")}
        type="number"
        onCommit={(newValue) => {
          const c: Color = new Color(red, parseInt(newValue), blue, alpha);
          const {h, s, v, a} = c.toHsv();
          hue = h;
          saturation = s;
          value = v;
        }}
        className="input input-sm input-bordered w-full"
        min="0"
        max="255"
        step="1"
      />

      <TwoWayInput
        value={blue.toString()}
        label={$_("color-chooser.blue")}
        type="number"
        onCommit={(newValue) => {
          const c: Color = new Color(red, green, parseInt(newValue), alpha);
          const {h, s, v, a} = c.toHsv();
          hue = h;
          saturation = s;
          value = v;
        }}
        className="input input-sm input-bordered w-full"
        min="0"
        max="255"
        step="1"
      />

    </div>

    <!-- HSV Group -->
    <div class="flex w-full gap-2">
      <div class="form-control flex-1">
        <label class="label" for="hue">
          <span class="label-text">{$_("color-chooser.hue")}</span>
        </label>
        <input
          id="hue"
          type="number"
          bind:value={hue}
          min="0"
          max="360"
          step="1"
          class="input input-sm input-bordered w-full"
        />
      </div>

      <div class="form-control flex-1">
        <label class="label" for="saturation">
          <span class="label-text">{$_("color-chooser.saturation")}</span>
        </label>
        <input
          id="saturation"
          type="number"
          bind:value={saturation}
          min="0"
          max="1"
          step="0.01"
          class="input input-sm input-bordered w-full"
        />
      </div>

      <div class="form-control flex-1">
        <label class="label" for="brightness">
          <span class="label-text">{$_("color-chooser.brightness")}</span>
        </label>
        <input
          id="brightness"
          type="number"
          bind:value
          min="0"
          max="1"
          step="0.01"
          class="input input-sm input-bordered w-full"
        />
      </div>
    </div>

    <TwoWayInput
      value={hex}
      label={$_("color-chooser.color-code")}
      onCommit={(v: string) => {
        onHexChanged(v);
      }}
      type="text"
      className="input input-sm input-bordered w-full"
    />
  </div>
</div>
