import { ApplicationCommandOptionType } from 'discord.js'
import { Emojis as e, Gifs } from '../../../../util/util.js'
import emotionalGifData from './gifs/emotional.gifs.data.js'
import emotionalGifs from './gifs/emotional.gifs.js'
import interactionGifData from './gifs/interaction.gifs.data.js'
import interactionGifs from './gifs/interaction.gifs.js'

const data = {
    name: 'gifs',
    description: '[gifs] Interações gerais',
    category: "images",
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'interaction',
            description: '[gifs] Interagir com as pessoas é legal',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'action',
                    description: 'Qual é a sua interacação?',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: []
                },
                {
                    name: 'user',
                    description: 'Usuário da interação',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: 'emotional',
            description: '[gifs] Tente demonstrar suas emoções por aqui',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'reaction',
                    description: 'Qual é a sua reação?',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: []
                },
                {
                    name: 'text',
                    description: 'Diga o que sente',
                    type: ApplicationCommandOptionType.String,
                }
            ]
        }
    ]
}

for (let gif of interactionGifData)
    data.options[0].options[0].choices.push({ name: gif.name, value: gif.JSON })

for (let gif of emotionalGifData)
    data.options[1].options[0].choices.push({ name: gif.name, value: gif.JSON })

export default {
    ...data,
    async execute({ interaction, client }) {

        const subCommand = interaction.options.getSubcommand()

        return subCommand === 'interaction'
            ? interactionGifs(interaction, client, e, Gifs, interactionGifData)
            : emotionalGifs(interaction, client, e, Gifs, emotionalGifData)

    }
}