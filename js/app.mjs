"use strict";

import { RendererConstants } from "./constants/renderer-constants.mjs";
class Main {

    /** @type {HTMLCanvasElement} */
    static canvas;
    /** @type {ImageBitmapRenderingContext} */
    static #context;
    /** @type {ImageBitmap} */
    static #bitmap;

    /** @type {Worker} */
    static worker;

    static #width;
    static #height;

    // /** @type {HTMLInputElement} */
    // static #image;

    static main() {
        this.worker = new Worker("js/worker/renderer.mjs", { type: "module", name: "Renderer" });

        //Estructura de los mensajes:
        //type (String): String con el tipo de mensaje
        //data (Object): Objeto con datos varios usado por el mensaje
        this.worker.postMessage({ type: "hello" });
        this.worker.addEventListener("message", (event) => { this.workerMessage.apply(this, [event]) });

        this.canvas = document.querySelector("#canvas");
        this.#width = this.canvas.width;
        this.#height = this.canvas.height;
        this.#context = this.canvas.getContext("bitmaprenderer");

        this.worker.postMessage({ type: "init", data: { width: this.#width, height: this.#height, pen_size: 5, pen_color:"#000000"} });

        //Eventos del mouse
        this.canvas.addEventListener("mousedown", this.mouseHandler);
        this.canvas.addEventListener("mouseup", this.mouseHandler);
        this.canvas.addEventListener("mousemove", this.mouseHandler);
        this.canvas.addEventListener("mouseenter", this.mouseHandler);
        this.canvas.addEventListener("mouseleave", this.mouseHandler);

        this.worker.postMessage({type:"pen_width",data:{width:document.querySelector("#pen_size").value}});
        this.worker.postMessage({type:"pen_color",data:{width:document.querySelector("#pen_size").value}})

        document.querySelector("#image_upload").addEventListener("change", (event) => { this.imageUpload.apply(this, [event]) });
        document.querySelector("#clear_image").addEventListener("click", (event)=>{this.worker.postMessage({type:"image", data:{image:undefined}})});
        document.querySelector("#pen_color").addEventListener("change",(event)=>{this.worker.postMessage({type:"pen_color",data:{color:event.target.value}})});
        document.querySelector("#pen_size").addEventListener("change",(event)=>{this.worker.postMessage({type:"pen_width",data:{width:event.target.value}})});
        document.querySelector("#download").addEventListener("click",this.download);
        document.querySelector("#apply_filter").addEventListener("click",this.filter);
        document.querySelector("#filters").addEventListener("change",this.filter_change);
        document.querySelector("#pen").addEventListener("click",(event)=>{this.worker.postMessage({type:"pen"})});
        document.querySelector("#eraser").addEventListener("click",(event)=>{this.worker.postMessage({type:"eraser"})});

        requestAnimationFrame((time) => { this.draw.apply(this, [time]) });
    }

    /** @param {DOMHighResTimeStamp} time */
    static draw(time) {
        if (this.#bitmap) {
            try {
                this.#context.transferFromImageBitmap(this.#bitmap);
            } catch (error) {
                
            }
        }
        this.worker.postMessage({ type: "draw", data: { time } });
        requestAnimationFrame((time) => { this.draw.apply(this, [time]) });
    }

    /** @param {MessageEvent} event */
    static workerMessage(event) {
        switch (event.data.type) {
            case "drawn":
                Main.#bitmap = event.data.data.bitmap;
                break;

            default:
                break;
        }
    }

    /** @param {MouseEvent} event */
    static mouseHandler(event) {
        const mouse_button_events_set = new Set(["mousedown","mouseup"]);
        let mouse_button;
        if (mouse_button_events_set.has(event.type)) {
            mouse_button = event.button
        }
        //Intellisense dejo de funcionar correctamente
        // console.log(RendererConstants);
        // /** @type {RendererMessage} */
        let event_data = {
            type: "mouse",
            data: {
                event_type:event.type,
                offsetX: event.offsetX,
                offsetY: event.offsetY,
                button: mouse_button
            }
        };
        Main.worker.postMessage(event_data)
    }

    /** @param {Event} event */
    static imageUpload(event) {
        /** @type {File} */
        let image = event.target.files[0]
        this.worker.postMessage({ type: "image", data: { image } });
        document.querySelector("#image_upload").value = "";
    }

    static download() {
        /** @type {HTMLAnchorElement} */
        let link = document.querySelector("#download_link");
        link.href = Main.canvas.toDataURL();
        link.click();
    }

    static filter(event) {
        let filter_type = document.querySelector("#filters").value;
        let filter_param = document.querySelector("#filter_param").value;

        Main.worker.postMessage({type:"filter", data:{type:filter_type, param: filter_param}});
    }

    static filter_change(event) {
        let filter_param = document.querySelector("#filter_param");
        if (event.target.value == "blur") {
            filter_param.hidden = false;
            filter_param.min = 1;
            filter_param.max = 10;
            filter_param.step = 1;
        } else if(event.target.value == "brillo") {
            filter_param.hidden = false;
            filter_param.min = 0.1;
            filter_param.max = 10;
            filter_param.step = 0.1;
        } else if (event.target.value == "binarizacion") {
            filter_param.hidden = false;
            filter_param.min = 0;
            filter_param.max = 255;
            filter_param.step = 1;  
        } else {
            filter_param.hidden = true;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    Main.main();
})
