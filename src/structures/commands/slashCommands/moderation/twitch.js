import { ApplicationCommandOptionType, ChannelType, PermissionsBitField } from 'discord.js'
import ativar from './functions/twitch/ativar.twitch.js'
import desativar from './functions/twitch/desativar.twitch.js'
import informations from './functions/twitch/informations.twitch.js'
import search from './functions/twitch/search.twitch.js'

export default {
    name: 'twitch',
    description: '[moderation] Configure as notificações da Twitch no seu servidor',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'ativar',
            description: '[moderation] Ative as notificações de um canal da Twitch no servidor',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'streamers',
                    type: ApplicationCommandOptionType.String,
                    description: 'NomeDoStreamer, OutroStreamer, https://twitch.tv/streamer, MaisOutroStreamer (Max: 100 Streamers)',
                    min_length: 4,
                    required: true
                },
                {
                    name: 'canal_do_servidor',
                    type: ApplicationCommandOptionType.Channel,
                    description: 'Canal onde as notificações serão enviadas.',
                    required: true,
                    channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement]
                },
                {
                    name: 'cargo_a_ser_mencionado',
                    type: ApplicationCommandOptionType.Role,
                    description: 'O cargo que será mencionado na hora do anúncio.'
                },
                {
                    name: 'mensagem_de_notificação',
                    type: ApplicationCommandOptionType.String,
                    max_length: 700,
                    description: 'O que eu devo dizer? Use $role para mencionar o cargo e $streamer para mencionar o/a streamer.'
                }
            ]
        },
        {
            name: 'desativar',
            description: '[moderation] Desative as notificações de um canal da Twitch no servidor',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'streamer',
                    type: ApplicationCommandOptionType.String,
                    description: 'Qual streamer você quer desativar as notificações?',
                    required: true,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'informations',
            name_localizations: { 'pt-BR': 'informações' },
            description: '[moderation] Todas as informações sobre o comando Twitch',
            type: ApplicationCommandOptionType.Subcommand,
            options: []
        },
        {
            name: 'search',
            name_localizations: { 'pt-BR': 'pesquisar' },
            description: '[general] Todas as informações sobre o comando Twitch',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'onde',
                    type: ApplicationCommandOptionType.String,
                    description: 'Onde você quer pesquisar?',
                    required: true,
                    choices: [
                        {
                            name: 'Categoria, Jogos ou Outros',
                            value: 'categories'
                        },
                        {
                            name: 'Canais ou Streamers',
                            value: 'channels'
                        }
                    ]
                },
                {
                    name: 'input',
                    type: ApplicationCommandOptionType.String,
                    description: 'O que ou quem você procura no Twitch?',
                    required: true
                }
            ]
        }
    ],
    helpData: {},
    async execute({ interaction }) {

        const { options, member } = interaction
        const Subcommand = options.getSubcommand()

        if (Subcommand == 'search') return search(interaction)

        if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
            return interaction.reply({
                content: `${e.DenyX} | Você precisa ser um **Administrador** do servidor para ativar as notificações da Twitch, ok?`,
                ephemeral: true
            })

        return { ativar, desativar, informations }[Subcommand](interaction)
    }
}