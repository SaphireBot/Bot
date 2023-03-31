import { SaphireClient as client, Database, GiveawayManager } from '../../../classes/index.js'
import { Emojis as e } from '../../../util/util.js'

export default async (log, guild) => {

    const channel = log?.target

    if (!log || !channel || !guild) return

    if (GiveawayManager.getGiveaway(null, channel.id))
        Database.deleteGiveaway(null, guild.id, null, channel.id)

    const inLogomarcaGameChannel = await Database.Cache.Logomarca.get(`${client.shardId}.Channels`, channel.id) || []
    if (inLogomarcaGameChannel.includes(channel.id)) await Database.Cache.Logomarca.pull(`${client.shardId}.Channels`, channel.id)

    const guildData = await Database.Guild.findOne({ id: guild.id }, "LogSystem Stars")
    if (!guildData || !guildData?.LogSystem?.channel) return

    if (channel.id === guildData?.LogSystem?.channel)
        return await Database.Guild.updateOne({ id: guild.id }, { $unset: { LogChannel: 1 } })

    const logChannel = guildData?.LogSystem?.channel
        ? await guild.channels.fetch(`${guildData?.LogSystem?.channel}`).catch(() => undefined)
        : undefined

    if (!logChannel) return

    let { executor, target, executorId } = log

    if (!executor || !target || client.user.id === executorId) return

    if (!executor.username)
        executor = await guild.members.fetch(executorId).then(member => member.user).catch(() => null)

    if (channel.id === guildData?.Stars?.channel)
        return logChannel?.send({
            content: `🛰️ | **Global System Notification** | Channel Delete\n \n${e.Info} | O canal **${channel.name}** - *\`${channel.id}\`* configurado como **\`Canal de Estrelas\`** foi deletado por **${executor.tag || "\`Not Found\`"}** - *\`${executor.id}\`*.\n📅 | ${Date.Timestamp()}`
        }).catch(() => { })

    return logChannel?.send({
        content: `🛰️ | **Global System Notification** | Channel Delete\n \n${e.Info} | O canal **${channel.name}** - *\`${channel.id}\`* foi deletado por **${executor.tag || "\`Not Found\`"}** - *\`${executor.id}\`*.\n📅 | ${Date.Timestamp()}`
    }).catch(() => { })
}