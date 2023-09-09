import { ApplicationCommandOptionType, ChannelType, PermissionFlagsBits } from 'discord.js';
import { DiscordPermissons, Permissions, PermissionsTranslate } from '../../../../util/Constants.js';
import { Emojis as e } from '../../../../util/util.js';
import statusStars from './functions/status.stars.js';

export default {
    name: 'stars',
    description: '[moderation] Ative o recurso de estrelas',
    dm_permission: false,
    default_member_permissions: `${PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageMessages}`,
    name_localizations: { "en-US": "stars", 'pt-BR': 'estrelas' },
    type: 1,
    options: [
        {
            name: 'config',
            description: '[ADMIN] Configure o limite de reações e o canal de envio',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'limit',
                    description: 'Quantas reações deve ter a mensagem?',
                    type: ApplicationCommandOptionType.Integer,
                    choices: [
                        {
                            name: 'Desativar Sistema',
                            value: 0
                        },
                        {
                            name: '2 Reações',
                            value: 2
                        },
                        {
                            name: '3 Reações',
                            value: 3
                        },
                        {
                            name: '4 Reações',
                            value: 4
                        },
                        {
                            name: '5 Reações',
                            value: 5
                        },
                        {
                            name: '6 Reações',
                            value: 6
                        },
                        {
                            name: '7 Reações',
                            value: 7
                        },
                        {
                            name: '8 Reações',
                            value: 8
                        },
                        {
                            name: '9 Reações',
                            value: 9
                        },
                        {
                            name: '10 Reações',
                            value: 10
                        }
                    ],
                    required: true
                },
                {
                    name: 'channel',
                    description: 'Canal onde as mensagens serão enviadas',
                    type: ApplicationCommandOptionType.Channel,
                    channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
                    required: true
                }
            ]
        },
        {
            name: 'status',
            description: '[USER] Acompanhe o status do sistema de estrelas',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'method',
                    description: 'Métodos disponíveis neste comando',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: 'Total de estrelas enviadas no servidor',
                            value: 'sended'
                        },
                        {
                            name: 'Quantas estrelas eu tenho?',
                            value: 'myStars'
                        },
                        {
                            name: 'Créditos de criação',
                            value: 'credits'
                        },
                        {
                            name: 'Estado das configurações',
                            value: 'stats'
                        }
                    ]
                }
            ]
        }
    ],
    helpData: {
        title: '⭐ Sistema de Estrelas',
        description: 'Com esse recurso, você pode reagir a mensagem para ela virar um destaque no servidor',
        permissions: ['ManageChannels', 'ManageMessages'],
        fields: [
            {
                name: `${e.Info} Tudo tem um limite`,
                value: 'A quantidade de estrela varia de 2 a 10 estrelas. Quando as reações de estrelas atigem o valor configurado, a mensagem é mandada apra o canal designado.'
            },
            {
                name: '📝 Bem-estar',
                value: 'Para o bem-estar deste sistema, apenas textos e imagens serão enviados ao canal configurado.'
            }
        ],
        footer: {
            text: 'O Project Saphire se ausenta de quaisquer responsabilidade pelo uso deste comando.'
        }
    },
    api_data: {
        name: "stars",
        description: "Ative as estrelas e salve as mensagens em um canal para ficar eternizado na história",
        category: "Moderação",
        synonyms: ["estrelas"],
        tags: [],
perms: {
            user: [DiscordPermissons.ManageChannels, DiscordPermissons.ManageMessages],
            bot: [DiscordPermissons.ManageChannels, DiscordPermissons.ManageMessages]
        }
    },
    async execute({ interaction, guildData, Database }) {

        const { guild, options, member } = interaction

        if (!guild.clientHasPermission(Permissions.ManageChannels) || !guild.clientHasPermission(Permissions.ManageMessages))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **\`${PermissionsTranslate.ManageChannels}\`** & **\`${PermissionsTranslate.ManageMessages}\`** para executar este comando.`,
                ephemeral: true
            })

        if (!member.permissions.has(DiscordPermissons.ManageChannels, true) || !member.permissions.has(DiscordPermissons.ManageMessages, true))
            return await interaction.reply({
                content: `${e.Deny} | Você precisa da permissão **${PermissionsTranslate.ManageChannels}** &  **${PermissionsTranslate.ManageMessages}** para executar este comando.`,
                ephemeral: true
            })

        const subCommand = options.getSubcommand()

        if (subCommand === 'status') return statusStars({ interaction, e, guildData })

        const channel = options.getChannel('channel')
        const limit = options.getInteger('limit')

        if (limit == 0) {
            await Database.Guild.findOneAndUpdate(
                { id: guild.id },
                { $unset: { Stars: 1 } },
                { upsert: true, new: true }
            )
                .then(data => Database.saveGuildCache(data.id, data))

            return await interaction.reply({
                content: `${e.Check} | Ok ok, sistema de estrelas desligado.`
            })
        }

        if (limit < 2 || limit > 10)
            return await interaction.reply({
                content: `${e.Deny} | A quantidade deve estar entre 2 e 10 reações`,
                ephemeral: true
            })

        if (![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type))
            return await interaction.reply({
                content: `${e.Deny} | Esse canal não é um canal válido para esse comando.`,
                ephemeral: true
            })

        const starsData = guildData?.starsData

        if (starsData?.limit === limit && starsData?.channel === channel.id)
            return await interaction.reply({
                content: `${e.Info} | A quantidade limite e o canal são os mesmos cadastrados no banco de dados.`
            })

        return Database.Guild.findOneAndUpdate(
            { id: guild.id },
            { $set: { Stars: { limit, channel: channel.id } } },
            { upsert: true, new: true }
        )
            .then(async data => {
                Database.saveGuildCache(data.id, data)
                interaction.reply({
                    content: `${e.Check} | As novas configurações de estrelas foi salva com sucesso.\n⭐ | Reaja com uma estrela em uma mensagem, ao atingir **${limit} reações**, a mensagem será enviada no canal ${channel} para que fique salva.`
                })
                return
            })
            .catch(async err => await interaction.reply({
                content: `${e.Deny} | Não foi possível salvar as configurações.\n${e.bug} | \`${err}\``
            }))

    }
}