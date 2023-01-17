import moment from "moment-timezone"

export default (Time) => {

    const Args = Time?.toLowerCase()?.trim().split(/ +/g)
    let timeResult = 0

    if (Args[0].includes('/') || Args[0].includes(':') || ['hoje', 'today', 'tomorrow', 'amanhã'].includes(Args[0]?.toLowerCase())) {

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
        const ano = parseInt(dataArray[2]) || '2023'
        const hora = parseInt(hourArray[0])
        const minutos = parseInt(hourArray[1])
        const segundos = parseInt(hourArray[2]) || 0

        let date = moment.tz({ day: dia, month: mes, year: ano, hour: hora, minutes: minutos, seconds: segundos }, "America/Sao_Paulo")

        if (!date.isValid()) return null

        date = date.valueOf()

        if (date < Date.now()) return false

        timeResult += date - Date.now()

    } else
        for (let i = 0; i < Args.length; i++) {

            if (Args[i].at(-1).includes('d') || ['dias', 'dia', 'day', 'days'].includes(Args[i + 1])) {
                const string = Args[i].at(-1).includes('d') ? `${Args[i]}` : `${Args[i]}${Args[i + 1]}`
                let time = formatString(string) * 60 * 60 * 24
                if (isNaN(time)) return null
                timeResult += parseInt(time)
                continue
            }

            if (Args[i].slice(-1).includes('h') || ['horas', 'hora', 'hour', 'hours'].includes(Args[i + 1])) {
                const string = Args[i].at(-1).includes('h') ? `${Args[i]}` : `${Args[i]}${Args[i + 1]}`
                let time = formatString(string) * 60 * 60
                if (isNaN(time)) return null
                timeResult += parseInt(time)
                continue
            }

            if (Args[i].slice(-1).includes('m') || ['minuto', 'minutos', 'minute', 'minutes'].includes(Args[i + 1])) {
                const string = Args[i].at(-1).includes('m') ? `${Args[i]}` : `${Args[i]}${Args[i + 1]}`
                let time = formatString(string) * 60
                if (isNaN(time)) return null
                timeResult += parseInt(time)
                continue
            }

            if (Args[i].slice(-1).includes('s') || ['segundo', 'segundos', 'second', 'seconds'].includes(Args[i + 1])) {
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
                'd',
                'dia',
                'dias',
                'day',
                'days',
                'h',
                'hora',
                'horas',
                'hour',
                'hours',
                'm',
                'minuto',
                'minutos',
                'minutes',
                'minute',
                's',
                'segundo',
                'segundos',
                'second',
                'seconds'
            ].includes(str)) return '000'
        })
}