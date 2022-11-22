import { Emojis as e } from '../../../../util/util.js'
import { Permissions } from '../../../../util/Constants.js'
import { ApplicationCommandOptionType } from 'discord.js'
import addAutorole from '../../functions/autorole/add.autorole.js'
import painelAutorole from '../../functions/autorole/painel.autorole.js'

export default {
    name: 'autorole',
    description: '[moderation] Gerencie o sistema de autorole por aqui',
    dm_permission: false,
    default_member_permissions: Permissions.ManageRoles,
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
    async execute({ interaction, guildData, Database }) {

        const { options } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand === 'roles') return addAutorole({ interaction, guildData, Database })
        if (subCommand === 'painel') return painelAutorole({ interaction, guildData, Database })

        return await interaction.reply({
            content: `${e.Deny} | Sub-Comando não encontrado.`,
            ephemeral: true
        })
    }
}