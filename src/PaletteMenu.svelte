<script lang="ts">
    import { _ } from "svelte-i18n";

    import { Color } from "./lib/Color";
    import { palette } from "./lib/Palette.svelte";
    import ColorButton from "./ColorButton.svelte";
    import ChooseColorButton from "./ChooseColorButton.svelte";

    import { editorState } from "./lib/EditorState.svelte"
    
    function handleColorClick(event, index) {
        if (event.button === 0) {
            editorState.drawingColor = palette[index];
            console.dir($state.snapshot(editorState.drawingColor));
        }
    }

    function onColorChanged(color: Color) {
        editorState.drawingColor = color;
        console.dir($state.snapshot(editorState.drawingColor));
    }
</script>

<div
    class="card card-xs card-border m-1 !p-4 bg-base-100 border-base-300"
>
    <div class="card-body !m-0 !p-0">
        <h2 class="card-title m-0 p-0">{$_("palette.card-title")}</h2>
        <div class="card-action flex gap-1 flex-wrap m-0 p-0">
            {#each palette as color, i}
                <ColorButton
                    {color}
                    isSelected={color.equals(editorState.drawingColor)}
                    onClick={handleColorClick}
                    id={i}
                />
            {/each}
        </div>
        <div class="divider m-0"></div>
        
        <ChooseColorButton startColor={editorState.drawingColor} {onColorChanged} />
    </div>
</div>
