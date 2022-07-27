Number.prototype.currency = function () {
    let numberFormated = `${Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(this)}`
    return numberFormated.substring(0, numberFormated.length - 3).slice(3)
}

Number.prototype.int = function () {
    return parseInt(this)
}