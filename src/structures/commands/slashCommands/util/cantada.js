import { ApplicationCommandOptionType } from 'discord.js'
import viewCantadas from '../../functions/cantadas/view.cantadas.js'
import Modals from '../../../classes/Modals.js'

export default {
    name: 'cantada',
    description: '[util] Comando interativo de cantadas',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'visualizar',
            description: '[util] Visualize as cantadas',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'opcoes',
                    description: 'Mais opções de visualizações de cantadas',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'enviar',
            description: '[util] Envie uma cantada ou relate um erro para a Saphire\'s Team',
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    helpData: {
        title: '😗 Super comando de cantadas',
        description: 'Veja as melhores cantadas do mundo aqui',
        permissions: [],
        fields: []
    },
    async execute({ interaction, clientData }) {

        const { options } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand === 'enviar')
            return await interaction.showModal(Modals.SendCanta)

        return viewCantadas({ interaction, clientData })
    }
}