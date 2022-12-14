import { Database } from "../../../classes/index.js"
import { DiscordPermissons, PermissionsTranslate } from "../../../util/Constants.js"

export default async ({ member, guildData, client }) => {

    const rolesId = guildData?.Autorole || []
    if (!rolesId || !rolesId.length) return;

    const { guild } = member

    if (!guild.members.me.permissions.has(DiscordPermissons.ManageRoles, true))
        return notify({ status: "noPermissions" })

    const rolesToRemove = []
    const rolesToAdd = []
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

    for (let roleId of rolesId) {
        const role = guild.roles.cache.get(roleId)

        if (!role || !role.editable) {
            rolesToRemove.push(roleId)
            continue
        }

        const perms = role.permissions.toArray()
        for (let perm of administratationPermissions)
            if (perms.includes(perm)) {
                rolesToRemove.push(roleId)
                break;
            }

        if (!rolesToRemove.includes(roleId))
            rolesToAdd.push(roleId)

        continue;
    }

    if (rolesToRemove.length)
        notify({ status: 'removeRole', rolesToRemove })

    if (rolesToAdd.length)
        return member.roles.add(rolesToAdd, `${client.user.username}'s Autorole System`).catch(() => { })

    return

    async function notify({ status, rolesToRemove }) {

        const channel = await guild.channels.fetch(guildData?.LogSystem?.channel || "undefined").catch(() => null)
        if (!channel) return

        const execute = {
            noPermissions: noPermissions,
            removeRole: removeRole
        }[status]

        if (execute) execute()
        return

        async function noPermissions() {
            disable()
            return channel?.send({
                content: `???? | **Global System Notification** | Autorole System\n \nEu estou sem a permiss??o **${PermissionsTranslate.ManageRoles}** para executar o sistema de Autorole.\nO autorole foi desativado neste servidor.`
            }).catch(() => { })
        }

        async function removeRole() {
            await Database.Guild.updateOne(
                { id: guild.id },
                {
                    $pullAll: {
                        Autorole: rolesToRemove
                    }
                }
            )
            return channel?.send({
                content: `???? | **Global System Notification** | Autorole System\n \nOs seguintes cargos foram removidos do autorole por conter permiss??es administrativas ou por serem inv??lidos.\n${rolesToRemove.map(r => guild.roles.cache.get(r)).join(', ')}`
            }).catch(() => { })
        }

        async function disable() {
            await Database.Guild.updateOne(
                { id: guild.id },
                {
                    $unset: {
                        Autorole: true
                    }
                }
            )
        }
    }
}