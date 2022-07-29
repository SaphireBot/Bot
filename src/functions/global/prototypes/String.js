String.prototype.didYouMean = function (array) { // Credits: JackSkelt#3063 - 904891162362519562
    return array
        .map(e => { return { e, v: checkSimilarity(this, e) } })
        .filter(({ v }) => v >= 80 / 100)
        .reduce((_, curr, i, arr) => arr[i].v > curr ? arr[i].v : curr.e, null)
}

String.prototype.isURL = function () {
    const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    return regexp.test(this)
}

function checkSimilarity(str1, str2) { // Credits: JackSkelt#3063 - 904891162362519562
    if (str1 === str2) return 1.0

    const len1 = str1.length
    const len2 = str2.length

    const maxDist = ~~(Math.max(len1, len2) / 2) - 1
    let matches = 0

    const hash1 = []
    const hash2 = []

    for (let i = 0; i < len1; i++)
        for (let j = Math.max(0, i - maxDist); j < Math.min(len2, i + maxDist + 1); j++)
            if (str1.charAt(i) === str2.charAt(j) && !hash2[j]) {
                hash1[i] = 1
                hash2[j] = 1
                matches++
                break
            }

    if (!matches) return 0.0

    let t = 0
    let point = 0

    for (let k = 0; k < len1; k++)
        if (hash1[k]) {
            while (!hash2[point])
                point++

            if (str1.charAt(k) !== str2.charAt(point++))
                t++
        }

    t /= 2

    return ((matches / len1) + (matches / len2) + ((matches - t) / matches)) / 3.0
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