"use strict";

/**
 * @module rendererConstants
 */

class RendererConstants {

    /**
     * Mensaje de inicializacion. Acepta un ancho y un alto
     * @typedef {Object} InitMessage
     * @property {"init"} type - Tipo del mensaje
     * @property {Object} data - Datos asociados al mensaje
     * @property {Number} data.width - Ancho del canvas
     * @property {Number} data.height - Alto del canvas
     */
    static get INIT_MESSAGE_TYPE() {return "init"};
    
    /**
     * Mensaje de dibujado. Datos asociados estan sin uso
     * @typedef {Object} DrawMessage
     * @property {"draw"} type - Tipo del mensaje
     * @property {Object} data - Datos asociados al mensaje
     */
    static get DRAW_MESSAGE_TYPE() {return "draw"};

    /**
     * Mensaje para subir una imagen. Opcionalmente acepta una imagen para reemplazar la imagen actual.
     * Si no se especifica una imagen la imagen actual es eliminada
     * @typedef {Object} ImageMessage
     * @property {"image"} type - Tipo del mensaje
     * @property {Object} data - Datos asociados al mensaje
     * @property {Blob} [data.image] - Imagen a subir
     */
    static get IMAGE_MESSAGE_TYPE() {return "image"};
    
    /**
     * Mensaje de respuesta cuando se termino de dibujar el frame. Transmite un imageBitmap con la image dibujada
     * @typedef {Object} DrawnMessage
     * @property {"drawn"} type - Tipo del mensaje
     * @property {Object} data - Datos asociados al mensaje
     * @property {ImageBitmap} data.image - Imagen dibujada este frame
     */
    static get DRAWN_MESSAGE_TYPE() {return "drawn"};

    /**
     * Mensaje para subir el evento de mouse
     * @typedef {Object} MouseMessage
     * @property {"mouse"} type - Tipo del mensaje
     * @property {Object} data - Datos asociados al mensaje
     * @property {"mouseup"|"mousedown"|"mousemove"|"mouseenter"|"mouseleave"} data.event_type - Tipo de evento de mouse
     * @property {Number} data.offsetX - Posicion X del mouse
     * @property {Number} data.offsetY - Posicion Y del mouse
     * @property {Number} data.button - Boton pulsado del mouse
     */
    static get MOUSE_MESSAGE_TYPE() {return "mouse"};

    /**
     * Mensajes usado por el worker de renderizado
     * @typedef {InitMessage|DrawMessage|ImageMessage|DrawnMessage|MouseMessage} RendererMessage
     */
}

export {RendererConstants};