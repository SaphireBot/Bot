import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { SaphireClient as client } from '../../../../classes/index.js';
import { Emojis as e } from '../../../../util/util.js';
import add from './functions/blacklist/add.blacklist.js'
import remove from './functions/blacklist/remove.blacklist.js'
import check from './functions/blacklist/check.blacklist.js'

export default {
    name: 'blacklist',
    description: '[admin] Comando para gerênciar a blacklist',
    dm_permission: false,
    staff: true,
    database: false,
    type: 1,
    options: [
        {
            name: 'add',
            name_localizations: { "pt-BR": "adicionar" },
            description: '[admin] Adicionar um usuário/servidor na blacklist',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'id',
                    description: 'ID do usuário ou do servidor',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'type',
                    name_localizations: { "pt-BR": "tipo" },
                    description: 'Este ID é de um usuário ou um servidor?',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: 'Usuário',
                            value: 'user'
                        },
                        {
                            name: 'Servidor',
                            value: 'guild'
                        },
                        {
                            name: 'Economia (Bloqueia apenas o usuário do sistema de economia)',
                            value: 'economy'
                        }
                    ]
                },
                {
                    name: 'reason',
                    name_localizations: { 'pt-BR': 'razão' },
                    description: 'Razão da adição na Blacklist',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
                {
                    name: 'time',
                    name_localizations: { 'pt-BR': 'tempo' },
                    description: 'Tempo em que o usuário/servidor ficará na blacklist',
                    type: ApplicationCommandOptionType.Integer,
                    choices: [
                        {
                            name: 'Permanente',
                            value: 0
                        },
                        {
                            name: '1 Hora',
                            value: 1000 * 60 * 60
                        },
                        {
                            name: '6 Horas',
                            value: 1000 * 60 * 60
                        },
                        {
                            name: '12 Horas',
                            value: 1000 * 60 * 60 * 12
                        },
                        {
                            name: '1 Dia',
                            value: 1000 * 60 * 60 * 24
                        },
                        {
                            name: '2 Dia',
                            value: 1000 * 60 * 60 * 24 * 2
                        },
                        {
                            name: '3 Dia',
                            value: 1000 * 60 * 60 * 24 * 3
                        },
                        {
                            name: '4 Dia',
                            value: 1000 * 60 * 60 * 24 * 4
                        },
                        {
                            name: '5 Dia',
                            value: 1000 * 60 * 60 * 24 * 5
                        },
                        {
                            name: '6 Dia',
                            value: 1000 * 60 * 60 * 24 * 6
                        },
                        {
                            name: '7 Dia',
                            value: 1000 * 60 * 60 * 24 * 7
                        },
                        {
                            name: '15 Dia',
                            value: 1000 * 60 * 60 * 24 * 15
                        },
                        {
                            name: '1 Mês',
                            value: 1000 * 60 * 60 * 24 * 30
                        }
                    ]
                }
            ]
        },
        {
            name: 'remove',
            name_localizations: { "pt-BR": "remover" },
            description: '[admin] Remova um usuário da blacklist',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'target',
                    description: 'ID do usuário ou do servidor a ser removido',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'check',
            name_localizations: { "pt-BR": "checar" },
            description: `[admin] Veja as informações de um usuário/servidor na Blacklist`,
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'target',
                    description: 'ID do usuário ou do servidor',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                }
            ]
        }
    ],
    helpData: {
        color: '',
        description: 'Comando da Blacklist',
        permissions: [],
        fields: []
    },
    apiData: {
        name: "blacklist",
        description: "Comando para gerênciar a blacklist",
        category: "Administração",
        synonyms: [],
        perms: {
            user: [],
            bot: []
        }
    },
    /**
     * @param { { interaction: ChatInputCommandInteraction } } param0
     */
    async execute({ interaction }) {

        // return interaction.reply({
        //     content: `${e.Loading} | Este sistema está sob-construção.`,
        //     ephemeral: true
        // })

        const { options, user } = interaction

        if (!client.staff.includes(user.id))
            return interaction.reply({
                content: `${e.Animated.SaphireReading} | Estava vendo aqui e você não pertence a minha staff... Que coisa, não?`,
                ephemeral: true
            })

        const subCommand = options.getSubcommand()

        if (!subCommand)
            return interaction.reply({
                content: `${e.DenyX} | Nenhum sub-comando foi encontrado. #165767423`,
                ephemeral: true
            })

        const exec = { add, remove, check }[subCommand]

        if (!exec)
            return interaction.reply({
                content: `${e.DenyX} | Nenhuma sub-função foi encontrado. #165767484423`,
                ephemeral: true
            })

        return exec(interaction)
    }
}