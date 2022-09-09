import { Modals } from '../../../../classes/index.js'
import { ApplicationCommandOptionType } from 'discord.js'

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
        }
    ],
    helpData: {
        description: 'Um simples jogo para escolher o que você prefere'
    },
    async execute({ interaction, client, e }) {

        const { options } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand === 'suggest')
            return await interaction.showModal(Modals.vocePrefere())

        return await interaction.reply({ content: `${e.Info} | Este jogo precisa de mais perguntas. Mande sua sugestão usando </rather suggest:${interaction.commandId}>` })
        return game(interaction)

    }
}