import { Emojis as e } from '../../util/util.js'
import {
    Database,
    SaphireClient as client
} from '../../classes/index.js'
import messageDeleteLogs from './system/messageDelete.logs.js'

client.on('messageDelete', async message => {

    if (!message || !message.id) return

    Database.deleteGiveaway(message.id, message.guildId)
    Database.Cache.Connect.delete(message.id)

    const isWordleGame = await Database.Cache.WordleGame.get(message.id)
    if (isWordleGame) await Database.Cache.WordleGame.delete(message.id)

    const cachedData = await Database.Cache.General.get(`TopGG.${message.interaction?.user?.id}`)
    if (cachedData) await Database.Cache.General.delete(`TopGG.${message.interaction?.user?.id}`)

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

    messageDeleteLogs(message)

    return
})
