import solo from '../../functions/memorygame/solo.memory.js'
import coop from '../../functions/memorygame/coop.memory.js'
import versus from '../../functions/memorygame/versus.memory.js'
import sequency from '../../functions/memorygame/sequency.memory.js'
import { ApplicationCommandOptionType } from 'discord.js'

const choices = [
    {
        name: 'Números (Easy)',
        value: 0
    },
    {
        name: 'Bandeiras (Medium)',
        value: 1
    },
    {
        name: 'Animais (Easy)',
        value: 2
    },
    {
        name: 'Frutas (Easy)',
        value: 3
    },
    {
        name: 'Bolas (Easy)',
        value: 4
    },
    {
        name: 'Emoticons (Medium)',
        value: 5
    },
    {
        name: 'Corações (Easy)',
        value: 6
    },
    {
        name: 'Relógios (Hard)',
        value: 7
    },
    {
        name: 'Família (Ultimate)',
        value: 8
    },
    {
        name: 'Bandeiras Azuis (Hard)',
        value: 9
    },
    {
        name: 'Setas (Medium)',
        value: 10
    },
    {
        name: 'Luas (Medium)',
        value: 11
    }
]

export default {
    name: 'memory',
    description: '[games] Um jogo simples para testar sua memória',
    category: "games",
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'solo',
            description: '[games] Jogue sozinho',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'emojis',
                    description: 'Emojis para o jogo',
                    type: ApplicationCommandOptionType.Integer,
                    choices
                },
                {
                    name: 'mode',
                    description: 'Escolha um modo de jogo',
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        {
                            name: 'Tempo Corrido (2 minutos)',
                            value: 'minutes'
                        }
                    ]
                }
            ]
        },
        {
            name: 'cooperative',
            description: '[games] Jogue com alguém no modo cooperativo',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'member',
                    description: 'Selecione um membro',
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'emojis',
                    description: 'Emojis para o jogo',
                    type: ApplicationCommandOptionType.Integer,
                    choices
                }
            ]
        },
        {
            name: 'versus',
            description: '[games] Jogue contra alguém no modo competitivo',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'member',
                    description: 'Selecione um adversário',
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'emojis',
                    description: 'Emojis para o jogo',
                    type: ApplicationCommandOptionType.Integer,
                }
            ]
        },
        {
            name: 'sequency',
            description: '[games] Você é capaz de seguir a sequência correta?',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'numbers',
                description: 'Quantos números você quer?',
                type: ApplicationCommandOptionType.Integer,
                required: true,
                choices: [
                    {
                        name: '5 Números',
                        value: 5
                    },
                    {
                        name: '6 Números',
                        value: 6
                    },
                    {
                        name: '7 Números',
                        value: 7
                    },
                    {
                        name: '8 Números',
                        value: 8
                    },
                    {
                        name: '9 Números',
                        value: 9
                    },
                    {
                        name: '10 Números',
                        value: 10
                    },
                ]
            }]
        }
    ],
    async execute({ interaction, Database, client, e }) {

        const { options } = interaction

        const gameMode = options.getSubcommand()
        if (gameMode === 'solo') return solo(interaction, Database, e)
        if (gameMode === 'cooperative') return coop(interaction, e)
        if (gameMode === 'versus') return versus(interaction, e)
        if (gameMode === 'sequency') return sequency(interaction, Database, client, e)

    }
}