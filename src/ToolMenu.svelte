<script lang="ts">
    import {
        PencilIcon,
        EraserIcon,
        SelectIcon,
        ColorPickerIcon,
        FillIcon,
    } from "./lib/Icons";

    import { _ } from "svelte-i18n";
    import { editorState } from "./lib/EditorState.svelte";
    import { DrawTool } from "./lib/DrawTool";
    import { EraserTool } from "./lib/EraserTool";
    import type { Tool } from "./lib/Tool";

    const buttons = [
        { id: "tools.pencil", svg: PencilIcon },
        { id: "tools.eraser", svg: EraserIcon },
        { id: "tools.select", svg: SelectIcon },
        { id: "tools.color-picker", svg: ColorPickerIcon },
        { id: "tools.fill", svg: FillIcon },
    ];

    let activeTool = $state("tools.pencil");

    function setActiveTool(tool: Tool) {
        if (editorState.tool != undefined) {
            editorState.tool.onDeactivate();
        }

        editorState.tool = tool;

        if (editorState.tool != undefined) {
            editorState.tool.onActivate();
        }
    }

    function setActive(id) {
        switch (id) {
            case "tools.pencil":
                setActiveTool(new DrawTool());
                activeTool = id;
                break;
            case "tools.eraser":
                setActiveTool(new EraserTool());
                activeTool = id;
                break;
            default:
                break;
        }
    }
</script>

<div
    class="card card-xs card-border m-1 !p-4 overflow-visible bg-base-100 border-base-300"
>
    <div class="card-body !m-0 !p-0">
        <h2 class="card-title m-0 p-0">{$_("tools.card-title")}</h2>
        <div class="card-action flex gap-2 flex-wrap m-0 p-0">
            {#each buttons as { id, svg }}
                <div
                    class="tooltip tooltip-right"
                    data-tip={$_(id + ".tooltip")}
                >
                    <button
                        class="btn btn-sm p-0 w-10 h-10"
                        class:btn-accent={activeTool === id}
                        class:btn-outline={activeTool !== id}
                        onclick={() => setActive(id)}
                    >
                        <!-- SVG direkt als HTML einfügen -->
                        <span class="w-5 h-5" aria-hidden="true">
                            {@html svg}
                        </span>
                    </button>
                </div>
            {/each}
        </div>
    </div>
</div>
