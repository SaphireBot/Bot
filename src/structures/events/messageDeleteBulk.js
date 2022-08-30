import {
    Database,
    SaphireClient as client
} from '../../classes/index.js'

client.on('messageDeleteBulk', async (messages) => {

    return setTimeout(() => check(), 3000)

    async function check() {

        const messagesId = [...messages.keys()]
        const allCachedGames = await Database.Cache.Bet.get('Bet') || {}
        const allGamesId = Object.entries(allCachedGames)
        const gamesToDelete = allGamesId.filter(([id]) => messagesId.includes(id)) || []

        if (!gamesToDelete || !gamesToDelete.length) return

        for (let game of gamesToDelete) {
            client.emit('betRefund', game[1])
        }

        return
    }
})