import { ApplicationCommandOptionType } from 'discord.js'
import newGame from '../../functions/tictactoe/newGame.tictactoe.js'

export default {
    name: 'tictactoe',
    description: '[games] O clássico jogo da velha',
    category: "games",
    dm_permission: false,
    name_localizations: { "en-US": "tictactoe", 'pt-BR': 'jogo-da-velha' },
    database: false,
    type: 1,
    options: [
        {
            name: 'oponente',
            description: 'Selecione o seu oponente',
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ],
    async execute({ interaction, e }) {

        const { options, user } = interaction
        const opponent = options.getUser('oponente')

        if (opponent.bot || opponent.id === user.id)
            return await interaction.reply({
                content: `${e.Deny} | Você não pode jogar contra bots ou você mesmo.`,
                ephemeral: true
            })

        return newGame(interaction, opponent)
    }
}