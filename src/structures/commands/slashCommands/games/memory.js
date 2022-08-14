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
                            name: 'Números',
                            value: 0
                        },
                        {
                            name: 'Bandeiras',
                            value: 1
                        },
                        {
                            name: 'Animais',
                            value: 2
                        },
                        {
                            name: 'Frutas',
                            value: 3
                        },
                        {
                            name: 'Bolas',
                            value: 4
                        },
                        {
                            name: 'Emoticons',
                            value: 5
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