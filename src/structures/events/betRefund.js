import { Database, SaphireClient as client } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import { socket } from '../../websocket/websocket.js'

client.on('betRefund', async (data, noDelete = false) => {

    const players = [...new Set([data?.players || [data?.red || [], data?.blue || []].flat()])].flat()
    const amount = data?.amount || data?.value
    const messageId = data?.messageId

    if (!players.length || !amount || !messageId) return

    if (!noDelete)
        await Database.Cache.Bet.delete(messageId)

    if (players?.length > 0) {

        const transaction = {
            time: `${Date.format(0, true)}`,
            data: `${e.Admin} Recebeu ${amount} Safiras via *Bet System Refund*`
        }

        for (const userId of players)
            socket?.send({
                type: "transactions",
                transactionsData: { value: amount, userId, transaction }
            })

        await Database.User.updateMany(
            { id: { $in: players } },
            {
                $inc: { Balance: amount },
                $push: {
                    Transactions: {
                        $each: [transaction],
                        $position: 0
                    }
                }
            },
            { upsert: true }
        )
        Database.refreshUsersData(players)
    }
    return
})