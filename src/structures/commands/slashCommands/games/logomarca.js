import newGame from '../../functions/logomarca/game.logomarca.js'

export default {
    name: 'logomarca',
    description: '[games] Um simples jogo de adivinhar logomarcas',
    dm_permission: false,
    type: 1,
    options: [
        // {
        //     name: 'new_game',
        //     description: '[games] Inicie um novo jogo',
        //     type: ApplicationCommandOptionType.Subcommand
        // },
        // {
        //     name: 'view',
        //     description: '[games] Veja uma logo especifica do logomarca',
        //     type: ApplicationCommandOptionType.Subcommand,
        // },
        // {
        //     name: 'options',
        //     description: '[games] Outros comandos do jogo',
        //     type: ApplicationCommandOptionType.Subcommand,
        //     options: [
        //         {
        //             name: 'admin',
        //             description: 'Comandos exclusivos para administradores da Saphire',
        //             type: ApplicationCommandOptionType.String,
        //             autocomplete: true
        //         }
        //     ]
        // }
    ],
    async execute({ interaction, e }) {
        return
        const { options } = interaction
        const subCommands = options.getSubcommand()

        if (subCommands === 'new_game') return newGame(interaction)

    }
}