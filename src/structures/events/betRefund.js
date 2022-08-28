import {
    Database,
    SaphireClient as client
} from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.on('betRefund', async ({ players, amount, messageId }, noDelete) => {

    if (!players || !amount || !messageId) return

    if (noDelete)
        await Database.Cache.Bet.delete(`Bet.${messageId}`)

    if (players?.length > 0)
        await Database.User.updateMany(
            { id: { $in: players } },
            {
                $inc: { Balance: amount },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)}`,
                            data: `${e.Admin} Recebeu ${amount} Safiras via *Bet System Refund*`
                        }],
                        $position: 0
                    }
                }
            },
            { upsert: true }
        )

    return
})