import { ApplicationCommandOptionType, PermissionsBitField } from 'discord.js'
import { DiscordPermissons, PermissionsTranslate } from '../../../../util/Constants.js'
import addAutorole from '../../functions/autorole/add.autorole.js'
import painelAutorole from '../../functions/autorole/painel.autorole.js'

export default {
    name: 'autorole',
    description: '[moderation] Gerencie o sistema de autorole por aqui',
    dm_permission: false,
    default_member_permissions: `${PermissionsBitField.Flags.ManageRoles}`,
    type: 1,
    options: [
        {
            name: 'roles',
            type: ApplicationCommandOptionType.Subcommand,
            description: '[moderation] Adicione cargos ao autorole',
            options: [
                {
                    name: 'add',
                    type: ApplicationCommandOptionType.Role,
                    description: 'Cargo a ser adicionado ao autorole'
                },
                {
                    name: 'remove',
                    type: ApplicationCommandOptionType.Role,
                    description: 'Cargo a ser removido do autorole'
                }
            ]
        },
        {
            name: 'painel',
            type: ApplicationCommandOptionType.Subcommand,
            description: '[moderation] Veja como está o estado do autorole'
        }
    ],
    helpData: {
        description: 'Sistema de autorole',
    },
    async execute({ interaction, guildData, Database, client, e }) {

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

        if (subCommand === 'roles') return addAutorole({ interaction, guildData, Database, client })
        if (subCommand === 'painel') return painelAutorole({ interaction, guildData, Database, client })

        return await interaction.reply({
            content: `${e.Deny} | Sub-Comando não encontrado.`,
            ephemeral: true
        })
    }
}