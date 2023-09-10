String.prototype.isURL = function () {
    const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    return regexp.test(this)
}

Object.defineProperty(String.prototype, 'isHex', {
    get: function () {
        if (!this) return null
        return /^#[0-9A-F]{6}$/i.test(`${this}`)
    }
})

Object.defineProperty(String.prototype, 'isUrl', {
    get: function () {
        if (!this) return false
        const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
        return regexp.test(this)
    }
})

Object.defineProperty(String.prototype, 'isAlphanumeric', {
    get: function () {
        return /^\w+$/.test(this);
    }
})

String.prototype.random = function (times = 0, repeat = false) {

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

String.prototype.captalize = function formatString(withTrace = true) {

    if (!this) return null

    let string = this

    if (typeof string !== 'string') return null

    let tras = false

    if (string.includes('-')) {
        tras = true
        string = string.replace(/-/g, ' ')
    }

    let format = string.split(/ +/g)
    let result = ''

    for (let word of format)
        if (word.length > 2 || !['de', 'do', 'da', 'e', 'com'].includes(word))
            if (tras)
                result += word[0].toUpperCase() + word.substring(1) + ' '
            else result += word[0].toUpperCase() + word.substring(1) + ' '
        else result += word + ' '

    if (tras) {
        result = result.replace(/ /g, withTrace ? '-' : ' ')
        tras = false
    }

    return result.slice(0, -1)
}

const keys = { k: 1_000, m: 1_000_000, b: 1_000_000_000, t: 1_000_000_000_000 }
String.prototype.toNumber = function () {
    const matches = this.match(/^([\d.,_]+)(k{1,3}|m{1,2}|b{1}|t{1})$/i);
    if (!matches) return 0;

    let num = parseInt(matches[1]);
    const sufix = matches[2]?.toLowerCase();
    if (isNaN(num)) return 0;
    for (const l of sufix) num *= keys[l]

    return num
}

String.prototype.limit = function (param) {

    const limit = {
        MessageEmbedTitle: 256,
        MessageEmbedDescription: 4096,
        MessageEmbedFields: 25,
        MessageEmbedFieldName: 256,
        MessageEmbedFieldValue: 1024,
        MessageEmbedFooterText: 2048,
        MessageEmbedAuthorName: 256,
        MessageContent: 2000,
        AutocompleteName: 100,
        AutocompleteValue: 100,
        SelectMenuLabel: 100,
        SelectMenuPlaceholder: 150,
        SelectMenuDescription: 100,
        SelectMenuValue: 100,
        ButtonLabel: 80
    }[param] || this.length

    if (this.length > limit)
        return `${this.slice(0, limit - 3)}...`

    return this.slice(0, limit)
}

String.prototype.cript = function (key, n = 126) {

    if (!(typeof (key) === 'number' && key % 1 === 0)
        || !(typeof (key) === 'number' && key % 1 === 0)
    )
        return this.toString()

    const chars = this.toString().split('');

    for (let i = 0; i < chars.length; i++) {
        let c = chars[i].charCodeAt(0);

        if (c <= n)
            chars[i] = String.fromCharCode((chars[i].charCodeAt(0) + key) % n)
    }

    return chars.join('');
}

String.prototype.descript = function (key, n = 126) {

    if (!(typeof (key) === 'number' && key % 1 === 0)
        || !(typeof (key) === 'number' && key % 1 === 0))
        return this.toString()

    return this.toString().cript(n - key);
}