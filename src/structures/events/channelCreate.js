import { SaphireClient as client, Database } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import { ChannelsTypes, Permissions } from '../../util/Constants.js'
import { AuditLogEvent } from 'discord.js'

client.on('channelCreate', async channel => {

    const { guild } = channel

    if (!channel || !guild || !guild.available || !channel.permissionsFor(channel.guild.members.me)?.has(Permissions.SendMessages)) return

    const guildData = await Database.Guild.findOne({ id: guild.id }, 'LogSystem')
    const logChannel = guild.channels.cache.get(guildData?.LogSystem?.channel)
    if (!logChannel || !guildData?.LogSystem?.channels?.active) return

    const channelType = ChannelsTypes[channel.type] || "Tipo de canal não reconhecido"
    const category = guild.channels.cache.get(channel.id)?.parent?.name || null
    const permissions = channel.permissionOverwrites.cache.toJSON() || []
    const fields = []

    if (permissions.length) {

        // https://discord-api-types.dev/api/discord-api-types-v10/enum/OverwriteType
        const rolesAllowed = permissions
            .filter(perm => perm.type === 0 && perm.id !== guild.roles.everyone.id)
            ?.map(perm => perm?.id)
            ?.filter(i => i)

        const adminRoles = guild.roles.cache.filter(role => role.permissions.toArray().includes("Administrator")).map(role => role.id)

        const roles = [
            adminRoles,
            rolesAllowed
        ]
            ?.flat()
            ?.map(roleId => guild.roles.cache.get(roleId)) // 0 Role

        const membersFilter = permissions
            .filter(perm => perm.type === 1)
            ?.map(perm => perm.id) // 1 Member
            ?.filter(i => i)

        const members = await guild.members.fetch({ user: membersFilter }).catch(() => [])

        if (roles.length)
            fields.push({
                name: "@ Cargos",
                value: `Negados: ${guild.roles.everyone}\nPermitidos: ${roles.join(", ") || "Nenhum cargo"}`.limit("MessageEmbedFieldValue")
            })

        if (members.size)
            fields.push({
                name: "@ Membros",
                value: `Permitidos: ${members.toJSON().join(", ") || "Nenhum membro"}`.limit("MessageEmbedFieldValue")
            })

    }

    const allChannels = await guild.channels.fetch().catch(() => null)
    if (!allChannels) return

    const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate }).catch(() => null) // { type: 10 } - ChannelCreate
    if (!logs) return

    const Log = logs.entries.first()
    if (!Log || Log.action !== AuditLogEvent.ChannelCreate) return

    const { executor, target } = Log

    if (
        !executor
        || !target
        || executor.id === target.id
        || client.user.id === executor.id
    ) return

    return logChannel.send({
        content: "🛰️ | **Global System Notification** | Channel Create",
        embeds: [{
            color: client.blue,
            title: `${e.Info} | Dados do Canal`,
            description: `Usuário: **${executor.tag || "\`Not Found\`"}** - *\`${executor.id}\`*\nNome: **${channel.name}** - \`${channel.id}\`\nPosição: \`${channel.position + 1}/${allChannels?.toJSON()?.length}\`\nTipo: ${channelType}\n${category ? `Categoria: ${category}` : ""}\n${Date.Timestamp()}`,
            fields
        }]
    }).catch(() => { })

})