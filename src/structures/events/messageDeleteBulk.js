import {
    Database,
    SaphireClient as client
} from '../../classes/index.js'

client.on('messageDeleteBulk', async (messages) => {

    const messagesId = messages.keys()
    const allCachedGames = await Database.Cache.Bet.get('Bet')
    const allGamesId = Object.keys(allCachedGames || {})
    const toDelete = []

    if (!allGamesId || !allGamesId.length) return

    for (let id of messagesId)
        if (allGamesId.includes(id)) toDelete.push(id)

    if (!toDelete || !toDelete.length) return

    const cachedData = []

    for await (let id of toDelete) {
        const data = await Database.Cache.Bet.get(`Bet.${id}`)
        cachedData.push(data)
        continue
    }

    if (!cachedData || !cachedData.length) return

    for (let cached of cachedData)
        client.emit('betRefund', cached)

    return
})