"use strict";

class Kernel {
    /** @type {Number} */
    width
    /** @type {Number} */
    height
    /** @type {Array<Number>} */
    pixels_class

    /** @type {Number} */
    kernel_offset_X;
    /** @type {Number} */
    kernel_offset_Y;

    /** @type {Number} */
    pixel_min;
    /** @type {Number} */
    pixel_max;

    /**
     * 
     * @param {Number} width Ancho
     * @param {Number} height Alto
     * @param {Array<Number>} pixels Pixeles
     */
    constructor(width, height, pixels, pixel_min, pixel_max) {
        //Ni el ancho ni el alto pueden ser par ni negativo
        if (width <= 0 || width % 2 == 0) {
            throw new RangeError("El ancho debe ser un numero impar positivo");
        }
        if (height <= 0 || height % 2 == 0) {
            throw new RangeError("El alto debe ser un numero impar positivo");
        }

        //La cantidad de pixeles debe ser la adecuada
        // if (pixels.length != width * height) {
        //     throw new TypeError("El arreglo de pixeles debe tener tamaño <ancho>X<alto>");
        // }
        // ^ comentado debido al uso de super en una clase que no puede cumplir este requisito

        if (pixel_min > pixel_max) {
            throw new RangeError("Pixel min debe ser menor o igual que Pixel max");
        }
        this.width = width;
        this.height = height;
        this.pixels_class = pixels;

        this.kernel_offset_X = Math.floor(width / 2);
        this.kernel_offset_Y = Math.floor(height / 2);

        this.pixel_min = pixel_min;
        this.pixel_max = pixel_max;
    }

    /**
     * @param {Array<Number>} pixels
     * @returns Pixeles
     */
    static #normalize(pixels) {
        let sum = 0;
        for (let i = 0; i < pixels.length; i++) {
            sum += pixels[i];
        }

        for (let i = 0; i < pixels.length; i++) {
            pixels[i] /= sum;
        }
        return pixels;
    }

    /**
     * Aplica el filtro descripto por este kernel a la imagen
     * @param {ImageData} image Imagen a filtrar
     */
    applyFilter(image) {
        //Iterar toda la imagen
        for (let image_X = 0; image_X < image.width; image_X++) {
            for (let image_Y = 0; image_Y < image.height; image_Y++) {
                let pixel;
                let new_pixel = [0,0,0,255];
                for (let kernel_X = -this.kernel_offset_X; kernel_X <= this.kernel_offset_X; kernel_X++) {
                    for (let kernel_Y = -this.kernel_offset_Y; kernel_Y <= this.kernel_offset_Y; kernel_Y++) {
                        pixel = this.get_image_pixel_at(image, image_X + kernel_X, image_Y + kernel_Y);
                        for (let pixel_component = 0; pixel_component < pixel.length - 1; pixel_component++) {
                            let kernel_value = this.#get_kernel_pixel_at(kernel_X, kernel_Y);
                            new_pixel[pixel_component] = new_pixel[pixel_component] + (pixel[pixel_component] * kernel_value);
                        }
                    }

                    new_pixel = this.pixel_clamp(new_pixel);
                    this.put_image_pixel_at(image, image_X, image_Y, new_pixel);
                }
            }
        }
    }

    /**
     * Devuelve el pixel de la image en una posicion dada
     * Si la posicion esta fuera de la imagen el valor retornado es negro solido
     * @param {ImageData} image
     * @param {Number} pos_X
     * @param {Number} pos_Y
     */
    get_image_pixel_at(image, pos_X, pos_Y) {
        if (
            pos_X >= 0 && pos_X < image.width &&
            pos_Y >= 0 && pos_Y < image.height
        ) {
            return [
                image.data[((pos_Y * image.width + pos_X) * 4) + 0],
                image.data[((pos_Y * image.width + pos_X) * 4) + 1],
                image.data[((pos_Y * image.width + pos_X) * 4) + 2],
                image.data[((pos_Y * image.width + pos_X) * 4) + 3]
            ]
        } else {
            return [0, 0, 0, 255];
        }
    }

    //Coloca el pixel en una posicion especifica de la imagen
    put_image_pixel_at(image, pos_X, pos_Y, pixel) {
        if (
            pos_X >= 0 && pos_X < image.width &&
            pos_Y >= 0 && pos_Y < image.height
        ) {
            image.data[((pos_Y * image.width + pos_X) * 4) + 0] = pixel[0];
            image.data[((pos_Y * image.width + pos_X) * 4) + 1] = pixel[1];
            image.data[((pos_Y * image.width + pos_X) * 4) + 2] = pixel[2];
            image.data[((pos_Y * image.width + pos_X) * 4) + 3] = pixel[3];
        } else {
            throw new RangeError("Posicion no valida");
        }
    }

    //Posicion de un valor del kernel en una posicion dada
    #get_kernel_pixel_at(pos_X, pos_Y) {
        const index = (pos_Y + this.kernel_offset_Y) * this.width + (pos_X + this.kernel_offset_X);
        return this.pixels_class[index];
    }

    //Limitar el valor del pixel dentro del rango dictado en el constructor
    pixel_clamp(pixel) {
        for(let i = 0; i < 4; i++) {
            if (pixel[i] < this.pixel_min) {
                pixel[i] = 0;
            } else if (pixel[i] > this.pixel_max) {
                pixel[i] = 255;
            } else {
                //Tamaño del rango de valores de pixel
                let span = this.pixel_max - this.pixel_min;

                //Valor escalado
                let valueScaled = (pixel[i] - this.pixel_min) / span;

                pixel[i] = valueScaled * 255;
            }
        }

        return pixel;
    }

}

export { Kernel };