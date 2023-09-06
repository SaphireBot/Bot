import { ApplicationCommandOptionType } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
import random from './hangman/random.hangman.js'
import Modals from '../../../classes/Modals.js'

export default {
    name: 'hangman',
    name_localizations: { 'pt-BR': 'jogo_da_forca' },
    description: '[game] O famoso jogo da forca',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'random',
            name_localizations: { 'pt-BR': 'aleatório' },
            description: 'Jogo da forca com uma palavra aleatória',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'amount_letters',
                    name_localizations: { 'pt-BR': 'quantidade_de_letras' },
                    description: 'Quantidade de letras (3 ~ 10)',
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 3,
                    max_value: 10,
                    choices: [
                        ...[3, 4, 5, 6, 7, 8, 9, 10]
                            .map(num => ({ name: `${num} letras`, value: num }))
                    ]
                },
                {
                    name: 'style',
                    name_localizations: { 'pt-BR': 'estilo' },
                    description: 'Estilo de jogo?',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: 'Multiplayer. Todos podem jogar.',
                            value: 'multiplayer'
                        },
                        {
                            name: 'Solo. Apenas eu posso jogar.',
                            value: 'solo'
                        }
                    ]
                }
            ]
        },
        {
            name: 'choose',
            name_localizations: { 'pt-BR': 'escolher' },
            description: 'Jogo da forca com uma palavra personalizada',
            type: ApplicationCommandOptionType.Subcommand,
            options: []
        }
    ],
    apiData: {
        name: "hangman",
        description: "jogar o jogo da forca é muito legal entre com os amigos.",
        category: "Diversão",
        synonyms: ["jogo_da_forca"],
        perms: {
            user: [],
            bot: []
        }
    },
    execute({ interaction }) {

        const subCommand = interaction.options.getSubcommand()
        const execute = { random }[subCommand]

        if (subCommand == 'choose')
            return interaction.showModal(Modals.newHangman)

        if (execute) return execute(interaction)

        return interaction.reply({
            content: `${e.Animated.SaphireCry} | Nenhuma sub-função foi encontrada para esta interação. #484354354038`
        })
    }
}