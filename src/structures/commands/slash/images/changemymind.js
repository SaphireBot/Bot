import { Canvacord as Canvas } from 'canvacord'
import { ApplicationCommandOptionType, AttachmentBuilder } from 'discord.js'

export default {
    name: 'changemymind',
    description: '[images] Apenas changemymind',
    category: "images",
    dm_permission: false,
    database: false,
    type: 1,
    options: [
        {
            name: 'content',
            description: 'Conteúdo a ser escrito no papel',
            max_length: 45,
            min_length: 1,
            type: ApplicationCommandOptionType.String,
            required: true
        },
    ],
    apiData: {
        name: "changemymind",
        description: "Can you change my mind? (meme)",
        category: "Imagens",
        synonyms: [],
        perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, e }) {

        const msg = await interaction.reply({
            content: `${e.Loading} | Gerando o seu change my mind...`,
            fetchReply: true
        })

        return await msg.edit({
            content: null,
            files: [
                new AttachmentBuilder(
                    await Canvas.changemymind(interaction.options.getString('content')), 'phub.png'
                )
            ]
        })
            .catch(err => msg.edit({
                content: `${e.Animated.SaphireCry} | Não foi possível gerar o seu change my mind.\n${e.bug} | \`${err}\``
            }))

    }
}