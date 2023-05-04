import { ApplicationCommandOptionType, ButtonStyle } from 'discord.js'
import PollManager from '../../../../functions/update/polls/poll.manager.js'
import { Colors } from '../../../../util/Constants.js'

export default {
    name: 'poll',
    description: '[util] Um jeito diferente de criar votações',
    category: "util",
    dm_permission: false,
    name_localizations: { "en-US": "poll", 'pt-BR': 'votação' },
    type: 1,
    options: [
        {
            name: 'create',
            description: '[util] Um jeito diferente de criar votações',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'text',
                    description: 'Texto a ser votado',
                    type: ApplicationCommandOptionType.String,
                    max_length: 4096,
                    required: true
                },
                {
                    name: 'time',
                    description: 'Tempo para encerramento da votação',
                    type: ApplicationCommandOptionType.Number,
                    choices: [
                        {
                            name: 'Permanente',
                            value: 0
                        },
                        {
                            name: '30 Segundos',
                            value: 30000
                        },
                        {
                            name: '1 Minuto',
                            value: 60000
                        },
                        {
                            name: '5 Minutos',
                            value: 60000 * 5
                        },
                        {
                            name: '10 Minutos',
                            value: 60000 * 10
                        },
                        {
                            name: '30 Minutos',
                            value: 60000 * 30
                        },
                        {
                            name: '1 Hora',
                            value: 60000 * 60
                        },
                        {
                            name: '5 Horas',
                            value: (60000 * 60) * 5
                        },
                        {
                            name: '10 Horas',
                            value: (60000 * 60) * 10
                        },
                        {
                            name: '1 Dia',
                            value: (60000 * 60) * 24
                        },
                        {
                            name: '2 Dias',
                            value: ((60000 * 60) * 24) * 2
                        },
                        {
                            name: '3 Dias',
                            value: ((60000 * 60) * 24) * 3
                        },
                        {
                            name: '4 Dias',
                            value: ((60000 * 60) * 24) * 4
                        },
                        {
                            name: '5 Dias',
                            value: ((60000 * 60) * 24) * 5
                        },
                        {
                            name: '6 Dias',
                            value: ((60000 * 60) * 24) * 6
                        },
                        {
                            name: '7 Dias',
                            value: ((60000 * 60) * 24) * 7
                        }
                    ],
                    required: true

                },
                {
                    name: 'type',
                    description: 'Qual o tipo desta votação?',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: 'Votação anônima',
                            value: 'true'
                        },
                        {
                            name: 'Votação comum',
                            value: 'false'
                        }
                    ]
                },
                {
                    name: 'color',
                    description: 'Escolha a cor da embed',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'close',
            description: '[util] Feche uma votação',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'available_polls',
                    description: 'Escolha uma votação aberta para encerrar',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    required: true
                }
            ]
        }
    ],
    async execute({ interaction, client, Database, emojis: e }) {

        const { options, user, channel, guild } = interaction
        const color = Colors[options.getString('color')] || client.blue
        const subCommand = options.getSubcommand()
        const text = options.getString('text')
        const endTime = options.getNumber('time')
        const anonymous = options.getString('type') === 'true'

        if (subCommand === 'close')
            return PollManager.close(interaction, options.getString('available_polls'))

        const fields = [{
            name: '🛰 Status',
            value: `${e.Upvote} 0 - 0%\n${e.QuestionMark} 0 - 0%\n${e.DownVote} 0 - 0%\n${e.saphireRight} 0 votos coletados${anonymous ? `\n${e.Loading} Aguardando finalização` : ''}`
        }]

        if (endTime > 0)
            fields.push({
                name: '⏱ Tempo',
                value: `Encerrando ${Date.Timestamp(new Date((Date.now() + endTime)), 'R', true)}`
            })

        const components = anonymous
            ? [{
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: e.Upvote,
                        custom_id: JSON.stringify({ c: 'poll', type: 'up' }),
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: 2,
                        emoji: e.QuestionMark,
                        custom_id: JSON.stringify({ c: 'poll', type: 'question' }),
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: 2,
                        emoji: e.DownVote,
                        custom_id: JSON.stringify({ c: 'poll', type: 'down' }),
                        style: ButtonStyle.Secondary
                    }
                ]
            }]
            : []

        if (anonymous && endTime === 0)
            components[0].components.push({
                type: 2,
                emoji: '📝',
                custom_id: JSON.stringify({ c: 'poll', type: 'result' }),
                style: ButtonStyle.Primary
            })

        const msg = await interaction.reply({
            embeds: [{
                color: color,
                title: `🎫 Nova votação ${anonymous ? 'anônima ' : ''}aberta`,
                description: text,
                fields: fields,
                footer: {
                    text: endTime === 0 ? 'Votação permanente' : null
                }
            }],
            components,
            fetchReply: true
        })

        if (!anonymous)
            for (let i of [e.Upvote, e.QuestionMark, e.DownVote]) msg.react(i).catch(() => { })

        const data = {
            MessageID: msg.id, // Id da Mensagem
            ChannelId: channel.id, // Id do Canal
            GuildId: guild.id, // Id do Servidor
            Text: text, // Prêmio de Votação
            TimeMs: endTime, // Tempo de Votação
            DateNow: Date.now(), // Agora
            MessageLink: msg.url, // Link da mensagem
            Author: user.id, // Quem fez a votação
            anonymous: anonymous, // Votação Anônina
            permanent: endTime === 0, // Votação Permanente
            votes: anonymous // Votos do sistema de votação anônima
                ? { up: [], down: [], question: [] }
                : {}
        }

        await Database.Guild.findOneAndUpdate(
            { id: guild.id },
            { $push: { Polls: data, $position: 0 } },
            { new: true }
        )
            .then(data => Database.saveGuildCache(data.id, data))

        if (endTime > 0 || anonymous) {
            await Database.Cache.Polls.push(`${client.shardId}.${guild.id}`, data)
            return PollManager.Polls.push(data)
        }
    }
}