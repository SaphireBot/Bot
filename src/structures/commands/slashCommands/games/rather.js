import { Modals } from '../../../../classes/index.js'
import { ApplicationCommandOptionType } from 'discord.js'
import game from './rather/game.rather.js'
import gameOptions from './rather/options.rather.js'

export default {
    name: 'rather',
    description: '[games] O que você prefere?',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'suggest',
            description: 'Sugira uma nova pergunta para o jogo',
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'play',
            description: 'Você prefere isso ou aquilo?',
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'options',
            description: 'Mais opções do comando',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'delete',
                    description: 'Delete uma questão do jogo',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                },
                {
                    name: 'edit',
                    description: 'Edite uma questão do jogo',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                }
            ]
        }
    ],
    helpData: {
        description: 'Um simples jogo para escolher o que você prefere'
    },
    async execute({ interaction }) {

        const { options } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand === 'suggest')
            return await interaction.showModal(Modals.vocePrefere())

        if (subCommand === 'options')
            return gameOptions(interaction)

        return game(interaction)

    }
}