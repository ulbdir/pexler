<script lang="ts">
    import { _ } from "svelte-i18n";
    import { editorState } from "./lib/EditorState.svelte";
    import { Image } from "./lib/Image";

    let fileMenuRef;
    let fileNewDialogRef;

    let imageWidth: number = 16;
    let imageHeight: number = 16;

    function closeMenu() {
        if (fileMenuRef?.open) {
            fileMenuRef.open = false;
        }
    }

    function handleNewClicked() {
        closeMenu();
        fileNewDialogRef.showModal();
    }

    function createImage(width: number, height: number) {
        editorState.image = (() => {
            // create an off-screen canvas to hold the pixel data
            const c = document.createElement("canvas");
            c.width = width;
            c.height = height;
            return c;
        })();
    }

    function handleLoadClicked() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;

            const url = URL.createObjectURL(file);
            const image = new window.Image();
            image.src = url;

            image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = image.width;
                canvas.height = image.height;

                const ctx = canvas.getContext("2d")!;
                ctx.drawImage(image, 0, 0);

                editorState.image = canvas;

                URL.revokeObjectURL(url); // clean up memory
            };

            image.onerror = () => {
                console.error("Failed to load image");
                URL.revokeObjectURL(url);
            };
        };

        input.click(); // open file picker
    }

    function handleSaveClick() {
        const dataUrl = editorState.image.toDataURL("image/png");

        const win = window.open();
        if (win) {
            // Wait until the new document is ready
            win.document.title = "Download Image";

            // Create elements
            const body = win.document.body;

            const message = win.document.createElement("p");
            message.textContent =
                "Right-click (or tap and hold) the image below to save it.";
            message.style.cssText =
                "font-family: sans-serif; text-align: center; margin-top: 2rem;";

            const image = win.document.createElement("img");
            image.src = dataUrl;
            image.alt = "Canvas Image";
            image.style.cssText =
                "display: block; margin: 1rem auto; max-width: 90%; border: 1px solid #ccc;";

            body.appendChild(message);
            body.appendChild(image);
        }
    }
</script>

<div class="flex-none">
    <ul class="menu">
        <li>
            <details bind:this={fileMenuRef} class="dropdown dropdown-end">
                <summary class="btn">{$_("file-menu.header")}</summary>
                <ul
                    class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
                >
                    <li><button onclick={handleNewClicked}>{$_("file-menu.new")}</button></li>
                    <li><button onclick={handleLoadClicked}>{$_("file-menu.load")}</button></li>
                    <li><button onclick={handleSaveClick}>{$_("file-menu.save")}</button></li>
                </ul>
            </details>
        </li>
    </ul>
</div>

<dialog bind:this={fileNewDialogRef} class="modal">
    <div class="modal-box border w-64">
        <fieldset
            class="fieldset p-4 border"
        >
            <legend class="fieldset-legend">{$_("file-menu.new.header")}</legend>

            <label class="label" for="width-input">{$_("file-menu.new.width")}</label>
            <input
                id="width-input"
                type="number"
                bind:value={imageWidth}
                class="input !w-full"
                min="1"
            />

            <label class="label" for="height-input">{$_("file-menu.new.height")}</label>
            <input
                id="height-input"
                type="number"
                bind:value={imageHeight}
                class="input !w-full"
                min="1"
            />
        </fieldset>
        <div class="modal-action">
            <form method="dialog">
                <!-- if there is a button in form, it will close the modal -->
                <button
                    class="btn"
                    onclick={() => {
                        createImage(imageWidth, imageHeight);
                        fileNewDialogRef.close();
                    }}>Create</button
                >
                <button
                    class="btn btn-error"
                    onclick={() => {
                        fileNewDialogRef.close();
                    }}>Close</button
                >
            </form>
        </div>
    </div>
</dialog>
