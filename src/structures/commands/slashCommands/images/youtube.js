import { Canvacord as Canvas } from 'canvacord'
import { AttachmentBuilder } from 'discord.js'

export default {
    name: 'youtube',
    description: '[images] Comentário do Youtube',
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
        },
        {
            name: 'darkmode',
            description: 'Aplicar modo darkmode?',
            type: 5
        }
    ],
    async execute({ interaction }) {

        await interaction.deferReply()

        const { options } = interaction
        const user = options.getUser('user')

        return await interaction.editReply({
            files: [
                new AttachmentBuilder(
                    await Canvas.youtube({
                        username: user.username,
                        content: options.getString('content'),
                        avatar: user.displayAvatarURL({ format: 'png' }),
                        dark: options.getBoolean('darkmode')
                    }), 'youtube.png'
                )
            ]
        })
            .catch(err => msg.edit({
                content: `${e.SaphireChorando} | Não foi possível gerar o seu change my mind.\n${e.bug} | \`${err}\``
            })).catch(() => { })

    }
}