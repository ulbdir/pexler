<script>
  import { onMount } from 'svelte';

  export let title = "Fenster";
  export let initialWidth = 400;
  export let initialHeight = 300;
  export let initialX = 100;
  export let initialY = 100;
  export let minWidth = 200;
   export let minHeight = 100;

   let windowElement;
  let width = initialWidth;
  let height = initialHeight;
  let x = initialX;
  let y = initialY;
  let isDragging = false;
  let isResizing = false;
  let dragStartX;
  let dragStartY;
  let initialWindowX;
  let initialWindowY;
  let initialWindowWidth;
   let initialWindowHeight;

   function startDrag(event) {
    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    initialWindowX = x;
    initialWindowY = y;

    event.preventDefault();
   }

   function startResize(event) {
    isResizing = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    initialWindowWidth = width;
    initialWindowHeight = height;

    event.preventDefault();
  }
  
  // Funktion für die Mausbewegung
  function handleMouseMove(event) {
    if (isDragging) {
      // Berechnung der neuen Position beim Ziehen
      const deltaX = event.clientX - dragStartX;
      const deltaY = event.clientY - dragStartY;
      
      x = initialWindowX + deltaX;
      y = initialWindowY + deltaY;

      if (x < 0) {
        x = 0;
      }

      if (y<0) {
        y = 0;
      }

    } else if (isResizing) {
      // Berechnung der neuen Größe beim Ändern der Fenstergröße
      const deltaX = event.clientX - dragStartX;
      const deltaY = event.clientY - dragStartY;
      
      width = Math.max(minWidth, initialWindowWidth + deltaX);
      height = Math.max(minHeight, initialWindowHeight + deltaY);
    }
  }
  
  // Funktion zum Beenden des Drag/Resize-Vorgangs
  function stopDragOrResize() {
    isDragging = false;
    isResizing = false;
  }
  
  // Event-Listener für globale Mausbewegungen und -loslassen
  onMount(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopDragOrResize);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopDragOrResize);
    };
  });
</script>

<div 
  class="window"
  bind:this={windowElement}
  style="
    width: {width}px; 
    height: {height}px; 
    left: {x}px; 
    top: {y}px;
  "
>
  <!-- Titelleiste -->
  <div class="title-bar" on:mousedown={startDrag}>
    <div class="title">{title}</div>
    <div class="controls">
        <slot name="buttons" />
    </div>
  </div>
  
  <div class="content-container">
    <!-- Fensterinhalt -->
    <div class="window-content">
      <slot></slot>
    </div>
    
    <!-- Resize-Handle -->
    <div class="resize-handle" on:mousedown={startResize}></div>
  </div>
</div>

<style>
  .window {
    position: absolute;
    background-color: #c0c0c0;
    border: 1px solid #000000;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    font-family: "MS Sans Serif", Arial, sans-serif;
  }
  
  .title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #80858a;
    color: black;
    padding: 2px 4px;
    cursor: move;
    user-select: none;
    height: 22px;
  }
  
  .title {
    font-weight: bold;
    font-size: 12px;
    margin-left: 2px;
  }
  
  .controls {
    display: flex;
  }
  
  ::slotted(button) {
    width: 18px;
    height: 18px;
    background-color: #c0c0c0;
    border-top: 1px solid #ffffff;
    border-left: 1px solid #ffffff;
    border-right: 1px solid #404040;
    border-bottom: 1px solid #404040;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-family: "Arial", sans-serif;
    cursor: pointer;
    padding: 0;
    margin-left: 2px;
    color: black;
    border-radius: 0;
  }
  
  ::slotted(button:active) {
    border-top: 1px solid #404040;
    border-left: 1px solid #404040;
    border-right: 1px solid #ffffff;
    border-bottom: 1px solid #ffffff;
  }

  .content-container {
    flex: 1;
    position: relative;
    margin: 0px;
    padding: 8px;
    background-color: #c0c0c0;
  }
  
  .window-content {
    height: 100%;
    overflow: hidden;
    background-color: rgb(82, 80, 80);
    border: 1px solid #000000;
  }
  
  .resize-handle {
    position: absolute;
    width: 8px;
    height: 8px;
    bottom: 0;
    right: 0;
    cursor: nwse-resize;
    z-index: 10;
  }
  
  .resize-handle::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 0 8px 8px;
    border-color: transparent transparent #555555 transparent;
  }
</style>