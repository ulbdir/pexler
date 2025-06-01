<script lang="ts">
    import { Color } from './lib/Color';

    export let color:Color; // { r, g, b, a }
    export let isSelected:boolean = false;
    export let onClick = (event, id) => {};
    export let id:Number = 0;

</script>

<div class="tooltip" data-tip={color.toHex()}>
    <button
        class="btn btn-square w-8 h-8 p-0 relative rounded-sm"
        onmousedown={(event) => onClick(event, id)}
        aria-pressed={isSelected}
        type="button"
    >
        <!-- Checkerboard background -->
        <div class="absolute inset-0 bg-checker rounded-sm"></div>

        <!-- Color overlay -->
        <div
            class="absolute inset-0 rounded-sm"
            style="background-color: {color.toCssRgba()}"
        ></div>

        {#if isSelected}
            <div
                class="absolute inset-0 ring-3 ring-info ring-offset-1 rounded-sm pointer-events-none"
            ></div>
        {/if}
    </button>
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
