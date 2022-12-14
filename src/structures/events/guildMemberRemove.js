import { SaphireClient as client, Database } from '../../classes/index.js'
import { Permissions } from '../../util/Constants.js'
import { Emojis as e } from '../../util/util.js'

client.on('guildMemberRemove', async member => {

    if (!member || !member.guild || !member.guild.available) return

    const { guild } = member
    Database.Cache.AfkSystem.delete(`${guild.id}.${member.user.id}`).catch(() => { })
    Database.Cache.AfkSystem.delete(`Global.${member.user.id}`).catch(() => { })

    const guildData = await Database.Guild.findOne({ id: guild.id }, 'LogSystem LeaveChannel')
    Notify()

    if (!guildData) return Database.registerServer(guild)

    const LeaveChannel = guild.channels.cache.get(guildData?.LeaveChannel?.Canal)
    if (!LeaveChannel) return

    if (guildData?.LeaveChannel?.Canal && !LeaveChannel) return unset()

    const Mensagem = guildData.LeaveChannel.Mensagem || '$member saiu do servidor.'
    const newMessage = Mensagem.replace('$member', member.user.tag).replace('$servername', guild.name)

    return LeaveChannel?.send(`${newMessage}`).catch(() => unset())

    async function unset() {
        await Database.Guild.updateOne(
            { id: guild.id },
            { $unset: { LeaveChannel: 1 } }
        )
        return;
    }

    async function Notify() {

        if (!guildData) return
        if (member.id === client.user.id || !guild.clientHasPermission(Permissions.ViewAuditLog) || !guildData.LogSystem?.channel) return

        if (!guildData?.LogSystem?.kick?.active) return

        const channel = guild.channels.cache.get(guildData.LogSystem?.channel)
        if (!channel) return

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
            title: "??????? Global System Notification | Kick",
            fields: [
                { name: '???? Usu??rio', value: `${member.user.tag} - *\`${member.user.id}\`*` },
                { name: `${e.ModShield} Moderador`, value: `${executor.tag} \`${executor.id}\`` },
                { name: '???? Raz??o', value: `${reason || 'Sem motivo informado'}` },
                { name: '???? Data', value: `${Date.Timestamp()}` }
            ],
            footer: { text: guild.name, iconURL: guild.iconURL({ dynamic: true }) }
        }

        return channel.send({ embeds: [embed] }).catch(() => { })
    }

})