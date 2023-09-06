import { DiscordPermissons, PermissionsTranslate } from '../../../../../../util/Constants.js'
import addAutorole from '../../../../functions/autorole/add.autorole.js'
import painelAutorole from '../../../../functions/autorole/painel.autorole.js'

export default async ({ interaction, guildData, Database, client, e }) => {

    const { options, guild, member } = interaction
    const subCommand = options.getSubcommand()

    if (!guild.members.me.permissions.has(DiscordPermissons.ManageRoles, true))
        return await interaction.reply({
            content: `${e.Deny} | Eu preciso da permissão **${PermissionsTranslate.ManageRoles}** para executar este comando.`,
            ephemeral: true
        })

    if (!member.permissions.has(DiscordPermissons.ManageRoles, true))
        return await interaction.reply({
            content: `${e.Deny} | Você precisa da permissão **${PermissionsTranslate.ManageRoles}** para executar este comando.`,
            ephemeral: true
        })

    if (subCommand === 'autorole') return addAutorole({ interaction, guildData, Database, client })
    if (subCommand === 'painel') return painelAutorole({ interaction, guildData, Database, client })

    return await interaction.reply({ content: `${e.Deny} | Sub-Comando não encontrado.`, ephemeral: true })
}