import { SaphireClient as client } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'
import managerReminder from '../manager.reminder.js'
import NotifyUser from './notifier.reminder.js'
import revalidateTime from './revalidate.reminder.js'

export default async ({ user, data }) => {

    if (typeof user === 'string')
        user = await client.users.fetch(user || '0').catch(() => null)

    const RemindMessage = data.RemindMessage.slice(0, 3500)
    const { isAutomatic } = data
    const guild = await client.guilds.fetch(data.guildId).catch(() => null)
    const Channel = await guild?.channels.fetch(data.ChannelId || "0").catch(() => NotifyUser(user, RemindMessage, data.id))

    if (!Channel || !Channel.guild || !Channel.guild?.members.cache.has(user.id))
        return NotifyUser(user, RemindMessage, data.id)

    const msg = await Channel.send(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**`)
        .catch(async () => {
            NotifyUser()
            return null
        })

    if (!msg) return
    if (isAutomatic) return managerReminder.remove(data.id)

    managerReminder.setAlert(data.id)

    const emojis = ['📅', '🗑️']

    for (let i of emojis) msg?.react(i).catch(() => { })

    const collector = msg.createReactionCollector({
        filter: (reaction, u) => emojis.includes(reaction.emoji.name) && u.id === user.id,
        idle: 600000,
        errors: ['idle']
    })
        .on('collect', (reaction) => {

            if (reaction.emoji.name === emojis[0]) {
                msg.delete().catch(() => { })
                return revalidateTime(Channel, user, data)
            }

            if (reaction.emoji.name === emojis[1]) {
                msg.reactions.removeAll().catch(() => { })
                managerReminder.remove(data.id)
                collector.stop()
                return msg.edit(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**\n${e.Info} | Lembrete deletado.`)
            }

            return
        })
        .on('end', (_, reason) => {
            if (reason !== 'user') return
            managerReminder.remove(data.id)
            if (!msg) return
            return msg.edit(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**\n${e.Info} | Lembrete deletado.`).catch(() => { })
        })

    return
}