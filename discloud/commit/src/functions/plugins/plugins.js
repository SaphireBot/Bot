import ms from 'parse-ms'

// Flag Gaming - Quiz Anime Theme
function formatString(string) {

    if (typeof string !== 'string') return null

    let tras = false

    if (string.includes('-')) {
        tras = true
        string = string.replace(/-/g, ' ')
    }

    let format = string.split(/ +/g)
    let result = ''

    for (let word of format)
        if (word.length > 2 || !['de', 'do', 'da'].includes(word))
            if (tras)
                result += word[0].toUpperCase() + word.substring(1) + ' '
            else result += word[0].toUpperCase() + word.substring(1) + ' '
        else result += word + ' '

    if (tras) {
        result = result.replace(/ /g, '-')
        tras = false
    }

    return result.slice(0, -1)
}

// Emojing Ranking
function emoji(i) {
    return {
        0: '🥇',
        1: '🥈',
        2: '🥉'
    }[i] || '🏅'
}

// Forca Gaming
function formatWord(word) {
    let format = ''
    for (let i of word) i === ' ' ? format += '-' : format += '_'
    return format.split('')
}

// palavamisturada.js
function formatArray(array) {

    // Solution by: Mrs_Isa♔༆#0002 - 510914249875390474

    const arrayComSubArrays = [];
    for (let i = 0; i < array.length; i++) {
        arrayComSubArrays.push([array[i], array[i + 1]]);
        array.splice(i + 1, 1);
    }

    return arrayComSubArrays.map(a => a.reduce((y, z) => `\`${y}\` ${z ? `- \`${z}\`` : ''}`)).join('\n');
}

// palavamisturada.js
function Mix(string) {
    // Solution by: Mateus Santos#4492 - 307983856135438337
    return string
        .toLowerCase()
        .split('')
        .sort(() => (0.5 - Math.random()))
        .join('')
}

// palavamisturada.js
function GetWord(Palavras) {
    return Palavras[Math.floor(Math.random() * Palavras.length)]
}

// Number < 10 = 00 01 02 03 04 05 06 07 08 09
function formatNumberCaracters(number) {
    return number < 10 ? `0${number}` : `${number}`
}

// Gerador de códigos em STRING
function CodeGenerator(number = 1) {

    if (isNaN(number) || number <= 0) number = 1

    let Result = ''
    const Caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < number; i++)
        Result += Caracteres.random()

    return Result;
}

function GetTimeout(TimeToCooldown = 0, DateNowInDatabase = 0, withDateNow = true) {

    const Time = withDateNow ? ms(TimeToCooldown - (Date.now() - DateNowInDatabase)) : ms(TimeToCooldown)
    const Day = Time.days > 0 ? `${Time.days}d` : ''
    const Hours = Time.hours > 0 ? `${Time.hours}h` : ''
    const Minutes = Time.minutes > 0 ? `${Time.minutes}m` : ''
    const Seconds = Time.seconds > 0 ? `${Time.seconds}s` : ''
    const Nothing = !Day && !Hours && !Minutes && !Seconds ? '0s' : ''
    let Dh = '', Hm = '', Ms = ''

    if (Time.days > 365) return '+365 dias'

    if (Day && Hours || Day && Minutes || Day && Seconds) Dh = 'SPACE'
    if (Hours && Minutes || Hours && Seconds) Hm = 'SPACE'
    if (Minutes && Seconds) Ms = 'SPACE'

    return `${Day}${Dh}${Hours}${Hm}${Minutes}${Ms}${Seconds}${Nothing}`.replace(/SPACE/g, ' ')
}

export {
    formatString,
    formatArray,
    Mix,
    GetWord,
    formatNumberCaracters,
    emoji,
    formatWord,
    CodeGenerator,
    GetTimeout
}