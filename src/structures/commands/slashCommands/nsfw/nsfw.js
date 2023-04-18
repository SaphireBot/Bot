import { Emojis as e } from '../../../../util/util.js'
import { ApplicationCommandOptionType } from 'discord.js'
import images from '../../functions/nsfw/images.js'

export default {
    name: 'nsfw',
    nsfw: true,
    description: '[nsfw] Not Safe For Work | Conteúdo maior de idade',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'images',
            name_localizations: { "pt-BR": "imagens" },
            description: 'Imagens de conteúdo adulto',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'category',
                    name_localizations: { "pt-BR": 'categoria' },
                    description: "Categoria desejada",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                }
            ]
        }
    ],
    helpData: {},
    async execute({ interaction }) {

        const { options } = interaction
        const subCommand = options.getSubcommand()

        const execute = {
            images
        }[subCommand]

        if (!subCommand)
            return interaction.reply({
                content: `${e.SaphireDesespero} | Sub-comando não encontrado #1684854000`,
                ephemeral: true
            })

        return execute(interaction)
    }
}