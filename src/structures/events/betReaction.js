import { Database, SaphireClient as client } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import realizeBet from '../commands/slashCommands/economy/bet/functions/realize.bet.js'
import newBetUser from '../commands/slashCommands/economy/bet/functions/addPlayer.bet.js'

client.on('betReaction', async ({ message, user, emojiName }) => {

    const betCachedData = await Database.Cache.Bet.get(message.id)
    if (!betCachedData) {
        message.reactions.removeAll().catch(() => { })
        return await message.edit({
            content: `${e.Deny} | Esta aposta já foi finalizada ou não foi armazenada.`,
            embeds: []
        }).catch(() => { })
    }

    const embed = message.embeds[0]?.data
    if (!embed) {
        client.emit('betRefund', betCachedData)
        message.reactions.removeAll().catch(() => { })
        return await message.edit({
            content: `${e.Deny} | Aposta inválida.\n${e.Info} | Os valores foram devolvidos aos participantes.`
        }).catch(() => { })
    }

    const timestamp = embed.fields[2].value.replace(/[^0-9]/g, '')
    const time = new Date(timestamp * 1000).valueOf()
    const { authorId, players, playersCount, versus, amount } = betCachedData
    const userData = await Database.getUser(user.id)
    const userBalance = userData?.Balance || 0

    if (time < Date.now() || emojiName === '✅' && user.id === authorId)
        return realizeBet(betCachedData, message)

    if (
        players.includes(user.id)
        || versus && user.id !== versus
        || !userBalance
        || userBalance < amount
    ) return

    return newBetUser(betCachedData, message, user.id, (players.length + 1) >= playersCount)
})