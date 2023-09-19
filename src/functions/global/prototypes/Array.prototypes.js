/**
 * Função adicionada ao Array que pega um item aleatório do mesmo.
 */
Array.prototype.random = function (times = 0, repeat = false) {

    const newArray = [];

    if ((amount || 1) > 1) {
        if (repeat)
            for (let i = 0; i < (amount || 1); i++)
                newArray.push(this[~~(Math.random() * this.length)]);
        else {
            const originalArray = [...this];
            for (let i = 0; i < (amount || 1); i++) {
                if (!originalArray.length) break;
                const value = ~~(Math.random() * originalArray.length);
                newArray.push(originalArray[value]);
                originalArray.splice(value, 1);
            }
        }

        return newArray;
    }

    return this[~~(Math.random() * this.length)];
}

/**
 * @returns Array randomizado
 */
Array.prototype.randomize = function () {
    return this.sort(() => Math.random() - Math.random())
}