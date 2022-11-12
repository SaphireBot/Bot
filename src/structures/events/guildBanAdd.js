import { SaphireClient as client, Database } from '../../classes/index.js'
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

    const guildData = await Database.Guild.findOne({ id: guild.id }, 'LogSystem LeaveChannel')
    if (!guildData?.LogSystem?.ban?.active) return

    const channel = guild.channels.cache.get(guildData.LogSystem?.channel)
    if (!channel || !guildData.LogSystem?.channel) return

    const logs = await guild.fetchAuditLogs().catch(() => null) // { type: 22 } - MemberBanAdd
    if (!logs) return

    const kickLog = logs.entries.first()
    if (!kickLog || kickLog.action !== 22) return

    const { executor, target, reason } = kickLog

    if (
        !executor
        || !target
        || executor.id === target.id
        || [user.id, client.user.id].includes(executor.id)
    ) return

    const embed = {
        color: client.red,
        title: "🛰️ Global System Notification | Ban",
        fields: [
            { name: '👤 Usuário', value: `${user.tag} - *\`${user.id}\`*` },
            { name: `${e.ModShield} Moderador`, value: `${executor.tag} \`${executor.id}\`` },
            { name: '📝 Razão', value: `${reason || 'Sem motivo informado'}` },
            { name: '📅 Data', value: `${Date.Timestamp()}` }
        ],
        footer: { text: guild.name, iconURL: guild.iconURL({ dynamic: true }) }
    }

    return channel.send({ embeds: [embed] }).catch(() => { })

})