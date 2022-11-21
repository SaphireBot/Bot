import { Database } from "../../../../classes/index.js"
import { Permissions, PermissionsTranslate } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, guildResources) => {

    const { guild, member } = interaction
    const guildData = guildResources || await Database.Guild.findOne({ id: guild.id })
    const roleId = guildData?.announce?.notificationRole

    if (!roleId)
        return await interaction.reply({
            content: `${e.Deny} | Nenhum administrador configurou este comando.`,
            ephemeral: true
        })


    if (!guild.clientHasPermission(Permissions.ManageRoles))
        return await interaction.reply({
            content: `${e.Deny} | Eu preciso da permissão **${PermissionsTranslate.ManageRoles}** para adicionar/remover cargos.`,
            ephemeral: true
        })

    const role = await guild.roles.fetch(roleId).catch(() => null)

    if (!role)
        return await interaction.reply({
            content: `${e.Deny} | O cargo configurado no banco de dados não foi encontrado.`,
            ephemeral: true
        })

    if (member.roles.cache.has(roleId))
        return member.roles.remove(roleId, `${member.user.tag} não quer ser notificado do jornal do servidor.`)
            .then(async () => await interaction.reply({
                content: `${e.Info} | O cargo ${role} foi removido e você não será mais notificado de novos jornais.`,
                ephemeral: true
            }))
            .catch(async err => {

                if (err.code === 50013)
                    return await interaction.reply({
                        content: `${e.Deny} | Eu não tenho a permissão de **${PermissionsTranslate.ManageRoles}** ou o cargo ${role} está acima de mim no ranking de cargos do servidor.`,
                        ephemeral: true
                    })

                return await interaction.reply({
                    content: `${e.Warn} | Houve um erro ao retirar o cargo ${role} de você.\n${e.bug} | \`${err}\``,
                    ephemeral: true
                })
            })

    return member.roles.add(roleId, `${member.user.tag} quer ser notificado do jornal do servidor.`)
        .then(async () => await interaction.reply({
            content: `${e.Notification} | O cargo ${role} foi adicionado e você será notificado de novos jornais.`,
            ephemeral: true
        }))
        .catch(async err => {
            if (err.code === 50013)
                return await interaction.reply({
                    content: `${e.Deny} | Eu não tenho a permissão de **${PermissionsTranslate.ManageRoles}** ou o cargo ${role} está acima de mim no ranking de cargos do servidor.`,
                    ephemeral: true
                })

            return await interaction.reply({
                content: `${e.Warn} | Houve um erro ao adicionar o cargo ${role} de você.\n${e.bug} | \`${err}\``,
                ephemeral: true
            })
        })


}