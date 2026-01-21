<script lang="ts">
    import { _ } from "svelte-i18n";
    import ColorWheelPicker from "./ColorWheelPicker.svelte";
    import { Color } from "./lib/Color";

    let { startColor, onColorChanged } = $props<{startColor: Color, onColorChanged: (color: Color)=>void}>();

    let open: boolean = $state(false);
    let buttonRef: HTMLElement = $state();
    let popupRef: HTMLElement = $state();
    let popupStyle: string = $state("");
    let chosenColor: Color = startColor;

    $effect(() => chosenColor = startColor);

    function handleColorChange(e: Color) {
        chosenColor = e;
    }

    function openPopup() {
        open = true;

        requestAnimationFrame(() => {
            const rect = buttonRef.getBoundingClientRect();
            const height = popupRef?.offsetHeight ?? 200;
            popupStyle = `
      top: ${rect.top - height - 4}px;
      left: ${rect.left}px;
      position: fixed;
    `;
            window.addEventListener("mousedown", handleClickOutside);
        });
    }

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!popupRef?.contains(target) && !buttonRef?.contains(target)) {
            open = false;
            window.removeEventListener("mousedown", handleClickOutside);

            onColorChanged(chosenColor);
            event.preventDefault();
        }
    }
</script>

<div class="tooltip w-full" data-tip={startColor.toHex()}>
    <button
        class="btn w-full"
        bind:this={buttonRef}
        onclick={(event) => {
            openPopup();
        }}
        type="button"
    >
        <div class="absolute inset-2 bg-checker rounded-sm w-6"></div>

        <div
            class="absolute inset-2 rounded-sm w-6"
            style="background-color: {startColor.toCssRgba()}"
        ></div>
        {$_("palette.drawing-color")}
    </button>
    {#if open}
        <div
            bind:this={popupRef}
            class="popup fixed z-[9999] bg-base-100 rounded-box shadow p-4 border border-base-300 border-2"
            style={popupStyle}
        >
            <ColorWheelPicker
                onColorChanged={handleColorChange}
                startColor={startColor}
            />
        </div>
    {/if}
</div>

<style>
    .bg-checker {
        background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%);
        background-size: 16px 16px;
        background-position:
            0 0,
            0 8px,
            8px -8px,
            -8px 0px;
    }
</style>
