import { ApplicationCommandOptionType, ChannelType } from 'discord.js'
import { Modals } from '../../../../classes/index.js'
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
                            name: 'EVERYONE | Obter/Retirar cargo de notificação',
                            value: 'role'
                        }
                    ]
                }
            ]
        }
    ],
    helpData: {
        description: 'Comando de anúncio'
    },
    async execute({ interaction, guildData }) {

        const command = interaction.options.getSubcommand()

        if (command === "config")
            return configAnunciar({ interaction, guildData })

        if (command === "notice") {

            const option = interaction.options.getString('options')

            if (option === 'notice')
                return await interaction.showModal(Modals.NewNotice)

            if (option === 'role')
                return roleAnunciar(interaction, guildData)

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