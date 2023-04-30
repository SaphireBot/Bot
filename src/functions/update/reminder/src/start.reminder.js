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

    const isAutomatic = data.isAutomatic
    const guild = await client.guilds.fetch(data.guildId).catch(() => null)
    const Channel = await guild?.channels.fetch(data.ChannelId || "0").catch(() => null)
    const hasMember = await guild?.members.fetch({ user: user.id, cache: true, force: true }).catch(() => null)

    if (!guild || !Channel || !hasMember)
        return NotifyUser(user, RemindMessage, data.id)

    const oneDay = 1000 * 60 * 60 * 24
    const intervalTime = {
        1: oneDay,
        2: oneDay * 7,
        3: oneDay * 30
    }[data.interval]

    const intervalMessage = data.interval == 0
        ? ''
        : `⏱️ | Este lembrete será disparado novamente ${Date.GetTimeout(intervalTime, Date.now(), 'R')}`

    const msg = data.privateOrChannel
        ? NotifyUser(user, RemindMessage, data.id)
        : await Channel.send(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**\n${intervalMessage}`)
            .catch(() => NotifyUser(user, RemindMessage, data.id))

    if (!msg) return
    if (intervalTime) return managerReminder.revalide(data.id, intervalTime, user)
    if (isAutomatic) return managerReminder.remove(data.id)

    managerReminder.setAlert(data.id)

    const emojis = ['💤', '📅', '🗑️']

    for (let i of emojis) msg?.react(i).catch(() => { })

    const collector = msg.createReactionCollector({
        filter: (reaction, u) => emojis.includes(reaction.emoji.name) && u.id === user.id,
        idle: 1000 * 60 * 60,
        max: 1,
        errors: ['idle', 'max']
    })
        .on('collect', async (reaction) => {

            const { emoji } = reaction

            if (emoji.name === emojis[1]) {
                client.pushMessage({
                    method: 'delete',
                    channelId: msg.channel.id,
                    messageId: msg.id
                })
                return revalidateTime(Channel, user, data)
            }

            collector.stop()
            await msg.reactions.removeAll().catch(() => { })

            if (emoji.name === emojis[2]) {
                managerReminder.remove(data.id)
                return msg.edit(`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**\n${e.Info} | Lembrete deletado.`).catch(() => { })
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
            client.pushMessage({
                method: 'patch',
                messageId: msg.id,
                channelId: msg.channel.id,
                body: {
                    content:`${e.Notification} | ${user}, lembrete pra você.\n🗒️ | **${RemindMessage}**\n${e.Info} | Lembrete deletado.`
                }
            })
            return
        })

    return
}