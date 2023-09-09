import { ApplicationCommandOptionType, ButtonStyle } from "discord.js"
import { Database, SaphireClient as client } from "../../../../classes/index.js"
import removeBet from "./emojibet/remove.bet.js"
import rescueBet from "./emojibet/rescue.bet.js"
import viewEmoji from "./emojibet/view.emoji.js"
import investEmoji from "./emojibet/invest.emoji.js"
import handlerEmoji from "./emojibet/handler.emoji.js"
import steal from "./emoji/steal.emoji.js"
import { socket } from "../../../../websocket/websocket.js"

const emojis = ['🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🙈', '🐵', '🐸', '🐨', '🐒', '🦁', '🐯', '🐮', '🐔', '🐧', '🐦', '🐤', '🦄', '🐴', '🐗', '🐺', '🦇', '🦉', '🦅', '🦤', '🦆', '🐛', '🦋', '🐌', '🐝', '🪳', '🪲', '🦗', '🦂', '🐢']

export default {
    name: 'emoji',
    description: '[economy/util] Um linda luta de emojis',
    category: "economy",
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'bet',
            description: '[economy] Aposte em uma linda lutinha entre emojis',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'value',
                    description: 'Valor do emojibet',
                    type: ApplicationCommandOptionType.Integer,
                    min_value: 1,
                    required: true
                },
                {
                    name: 'options',
                    description: 'Outras opções do emojibet',
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        {
                            name: 'Resgatar dinheiro ocasionalmente perdido',
                            value: 'rescue'
                        }
                    ]
                }
            ]
        },
        // {
        //     name: 'invest',
        //     description: '[economy] Invista em um emoji e faça seu lucro',
        //     type: ApplicationCommandOptionType.Subcommand,
        //     options: [
        //         {
        //             name: 'options',
        //             description: 'Escolha uma das opções',
        //             type: ApplicationCommandOptionType.String,
        //             required: true,
        //             choices: [
        //                 {
        //                     name: 'Investir/apostar em um emoji',
        //                     value: 'bet'
        //                 },
        //                 // {
        //                 //     name: 'Visualizar status geral',
        //                 //     value: 'view'
        //                 // }
        //             ]
        //         }
        //     ]
        // },
        {
            name: 'view',
            description: '[util] Veja um emoji de uma forma maior',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'emoji',
                    description: 'Escolha um emoji personalizado para ve-lô de forma maior',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'handler',
            description: '[bot] Todos os emojis disponíveis nos meus sistemas',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'method',
                description: 'Metódo a ser executado',
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: '[ADMIN] Adicionar novo emoji',
                        value: 'add'
                    },
                    {
                        name: '[ADMIN] Remover um emoji',
                        value: 'remove'
                    },
                    {
                        name: '[USER] Visualizar todos os emojis',
                        value: 'view'
                    }
                ]
            }]
        },
        {
            name: 'steal',
            name_localizations: { 'pt-BR': 'roubar' },
            description: '[moderation] Roube um emoji de qualquer servidor',
            type: ApplicationCommandOptionType.Subcommand,
            options: []
        }
    ],
    helpData: {
        description: 'Luta de emojis, legal né?'
    },
    api_data: {
        name: "emoji",
        description: "Um comando só para emojis! Veja e aposte com os emojis. É divertido!",
        category: "Economia",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, e, guildData }) {

        const { options, user } = interaction

        const isFunctionCommand = {
            view: viewEmoji,
            invest: investEmoji,
            handler: handlerEmoji,
            steal
        }[options.getSubcommand()]

        if (isFunctionCommand)
            return isFunctionCommand(interaction)

        const emojisChoosen = emojis.random(20)
        const buttons = getButtons()
        const participants = []
        const value = parseInt(options.getInteger('value'))
        const userData = await Database.getUser(user.id)
        const userBalance = userData?.Balance || 0
        const moeda = guildData?.Moeda || `${e.Coin} Safiras`
        const alreadyWarned = []
        const rescue = options.getString('options') === 'rescue'
        let total = 0

        if (rescue) return rescueBet(interaction)

        if (!userBalance || userBalance <= 0 || userBalance < value)
            return await interaction.reply({
                content: `${e.Deny} | Você não tem dinheiro suficiente para iniciar um emoji bet`,
                ephemeral: true
            })

        participants.push({ user: user.id, emoji: emojisChoosen[0] })
        joined(user.id)

        const embed = {
            color: client.blue,
            title: `${emojis.random()} ${user.username} inicou um emoji bet`,
            description: `Valor: ${value} ${moeda}`,
            fields: [
                {
                    name: `${e.MoneyWings} Prêmio acumulado`,
                    value: `${total} ${moeda}`
                },
                {
                    name: '👥 Participantes (1)',
                    value: `${emojisChoosen[0]} ${user}`
                }
            ],
            footer: { text: 'O emoji será sorteado após 30 segundos.' }
        }

        const msg = await interaction.reply({
            embeds: [embed],
            components: buttons,
            fetchReply: true
        })

        const collector = msg.createMessageComponentCollector({
            filter: () => true,
            time: 30000
        })
            .on('collect', async int => {

                const { customId, user: author } = int

                if (customId === 'finalize') {
                    if (author.id !== user.id)
                        return await int.reply({
                            content: `${e.Deny} | Apenas ${user} pode finalizar este emojibet.`,
                            ephemeral: true
                        })

                    return collector.stop()
                }

                if (participants.find(d => d.user === author.id)) {

                    if (alreadyWarned.includes(author.id))
                        return int.deferUpdate().catch(() => { })

                    alreadyWarned.push(author.id)
                    return await int.reply({
                        content: `${e.Info} | Você já entrou neste emoji bet`,
                        ephemeral: true
                    })
                }

                const userData = await Database.getUser(user.id)
                const authorBalance = userData?.Balance || 0
                if (!authorBalance || authorBalance < value)
                    return await int.reply({
                        content: `${e.Deny} | Você não possui dinheiro suficiente para entrar neste emoji bet.`,
                        ephemeral: true
                    })

                int.deferUpdate().catch(() => { })

                const buttonIndex = { a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, b1: 1, b2: 1, b3: 1, b4: 1, b5: 1, c1: 2, c2: 2, c3: 2, c4: 2, c5: 2, d1: 3, d2: 3, d3: 3, d4: 3, d5: 3 }[`${customId}`]
                const buttom = buttons[buttonIndex].components.find(data => data.custom_id === customId)

                participants.push({ user: author.id, emoji: buttom.emoji })

                buttom.disabled = true
                buttom.style = ButtonStyle.Primary

                embed.fields[1].value = participants.map(d => `${d.emoji} <@${d.user}>`).join('\n')
                embed.fields[1].name = `👥 Participantes (${participants.length})`
                embed.fields[0].value = `${total} ${moeda}`

                joined(author.id)
                return msg.edit({ embeds: [embed], components: buttons }).catch(() => { })
            })
            .on('end', async () => {

                if (participants.length === 1) {

                    const cachedValue = await Database.Cache.EmojiBetRescue.get(user.id) || 0

                    if (cachedValue > 0)
                        Database.add(user.id, cachedValue)

                    embed.color = client.red
                    embed.footer = { text: 'Cancelado' }

                    await interaction.followUp({
                        content: `${e.Deny} | Emoji bet cancelado por falta de participantes.`
                    })

                    return await interaction.editReply({ embeds: [embed], components: [] }).catch(() => { })
                }

                await removeBet(participants, value)

                const winData = participants.random()

                embed.fields[2] = {
                    name: 'Vencedor',
                    value: `${winData.emoji} <@${winData.user}>`
                }

                embed.color = client.green
                embed.footer = { text: 'Finalizado' }

                joined(winData.user, true)

                await interaction.followUp({
                    content: `${e.Check} | O emoji bet foi finalizado. O vencedor desta rodada foi o emoji ${winData.emoji} de <@${winData.user}>. Levando pra casa o total de **${total.currency()} ${moeda}**.`
                })

                return await interaction.editReply({ content: null, embeds: [embed], components: [] }).catch(() => { })
            })

        return

        function getButtons() {

            /*
                a1 a2 a3 a4 a5
                b1 b2 b3 b4 b5
                c1 c2 c3 c4 c5
                d1 d2 d3 d4 d5
            */

            return [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojisChoosen[0],
                            custom_id: 'a1',
                            disabled: true,
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[1],
                            custom_id: 'a2',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[2],
                            custom_id: 'a3',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[3],
                            custom_id: 'a4',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[4],
                            custom_id: 'a5',
                            style: ButtonStyle.Secondary
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojisChoosen[5],
                            custom_id: 'b1',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[6],
                            custom_id: 'b2',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[7],
                            custom_id: 'b3',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[8],
                            custom_id: 'b4',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[9],
                            custom_id: 'b5',
                            style: ButtonStyle.Secondary
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojisChoosen[10],
                            custom_id: 'c1',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[11],
                            custom_id: 'c2',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[12],
                            custom_id: 'c3',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[13],
                            custom_id: 'c4',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[14],
                            custom_id: 'c5',
                            style: ButtonStyle.Secondary
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojisChoosen[15],
                            custom_id: 'd1',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[16],
                            custom_id: 'd2',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[17],
                            custom_id: 'd3',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[18],
                            custom_id: 'd4',
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            emoji: emojisChoosen[19],
                            custom_id: 'd5',
                            style: ButtonStyle.Secondary
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: `FINALIZAR EMOJIBET - (${user.username})`,
                            custom_id: 'finalize',
                            style: ButtonStyle.Success
                        }
                    ]
                }
            ]
        }

        async function joined(userId, toAdd = false) {

            if (toAdd) {

                const cachedValue = await Database.Cache.EmojiBetRescue.get(userId) || 0

                const transaction = {
                    time: `${Date.format(0, true)}`,
                    data: `${e.gain} Ganhou ${total} Safiras no Emoji Bet`
                }

                socket?.send({
                    type: "transactions",
                    transactionsData: { value: total, userId, transaction }
                })

                await Database.User.findOneAndUpdate(
                    { id: userId },
                    {
                        $inc: { Balance: (total + cachedValue) - value },
                        $push: {
                            Transactions: {
                                $each: [transaction],
                                $position: 0
                            }
                        }
                    },
                    { upsert: true, new: true }
                )
                    .then(doc => Database.saveUserCache(doc?.id, doc))

                await Database.Cache.EmojiBetRescue.delete(userId)
                return
            }

            const transaction = {
                time: `${Date.format(0, true)}`,
                data: `${e.loss} Apostou ${value} Safiras no Emoji Bet`
            }

            socket?.send({
                type: "transactions",
                transactionsData: { value, userId, transaction }
            })

            await Database.User.findOneAndUpdate(
                { id: userId },
                {
                    $inc: { Balance: -value },
                    $push: {
                        Transactions: {
                            $each: [transaction],
                            $position: 0
                        }
                    }
                },
                { upsert: true, new: true }
            )
                .then(doc => Database.saveUserCache(doc?.id, doc))

            await Database.Cache.EmojiBetRescue.add(userId, value)
            total += value
            return
        }

    }
}