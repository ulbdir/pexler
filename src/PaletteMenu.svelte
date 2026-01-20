<script lang="ts">
    import { _ } from "svelte-i18n";

    import { Color } from "./lib/Color";
    import { palette, sortPalette, generatePaletteFromImage, clearPalette, loadFromGpl, type SortOrder } from "./lib/Palette.svelte";
    import ColorButton from "./ColorButton.svelte";
    import ChooseColorButton from "./ChooseColorButton.svelte";
    import Toast from "./lib/Toast.svelte";

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

    let toastMessage: string = $state("");
    let toastType: "success" | "error" = $state("success");
    let showToast: boolean = $state(false);
    
    const TOAST_DURATION_MS = 3000;
    
    let paletteMenuRef: any;

    function closePaletteMenu() {
        if (paletteMenuRef?.open) {
            paletteMenuRef.open = false;
        }
    }

    function triggerToast(message: string, type: "success" | "error" = "success") {
        toastMessage = message;
        toastType = type;
        showToast = true;
        
        setTimeout(() => {
            showToast = false;
        }, TOAST_DURATION_MS);
    }

    function sortAndClose(order: SortOrder) {
        sortPalette(order);
        closePaletteMenu();
        triggerToast($_("palette.sorted"), 'success');
    }

    function handleGenerateFromImage() {
        closePaletteMenu();
        const count = generatePaletteFromImage(editorState.image);
        triggerToast($_("palette.generated", { values: { count } }), 'success');
    }

    function handleClearPalette() {
        closePaletteMenu();
        clearPalette();
        triggerToast($_("palette.cleared"), 'success');
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
                    
                    triggerToast($_("palette.saved"), 'success');
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
                    
                    triggerToast($_("palette.saved"), 'success');
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    triggerToast($_("palette.error.save"), 'error');
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
                const success = loadFromGpl(content);
                
                if (success) {
                    triggerToast($_("palette.loaded"), 'success');
                } else {
                    triggerToast($_("palette.error.load"), 'error');
                }
            };
            
            reader.onerror = () => {
                triggerToast($_("palette.error.read"), 'error');
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // Close menu when clicking outside
    $effect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            if (paletteMenuRef && !target.closest('.dropdown')) {
                closePaletteMenu();
            }
        }
        
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    });
</script>

<div
    class="card card-xs card-border m-1 !p-4 bg-base-100 border-base-300"
>
    <div class="card-body !m-0 !p-0">
        <div class="flex justify-between items-center m-0 p-0">
            <h2 class="card-title m-0 p-0">{$_("palette.card-title")}</h2>
            <details bind:this={paletteMenuRef} class="dropdown dropdown-end">
                <summary class="btn btn-xs btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </summary>
                <ul class="menu dropdown-content bg-base-100 rounded-box z-50 w-48 p-2 shadow-lg border border-base-300">
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
        </div>
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
        
        <Toast message={toastMessage} type={toastType} />
    </div>
</div>
