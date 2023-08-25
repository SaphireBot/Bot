import { GuildMember } from 'discord.js'
import { SaphireClient as client, Database } from '../../classes/index.js'
import { Permissions } from '../../util/Constants.js'
import { Emojis as e } from '../../util/util.js'
import notifyMemberExit from './functions/remove.guildMemberRemove.js'

/**
 * @param { GuildMember } member
 */
client.on('guildMemberRemove', async member => {

    if (!member || !member.guild || !member.guild.available) return

    const { guild } = member
    await Database.Cache.AfkSystem.delete(`${guild.id}.${member.user.id}`).catch(() => { })
    await Database.Cache.AfkSystem.delete(`Global.${member.user.id}`).catch(() => { })

    // const guildData = await Database.Guild.findOne({ id: guild.id }, 'LogSystem LeaveChannel')
    const guildData = await Database.getGuild(guild.id)
    Notify()

    if (!guildData) return Database.registerServer(guild)

    if (guildData.LeaveChannel?.channelId)
        notifyMemberExit(member, guildData.LeaveChannel)

    return
    async function Notify() {

        if (!guildData) return
        if (member.id === client.user.id || !guild.clientHasPermission(Permissions.ViewAuditLog) || !guildData.LogSystem?.channel) return

        if (!guildData?.LogSystem?.kick?.active) return

        const guildAuditLogs = await guild.fetchAuditLogs().catch(() => null) // { type: 20 } - MemberKick
        if (!guildAuditLogs) return

        const kickLog = guildAuditLogs.entries.first()
        if (!kickLog || kickLog.action !== 20) return

        const { executor, target, reason } = kickLog

        if (
            !executor
            || !target
            || executor.id === target.id
            || [member.user.id, client.user.id].includes(executor.id)
        ) return

        const embed = {
            color: client.red,
            title: "🛰️ Global System Notification | Kick",
            fields: [
                { name: '👤 Usuário', value: `${member.user.username} - *\`${member.user.id}\`*` },
                { name: `${e.ModShield} Moderador`, value: `${executor.username} \`${executor.id}\`` },
                { name: '📝 Razão', value: `${reason || 'Sem motivo informado'}` },
                { name: '📅 Data', value: `${Date.complete(new Date().valueOf())}` }
            ],
            footer: { text: guild.name, iconURL: guild.iconURL({ forceStatic: false }) }
        }

        return client.pushMessage({
            channelId: guildData.LogSystem?.channel,
            method: 'post',
            guildId: member.guild.id,
            LogType: 'channels',
            body: {
                channelId: guildData.LogSystem?.channel,
                method: 'post',
                guildId: member.guild.id,
                LogType: 'channels',
                embeds: [embed]
            }
        })
    }

})