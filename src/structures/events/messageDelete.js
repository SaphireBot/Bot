import { Database, GiveawayManager, SaphireClient as client } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import { socket } from '../../websocket/websocket.js'
import messageDeleteLogs from './system/messageDelete.logs.js'

client.on('messageDelete', async message => {

    if (!message || !message.id) return

    if (GiveawayManager.getGiveaway(message.id))
        await Database.deleteGiveaway(message.id, message.guildId)

    await Database.Cache.Connect.delete(message.id)
    await Database.Cache.WordleGame.delete(message.id)
    await Database.Cache.General.delete(`TopGG.${message.interaction?.user?.id}`)

    const multiplier = await Database.Cache.Multiplier.all() || []
    if (multiplier.length)
        for (const data of multiplier) {
            if (data.value[message.id]) {
                await Database.Cache.Multiplier.delete(`${data.value[message.id]?.userId}.${message.id}`)

                const value = data.value[message.id]?.prize || data.value[message.id]?.value || 0
                const userId = data.value[message.id]?.userId

                if (!userId) continue

                const transaction = {
                    time: `${Date.format(0, true)}`,
                    data: `${e.Admin} Ganhou ${value.currency()} Safiras via *Bet System Refund*`
                }

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
                                $each: [transaction],
                                $position: 0
                            }
                        }
                    },
                    { upsert: true, new: true }
                )
                    .then(data => Database.saveUserCache(data?.id, data))
            }
        }

    const pay = await Database.Cache.Pay.get(`${message.interaction?.user?.id}.${message.id}`)
    if (pay?.value) {
        Database.Cache.Pay.delete(`${message.interaction?.user?.id}.${message.id}`)

        const transaction = {
            time: `${Date.format(0, true)}`,
            data: `${e.Admin} Reembolso de ${pay.total} Safiras por *Pay Message Delete*`
        }

        socket?.send({
            type: "transactions",
            transactionsData: { value: pay.total || 0, userId: message.interaction?.user?.id, transaction }
        })

        await Database.User.findOneAndUpdate(
            { id: message.interaction?.user?.id },
            {
                $inc: { Balance: pay.total || 0 },
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

    const betDataFound = await Database.Cache.Bet.get(message.id)
    if (betDataFound) client.emit('betRefund', betDataFound)

    const blackjack = await Database.Cache.Blackjack.get(message.id)
    if (blackjack) {

        if (blackjack?.players?.length > 0)
            client.emit('blackjackRefund', blackjack)

        Database.add(blackjack.userId, blackjack.bet, `${e.Admin} Recebeu ${blackjack.bet} Safiras via *Blackjack Refund*`)
        await Database.Cache.Blackjack.delete(message.id)
    }

    const diceGame = await Database.Cache.Bet.get(message.id)
    if (diceGame) {

        const usersId = [...diceGame.red, ...diceGame.blue]

        const transaction = {
            time: `${Date.format(0, true)}`,
            data: `${e.Admin} Ganhou ${diceGame.value || 0} Safiras atráves do *Bet Delete System*`
        }

        for (const userId of usersId)
            socket?.send({
                type: "transactions",
                transactionsData: { value: diceGame.value || 0, userId, transaction }
            })

        await Database.User.updateMany(
            { id: { $in: usersId } },
            {
                $inc: { Balance: diceGame.value },
                $push: {
                    Transactions: {
                        $each: [transaction],
                        $position: 0
                    }
                }
            }
        )
            .then(() => {
                Database.refreshUsersData([...diceGame.red, ...diceGame.blue])
                if (!message.channel) return
                const usersRefunded = [...diceGame.red, ...diceGame.blue].length

                return message.channel.send({
                    content: `${e.Trash} | A mensagem da aposta \`${message.id}\` foi deletada.\n${e.Check} | Eu devolvi **${diceGame.value} Safiras** para ${usersRefunded} usuários.\n👥 | ${[...new Set([...diceGame.red, ...diceGame.blue, diceGame.authorId])].map(id => `<@${id}>`).join(', ')}`
                }).catch(() => { })

            })
            .catch(() => { })
        await Database.Cache.Bet.delete(message.id)
    }

    const jokempoGame = await Database.Cache.Jokempo.get(message.id)
    if (jokempoGame) {
        if (jokempoGame.value > 0) {

            const usersId = jokempoGame?.players || []

            const transaction = {
                time: `${Date.format(0, true)}`,
                data: `${e.Admin} Recebeu ${jokempoGame.value || 0} Safiras atráves do *Bet Delete System (Jokempo)*`
            }

            for (const userId of usersId)
                socket?.send({
                    type: "transactions",
                    transactionsData: { value: jokempoGame.value || 0, userId, transaction }
                })

            await Database.User.updateMany(
                { id: { $in: jokempoGame.players } },
                {
                    $inc: { Balance: jokempoGame.value },
                    $push: {
                        Transactions: {
                            $each: [transaction],
                            $position: 0
                        }
                    }
                }
            )
                .then(() => {
                    Database.refreshUsersData(jokempoGame.players)
                    if (!message.channel) return
                    return message.channel.send({
                        content: `${e.Trash} | A mensagem do jokempo \`${message.id}\` foi deletada.\n${e.Check} | Eu devolvi **${jokempoGame.value} Safiras** para os jogadores ${jokempoGame.players.map(id => `<@${id}>`).join(' & ')}.`
                    }).catch(() => { })

                })
                .catch(() => { })
        }
        await Database.Cache.Jokempo.delete(message.id)
    }

    const jokempoGameGlobal = await Database.Cache.Jokempo.get(`Global.${message.id}`)
    if (jokempoGameGlobal) {

        new Database.Jokempo({
            creatorId: jokempoGameGlobal.creatorId,
            creatorOption: jokempoGameGlobal.creatorOption,
            id: jokempoGameGlobal.id,
            value: jokempoGameGlobal.value,
            webhookUrl: jokempoGameGlobal.webhookUrl
        }).save()
        Database.Cache.Jokempo.delete(`Global.${message.id}`)

        const transaction = {
            time: `${Date.format(0, true)}`,
            data: `${e.Admin} Recebeu ${jokempoGameGlobal.value || 0} Safiras atráves do *Bet Delete System (Jokempo)*`
        }

        socket?.send({
            type: "transactions",
            transactionsData: { value: jokempoGameGlobal.value || 0, userId: jokempoGameGlobal.userId, transaction }
        })

        await Database.User.findOneAndUpdate(
            { id: jokempoGameGlobal.userId },
            {
                $inc: { Balance: jokempoGameGlobal.value },
                $push: {
                    Transactions: {
                        $each: [transaction],
                        $position: 0
                    }
                }
            }
        )
            .then(doc => {
                Database.saveUserCache(doc?.id, doc)
                if (!message.channel) return
                return message.channel.send({
                    content: `${e.Trash} | A mensagem do jokempo global \`${message.id}\` foi deletada.\n${e.Check} | Eu cancelei esta aposta e devolvi **${jokempoGameGlobal.value.currency()} Safiras** para o desafiante.`
                }).catch(() => { })

            })
            .catch(() => { })
        await Database.Cache.Jokempo.delete(message.id)
    }

    messageDeleteLogs(message)

    return
})
