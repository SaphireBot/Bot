import { Emojis as e } from '../../../../util/util.js'
import { ApplicationCommandOptionType, PermissionsBitField } from 'discord.js'
import config from './tempcall/config.tempcall.js'
import ranking from './tempcall/ranking.tempcall.js'

export default {
    name: 'tempcall',
    description: '[util] Contador de tempo de call',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'config',
            name_localizations: { 'pt-BR': 'configurações' },
            description: 'Configurações do tempo em call',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'method',
                    name_localizations: { 'pt-BR': 'método' },
                    description: 'Escolha um método',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: 'Ativar',
                            value: 'enable'
                        },
                        {
                            name: 'Desativar',
                            value: 'disable'
                        },
                        {
                            name: 'Resetar Ranking',
                            value: 'reset'
                        }
                    ]
                }
            ]
        },
        {
            name: 'ranking',
            description: 'Ranking dos membros com mais tempo em call',
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    helpData: { },
    async execute({ interaction }) {

        const { options, member } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand == 'config' && !member.permissions.has(PermissionsBitField.Flags.Administrator))
            return interaction.reply({
                content: `${e.Deny} | Opa! Só um administrador pode usar este comando, ok?`,
                ephemeral: true
            })

        const execute = { config, ranking }[subCommand]

        if (!execute)
            return interaction.reply({
                content: `${e.Deny} | Sub-comando não encontrado. #9989898565`
            })

        return execute(interaction)
    }
}