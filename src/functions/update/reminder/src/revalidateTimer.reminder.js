import { Database, SaphireClient as client } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'
import * as moment from 'moment-timezone'

export default async (Channel, user, data) => {

    const msg = await Channel.send(`${e.Loading} | Quando que eu devo te lembrar novamente?\n> Formato 1: \`h, m, s\` - Exemplo: 1h 10m 40s *(1 hora, 10 minutos, 40 segundos)* ou \`1m 10s\`, \`2h 10m\`\n> Formato 2: \`30/01/2022 14:35:25\` - *(Os segundos são opcionais)*\n> Formato 3: \`hoje 14:35 | amanhã 14:35\`\n> Formato 4: \`14:35\``)
    let CollectControl = false

    const collector = Channel.createMessageCollector({
        filter: (m) => m.author.id === user.id,
        time: 600000,
        dispose: true,
        max: 1
    })
        .on('collect', m => {

            if (['cancel', 'cancelar', 'fechar', 'close'].includes(m.content))
                return collector.stop()

            let Args = m.content.trim().split(/ +/g)
            let DefinedTime = 0

            if (Args[0].includes('/') || Args[0].includes(':') || ['hoje', 'today', 'tomorrow', 'amanhã'].includes(Args[0]?.toLowerCase())) {

                let data = Args[0]
                let hour = Args[1]

                if (['tomorrow', 'amanhã'].includes(data.toLowerCase()))
                    data = day(true)

                if (['hoje', 'today'].includes(data.toLowerCase()))
                    data = day()

                if (!hour && data.includes(':') && data.length <= 5) {
                    data = day()
                    hour = Args[0]
                }

                if (!data || !hour)
                    return m.reply(`${e.Deny} | A data informada não é a correta. Lembrete deletado.`)

                let dataArray = data.split('/')
                let hourArray = hour.split(':')
                let dia = parseInt(dataArray[0])
                let mes = parseInt(dataArray[1]) - 1
                let ano = parseInt(dataArray[2])
                let hora = parseInt(hourArray[0])
                let minutos = parseInt(hourArray[1])
                let segundos = parseInt(hourArray[2]) || 0

                let date = moment.tz({ day: dia, month: mes, year: ano, hour: hora, minutes: minutos, seconds: segundos }, "America/Sao_Paulo")

                if (!date.isValid())
                    return m.reply(`${e.Deny} | Data inválida! Verifique se a data esta realmente correta: \`dd/mm/aaaa hh:mm\` *(dia, mês, ano, horas, minutos)*\n${e.Info} | Exemplo: \`30/01/2022 14:35:25\` *(Os segundos são opcionais)* Lembrete deletado.`)

                date = date.valueOf()

                if (date < Date.now())
                    return m.reply(`${e.Deny} | O tempo do lembrete deve ser maior que o tempo de "agora", não acha? Lembrete deletado.`)

                DefinedTime += date - Date.now()

            } else {

                for (let arg of Args) {

                    if (arg.slice(-1).includes('d')) {
                        let time = arg.replace(/d/g, '000') * 60 * 60 * 24
                        if (isNaN(time)) return cancelReminder()
                        DefinedTime += parseInt(time)
                        continue
                    }

                    if (arg.slice(-1).includes('h')) {
                        let time = arg.replace(/h/g, '000') * 60 * 60
                        if (isNaN(time)) return cancelReminder()
                        DefinedTime += parseInt(time)
                        continue
                    }

                    if (arg.slice(-1).includes('m')) {
                        let time = arg.replace(/m/g, '000') * 60
                        if (isNaN(time)) return cancelReminder()
                        DefinedTime += parseInt(time)
                        continue
                    }

                    if (arg.slice(-1).includes('s')) {
                        let time = arg.replace(/s/g, '000')
                        if (isNaN(time)) return cancelReminder()
                        DefinedTime += parseInt(time)
                        continue
                    }

                    return m.reply(`${e.Deny} | Tempo inválido! Verifique se o tempo dito segue esse formato: \`1d 2h 3m 4s\`. Lembrete deletado.`)
                }
            }

            if (DefinedTime < 3000) return m.reply(`${e.Deny} | O tempo mínimo é de 3 segundos. Lembrete deletado.`)
            if (DefinedTime > 31536000000) return m.reply(`${e.Deny} | O tempo limite é de 1 ano. Lembrete deletado.`)

            CollectControl = true

            editReminderTimer(DefinedTime, m)
            return msg.delete().catch(() => { })

            function cancelReminder() {
                collector.stop()
                return m.reply(`${e.Deny} | Tempo inválido! Use novamente o comando  e verifique se o tempo dito segue esse formato: \`1d 2h 3m 4s\` Lembrete deletado.`)
            }

        })

        .on('end', () => {
            if (CollectControl) return
            Database.deleteReminders(data.id)
            return msg.delete().catch(() => { })
        })

    return

    async function editReminderTimer(DefinedTime, message) {

        await Database.Reminder.updateOne(
            { id: data.id },
            {
                Time: DefinedTime,
                DateNow: Date.now(),
                $unset: { Alerted: 1 }
            }
        )

        return message.reply(`${e.ReminderBook} | Tudo bem! Lembrete definido: **${Date.GetTimeout(DefinedTime, Date.now(), 'R')}**`).catch(() => { })
    }


    function day(tomorrow = false) {

        const date = new Date()
        date.setHours(date.getHours() - 3)

        if (tomorrow)
            date.setDate(date.getDate() + 1)

        const Mes = FormatNumber(date.getMonth() + 1)
        const Dia = FormatNumber(date.getDate())
        const Ano = date.getFullYear()

        return `${Dia}/${Mes}/${Ano}`
    }

    function FormatNumber(data) {
        return data < 10 ? `0${data}` : data
    }
}