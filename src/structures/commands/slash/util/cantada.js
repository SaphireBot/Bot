import { ApplicationCommandOptionType } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
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
                    name: 'search',
                    description: 'Pesquise por um cantada',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                },
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
        fields: [
            {
                name: `${e.Info} Minhas cantadas`,
                value: 'Você também pode ver suas cantadas entrando nas opções do comando `/cantada visualizar opcoes`'
            },
            {
                name: '📨 Enviar cantadas',
                value: 'Você pode enviar sua cantada usando o comando `/cantada enviar`. Assim, os membros da Saphire Team irá dar uma olhada na sua cantada'
            },
            {
                name: '❤️‍🔥 Like Unlike Refresh',
                value: 'Você pode dar like ❤️‍🔥 e 🖤 unlike em cada cantada.\nO 🔄 Refresh é para mudar de cantada'
            }
        ]
    },
    api_data: {
        name: "cantada",
        description: "Veja e envie as melhores cantadas do mundo aqui (ou não)",
        category: "Utilidades",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, clientData }) {

        const { options } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand === 'enviar')
            return await interaction.showModal(Modals.SendCanta)

        if (options.getString('search'))
            return viewCantadas({ interaction, clientData, search: options.getString('search') })

        return viewCantadas({ interaction, clientData })
    }
}