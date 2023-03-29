import { Emojis as e } from '../../util/util.js'
import { Database, SaphireClient as client } from '../../classes/index.js'

client.on('messageDeleteBulk', async (messages) => {

    const messagesId = [...messages.keys()]
    return setTimeout(() => check(), 3000)

    function check() {
        refundBet()
        refundJokempo()
        refundBlackjack()
        deleteSingleData()
        return
    }

    async function refundBet() {
        const allGamesId = await Database.Cache.Bet.all() || []
        const gamesToDelete = allGamesId.filter(data => messagesId.includes(data.id)) || []

        if (!gamesToDelete || !gamesToDelete.length) return

        for (let game of gamesToDelete)
            client.emit('betRefund', game.value)
    }

    async function refundJokempo() {
        const allGamesId = await Database.Cache.Jokempo.all() || []
        const gamesToDelete = allGamesId.filter(data => messagesId.includes(data.id)) || []

        if (!gamesToDelete || !gamesToDelete.length) return

        for (let gameData of gamesToDelete)
            client.emit('jokempoRefund', gameData)
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

    async function deleteSingleData() {

        for (const messageId of messagesId) {
            Database.Cache.Connect.delete(messageId)
            Database.Cache.WordleGame.delete(messageId)
        }

        const topGGData = await Database.Cache.General.get('TopGG')

        if (topGGData)
            for (const data of Object.values(topGGData))
                if (messagesId.includes(data.messageId))
                    Database.Cache.General.delete(`TopGG.${data.userId}`)

    }

})