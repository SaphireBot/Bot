import { Emojis as e } from '../../util/util.js'
import {
    Database,
    SaphireClient as client
} from '../../classes/index.js'

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
        const multiplayer = []

        if (!gamesToDelete || !gamesToDelete.length) return

        for await (let game of gamesToDelete) {

            if (game?.players?.length > 0) {
                multiplayer.push(game)
                continue
            }

            Database.add(game.value.userId, game.value.bet, `${e.gain} Recebeu ${game.value.bet} Safiras via *Blackjack Refund*`)
            await Database.Cache.Blackjack.delete(game.id)
            continue
        }

        for await (let game of multiplayer) {
            client.emit(game, true)
            await Database.Cache.Blackjack.delete(game.id)
        }
    }

})