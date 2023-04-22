import { AuditLogEvent, GuildChannel } from 'discord.js'
import { SaphireClient as client, Database, GiveawayManager, TwitchManager } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

/**
 * @param { GuildChannel } channel
 */
client.on('channelDelete', async channel => {

    const { guild } = channel

    if (!channel || !guild) return
    await Database.Cache.TempCall.delete(`${guild.id}.inCall.${channel.id}`)

    if (GiveawayManager.getGiveaway(null, channel.id))
        Database.deleteGiveaway(null, guild.id, null, channel.id)

    const inLogomarcaGameChannel = await Database.Cache.Logomarca.get(`${client.shardId}.Channels`, channel.id) || []
    if (inLogomarcaGameChannel.includes(channel.id)) await Database.Cache.Logomarca.pull(`${client.shardId}.Channels`, channel.id)

    const guildData = await Database.Guild.findOne({ id: guild.id }, "LogSystem Stars TwitchNotifications")
    if (!guildData) return

    if (guildData.TwitchNotifications?.length)
        TwitchManager.deleteChannelFromTwitchNotification(channel.id)

    if (!guildData || !guildData?.LogSystem?.channel) return
    if (channel.id === guildData?.LogSystem?.channel)
        return await Database.Guild.updateOne({ id: guild.id }, { $unset: { LogChannel: 1 } })

    const logChannel = guildData?.LogSystem?.channel
        ? await guild.channels.fetch(`${guildData?.LogSystem?.channel}`).catch(() => undefined)
        : undefined

    if (!logChannel) return

    const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete }).catch(() => null)
    if (!logs) return

    const Log = logs.entries.first()
    if (!Log || Log.action !== AuditLogEvent.ChannelDelete) return

    let { executor, target, executorId } = Log

    if (!executor || !target || client.user.id === executorId) return

    if (!executor.username)
        executor = await guild.members.fetch(executorId).then(member => member.user).catch(() => null)

    if (channel.id === guildData?.Stars?.channel)
        return client.pushMessage({
            channelId: guildData.LogSystem?.channel,
            method: 'post',
            guildId: guild.id,
            LogType: 'channels',
            body: {
                content: `🛰️ | **Global System Notification** | Channel Delete\n \n${e.Info} | O canal **${channel.name}** - *\`${channel.id}\`* configurado como **\`Canal de Estrelas\`** foi deletado por **${executor.tag || "\`Not Found\`"}** - *\`${executor.id}\`*.\n📅 | ${Date.complete(new Date().valueOf())}`
            }
        })

    return client.pushMessage({
        channelId: guildData.LogSystem?.channel,
        method: 'post',
        guildId: guild.id,
        LogType: 'channels',
        body: {
            content: `🛰️ | **Global System Notification** | Channel Delete\n \n${e.Info} | O canal **${channel.name}** - *\`${channel.id}\`* foi deletado por **${executor.tag || "\`Not Found\`"}** - *\`${executor.id}\`*.\n📅 | ${Date.complete(new Date().valueOf())}`
        }
    })
})