import moment from "moment"

export default (Time) => {

    let Args = Time.trim().split(/ +/g)
    let timeResult = 0

    if (Args[0].includes('/') || Args[0].includes(':') || ['hoje', 'today', 'tomorrow', 'amanhã'].includes(Args[0]?.toLowerCase())) {

        let data = Args[0],
            hour = Args[1]

        if (['tomorrow', 'amanhã'].includes(data.toLowerCase()))
            data = day(true)

        if (['hoje', 'today'].includes(data.toLowerCase()))
            data = day()

        if (!hour && data.includes(':') && data.length <= 5) {
            data = day()
            hour = Args[0]
        }

        if (data.includes('/') && data.length === 10 && !hour)
            hour = '12:00'

        if (!data || !hour) return null

        let dataArray = data.split('/')
        let hourArray = hour.split(':')
        let dia = parseInt(dataArray[0])
        let mes = parseInt(dataArray[1]) - 1
        let ano = parseInt(dataArray[2])
        let hora = parseInt(hourArray[0])
        let minutos = parseInt(hourArray[1])
        let segundos = parseInt(hourArray[2]) || 0

        let date = moment.tz({ day: dia, month: mes, year: ano, hour: hora, minutes: minutos, seconds: segundos }, "America/Sao_Paulo")

        if (!date.isValid()) return null

        date = date.valueOf()

        if (date < Date.now()) return null

        timeResult += date - Date.now()

    } else
        for (let arg of Args) {

            if (arg.slice(-1).includes('d')) {
                let time = arg.replace(/d/g, '000') * 60 * 60 * 24
                if (isNaN(time)) return null
                timeResult += parseInt(time)
                continue
            }

            if (arg.slice(-1).includes('h')) {
                let time = arg.replace(/h/g, '000') * 60 * 60
                if (isNaN(time)) return null
                timeResult += parseInt(time)
                continue
            }

            if (arg.slice(-1).includes('m')) {
                let time = arg.replace(/m/g, '000') * 60
                if (isNaN(time)) return null
                timeResult += parseInt(time)
                continue
            }

            if (arg.slice(-1).includes('s')) {
                let time = arg.replace(/s/g, '000')
                if (isNaN(time)) return null
                timeResult += parseInt(time)
                continue
            }

            return null
        }

    return timeResult
}

function day(tomorrow = false) {

    const date = new Date()
    date.setHours(date.getHours() - 3)

    if (tomorrow)
        date.setDate(date.getDate() + 1)

    let Mes = FormatNumber(date.getMonth() + 1)
    let Dia = FormatNumber(date.getDate())
    let Ano = date.getFullYear()

    return `${Dia}/${Mes}/${Ano}`

    function FormatNumber(number) {
        return number < 10 ? `0${number}` : number
    }
}