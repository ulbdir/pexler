<script lang="ts">
    import { _ } from "svelte-i18n";

    import { Color } from "./lib/Color";
    import { palette } from "./lib/Palette.svelte";
    import ColorButton from "./ColorButton.svelte";
    import InlineColorPicker from "./InlineColorPicker.svelte";
    import ChooseColorButton from "./ChooseColorButton.svelte";

    import { editorState } from "./lib/EditorState.svelte"
    
    function handleColorClick(event, index) {
        if (event.button === 0) {
            editorState.drawingColor = palette[index];
        }
    }

    function onColorChanged(color: Color) {
        editorState.drawingColor = color;
    }
</script>

<div
    class="card card-xs card-border m-1 !p-4 bg-base-100 border-base-300 flex flex-col overflow-hidden"
    style="height: calc(100% - 0.5rem);"
>
    <div class="flex-none w-full">
        <h2 class="card-title m-0 p-0">{$_("palette.card-title")}</h2>
        <div class="w-full">
            <ChooseColorButton startColor={editorState.drawingColor} {onColorChanged} />
        </div>
    </div>
    
    <div class="flex-1 overflow-y-auto min-h-0 p-1">
        <div class="flex flex-wrap gap-1 content-start">
            {#each palette as color, i}
                <ColorButton
                    {color}
                    isSelected={color.equals(editorState.drawingColor)}
                    onClick={handleColorClick}
                    id={i}
                />
            {/each}
        </div>
    </div>
</div>
