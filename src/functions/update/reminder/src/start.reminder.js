import { SaphireClient as client } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'
import managerReminder from '../manager.reminder.js'
import NotifyUser from './notifier.reminder.js'
import revalidateTime from './revalidate.reminder.js'

export default async ({ user, data }) => {

    if (typeof user === 'string')
        user = await client.users.fetch(user || '0').catch(() => null)

    const RemindMessage = data?.RemindMessage?.slice(0, 3500)

    if (!user || !RemindMessage)
        return managerReminder.remove(data.id)

    const { isAutomatic } = data
    const guild = await client.guilds.fetch(data.guildId).catch(() => null)
    const Channel = await guild?.channels.fetch(data.ChannelId || "0").catch(() => null)
    const hasMember = await guild?.members.fetch({ user: user.id, cache: true, force: true }).catch(() => null)

    if (!guild || !Channel || !hasMember)
        return NotifyUser(user, RemindMessage, data.id)

    const msg = await Channel.send(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**`)
        .catch(async () => await  NotifyUser())

    if (!msg) return
    if (isAutomatic) return managerReminder.remove(data.id)

    managerReminder.setAlert(data.id)

    const emojis = ['💤', '📅', '🗑️']

    for (let i of emojis) msg?.react(i).catch(() => { })

    const collector = msg.createReactionCollector({
        filter: (reaction, u) => emojis.includes(reaction.emoji.name) && u.id === user.id,
        idle: 600000,
        max: 1,
        errors: ['idle', 'max']
    })
        .on('collect', async (reaction) => {

            const { emoji } = reaction

            if (emoji.name === emojis[1]) {
                msg.delete().catch(() => { })
                return revalidateTime(Channel, user, data)
            }

            collector.stop()
            await msg.reactions.removeAll().catch(() => { })

            if (emoji.name === emojis[2]) {
                managerReminder.remove(data.id)
                return msg.edit(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**\n${e.Info} | Lembrete deletado.`)
            }

            if (emoji.name === emojis[0])
                return managerReminder.snooze(msg, data.id, user)

            return
        })
        .on('end', (_, reason) => {
            msg.reactions.removeAll().catch(() => { })
            if (['user', 'limit'].includes(reason)) return
            managerReminder.remove(data.id)
            if (!msg) return
            return msg.edit(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**\n${e.Info} | Lembrete deletado.`).catch(() => { })
        })

    return
}