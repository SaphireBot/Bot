import { Emojis as e } from '../../util/util.js'
import { Database, GiveawayManager, SaphireClient as client } from '../../classes/index.js'
import messageDeleteLogs from './system/messageDelete.logs.js'

client.on('messageDelete', async message => {

    if (!message || !message.id) return

    if (GiveawayManager.getGiveaway(message.id))
        Database.deleteGiveaway(message.id, message.guildId)

    Database.Cache.Connect.delete(message.id)
    Database.Cache.WordleGame.delete(message.id)
    Database.Cache.General.delete(`TopGG.${message.interaction?.user?.id}`)

    const pay = await Database.Cache.Pay.get(`${message.interaction?.user?.id}.${message.id}`)
    if (pay?.value) {
        Database.Cache.Pay.delete(`${message.interaction?.user?.id}.${message.id}`)
        await Database.User.updateOne(
            { id: message.interaction?.user?.id },
            {
                $inc: {
                    Balance: pay.total || 0
                },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)}`,
                            data: `${e.gain} Reembolso de ${pay.value} Safiras por *Pay Message Delete*`
                        }],
                        $position: 0
                    }
                }
            },
            { upsert: true }
        )
    }

    const betDataFound = await Database.Cache.Bet.get(message.id)
    if (betDataFound) client.emit('betRefund', betDataFound)

    const blackjack = await Database.Cache.Blackjack.get(message.id)
    if (blackjack) {

        if (blackjack?.players?.length > 0)
            client.emit('blackjackRefund', blackjack)

        Database.add(blackjack.userId, blackjack.bet, `${e.gain} Recebeu ${blackjack.bet} Safiras via *Blackjack Refund*`)
        await Database.Cache.Blackjack.delete(message.id)
    }

    const diceGame = await Database.Cache.Bet.get(message.id)
    if (diceGame) {
        await Database.User.updateMany(
            { id: { $in: [...diceGame.red, ...diceGame.blue] } },
            {
                $inc: { Balance: diceGame.value },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)}`,
                            data: `${e.gain} Ganhou ${diceGame.value || 0} Safiras atráves do *Bet Delete System*`
                        }],
                        $position: 0
                    }
                }
            }
        )
            .then(result => {

                if (!message.channel) return
                const usersRefunded = result.matchedCount || 0

                return message.channel.send({
                    content: `${e.Trash} | A mensagem da aposta \`${message.id}\` foi deletada.\n${e.Check} | Eu devolvi **${diceGame.value} Safiras** para ${usersRefunded} usuários.\n👥 | ${[...new Set([...diceGame.red, ...diceGame.blue, diceGame.authorId])].map(id => `<@${id}>`).join(', ')}`
                }).catch(() => { })

            })
            .catch(() => { })
        await Database.Cache.Bet.delete(message.id)
    }

    const jokempoGame = await Database.Cache.Jokempo.get(message.id)
    if (jokempoGame) {
        if (jokempoGame.value > 0)
            await Database.User.updateMany(
                { id: { $in: jokempoGame.players } },
                {
                    $inc: { Balance: jokempoGame.value },
                    $push: {
                        Transactions: {
                            $each: [{
                                time: `${Date.format(0, true)}`,
                                data: `${e.gain} Recebeu ${jokempoGame.value || 0} Safiras atráves do *Bet Delete System (Jokempo)*`
                            }],
                            $position: 0
                        }
                    }
                }
            )
                .then(() => {
                    if (!message.channel) return
                    return message.channel.send({
                        content: `${e.Trash} | A mensagem do jokempo \`${message.id}\` foi deletada.\n${e.Check} | Eu devolvi **${jokempoGame.value} Safiras** para os jogadores ${jokempoGame.players.map(id => `<@${id}>`).join(' & ')}.`
                    }).catch(() => { })

                })
                .catch(() => { })
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
        await Database.User.updateOne(
            { id: jokempoGameGlobal.userId },
            {
                $inc: { Balance: jokempoGameGlobal.value },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)}`,
                            data: `${e.gain} Recebeu ${jokempoGameGlobal.value || 0} Safiras atráves do *Bet Delete System (Jokempo)*`
                        }],
                        $position: 0
                    }
                }
            }
        )
            .then(() => {
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
