import {
    Database,
    SaphireClient as client
} from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.on('blackjackRefund', async ({ availablePlayers, bet, messageId }, noDelete = false) => {

    if (!availablePlayers || !messageId) return

    if (!noDelete)
        await Database.Cache.Blackjack.delete(messageId)

    if (availablePlayers?.length > 0 && bet > 0)
        await Database.User.updateMany(
            { id: { $in: availablePlayers } },
            {
                $inc: { Balance: bet },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)}`,
                            data: `${e.Admin} Recebeu ${bet} Safiras via *Blackjack System Refund*`
                        }],
                        $position: 0
                    }
                }
            },
            { upsert: true }
        )

    return
})