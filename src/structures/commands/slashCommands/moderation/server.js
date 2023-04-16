import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
import { PermissionsTranslate } from '../../../../util/Constants.js'
import lauch from './functions/server/lauch.server.js'

export default {
    name: 'server',
    name_localizations: { "pt-BR": 'servidor' },
    description: '[moderation] Configure minhas funções no servidor',
    dm_permission: false,
    type: 1,
    options: [{
        name: 'options',
        name_localizations: { "pt-BR": 'opções' },
        description: 'Opção a ser executada',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
            {
                name: 'Configurar mensagens de boas-vindas',
                value: 'welcome'
            },
            {
                name: 'Configurar mensagens de saída',
                value: 'leave'
            }
        ]
    }],
    helpData: {},
    execute({ interaction, guildData }) {

        const { options, member } = interaction
        const option = options.getString('options')

        if (
            ['welcome', 'leave'].includes(option)
            && !member.permissions.has(PermissionFlagsBits.ManageGuild, true)
        )
            return interaction.reply({
                content: `${e.Deny} | Opa opa! Só quem tem a permissão **${PermissionsTranslate.ManageGuild}** pode gerenciar esse sistema, ok?`,
                ephemeral: true
            })

        return lauch(interaction, guildData, option)
    }
}