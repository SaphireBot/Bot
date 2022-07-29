import { Canvacord as Canvas } from 'canvacord'
import { AttachmentBuilder } from 'discord.js'

export default {
    name: 'youtube',
    description: '[images] Comentário do Youtube',
    dm_permission: false,
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
    async execute({ interaction, emojis: e }) {

        await interaction.deferReply()

        const { options } = interaction
        const content = options.getString('content')
        const user = options.getUser('user')
        const dark = options.getBoolean('darkmode')
        const avatar = user.displayAvatarURL({ format: 'png' })

        const attachment = new AttachmentBuilder(
            await Canvas.youtube({
                username: user.username,
                content,
                avatar,
                dark
            }), 'youtube.png'
        )

        return await interaction.editReply({ files: [attachment] })

    }
}