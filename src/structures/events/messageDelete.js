import { Emojis as e } from '../../util/util.js'
import {
    Database,
    SaphireClient as client
} from '../../classes/index.js'

client.on('messageDelete', async message => {

    if (!message?.id) return

    const isWordleGame = await Database.Cache.WordleGame.get(message.id)
    if (isWordleGame) await Database.Cache.WordleGame.delete(message.id)

    const cachedData = await Database.Cache.General.get(`${client.shardId}.TopGG`)
    if (cachedData?.find(data => data.messageId === message.id))
        await Database.Cache.General.pull(`${client.shardId}.TopGG`, data => data.messageId === message.id)

    const betDataFound = await Database.Cache.Bet.get(`Bet.${message.id}`)
    if (betDataFound) client.emit('betRefund', betDataFound)

    const blackjack = await Database.Cache.Blackjack.get(message.id)
    if (blackjack) {

        if (blackjack?.players?.length > 0)
            client.emit('blackjackRefund', blackjack)

        Database.add(blackjack.userId, blackjack.bet, `${e.gain} Recebeu ${blackjack.bet} Safiras via *Blackjack Refund*`)
        await Database.Cache.Blackjack.delete(message.id)
    }

    // TODO: Terminar aqui
    // const Giveaways = await Database.Cache.Giveaways.get(`${client.shardId}.Giveaways.${message.guild.id}`)
    // if (Giveaways?.includes(data => data.MessageID === message.id)) {
    //     await Database.Cache.Giveaways.pull(`${client.shardId}.Giveaways`, data => data.MessageID === message.id)
    //     Database.deleteGiveaway(message.id, message.guild.id)
    // }

    return
})
