<script lang="ts">
    import { _ } from "svelte-i18n";

    import { Color } from "./lib/Color";
    import { palette, sortPalette, generatePaletteFromImage, clearPalette, getAutoAddColor, toggleAutoAddColor, loadFromGpl, type SortOrder } from "./lib/Palette.svelte";
    import { editorState } from "./lib/EditorState.svelte"

    let paletteMenuRef: any;

    function closePaletteMenu() {
        if (paletteMenuRef?.open) {
            paletteMenuRef.open = false;
        }
    }

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (paletteMenuRef && !target.closest('.dropdown')) {
            closePaletteMenu();
        }
    }

    $effect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    });

    function sortAndClose(order: SortOrder) {
        sortPalette(order);
        closePaletteMenu();
    }

    function handleGenerateFromImage() {
        closePaletteMenu();
        generatePaletteFromImage(editorState.image);
    }

    function handleClearPalette() {
        closePaletteMenu();
        clearPalette();
    }

    function handleSavePalette() {
        closePaletteMenu();
        
        const gplContent = palette.length > 0 ? "GIMP Palette\nChannels: RGBA\nName: Pexler Palette\n#\n" + 
            palette.map((color, index) => {
                const r = Math.round(color.r);
                const g = Math.round(color.g);
                const b = Math.round(color.b);
                const a = Math.round(color.a * 255);
                const name = `Color ${index + 1}`;
                return `${r.toString().padStart(3)} ${g.toString().padStart(3)} ${b.toString().padStart(3)} ${a.toString().padStart(3)} ${name}`;
            }).join('\n') : "";
        
        const saveFile = async () => {
            try {
                if ('showSaveFilePicker' in window) {
                    const fileHandle = await (window as any).showSaveFilePicker({
                        suggestedName: 'palette.gpl',
                        types: [{
                            description: 'GIMP Palette',
                            accept: { 'text/plain': ['.gpl'] },
                        }],
                    });
                    
                    const writable = await fileHandle.createWritable();
                    await writable.write(gplContent);
                    await writable.close();
                } else {
                    const blob = new Blob([gplContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'palette.gpl';
                    document.body.appendChild(a);
                    a.click();
                    
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }, 0);
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('Failed to save palette:', error);
                }
            }
        };
        
        saveFile();
    }

    function handleLoadPalette() {
        closePaletteMenu();
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.gpl';
        
        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                loadFromGpl(content);
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
</script>

<div class="flex-none">
    <ul class="menu">
        <li>
            <details bind:this={paletteMenuRef} class="dropdown dropdown-end">
                <summary class="btn">{$_("palette.card-title")}</summary>
                <ul class="menu dropdown-content bg-base-100 rounded-box z-50 w-52 p-2 shadow-lg border border-base-300">
                    <li>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" class="checkbox checkbox-xs" checked={getAutoAddColor()} onchange={(e) => { e.preventDefault(); toggleAutoAddColor(); }} />
                            <span class="label-text">{$_("palette.auto-add")}</span>
                        </label>
                    </li>
                    <div class="divider my-1"></div>
                    <li class="menu-title">
                        <span>{$_("palette.sort.title")}</span>
                    </li>
                    <li><button onclick={() => sortAndClose('hue')}>{$_("palette.sort.hue")}</button></li>
                    <li><button onclick={() => sortAndClose('value')}>{$_("palette.sort.light-to-dark")}</button></li>
                    <li><button onclick={() => sortAndClose('saturation')}>{$_("palette.sort.saturated-to-muted")}</button></li>
                    <li><button onclick={() => sortAndClose('luminance')}>{$_("palette.sort.luminance")}</button></li>
                    <div class="divider my-1"></div>
                    <li><button onclick={handleGenerateFromImage}>{$_("palette.generate-from-image")}</button></li>
                    <div class="divider my-1"></div>
                    <li><button onclick={handleClearPalette}>{$_("palette.clear")}</button></li>
                    <li><button onclick={handleLoadPalette}>{$_("palette.load")}</button></li>
                    <li><button onclick={handleSavePalette}>{$_("palette.save")}</button></li>
                </ul>
            </details>
        </li>
    </ul>
</div>
