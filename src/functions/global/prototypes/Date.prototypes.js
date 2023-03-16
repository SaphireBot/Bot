import { time } from 'discord.js'
import parsems from 'parse-ms'

const TimestampStyles = {
    /**
     * Short time format, consisting of hours and minutes, e.g. 16:20
     */
    t: "t",
    /**
     * Long time format, consisting of hours, minutes, and seconds, e.g. 16:20:30
     */
    T: "T",
    /**
     * Short date format, consisting of day, month, and year, e.g. 20/04/2021
     */
    d: "d",
    /**
     * Long date format, consisting of day, month, and year, e.g. 20 April 2021
     */
    D: "D",
    /**
     * Short date-time format, consisting of short date and short time formats, e.g. 20 April 2021 16:20
     */
    f: "f",
    /**
     * Long date-time format, consisting of long date and short time formats, e.g. Tuesday, 20 April 2021 16:20
     */
    F: "F",
    /**
     * Relative time format, consisting of a relative duration format, e.g. 2 months ago
     */
    R: "R"
}

Date.prototype.constructor.complete = ms => {
    return `${time(new Date(ms), 'D')} ás ${time(new Date(ms), 'T')}`
}

Date.prototype.constructor.GetTimeout = function (TimeToCooldown = 0, DateNowInDatabase = 0, style) {

    const Time = ~~((TimeToCooldown + DateNowInDatabase) / 1000)

    return time(Time, TimestampStyles[style] || 't')
}

Date.prototype.constructor.Timeout = (TimeoutInMS = 0, DateNowAtDatabase = 0) => TimeoutInMS - (Date.now() - DateNowAtDatabase) > 0

Date.prototype.constructor.Timestamp = function (TimeInMs = 0, style, isDate) {

    if (isDate) return time(TimeInMs, TimestampStyles[style] || 't')

    return time(new Date((Date.now() + TimeInMs) / 1000).valueOf(), TimestampStyles[style] || 't')

}

Date.prototype.constructor.format = function (DateInMs = 0, Shorted = false, withDateNow = true) {

    if (Shorted)
        return new Date(DateInMs + Date.now()).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })

    const date = withDateNow ? new Date(DateInMs + Date.now()) : new Date(DateInMs)

    return Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'medium' }).format(date)
}

// Função para chegar a data de aniversário
Date.prototype.constructor.eightyYears = (formatBr = false) => {

    const date = new Date(Date.now() - 3155760000000) // 80 anos no passado
    const Dia = FormatNumber(date.getDate())
    const Ano = date.getFullYear()

    if (formatBr)
        return `${Dia}/${FormatNumber(date.getMonth() + 1)}/${Ano}`

    return `${Ano}-${FormatNumber(date.getMonth() + 1)}-${Dia}`
}

// Função para chegar a data de aniversário
Date.prototype.constructor.thirteen = (formatBr = false) => {

    const date = new Date(Date.now() - 410248800000) // 13 anos no passado
    const Dia = FormatNumber(date.getDate())
    const Ano = date.getFullYear()

    if (formatBr)
        return `${Dia}/${FormatNumber(date.getMonth() + 1)}/${Ano}`

    return `${Ano}-${FormatNumber(date.getMonth() + 1)}-${Dia}`

}

Date.prototype.constructor.stringDate = ms => {

    if (!ms || isNaN(ms) || ms <= 0) return '0 segundo'

    const translate = {
        millennia: n => n == 1 ? 'milênio' : 'milênios',
        century: n => n == 1 ? 'século' : 'séculos',
        years: n => n == 1 ? 'ano' : 'anos',
        months: n => n == 1 ? 'mês' : 'meses',
        days: n => n == 1 ? 'dia' : 'dias',
        hours: n => n == 1 ? 'hora' : 'horas',
        minutes: n => n == 1 ? 'minuto' : 'minutos',
        seconds: n => n == 1 ? 'segundo' : 'segundos'
    }

    const date = { millennia: 0, century: 0, years: 0, months: 0, ...parsems(ms) }

    if (date.days >= 365)
        while (date.days >= 365) {
            date.years++
            date.days -= 365
        }

    if (date.days >= 30)
        while (date.days >= 30) {
            date.months++
            date.days -= 30
        }

    if (date.years >= 1000)
        while (date.years >= 1000) {
            date.millennia++
            date.years -= 1000
        }

    if (date.years >= 100)
        while (date.years >= 365) {
            date.century++
            date.years -= 100
        }

    const timeSequency = ['millennia', 'century', 'years', 'months', 'days', 'hours', 'minutes', 'seconds']
    let result = ''

    for (let time of timeSequency)
        if (date[time] > 0)
            result += `${date[time]} ${translate[time](date[time])} `

    return result?.trim()
}

function FormatNumber(data) {
    return data < 10 ? `0${data}` : data
}