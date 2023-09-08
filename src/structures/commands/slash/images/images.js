import { Canvacord as Canvas } from 'canvacord';
import { ApplicationCommandOptionType, AttachmentBuilder } from 'discord.js';

export default {
    name: 'images',
    name_localizations: { "en-US": "images", 'pt-BR': 'imagens' },
    description: '[images] Imagens e suas interações',
    dm_permission: false,
    database: false,
    type: 1,
    options: [
        {
            name: 'avatar',
            type: ApplicationCommandOptionType.Subcommand,
            description: '[images] Brinque com o avatar de alguém',
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
                            name: 'Arco-íris do ele é?',
                            value: 'rainbow'
                        },
                        {
                            name: 'Pior que hilter cara...',
                            value: 'hitler'
                        },
                        {
                            name: 'R.I.P',
                            value: 'rip'
                        },
                        {
                            name: 'Wanted (Procurado em PT)',
                            value: 'wanted'
                        },
                        {
                            name: 'Deleta pra lixeira',
                            value: 'delete'
                        },
                        {
                            name: 'Wasted',
                            value: 'wasted'
                        },
                        {
                            name: 'Pisei no cocô',
                            value: 'shit'
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
            ] // TODO: Adicionar o resto
        }
    ],
    apiData: {
        name: "images",
        description: "Edite diretamente o avatar de alguém de uma forma criativa.",
        category: "Imagens",
        synonyms: ["imagens"],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
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
                content: `${e.Animated.SaphireCry} | Não foi possível gerar o seu change my mind.\n${e.bug} | \`${err}\``
            }))

    }
}