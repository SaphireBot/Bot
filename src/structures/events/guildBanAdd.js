import { SaphireClient as client, Database } from '../../classes/index.js'
import { AuditLogEvent } from 'discord.js'
import { Permissions } from '../../util/Constants.js'
import { Emojis as e } from '../../util/util.js'

client.on('guildBanAdd', async ban => {

    const { user, guild } = ban

    if (
        !user
        || !guild
        || !guild.available
        || user.id === client.user.id
        || !guild.clientHasPermission(Permissions.ViewAuditLog)
    ) return

    // const guildData = await Database.Guild.findOne({ id: guild.id }, 'LogSystem LeaveChannel')
    const guildData = await Database.getGuild(guild.id)
    if (!guildData?.LogSystem?.ban?.active) return

    const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 5 }).catch(() => null) // { type: 22 } - GuildBanAdd
    if (!logs) return

    const kickLog = logs?.entries.find((value) => value.targetId === ban.user.id);
    if (!kickLog || kickLog.action !== AuditLogEvent.MemberBanAdd) return

    const { executor, target, reason } = kickLog

    if (
        !executor
        || !target
        || executor.id === target.id
        || [user.id, client.user.id].includes(executor.id)
    ) return

    return client.pushMessage({
        channelId: guildData.LogSystem?.channel,
        method: 'post',
        guildId: guild.id,
        LogType: 'ban',
        body: {
            embeds: [{
                color: client.red,
                title: "🛰️ Global System Notification | Ban",
                fields: [
                    { name: '👤 Usuário', value: `${user.tag} - *\`${user.id}\`*` },
                    { name: `${e.ModShield} Moderador`, value: `${executor.tag} \`${executor.id}\`` },
                    { name: '📝 Razão', value: `${reason || 'Sem motivo informado'}` },
                    { name: '📅 Data', value: `${Date.complete(new Date().valueOf())}` }
                ],
                footer: { text: guild.name, iconURL: guild.iconURL({ forceStatic: false }) }
            }]
        }
    })
})