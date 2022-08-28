/**
 * Função adicionada ao Array que pega um item aleatório do mesmo.
 */
Array.prototype.random = function (times = 0, repeat = false) {

    if (times > 0) {
        let newArray = []

        if (repeat)
            for (let i = 0; i < times; i++)
                newArray.push(originalArray[~~(Math.random() * originalArray.length)])
        else {
            let originalArray = [...this]
            for (let i = 0; i < times; i++) {
                let value = ~~(Math.random() * originalArray.length)
                newArray.push(originalArray[value])
                originalArray.splice(value, 1)
            }
        }

        return newArray
    }

    return this[~~(Math.random() * this.length)]
}

/**
 * @returns Array randomizado
 */
Array.prototype.randomize = function () {
    return this.sort(() => Math.random() - Math.random())
}