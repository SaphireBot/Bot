import { ApplicationCommandOptionType, PermissionsBitField } from 'discord.js'
import { DiscordPermissons } from '../../../../util/Constants.js'
import autorole from './functions/autorole/index.autorole.js'

export default {
    name: 'roles',
    name_localizations: { 'pt-BR': 'cargos' },
    description: '[moderation] Gerencie o sistema de autorole por aqui',
    dm_permission: false,
    default_member_permissions: `${PermissionsBitField.Flags.ManageRoles}`,
    type: 1,
    options: [
        {
            name: 'autorole',
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
                    type: ApplicationCommandOptionType.String,
                    description: 'Cargo a ser removido do autorole',
                    autocomplete: true
                }
            ]
        },
        {
            name: 'painel',
            type: ApplicationCommandOptionType.Subcommand,
            description: '[moderation] (AUTOROLE) Veja como está o estado do autorole'
        }
    ],
    apiData: {
        name: "roles",
        description: "Um simples comando para gerênciar o autorole (Porém em constante construção)",
        category: "Moderação",
        synonyms: ["cargos"],
        tags: [],
perms: {
            user: [DiscordPermissons.ManageRoles],
            bot: [DiscordPermissons.ManageRoles]
        }
    },
    async execute(slashCommand) {

        const command = {
            autorole, painel: autorole,
        }[slashCommand.interaction.options.getSubcommand()]

        if (command) return command(slashCommand)

        return slashCommand.interaction.reply({ content: '${e.DenyX} ${subCommandNotFound} #5444816' })
    }
}