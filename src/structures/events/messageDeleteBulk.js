import {
    Database,
    SaphireClient as client
} from '../../classes/index.js'
import {
    Emojis as e,
    economy
} from '../../util/util.js'

client.on('messageDeleteBulk', async (messages) => {

    const messagesId = [...messages.keys()]
    return setTimeout(() => check(), 3000)

    function check() {
        refundBet()
        refundBlackjack()
        return
    }

    async function refundBet() {
        const allCachedGames = await Database.Cache.Bet.get('Bet') || {}
        const allGamesId = Object.entries(allCachedGames)
        const gamesToDelete = allGamesId.filter(([id]) => messagesId.includes(id)) || []

        if (!gamesToDelete || !gamesToDelete.length) return

        for (let game of gamesToDelete) {
            client.emit('betRefund', game[1])
        }
    }

    async function refundBlackjack() {

        const allCachedGames = await Database.Cache.Blackjack.all() || []
        const gamesToDelete = allCachedGames.filter(game => messagesId.includes(game.id)) || []

        if (!gamesToDelete || !gamesToDelete.length) return

        for await (let game of gamesToDelete) {
            economy.add(game.value.userId, game.value.bet, `${e.gain} Recebeu ${game.value.bet} Safiras via *Blackjack Refund*`)
            await Database.Cache.Blackjack.delete(game.id)
            continue
        }
    }

})