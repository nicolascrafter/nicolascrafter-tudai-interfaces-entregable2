"use strict";

import * as rendererConstants from "/js/constants/renderer-constants.mjs";
import { Kernel } from "../filters/kernel.mjs";
import { RgbKernel } from "../filters/rgb_kernel.mjs";
import { FilterFactory } from "../filters/filters_factory.mjs";

class Renderer {

    /** @type {OffscreenCanvas} */
    static #canvas;
    /** @type {OffscreenCanvasRenderingContext2D} */
    static #context;

    static #width;
    static #height;

    static borrador_selected = false;

    /** @type {ImageData} */
    static #image_data

    static #pulsado = false;

    /** @type {Object[]} */
    static #path_points = [];

    static #pen_style = { size: 5, color: "#7f7f7f" };

    static rendererMain() {
        //bloque switch con los distintos tipos de mensajes que se pueden recibir
        //cada tipo de mensaje es documentado en la funcion correspondiente
        /** @param {MessageEvent} event */
        self.onmessage = (event) => {
            switch (event.data.type) {
                case "hello":
                    console.log("Hello Renderer")
                    break;
                case "init":
                    this.init(event.data);
                    break;
                case "draw":
                    this.draw(event.data);
                    break;
                case "mouse":
                    this.mouse(event.data)
                    break;
                case "image":
                    this.image(event.data);
                    break;
                case "pen_color":
                    this.#pen_style.color = event.data.data.color;
                    console.log("color", event.data.data.color);
                    break;
                case "pen_width":
                    this.#pen_style.size = event.data.data.width;
                    console.log("width", event.data.data.width);
                    break;
                case "filter":
                    this.filter_apply(event.data);
                    break;
                case "eraser":
                    this.borrador_selected = true;
                    break;
                case "pen":
                    this.borrador_selected = false;
                    break;
                default:
                    console.error("Mensaje Invalido");
                    break;
            }
        }
    }

    static init(data) {
        this.#width = data.data.width;
        this.#height = data.data.height;
        this.#canvas = new OffscreenCanvas(this.#width, this.#height);
        this.#context = this.#canvas.getContext("2d");
    }

    static async draw(data) {
        // this.#context.fillStyle = "#000000";
        // this.#context.fillRect(20, 20, 100, 100);
        this.#context.fillStyle = "#ffffff"
        this.#context.fillRect(0, 0, this.#width, this.#height);
        if (this.#image_data) {
            this.#context.putImageData(this.#image_data, 0, 0)
        }
        if (this.borrador_selected == false) {
            this.#context.beginPath();
            for (let i = 0; i < this.#path_points.length; i++) {
                const point = this.#path_points[i];
                this.#context.lineTo(point.offsetX, point.offsetY);
            }
            this.#context.lineWidth = this.#pen_style.size;
            this.#context.strokeStyle = this.#pen_style.color;
            this.#context.stroke();
        } else {
            for (let i = 0; i < this.#path_points.length; i++) {
                const point = this.#path_points[i];
                this.#context.clearRect(point.offsetX - this.#pen_style.size, point.offsetY - this.#pen_style.size, this.#pen_style.size * 2, this.#pen_style.size * 2);
            }
        }
        this.#path_points = [];
        this.#image_data = this.#context.getImageData(0, 0, this.#width, this.#height);
        let bitmap = this.#canvas.transferToImageBitmap();
        postMessage({ type: "drawn", data: { bitmap } }, [bitmap]);
    }

    static mouse(data) {
        switch (data.data.event_type) {
            case "mousedown":
                this.#pulsado = true;
                break;
            case "mouseup":
                this.#pulsado = false;
                break;
            case "mousemove":
                if (this.#pulsado) {
                    this.#path_points.push({ offsetX: data.data.offsetX, offsetY: data.data.offsetY })
                }
                break;
            default:
                break;
        }
    }

    static filter_apply(data) {
        // let kernel = new RgbKernel(1, 1, [0.393, 0.769, 0.189, 0.349, 0.686, 0.168, 0.272, 0.534, 0.131], 0, 255);
        switch (data.data.type) {
            case "negativo":
                FilterFactory.makeNegativo().applyFilter(this.#image_data);
                break;
            case "brillo":
                FilterFactory.makeBrillo(data.data.param).applyFilter(this.#image_data);
                break;
            case "binarizacion":
                FilterFactory.makeBinarizacion(data.data.param).applyFilter(this.#image_data);
                break;
            case "blur":
                FilterFactory.makeBlur((data.data.param * 2) + 1).applyFilter(this.#image_data);
                break;
            case "sobel":
                FilterFactory.makeSobel().applyFilter(this.#image_data);
                break;
            default:
                break;
        }
        // let image = kernel.applyFilter(this.#image_data);

    }

    static async image(data) {
        if (data.data.image) {
            //Hay que hacer todo esto o el recolector de basura en chrome hace que el codigo explote espectacularmente
            let image_bitmap = await createImageBitmap(data.data.image);
            this.#context.drawImage(image_bitmap, 0, 0, this.#width, this.#height);
            image_bitmap.close();
            this.#image_data = this.#context.getImageData(0, 0, this.#width, this.#height);
        } else {
            this.#image_data = null;
        }
    }
}

Renderer.rendererMain();
