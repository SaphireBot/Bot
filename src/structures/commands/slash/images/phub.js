import { Canvacord as Canvas } from 'canvacord'
import { AttachmentBuilder } from 'discord.js'

export default {
    name: 'phub',
    description: '[images] Comentário do Phub',
    category: "images",
    dm_permission: false,
    database: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Escolha o usuário do comentário',
            type: 6,
            required: true
        },
        {
            name: 'content',
            description: 'O conteúdo do comentário',
            type: 3,
            max_length: 60,
            min_length: 1,
            required: true
        }
    ],
    apiData: {
        name: "phub",
        description: "Não use esse comando",
        category: "Imagens",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, e }) {

        const msg = await interaction.reply({
            content: `${e.Loading} | Gerando o seu incrível comentário`,
            fetchReply: true
        })

        const { options } = interaction
        const user = options.getUser('user')

        return await msg.edit({
            content: null,
            files: [
                new AttachmentBuilder(
                    await Canvas.phub({
                        image: user.displayAvatarURL({ format: 'png' }),
                        message: options.getString('content'),
                        username: user.username
                    }), 'phub.png'
                )
            ]
        })
            .catch(err => msg.edit({
                content: `${e.Animated.SaphireCry} | Não foi possível gerar o seu change my mind.\n${e.bug} | \`${err}\``
            }))

    }
}