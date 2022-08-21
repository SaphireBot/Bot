import game from '../../functions/bandeiras/game.bandeiras.js'
import { ApplicationCommandOptionType } from 'discord.js'

export default {
    name: 'bandeiras',
    description: '[games] Um simples jogo de adivinhar as bandeiras',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'start',
            description: '[games] Comece um novo jogo de adivinhar bandeiras',
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    async execute({ interaction, emojis: e }) {

        const { options } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand === 'start') return game(interaction)
    }
}