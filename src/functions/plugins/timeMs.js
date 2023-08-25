import moment from "moment-timezone"

export default Time => {

    if (Time == "00:00") Time = 'tomorrow 00:00'

    let Args = Time?.toLowerCase()?.trim().split(/ +/g)
    let timeResult = 0
    const today = new Date().getDay()

    const week = {
        domingo: 0, sunday: 0,
        segunda: 1, 'segunda-feira': 1, monday: 1,
        terça: 2, 'terça-feira': 2, tuesday: 2,
        quarta: 3, 'quarta-feira': 3, wednesday: 3,
        quinta: 4, 'quinta-feira': 4, thursday: 4,
        sexta: 5, 'sexta-feira': 5, friday: 5,
        sabado: 6, sábado: 6, saturday: 6,
        hoje: today + 1, today: today + 1, tomorrow: today + 1, amanhã: today + 1
    }[Args[0]?.toLowerCase()]

    if (week !== undefined)
        return calculateWeek()

    return Args[0].includes('/') || Args[0].includes(':') ? withDay() : minimalDay()

    function minimalDay() {
        for (let i = 0; i < Args.length; i++) {

            if (['a', 'y'].includes(Args[i].at(-1)) || ['ano', 'year', 'anos', 'y'].includes(Args[i + 1])) {
                const string = ['a', 'y'].includes(Args[i].at(-1)) ? `${Args[i]}` : `${Args[i]}${Args[i + 1]}`
                let time = formatString(string) * 60 * 60 * 24 * 365
                if (isNaN(time)) return null
                timeResult += parseInt(time)
                continue
            }

            if (Args[i].at(-1).includes('d') || ['dias', 'dia', 'day', 'days', 'd'].includes(Args[i + 1])) {
                const string = Args[i].at(-1).includes('d') ? `${Args[i]}` : `${Args[i]}${Args[i + 1]}`
                let time = formatString(string) * 60 * 60 * 24
                if (isNaN(time)) return null
                timeResult += parseInt(time)
                continue
            }

            if (Args[i].slice(-1).includes('h') || ['horas', 'hora', 'hour', 'hours', 'h'].includes(Args[i + 1])) {
                const string = Args[i].at(-1).includes('h') ? `${Args[i]}` : `${Args[i]}${Args[i + 1]}`
                let time = formatString(string) * 60 * 60
                if (isNaN(time)) return null
                timeResult += parseInt(time)
                continue
            }

            if (Args[i].slice(-1).includes('m') || ['minuto', 'minutos', 'minute', 'minutes', 'm'].includes(Args[i + 1])) {
                const string = Args[i].at(-1).includes('m') ? `${Args[i]}` : `${Args[i]}${Args[i + 1]}`
                let time = formatString(string) * 60
                if (isNaN(time)) return null
                timeResult += parseInt(time)
                continue
            }

            if (Args[i].slice(-1).includes('s') || ['segundo', 'segundos', 'second', 'seconds', 's'].includes(Args[i + 1])) {
                const string = Args[i].at(-1).includes('s') ? `${Args[i]}` : `${Args[i]}${Args[i + 1]}`
                let time = formatString(string)
                if (isNaN(time)) return null
                timeResult += parseInt(time)
                continue
            }

            continue
        }
        return timeResult
    }

    function withDay() {

        let data = Args[0]
        let hour = Args[1]

        if (['tomorrow', 'amanhã'].includes(data.toLowerCase()))
            data = day(true)

        if (['hoje', 'today'].includes(data.toLowerCase()))
            data = day()

        if (!hour && data.includes(':') && data.length <= 8) {
            data = day()
            hour = Args[0]
        }

        if (data.includes('/') && data.length === 10 && !hour)
            hour = '12:00'

        if (!data || !hour) return null

        const dataArray = data.split('/')
        const hourArray = hour.split(':')
        const dia = parseInt(dataArray[0])
        const mes = parseInt(dataArray[1]) - 1
        const ano = parseInt(dataArray[2]) || new Date().getFullYear()
        const hora = parseInt(hourArray[0]) || 0
        const minutos = parseInt(hourArray[1]) || 0
        const segundos = parseInt(hourArray[2]) || 0

        let date = moment.tz({ day: dia, month: mes, year: ano, hour: hora, minutes: minutos, seconds: segundos }, "America/Sao_Paulo")
        if (!date.isValid()) return null
        date = date.valueOf()
        if (date < Date.now()) return false
        timeResult += date - Date.now()

        return timeResult
    }

    function calculateWeek() {

        const date = new Date()
        date.setDate(date.getDate() + ((week || 0) - 1 - date.getDay() + 7) % 7 + 1);
        Args = `${date.toLocaleDateString("pt-BR")} ${Args.slice(1).join(' ') || '12:00'}`.split(/ +/g)
        return withDay()
    }

}

function day(tomorrow = false) {

    const date = new Date()

    if (tomorrow)
        date.setDate(date.getDate() + 1)

    const Mes = FormatNumber(date.getMonth() + 1)
    const Dia = FormatNumber(date.getDate())
    const Ano = date.getFullYear()

    return `${Dia}/${Mes}/${Ano}`

    function FormatNumber(number) {
        return number < 10 ? `0${number}` : number
    }
}

function formatString(string) {
    return string
        .replace(/(\D+)/, str => {
            if ([
                's',
                'segundo',
                'segundos',
                'second',
                'seconds',

                'm',
                'minuto',
                'minutos',
                'minutes',
                'minute',

                'h',
                'hora',
                'horas',
                'hour',
                'hours',

                'd',
                'dia',
                'dias',
                'day',
                'days',

                'a',
                'ano',
                'anos',
                'y',
                'year',
                'years',
            ].includes(str)) return '000'
        })
}