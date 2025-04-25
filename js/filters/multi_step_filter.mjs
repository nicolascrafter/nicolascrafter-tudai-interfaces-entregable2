"use strict";

class MultiStepFilter {

    #kernels = [];

    constructor(kernels) {
        this.#kernels = kernels;
    }

    applyFilter(image) {
        for (let i = 0; i < this.#kernels.length; i++) {
            this.#kernels[i].applyFilter(image);
        }
    }
}

export {MultiStepFilter};