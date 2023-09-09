import { ApplicationCommandOptionType, ChannelType } from 'discord.js';
import { Modals } from '../../../../classes/index.js';
import configAnunciar from '../../../classes/selectmenu/announce/config.anunciar.js';
import roleAnunciar from '../../functions/anunciar/role.anunciar.js';
import { DiscordPermissons } from '../../../../util/Constants.js';

export default {
    name: 'announce',
    description: '[moderation] Anúncie assuntos interessantes em forma de notícia.',
    dm_permission: false,
    type: 1,
    name_localizations: { "en-US": "announce", 'pt-BR': 'anunciar' },
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
    api_data: {
        name: "announce",
        description: "Faça anúncios no seu servidor com uma embed personalizada.",
        category: "Moderação",
        synonyms: ["anunciar"],
        tags: [],
perms: {
            user: [DiscordPermissons.Administrator],
            bot: [DiscordPermissons.SendMessages]
        }
    },
    async execute({ interaction, guildData, client, Database, e }) {

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
                                value: `${pepy.username} - \`${pepy.id}\`\n${san.username} - \`${san.id}\``
                            },
                            {
                                name: `${e.VerifiedDeveloper} Código Fonte`,
                                value: `${rody.username} - \`${rody.id}\``
                            },
                            {
                                name: `${e.Reference} Melhorias`,
                                value: `${andre.username} - \`${andre.id}\`\n${lewd.username} - \`${lewd.id}\``
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