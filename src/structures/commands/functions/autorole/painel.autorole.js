import { Emojis as e } from "../../../../util/util.js"
import { DiscordPermissons } from "../../../../util/Constants.js"

export default async ({ interaction, guildData, Database, client }) => {

    const rolesId = guildData?.Autorole || []

    if (!rolesId || !rolesId.length)
        return await interaction.reply({
            content: `${e.Deny} | Nenhum cargo foi registrado no banco de dados.`,
            ephemeral: true
        })

    const { guild } = interaction
    const rolesToRemove = []
    const control = {
        response: ''
    }

    const administratationPermissions = [
        DiscordPermissons.KickMembers,
        DiscordPermissons.BanMembers,
        DiscordPermissons.ManageGuild,
        DiscordPermissons.ManageMessages,
        DiscordPermissons.MuteMembers,
        DiscordPermissons.DeafenMembers,
        DiscordPermissons.MoveMembers,
        DiscordPermissons.ManageNicknames,
        DiscordPermissons.ManageRoles,
        DiscordPermissons.Administrator,
        DiscordPermissons.ModerateMembers
    ]

    const guildRoles = rolesId.map(r => {
        const role = guild.roles.cache.get(r)

        if (!role) {
            rolesToRemove.push(r)
            return undefined
        }

        if (['@everyone', '@here'].includes(role.name)) {
            rolesToRemove.push(role.id)
            return undefined
        }

        const rolePermissions = role?.permissions?.toArray() || []

        if (role?.editable)
            for (let perm of administratationPermissions)
                if (rolePermissions.includes(perm)) {
                    rolesToRemove.push(role.id)
                    return undefined
                }
                else return role
        else {
            rolesToRemove.push(role.id)
            return undefined
        }
    })
        .filter(i => i)
        .join(', ')

    if (rolesToRemove.length)
        await removeRoles(rolesToRemove)

    const dataSend = {
        embeds: [{
            color: client.blue,
            title: `🛠 ${client.user.username}s' Autorole Painel`,
            description: 'O sistema de autorole é algo sim',
            fields: [{
                name: '🎯 Cargos no Autorole',
                value: guildRoles || 'Nenhum cargo por aqui'
            }]
        }]
    }

    if (control.response)
        dataSend.embeds[0].fields.push({
            name: `${e.Info} | Server Security Control`,
            value: control.response
        })

    return await interaction.reply(dataSend)

    async function removeRoles(rolesId) {
        await Database.Guild.findOneAndUpdate(
            { id: guild.id },
            { $pullAll: { Autorole: rolesId } },
            { new: true }
        )
            .then(data => {
                Database.saveGuildCache(data.id, data)
                control.response += `${e.Info} | **${rolesId.length} cargos** foram removidos do autorole por não serem encontrados ou por possuirem permissões administrativas ou por ser um cargo maior que o meu.`
                return
            })
            .catch(() => { })
    }
}