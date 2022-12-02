import { ApplicationCommandOptionType, ChannelType } from 'discord.js'
import { Database, Modals } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'
import configAnunciar from '../../../classes/selectmenu/announce/config.anunciar.js'
import roleAnunciar from '../../functions/anunciar/role.anunciar.js'

export default {
    name: 'anunciar',
    description: '[moderation] Anúncie assuntos interessantes em forma de notícia.',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'config',
            description: '[moderation] ADMIN ONLY | Configure o canal e os cargos do comando/sistema',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'notification_role',
                    description: 'Cargo a ser notificado a cada publicação',
                    type: ApplicationCommandOptionType.Role,
                },
                {
                    name: 'allowed_role',
                    description: 'Membros com este cargo poderá fazer novas publicações',
                    type: ApplicationCommandOptionType.Role,
                },
                {
                    name: 'notice_channel',
                    description: 'Canal para envio das notícias',
                    type: ApplicationCommandOptionType.Channel,
                    channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
                }
            ]
        },
        {
            name: 'notice',
            description: '[moderation] Opções do comando',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'options',
                    description: 'Opções do comando de anúnciar notícias',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: 'ALLOWED ROLE | Publicar uma nova notícia',
                            value: 'notice'
                        },
                        {
                            name: 'Obter/Retirar cargo de notificação',
                            value: 'role'
                        },
                        {
                            name: 'Créditos',
                            value: 'credits'
                        }
                    ]
                }
            ]
        }
    ],
    helpData: {
        description: 'Comando de anúncio'
    },
    async execute({ interaction, guildData, client }) {
        
        const command = interaction.options.getSubcommand()

        if (command === "config")
            return configAnunciar({ interaction, guildData })

        if (command === "notice") {

            const option = interaction.options.getString('options')

            if (option === 'notice')
                return await interaction.showModal(Modals.NewNotice)

            if (option === 'role')
                return roleAnunciar(interaction, guildData)

            if (option === 'credits') {

                const pepy = await client.users.fetch(Database.Names.Pepy) || { tag: 'Pepy', id: Database.Names.Pepy }
                const san = await client.users.fetch(Database.Names.San) || { tag: 'San', id: Database.Names.San }
                const rody = await client.users.fetch(Database.Names.Rody) || { tag: 'Rody', id: Database.Names.Rody }
                const andre = await client.users.fetch(Database.Names.Andre) || { tag: 'Andre', id: Database.Names.Andre }
                const lewd = await client.users.fetch("140926143783108610") || { tag: 'Lewd', id: "140926143783108610" }

                return await interaction.reply({
                    embeds: [{
                        color: client.blue,
                        title: '❤ Créditos do comando anunciar',
                        description: 'Um agradecimento para todos os membros que contribuíram para a construção deste comando.',
                        fields: [
                            {
                                name: '💡 Idealizadores',
                                value: `${pepy.tag} - \`${pepy.id}\`\n${san.tag} - \`${san.id}\``
                            },
                            {
                                name: `${e.VerifiedDeveloper} Código Fonte`,
                                value: `${rody.tag} - \`${rody.id}\``
                            },
                            {
                                name: `${e.Reference} Melhorias`,
                                value: `${andre.tag} - \`${andre.id}\`\n${lewd.tag} - \`${lewd.id}\``
                            }
                        ]
                    }]
                })
            }

            return await interaction.reply({
                content: `${e.Deny} | Opção de sub-comando não definida.`,
                ephemeral: true
            })
        }

        return await interaction.reply({
            content: `${e.Deny} | Sub-Comando não reconhecido dentre as opções.`,
            ephemeral: true
        })
    }
}