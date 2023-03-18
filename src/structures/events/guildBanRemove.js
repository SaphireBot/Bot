import { SaphireClient as client, Database } from '../../classes/index.js'
import { Permissions } from '../../util/Constants.js'
import { Emojis as e } from '../../util/util.js'

client.on('guildBanRemove', async ban => {

    const { user, guild } = ban

    if (!user || !guild || !guild.available) return
    if (user.id === client.user.id || !guild.clientHasPermission(Permissions.ViewAuditLog)) return

    const guildData = await Database.Guild.findOne({ id: guild.id }, 'LogSystem LeaveChannel')
    if (!guildData?.LogSystem?.unban?.active) return

    const channel = guild.channels.cache.get(guildData.LogSystem?.channel)
    if (!channel || !guildData.LogSystem?.channel) return

    const logs = await guild.fetchAuditLogs().catch(() => null) // { type: 23 } - MemberBanRemove
    if (!logs) return

    const kickLog = logs.entries.first()
    if (!kickLog || kickLog.action !== 23) return

    const { executor, target } = kickLog

    if (
        !executor
        || !target
        || executor.id === target.id
        || [user.id, client.user.id].includes(executor.id)
    ) return

    const embed = {
        color: client.red,
        title: "🛰️ Global System Notification | Ban Remove",
        fields: [
            { name: '👤 Usuário', value: `${user.tag} - *\`${user.id}\`*` },
            { name: `${e.ModShield} Moderador`, value: `${executor.tag} \`${executor.id}\`` },
            { name: '📅 Data', value: `${Date.Timestamp()}` }
        ],
        footer: { text: guild.name, iconURL: guild.iconURL({ forceStatic: false }) }
    }

    return channel.send({ embeds: [embed] }).catch(() => { })

})