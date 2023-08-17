import { Database } from '../../../../../classes/index.js'
import { Emojis as e } from '../../../../../util/util.js'
import { socket } from '../../../../../websocket/websocket.js'

export default async interaction => {

    const { user, guild } = interaction

    const cachedValue = await Database.Cache.EmojiBetRescue.get(user.id)

    if (!cachedValue)
        return await interaction.reply({
            content: `${e.Deny} | Você não tem nenhum valor a ser resgatado.`,
            ephemeral: true
        })

    if (cachedValue < 0) {
        await Database.Cache.EmojiBetRescue.delete(user.id)
        return await interaction.reply({
            content: `${e.Deny} | Você não tem nenhum valor a ser resgatado.`,
            ephemeral: true
        })
    }

    const transaction = {
        time: `${Date.format(0, true)}`,
        data: `${e.Admin} Resgatou ${cachedValue} Safiras perdidas no Emoji Bet`
    }

    socket?.send({
        type: "transactions",
        transactionsData: { value: cachedValue, userId: user.id, transaction }
    })

    await Database.User.findOneAndUpdate(
        { id: user.id },
        {
            $inc: { Balance: cachedValue },
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

    await Database.Cache.EmojiBetRescue.delete(user.id)
    const coin = await guild.getCoin()

    return await interaction.reply({
        content: `${e.Check} | Você resgatou **${cachedValue.currency()} ${coin}** perdidas no emoji bet.`
    })
}