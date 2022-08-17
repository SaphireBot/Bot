import solo from '../../functions/memorygame/solo.memory.js'
import { ApplicationCommandOptionType } from 'discord.js'

export default {
    name: 'memory',
    description: '[games] Um jogo simples para testar sua memória',
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
                    choices: [
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
                        }
                    ]
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
        }
    ],
    async execute({ interaction, Database, emojis: e }) {

        const { options } = interaction

        const gameMode = options.getSubcommand()
        if (gameMode === 'solo') return solo(interaction, Database, e)

    }
}