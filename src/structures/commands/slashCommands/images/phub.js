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
    async execute({ interaction }) {

        await interaction.deferReply()

        const { options } = interaction
        const message = options.getString('content')
        const user = options.getUser('user')
        const avatar = user.displayAvatarURL({ format: 'png' })

        const attachment = new AttachmentBuilder(
            await Canvas.phub({
                image: avatar,
                message,
                username: user.username
            }), 'youtube.png'
        )

        return await interaction.editReply({ files: [attachment] }).catch(() => { })

    }
}