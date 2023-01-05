import {
    Database,
    SaphireClient as client
} from "../../classes/index.js";
import { AuditLogEvent } from "discord.js";
import { Emojis as e } from "../../util/util.js";
import { ChannelsTypes, PermissionsTranslate } from "../../util/Constants.js";

client.on("channelUpdate", async (oldChannel, newChannel) => {

    const { guild } = oldChannel

    const guildData = await Database.Guild.findOne({ id: guild.id }, "LogSystem")
    if (!guildData) return

    const logChannel = await guild.channels.fetch(guildData?.LogSystem?.channel).catch(() => null)
    if (!logChannel) return

    const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.ChannelUpdate }).catch(() => null) // { type: 11 } - ChannelUpdate
    if (!logs) return

    const Log = logs.entries.first()
    if (!Log || Log.action !== AuditLogEvent.ChannelUpdate) return

    let description = ""
    const fields = []

    if (oldChannel.name !== newChannel.name)
        description += `\n🏷️ Nome: \`${oldChannel.name}\` -> \`${newChannel.name}\``

    if (oldChannel.nsfw !== newChannel.nsfw)
        description += `\n🔞 NSFW: \`${oldChannel.nsfw ? "Ativado" : "Desativado"}\` -> \`${newChannel.nsfw ? "Ativado" : "Desativado"}\``

    if (oldChannel.defaultAutoArchiveDuration !== newChannel.defaultAutoArchiveDuration) {
        const oldArchive = Date.stringDate(oldChannel.defaultAutoArchiveDuration * 60 * 1000)
        const newArchive = Date.stringDate(newChannel.defaultAutoArchiveDuration * 60 * 1000)
        description += `\n🧱 Arquivamento de Tópicos: \`${oldArchive}\` -> \`${newArchive}\``
    }
    if (oldChannel.type !== newChannel.type)
        description += `\n📑 Tipo: \`${ChannelsTypes[oldChannel.type] || `Not Found (${oldChannel.type})`}\` -> \`${ChannelsTypes[newChannel.type] || `Not Found (${newChannel.type})`}\``

    if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
        const oldLimit = Date.stringDate(oldChannel.rateLimitPerUser * 1000)
        const newLimit = Date.stringDate(newChannel.rateLimitPerUser * 1000)
        description += `\n⏲ Cooldown: \`${oldLimit}\` -> \`${newLimit}\``
    }

    if (oldChannel.position !== newChannel.position)
        description += `\n🎯 Posição: \`${oldChannel.position}\` -> \`${newChannel.position}\``

    if (oldChannel.topic !== newChannel.topic) {
        fields.push({
            name: "📍 Tópico Antigo",
            value: oldChannel.topic
                ? `${oldChannel.topic}`
                : "Nenhum tópico definido"
        })

        fields.push({
            name: "📍 Tópico Novo",
            value: newChannel.topic
                ? newChannel.topic
                : "Nenhum tópico definido"
        })
    }

    if (oldChannel.parentId !== newChannel.parentId)
        description += `\n📂 Categoria: \`${oldChannel.parent?.name || 'Nenhum'}\` -> \`${newChannel.parent?.name || 'Nenhum'}\``

    const oldPermissions = oldChannel.permissionOverwrites.cache.toJSON() || []
    const newPermissions = newChannel.permissionOverwrites.cache.toJSON() || []
    const oldRoles = formatRoles(oldPermissions)
    const newRoles = formatRoles(newPermissions)
    const oldMembers = formatMembers(oldPermissions)
    const newMembers = formatMembers(newPermissions)

    if ((oldRoles.length || newRoles.length) && oldRoles !== newRoles) {
        if (!oldRoles || !oldRoles.length) return

        if (oldRoles && oldRoles?.map(u => u.id).filter(roleId => !newRoles.map(u => u.id).includes(roleId)).length) {
            fields.push({
                name: "🔰 Permissões Antigas | Cargos",
                value: `${oldRoles.join(", ") || "Nenhum cargo"}`.limit("MessageEmbedFieldValue")
            })

            fields.push({
                name: "🔰 Permissões Atualizadas | Cargos",
                value: `${newRoles.join(", ") || "Nenhum cargo"}`.limit("MessageEmbedFieldValue")
            })
        }
    }

    const compare = {
        large: oldMembers.length >= newMembers ? oldMembers : newMembers,
        smaller: oldMembers.length < newMembers ? newMembers : oldMembers
    }

    if (
        oldMembers.length !== newMembers.length
        || compare.large.filter(memberId => !compare.smaller.includes(memberId)).length
    ) {
        const allMembersInChannelPermissions = await guild.members.fetch({ user: [...oldMembers, ...newMembers] }).catch(() => null)

        if (allMembersInChannelPermissions !== null) {
            fields.push({
                name: "👥 Permissões Membros | Antigo",
                value: `${allMembersInChannelPermissions.toJSON().filter(u => oldMembers.includes(u.id)).join(", ") || "`Nenhum membro`"}`.limit("MessageEmbedFieldValue")
            })

            fields.push({
                name: "👥 Permissões Membros | Atualizado",
                value: `${allMembersInChannelPermissions.toJSON().filter(u => newMembers.includes(u.id)).join(", ") || "`Nenhum membro`"}`.limit("MessageEmbedFieldValue")
            })
        }
    }


    function formatRoles(roles) {
        const rolesAllowed = roles
            .filter(perm => perm.type === 0 && perm.id !== guild.roles.everyone.id)
            ?.map(perm => perm?.id)
            ?.filter(i => i)

        const adminRoles = guild.roles.cache.filter(role => role.permissions.toArray().includes("Administrator")).map(role => role.id)

        return [adminRoles, rolesAllowed]
            ?.flat()
            ?.map(roleId => guild.roles.cache.get(roleId)) // 0 Role
    }

    function formatMembers(members) {
        return members
            .filter(perm => perm.type === 1)
            ?.map(perm => perm.id) // 1 Member
            ?.filter(i => i)
    }


    const everyonePermissions = guild.roles.everyone.permissions.serialize() || {}
    const oldPermissionsFor = oldChannel.permissionsFor(guild.roles.everyone, true)
    const newPermissionsFor = newChannel.permissionsFor(guild.roles.everyone, true)
    const oldNoPermissions = noPermissions(oldPermissionsFor)
    const newNoPermissions = noPermissions(newPermissionsFor)
    const oldFinalPermissions = oldPermissionsFor.toArray().map(perm => `\`${PermissionsTranslate[perm] || `**${perm}**`}\``).join(', ')
    const newFinalPermissions = newPermissionsFor.toArray().map(perm => `\`${PermissionsTranslate[perm] || `**${perm}**`}\``).join(', ')

    if (oldFinalPermissions !== newFinalPermissions) {
        fields.push({
            name: "🔰 Permissões Everyone | Antigo",
            value: `**+ Possui**\n> ${oldFinalPermissions || "`Nenhuma permissão`"}\n \n**- Não Possui**\n> ${oldNoPermissions}`.limit("MessageEmbedFieldValue")
        })

        fields.push({
            name: "🔰 Permissões Everyone | Atualizado",
            value: `**+ Possui**\n> ${newFinalPermissions || "`Nenhuma permissão`"}\n \n**- Não Possui**\n> ${newNoPermissions}`.limit("MessageEmbedFieldValue")
        })

    }

    function noPermissions(perms) {
        return Object.entries(perms.serialize())
            .filter(perm => !perm[1] && !everyonePermissions[perm[0]])
            .map(perm => `\`${PermissionsTranslate[perm[0]] || `**${perm[0]}**`}\``)
            .join(', ')
    }

    if (Log?.executor)
        fields.push({
            name: `${e.Info} Informações Extra`,
            value: `${e.Admin} **${Log?.executor.tag}** - *\`${Log?.executor.id}\`*\n📅 ${Date.Timestamp()}\n💬 ${newChannel}`
        })

    if (((!description || !description.length) && !fields.length) || (fields.length === 1 && !description)) return

    if (!logChannel?.id || !logChannel?.name) return
    return logChannel?.send({
        content: "🛰️ | **Global System Notification** | Channel Updated",
        embeds: [{
            color: client.blue,
            title: "📝 Canal Atualizado - Relatório",
            description,
            fields
        }]
    }).catch(() => { })
})