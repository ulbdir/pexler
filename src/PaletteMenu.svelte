<script lang="ts">
    import { _ } from "svelte-i18n";

    import { Color } from "./lib/Color";
    import { palette } from "./lib/Palette.svelte";
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
        }, 3000);
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
                // Try to use the File System Access API
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
                    
                    console.log('Palette saved successfully');
                    triggerToast('Palette saved', 'success');
                } else {
                    // Fallback to traditional download
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
                    
                    console.log('Palette saved successfully');
                    triggerToast('Palette saved', 'success');
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('Failed to save palette:', error);
                    triggerToast('Failed to save palette', 'error');
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
                try {
                    const content = event.target?.result as string;
                    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
                    
                    // Check header
                    if (!lines.length || !lines[0].startsWith('GIMP Palette')) {
                        throw new Error('Invalid GPL file: Missing GIMP Palette header');
                    }
                    
                    let hasRGBA = false;
                    let startIndex = 1;
                    
                    // Check for RGBA channels
                    for (let i = 1; i < Math.min(5, lines.length); i++) {
                        if (lines[i].startsWith('Channels: RGBA')) {
                            hasRGBA = true;
                            startIndex = i + 1;
                            break;
                        } else if (lines[i].startsWith('Channels:')) {
                            startIndex = i + 1;
                            break;
                        }
                    }
                    
                    const newColors: Color[] = [];
                    let colorCount = 0;
                    
                    for (let i = startIndex; i < lines.length; i++) {
                        const line = lines[i];
                        
                        // Skip comments and empty lines
                        if (line.startsWith('#') || !line) continue;
                        
                        // Parse color line: r g b [a] [name]
                        const parts = line.split(/\s+/).filter(part => part);
                        if (parts.length < 3) continue;
                        
                        try {
                            const r = Math.max(0, Math.min(255, parseInt(parts[0])));
                            const g = Math.max(0, Math.min(255, parseInt(parts[1])));
                            const b = Math.max(0, Math.min(255, parseInt(parts[2])));
                            
                            let a = 1.0; // Default alpha
                            if (hasRGBA && parts.length >= 4) {
                                a = Math.max(0, Math.min(255, parseInt(parts[3]))) / 255;
                            }
                            
                            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                                newColors.push(new Color(r, g, b, a));
                                colorCount++;
                            }
                        } catch (error) {
                            console.warn(`Failed to parse line ${i + 1}: "${line}"`, error);
                        }
                    }
                    
                    if (colorCount === 0) {
                        throw new Error('No valid colors found in GPL file');
                    }
                    
                    // Replace palette with loaded colors
                    palette.length = 0;
                    palette.push(...newColors);
                    
                    console.log(`Loaded ${colorCount} colors from GPL file`);
                    triggerToast('Palette loaded', 'success');
                } catch (error) {
                    console.error('Failed to load palette:', error);
                    triggerToast('Failed to load palette', 'error');
                }
            };
            
            reader.onerror = () => {
                console.error('Failed to read file');
                triggerToast('Failed to read file', 'error');
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
    class="card card-xs card-border m-1 !p-4 overflow-hidden bg-base-100 border-base-300"
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
                <ul class="menu dropdown-content bg-base-100 rounded-box z-50 w-40 p-2 shadow-lg border border-base-300">
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
        
        <!-- Toast notification -->
        {#if showToast}
            <div class="toast toast-bottom toast-end z-50 transition-all duration-300 rounded-lg shadow-lg border-2 {toastType === 'success' ? 'opacity-100 translate-y-0 bg-success text-success-content border-success' : 'opacity-0 translate-y-2 pointer-events-none bg-error text-error-content border-error'}">
                <div class="flex items-center gap-3 px-4 py-3">
                    {#if toastType === "success"}
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    {/if}
                    <span class="font-medium">{toastMessage}</span>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .toast {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        z-index: 9999;
    }
</style>
