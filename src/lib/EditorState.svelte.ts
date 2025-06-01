import { Image } from "./Image"
import { Color } from "./Color"
import type { Tool } from "./Tool"
import { DrawTool } from "./DrawTool";

export interface EditorState {
    image: HTMLCanvasElement;
    drawingColor: Color;
    tool: Tool;
}

export const editorState: EditorState = $state({
    image: (() => {
        // create an off-screen canvas to hold the pixel data
        const c = document.createElement('canvas');
        c.width = 16;
        c.height = 16;
        return c;
    })(),
    drawingColor: new Color(128, 128, 128),
    tool: new DrawTool()
})
