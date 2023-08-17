import { ApplicationCommandOptionType, PermissionsBitField } from 'discord.js'
import { DiscordPermissons } from '../../../../util/Constants.js'
import { Emojis as e } from '../../../../util/util.js'
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
                            name: 'Ativar/Desativar Contador de Tempo em Call',
                            value: 'layout'
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
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'member',
                    name_localizations: { 'pt-BR': 'membro' },
                    description: 'verificar o ranking de um membro',
                    type: ApplicationCommandOptionType.User
                }
            ]
        }
    ],
    apiData: {
        name: "tempcall",
        description: "Um comando/sistema poderoso que conta o tempo em call de todos os membros (Com direito a ranking e tempo mutado)",
        category: "Utilidades",
        synonyms: [],
        perms: {
            user: [DiscordPermissons.Administrator],
            bot: []
        }
    },
    async execute({ interaction, guildData }) {

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

        return execute(interaction, guildData)
    }
}