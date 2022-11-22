import { DiscordPermissons, PermissionsTranslate } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"

export default async ({ interaction, guildData, Database, client }) => {

    const { options, guild } = interaction
    const addRole = options.getRole('add')
    const removeRole = options.getRole('remove')
    const roleInDatabase = guildData?.Autorole || []
    let content = ""
    const validate = {}

    if (!addRole && !removeRole)
        return await interaction.reply({
            content: `${e.Deny} | Você tem que selecionar pelo menos uma sub-função. Add ou Remove`,
            ephemeral: true
        })

    if (addRole?.id === removeRole?.id)
        return await interaction.reply({
            content: `${e.Deny} | O cargo a ser adicionado e removido não podem ser os mesmos.`,
            ephemeral: true
        })

    if (addRole && roleInDatabase.length >= 10) {
        validate.addRole = false
        content += `\n${e.Deny} | Esse servidor já possui 10 cargos no autorole.`
    }

    if (['@everyone', '@here'].includes(addRole?.name)) {
        validate.addRole = false
        content += `${e.Deny} | Os cargos everyone e here não podem entrar no sistema de autorole.`
    }

    if (addRole && validate.addRole !== false && roleInDatabase.includes(addRole?.id)) {
        validate.addRole = false
        content += `\n${e.Deny} | O cargo ${addRole} já está no banco de dados.`
    }

    if (removeRole && !roleInDatabase.includes(removeRole?.id)) {
        validate.removeRole = false
        content += `\n${e.Deny} | O cargo ${removeRole} não está no banco de dados.`
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

    const rolePermissions = addRole?.permissions?.toArray() || []
    const admPerms = []

    if (addRole?.editable && validate.addRole !== false)
        for (let perm of administratationPermissions)
            if (rolePermissions.includes(perm))
                admPerms.push(perm)
            else continue
    else if (addRole && validate.addRole !== false) {
        validate.addRole = false
        content += `\n${e.Deny} | Eu não tenho permissão para gerenciar o cargo ${addRole}`
    }

    if (admPerms.length && validate.addRole !== false) {
        validate.addRole = false
        content += `\n \n${e.Deny} | O cargo ${addRole} possui permissões administrativas e não pode entrar para o autorole -> ${admPerms.map(p => `\`${PermissionsTranslate[p]}\``).join(', ')}\n`
    }

    const saveData = {}
    const rolesFromDB = []

    if (removeRole && validate.removeRole !== false) {
        content += `\n${e.Check} | O cargo ${removeRole} foi removido do Autorole.`
        await removeRoleFromDatabase(removeRole.id)
    }

    if (addRole && validate.addRole !== false) {
        content += `\n${e.Check} | O cargo ${addRole} foi adicionado ao Autorole.`
        saveData.add = true
    }

    if (addRole && validate.addRole !== false && saveData.add)
        await Database.Guild.findOneAndUpdate(
            { id: guild.id },
            {
                $addToSet: {
                    Autorole: addRole.id
                }
            },
            { new: true, upsert: true }
        )
            .then(doc => {
                for (let roleId of doc.Autorole)
                    if (!rolesFromDB.includes(roleId))
                        rolesFromDB.push(roleId)
            })
            .catch(err => {
                validate.error = true
                content += `\n${e.bug} | ${err}`
            })

    if (validate.error)
        return await interaction.reply({ content: content })

    if (!rolesFromDB.length)
        rolesFromDB.push(...roleInDatabase)

    return await interaction.reply({
        embeds: [{ // TODO: Deixar a embed mais bonita
            color: client.blue,
            title: `${client.user.username}'s Autorole System`,
            description: 'O sistema de autorole irá adicionar todos os cargos abaixo a todos os membros que entrarem no servidor automáticamente.\n**Autorole** - AUTO Automático - ROLE Cargo',
            fields: [
                {
                    name: '🎯 Cargos no Autorole',
                    value: rolesFromDB.map(roleId => `${guild.roles.cache.get(roleId) || 'Not Found'}`).join(', ') || 'Nenhum cargo por aqui'
                },
                {
                    name: `${e.Info} Resultado`,
                    value: content || "Nenhum resultado? Osh..."
                }
            ]
        }]
    })

    async function removeRoleFromDatabase(roleId) {

        await Database.Guild.findOneAndUpdate(
            { id: guild.id },
            { $pull: { Autorole: roleId } },
            { new: true, upsert: true }
        )
            .then(doc => rolesFromDB.push(...doc.Autorole))
            .catch(err => {
                validate.error = true
                content += `\n${e.bug} | ${err}`
            })
        return;
    }
}