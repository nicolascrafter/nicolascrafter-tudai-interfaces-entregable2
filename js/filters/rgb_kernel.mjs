"use strict";

import { Kernel } from "./kernel.mjs";

class RgbKernel extends Kernel {

    constructor(width, height, pixels, pixel_min, pixel_max) {
        super(width, height, pixels, pixel_min, pixel_max);
    }

    applyFilter(image) {
        //Iterar toda la imagen
        for (let image_X = 0; image_X < image.width; image_X++) {
            for (let image_Y = 0; image_Y < image.height; image_Y++) {
                let pixel;
                let new_pixel = [0,0,0,255];
                for (let kernel_X = -this.kernel_offset_X; kernel_X <= this.kernel_offset_X; kernel_X++) {
                    for (let kernel_Y = -this.kernel_offset_Y; kernel_Y <= this.kernel_offset_Y; kernel_Y++) {
                        pixel = this.get_image_pixel_at(image, image_X + kernel_X, image_Y + kernel_Y);
                        let kernel_value = this.#get_kernel_pixel_at(kernel_X, kernel_Y);
                        //Oops, todo matematicas. No se como acabe con una multiplicacion matriz - vector
                        //Indices 0, 1 y 2 del rgb kernel value corresponden a cuanto le afectan los canales
                        //rojo, verde y azul respectivamente al canal rojo resultante
                        new_pixel[0] += pixel[0] * kernel_value[0] + pixel[1] * kernel_value[1] + pixel[2] * kernel_value[2];
                        //Lo mismo que arriba pero en el verde resultante con los indices 3, 4 y 5 del kernel
                        new_pixel[1] += pixel[0] * kernel_value[3] + pixel[1] * kernel_value[4] + pixel[2] * kernel_value[5];
                        //Y por ultimo el azul resultante con los indices 6, 7 y 8 del kernel
                        new_pixel[2] += pixel[0] * kernel_value[6] + pixel[1] * kernel_value[7] + pixel[2] * kernel_value[8];
                    }

                    new_pixel = this.pixel_clamp(new_pixel);
                    this.put_image_pixel_at(image, image_X, image_Y, new_pixel);
                }
            }
        }
    }

    #get_kernel_pixel_at(pos_X, pos_Y) {
        const index = ((pos_Y + this.kernel_offset_Y) * this.width + (pos_X + this.kernel_offset_X)) * 9;
        return this.pixels_class.slice(index, index + 9);
    }

}

export {RgbKernel};