import { Canvacord as Canvas } from 'canvacord'
import { ApplicationCommandOptionType, AttachmentBuilder } from 'discord.js'

export default {
    name: 'images',
    name_localizations: { "en-US": "images", 'pt-BR': 'imagens' },
    description: '[images] Imagens e suas interações',
    dm_permission: false,
    database: false,
    type: 1,
    options: [
        {
            name: 'interaction',
            description: 'Interação a ser usada',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Isso não afeta o bebê',
                    value: 'affect'
                },
                {
                    name: 'Isso é bonito',
                    value: 'beautiful'
                },
                {
                    name: 'Pera... É um lixo?',
                    value: 'trash'
                },
                {
                    name: 'Pior que hilter cara...',
                    value: 'hitler'
                },
                {
                    name: 'Facepalm',
                    value: 'facepalm'
                },
                {
                    name: 'Borrão',
                    value: 'blur'
                }
            ]
        },
        {
            name: 'user',
            description: 'Escolha o usuário a ser afetado',
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ],
    async execute({ interaction, e }) {

        const msg = await interaction.reply({
            content: `${e.Loading} | Gerando a sua imagem...`,
            fetchReply: true
        })

        const { options, user: author } = interaction
        const option = options.getString('interaction')
        const user = options.getUser('user')

        return await msg.edit({
            content: null,
            files: [
                new AttachmentBuilder(
                    await Canvas[option](user.displayAvatarURL({ format: 'png' })),
                    `${author.id}_${option}.png`)
            ]
        })
            .catch(err => msg.edit({
                content: `${e.cry} | Não foi possível gerar o seu change my mind.\n${e.bug} | \`${err}\``
            }))

    }
}