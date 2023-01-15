import { Database, SaphireClient as client } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'
import timeMs from '../../../plugins/timeMs.js'
import reminderStart from './start.reminder.js'

export default async (Channel, user, data) => {

    const msg = await Channel.send({
        embeds: [{
            color: client.blue,
            title: `⏱️ | ${client.user.username}'s Time System`,
            description: `${e.Loading} Diga uma nova data para disparo neste mesmo lembrete.`,
            fields: [
                {
                    name: '📝 Formas de Escrita',
                    value: "> `h - m - s` - Hora, Minuto, Segundo\n> `1h 10m 40s` - `1m 10s` - `2h 10m`\n> `2 dias 10 minutos 5 segundos`\n> `30/01/2022 14:35:25` *Os segundos são opcionais*\n> `hoje 14:35` - `amanhã 14:35`\n> `09:10` - `14:35` - `30/01/2022` - `00:00`"
                }
            ]
        }]
    })

    let CollectControl = false

    const collector = Channel.createMessageCollector({
        filter: m => m.author.id === user.id,
        time: 600000,
        dispose: true,
        max: 1
    })
        .on('collect', m => {

            if (['cancel', 'cancelar', 'fechar', 'close'].includes(m.content))
                return collector.stop()

            const DefinedTime = timeMs(m.content)

            if (!DefinedTime) return m.reply(`${e.Deny} | O tempo que você passou não é válido. Por favor, crie outro lembrete. Lembrete deletado.`)
            if (DefinedTime < 3000) return m.reply(`${e.Deny} | O tempo mínimo é de 3 segundos. Lembrete deletado.`)
            if (DefinedTime > 31536000000) return m.reply(`${e.Deny} | O tempo limite é de 1 ano. Lembrete deletado.`)

            CollectControl = true

            editReminderTimer(DefinedTime, m)
            return msg.delete().catch(() => { })
        })
        .on('end', () => {
            if (CollectControl) return
            Database.deleteReminders(data.id)
            return msg.delete().catch(() => { })
        })

    return

    async function editReminderTimer(DefinedTime, message) {

        const reminderData = await Database.Reminder.findOneAndUpdate(
            { id: data.id },
            {
                Time: DefinedTime,
                DateNow: Date.now(),
                Alerted: false
            }
        )

        setTimeout(() => reminderStart({ user, data: reminderData }), DefinedTime)

        return message.reply(`${e.Check} | Tudo bem! Lembrete redefinido! Novo disparo **${Date.GetTimeout(DefinedTime, Date.now(), 'R')}**`).catch(() => { })
    }
}