import { Database, SaphireClient as client } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.on('jokempoRefund', async (data) => {

    const players = data.value?.players || []
    const value = data.value?.value || 0
    const messageId = data?.id

    if (players?.length > 0 && value > 0)
        await Database.User.updateMany(
            { id: { $in: players } },
            {
                $inc: { Balance: value },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)}`,
                            data: `${e.Admin} Recebeu ${value} Safiras via *Bet System Refund (Jokempo)*`
                        }],
                        $position: 0
                    }
                }
            },
            { upsert: true }
        )

    return Database.Cache.Jokempo.delete(messageId)
})