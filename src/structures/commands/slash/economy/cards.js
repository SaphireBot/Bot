import { Database, SaphireClient as client } from '../../../../classes/index.js'
import { ApplicationCommandOptionType, ButtonStyle, time } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
import { socket } from '../../../../websocket/websocket.js'

export default {
    name: 'cards',
    name_localizations: { 'pt-BR': 'cartas' },
    description: '[economy] Aposte, escolha um lado e boa sorte!',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'value',
            name_localizations: { 'pt-BR': 'valor' },
            description: 'Valor a ser apostado',
            min_value: 0,
            required: true,
            type: ApplicationCommandOptionType.Integer
        }
    ],
    api_data: {
        name: "cards",
        description: "Aposte nas cartas! Azul ou Verde? Quem ganha? Ou será que empata?",
        category: "Economia",
        synonyms: ["cartas"],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction }) {

        const cards = e.cards
        const { user, options, guild } = interaction
        const value = options.getInteger('value')
        const userData = await Database.getUser(user.id)
        const moeda = await guild.getCoin()

        if (userData?.Balance < value)
            return interaction.reply({
                content: `${e.Animated.SaphireCry} | Você não tem tudo isso de dinheiro.`,
                ephemeral: true
            })

        const data = {
            players: [],
            blue: {
                emoji: '🔵',
                users: [],
                amount: 0
            },
            red: {
                emoji: '🔴',
                users: [],
                amount: 0
            },
            green: {
                emoji: '🟢',
                users: [],
                amount: 0
            }
        }

        return await interaction.reply({
            content: `${e.Loading} | Lançamento ${time(new Date(Date.now() + (1000 * 30)), 'R')}\n💸 | Valor da aposta: **${value.currency()} ${moeda}**`,
            embeds: [{
                color: client.blue,
                title: `${cards.random().emoji} Carta Mais Alta`,
                description: `A cor azul e a cor verde, irá receber uma carta. A carta mais alta, ganha.\nO prêmio da cor que perdeu, será dividido igualmente entre os apostadores da cor vencedora.`,
                fields: [
                    {
                        name: '🔵 Azul',
                        value: `👥 0\n💰 0`,
                        inline: true
                    },
                    {
                        name: '🔴 Empate',
                        value: `👥 0\n💰 0`,
                        inline: true
                    },
                    {
                        name: '🟢 Verde',
                        value: `👥 0\n💰 0`,
                        inline: true
                    }
                ]
            }],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Azul',
                        custom_id: 'blue',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Empate',
                        custom_id: 'red',
                        style: ButtonStyle.Danger
                    },
                    {
                        type: 2,
                        label: 'Verde',
                        custom_id: 'green',
                        style: ButtonStyle.Success
                    }
                ]
            }],
            fetchReply: true
        })
            .then(message => {
                return message.createMessageComponentCollector({
                    filter: () => true,
                    time: 1000 * 29
                })
                    .on('collect', async int => {

                        if (data.players.includes(int.user.id))
                            return int.reply({
                                content: `${e.Deny} | Você já está nesta partida. Cai fora.`,
                                ephemeral: true
                            })

                        await int.reply({
                            content: `${e.Loading} | Estou te registrando na aposta, aguarde um segundo...`,
                            ephemeral: true
                        })
                        const userData = await Database.getUser(int.user.id)

                        if ((userData?.Balance || 0) < value)
                            return int.editReply({ content: `${e.Deny} | Você não tem o valor necessário para entrar nesta aposta.` }).catch(() => { })

                        data.players.push(int.user.id)
                        await subtract(int.user.id, value)

                        data[int.customId].users.push(int.user.id)
                        data[int.customId].amount += value

                        const colorResponse = {
                            red: 'Você apostou no empate.',
                            blue: 'Você apostou na cor azul.',
                            green: 'Você apostou na cor verde.'
                        }[int.customId]

                        refresh()
                        return int.editReply({ content: `${e.Animated.SaphireDance} | Tudo ok! Você entrou nesta aposta. Boa sorte!\n${e.Info} | ${colorResponse}` }).catch(() => { })
                    })
                    .on('end', (_, reason) => {

                        if (['channelDelete', 'messageDelete'].includes(reason)) return refund()

                        if (reason == 'time') return lauch()

                    })
            })

        async function lauch() {

            const greenCard = e.cards.random()
            const blueCard = e.cards.random()

            const winnerColor = greenCard.value == blueCard.value
                ? 'red'
                : greenCard.value > blueCard.value ? 'green' : 'blue'

            const losersAmount = winnerColor == 'red'
                ? data.blue.amount + data.green.amount
                : winnerColor == 'green'
                    ? data.red.amount + data.blue.amount
                    : data.red.amount + data.green.amount

            const prize = losersAmount > 0
                ? parseInt((losersAmount || 1) / (data[winnerColor].users.length || 1))
                : 0
            let content = ''
            if (data[winnerColor].users.length) {
                giveRewardsToWinners(data[winnerColor].users, prize)
                content = `👑 | A cor ${data[winnerColor].emoji} venceu nessa aposta. Cada jogador recebeu **${(value + prize).currency()} ${moeda}** *(+${prize.currency()})*.`
            } else content = `👑 | A cor ${data[winnerColor].emoji} venceu nessa aposta. Se pelo menos um tivesse apostado aqui, teria ganhado **${losersAmount.currency()} ${moeda}**`

            if (prize == 0)
                content = `${e.Animated.SaphireCry} | A cor ${data[winnerColor].emoji} venceu nessa aposta, mas ninguém participou...`

            interaction.followUp({ content }).catch(() => { })
            return await interaction.editReply({
                content: `🟢 ${greenCard.emoji}\n🔵 ${blueCard.emoji}`,
                embeds: [{
                    color: client.blue,
                    title: `${cards.random().emoji} Carta Mais Alta`,
                    description: `Os vencedores ganharam um total de ${prize.currency()} ${moeda}`,
                    fields: [
                        {
                            name: `🔵 Azul ${winnerColor == 'blue' ? '👑' : ''}`,
                            value: `👥 ${data.blue.users.length}\n💰 ${data.blue.amount.currency()}`,
                            inline: true
                        },
                        {
                            name: `🔴 Empate ${winnerColor == 'red' ? '👑' : ''}`,
                            value: `👥 ${data.red.users.length}\n💰 ${data.red.amount.currency()}`,
                            inline: true
                        },
                        {
                            name: `🟢 Verde ${winnerColor == 'green' ? '👑' : ''}`,
                            value: `👥 ${data.green.users.length}\n💰 ${data.green.amount.currency()}`,
                            inline: true
                        }
                    ]
                }],
                components: []
            }).catch(() => { })
        }

        async function giveRewardsToWinners(winners, prize = 0) {
            if (!winners.length) return

            const transaction = {
                time: `${Date.format(0, true)}`,
                data: `${e.gain} Ganhou ${value + prize} Safiras no *Cartas*`
            }

            for (const userId of winners) {

                socket?.send({
                    type: "transactions",
                    transactionsData: { value: value + prize, userId, transaction }
                })

                await Database.User.findOneAndUpdate(
                    { id: userId },
                    {
                        $inc: { Balance: value + prize },
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
            }
        }

        function refresh() {
            return interaction.editReply({
                embeds: [{
                    color: client.blue,
                    title: `${cards.random().emoji} Carta Mais Alta`,
                    description: `A cor azul e a cor verde, irá receber uma carta. A carta mais alta, ganha.\nO prêmio da cor que perdeu, será dividido igualmente entre os apostadores da cor vencedora.`,
                    fields: [
                        {
                            name: '🔵 Azul',
                            value: `👥 ${data.blue.users.length}\n💰 ${data.blue.amount.currency()}`,
                            inline: true
                        },
                        {
                            name: '🔴 Empate',
                            value: `👥 ${data.red.users.length}\n💰 ${data.red.amount.currency()}`,
                            inline: true
                        },
                        {
                            name: '🟢 Verde',
                            value: `👥 ${data.green.users.length}\n💰 ${data.green.amount.currency()}`,
                            inline: true
                        }
                    ]
                }]
            }).catch(() => { })
        }

        async function refund() {

            const transaction = {
                time: `${Date.format(0, true)}`,
                data: `${e.Admin} Ganhou ${value} Safiras no *Bet System Refund*`
            }

            for (const userId of data.players) {

                socket?.send({
                    type: "transactions",
                    transactionsData: { value, userId, transaction }
                })

                await Database.User.findOneAndUpdate(
                    { id: userId },
                    {
                        $inc: { Balance: value },
                        $push: {
                            Transactions: {
                                $each: [],
                                $position: 0
                            }
                        }
                    },
                    { upsert: true, new: true }
                )
                    .then(doc => Database.saveUserCache(doc?.id, doc))
            }
        }

        async function subtract(userId, value) {
            if (value <= 0) return

            const transaction = {
                time: `${Date.format(0, true)}`,
                data: `${e.loss} Apostou ${value} Safiras no *Cartas*`
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
            return
        }

    }
}