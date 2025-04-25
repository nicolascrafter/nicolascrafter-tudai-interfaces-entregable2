"use strict";

import { Kernel } from "./kernel.mjs";
import { MultiStepFilter } from "./multi_step_filter.mjs";
import { RgbKernel } from "./rgb_kernel.mjs";

class FilterFactory {
    static makeNegativo () {
        return new Kernel(1, 1, [-1], -255, 0);
    }

    static makeBrillo (multiplicador) {
        return new Kernel(1, 1, [multiplicador], 0, 255);
    }

    static makeSepia () {
        return new RgbKernel(1, 1, [0.393, 0.769, 0.189, 0.349, 0.686, 0.168, 0.272, 0.534, 0.131], 0, 255);
    }

    static makeBinarizacion(threshold) {
        //Esto basicamente aplica un filtro de escala de grises antes de aplicar el clamping
        return new RgbKernel(1, 1, [1/3, 1/3, 1/3, 1/3, 1/3, 1/3, 1/3, 1/3, 1/3], threshold, threshold);
    }

    static makeBlur(radio) {
        let values = new Array(radio * radio);

        for (let i = 0; i < values.length; i++) {
            values[i] = 1/ (radio * radio);
        }

        return new Kernel(radio, radio, values, 0, 255);
    }

    static makeSobel() {
        let x_kernel = new Kernel(3, 3, [-1, 0, 1, -2, 0, 2, -1, 0, 1], -255, 255);
        let y_kernel = new Kernel(3, 3, [-1, -2, -1, 0, 0, 0, 1, 2, 1], -255, 255);

        return new MultiStepFilter([x_kernel, y_kernel]);
    }
}

export {FilterFactory};