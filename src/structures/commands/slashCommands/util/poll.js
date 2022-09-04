import { ApplicationCommandOptionType } from 'discord.js'
import PollManager from '../../../../functions/update/polls/poll.manager.js'
import { Colors } from '../../../../util/Constants.js'

export default {
    name: 'poll',
    description: '[util] Um jeito diferente de criar votações',
    dm_permission: false,
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

        if (subCommand === 'close') return PollManager.close(interaction, options.getString('available_polls'))

        const fields = [{
            name: '🛰 Status',
            value: `${e.Upvote} 0 - 0%\n${e.QuestionMark} 0 - 0%\n${e.DownVote} 0 - 0%\n${e.saphireRight} 0 votos coletados`
        }]

        if (endTime > 0)
            fields.push({
                name: '⏱ Tempo',
                value: `Encerrando ${Date.Timestamp(new Date((Date.now() + endTime)), 'R', true)}`
            })

        const msg = await interaction.reply({
            embeds: [{
                color: color,
                title: '🎫 Nova votação aberta',
                description: text,
                fields: fields
            }],
            fetchReply: true
        })
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
        }

        await Database.Guild.updateOne(
            { id: guild.id },
            {
                $push: {
                    Polls: data,
                    $position: 0
                }
            }
        )

        if (endTime > 0) {
            await Database.Cache.Polls.push(`${client.shardId}.${guild.id}`, data)
            return PollManager.Polls.push(data)
        }
    }
}