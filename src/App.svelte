<script>
  import { isLoading } from "svelte-i18n";
  import "./lib/i18n/i18n.js";
  import PixelCanvas from "./PixelCanvas.svelte";
  import Menu from "./Menu.svelte";
  import LanguageChanger from "./LanguageChanger.svelte";
  import FileMenu from "./FileMenu.svelte";
  import PaletteMenuTop from "./PaletteMenuTop.svelte";
  import { editorState } from "./lib/EditorState.svelte.js";

  let loading = $state(isLoading);
</script>

{#if !$loading}
<main>
  <div
    class="flex flex-col w-screen h-screen p-1 overflow-hidden bg-base-200 bg-[repeating-linear-gradient(135deg,_rgba(0,0,0,0.03)_0px,_rgba(0,0,0,0.03)_1px,_transparent_1px,_transparent_10px)]"
  >
    <div class="navbar">
      <div class="flex-1">
        <h1 class="text-5xl font-bold text-accent retro-font drop-shadow-lg">
          Pexler
        </h1>
      </div>
      <FileMenu />
      <PaletteMenuTop />
      <LanguageChanger />
    </div>

    <div class="flex w-full h-full max-w-full max-h-full overflow-hidden p-4">
      <div
        class="resize-x flex flex-col w-60 h-full max-h-full overflow-visible shrink-0 p-1"
      >
        <Menu />
      </div>

      <div class="flex-1 max-w-full max-h-full overflow-hidden">
        <div
          class="flex items-center content-center justify-center p-4 h-full overflow-hidden border"
        >
          <PixelCanvas pixels={editorState.image} grid={true} />
        </div>
      </div>
    </div>
  </div>
</main>

{/if}