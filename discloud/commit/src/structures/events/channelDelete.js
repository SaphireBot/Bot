import { AuditLogEvent } from 'discord.js'
import { SaphireClient as client, Database } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.on('channelDelete', async channel => {

    if (!channel || !channel.guild) return

    const inLogomarcaGameChannel = await Database.Cache.Logomarca.get(`${client.shardId}.Channels`, channel.id) || []
    if (inLogomarcaGameChannel.includes(channel.id))
        await Database.Cache.Logomarca.pull(`${client.shardId}.Channels`, channel.id)

    const { guild } = channel
    const guildData = await Database.Guild.findOne({ id: guild.id }, "LogSystem")
    if (!guildData) return

    if (channel.id === guildData?.LogSystem?.channel)
        return await Database.Guild.updateOne({ id: guild.id }, { $unset: { LogChannel: 1 } })

    const logChannel = await guild.channels.fetch(`${guildData?.LogSystem?.channel}`).catch(() => null)
    if (!logChannel) return

    const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete }).catch(() => null) // { type: 12 } - ChannelDelete
    if (!logs) return

    const Log = logs.entries.first()
    if (!Log || Log.action !== AuditLogEvent.ChannelDelete) return

    const { executor, target } = Log

    if (
        !executor
        || !target
        || client.user.id === executor.id
    ) return

    return logChannel?.send({
        content: `🛰️ | **Global System Notification** | Channel Delete\n \n${e.Info} | O canal **${channel.name}** - *\`${channel.id}\`* foi deletado por **${executor.tag || "\`Not Found\`"}** - *\`${executor.id}\`*.\n📅 | ${Date.Timestamp()}`
    }).catch(() => { })
})