import { Database, GiveawayManager, SaphireClient as client } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import { socket } from '../../websocket/websocket.js'

client.on('messageDeleteBulk', async (messages) => {

    const messagesId = [...messages.keys()]
    return setTimeout(() => check(), 3000)

    function check() {
        refundBet()
        refundJokempo()
        refundBlackjack()
        deleteSingleData()
        refundGlobalJokempo()
        analiseGiveaway()
        refundMultiplier()
        return
    }

    async function refundMultiplier() {

        const multiplier = await Database.Cache.Multiplier.all() || []
        if (multiplier.length)
            for (const messageId of messagesId) {
                const data = multiplier.find(d => d.value[messageId])?.value[messageId]
                if (data) {
                    await Database.Cache.Multiplier.delete(`${data.userId}.${messageId}`)
                    const value = data.prize || data.value || 0

                    const transaction = {
                        time: `${Date.format(0, true)}`,
                        data: `${e.gain} Ganhou ${value.currency()} Safiras via *Bet System Refund*`
                    }

                    socket?.send({
                        type: "transactions",
                        transactionsData: { value, userId: data.userId, transaction }
                    })

                    await Database.User.findOneAndUpdate(
                        { id: data.userId },
                        {
                            $inc: { Balance: value },
                            $push: {
                                Transactions: {
                                    $each: [transaction],
                                    $position: 0
                                }
                            }
                        },
                        { upsert: true, new: true }
                    )
                        .then(data => Database.saveUserCache(data?.id, data))
                } else continue

            }
    }

    async function refundBet() {
        const allGamesId = await Database.Cache.Bet.all() || []
        const gamesToDelete = allGamesId.filter(data => messagesId.includes(data.id)) || []

        if (!gamesToDelete || !gamesToDelete.length) return

        for (let game of gamesToDelete)
            client.emit('betRefund', game.value)
        return
    }

    async function refundJokempo() {
        const allGamesId = await Database.Cache.Jokempo.all() || []
        const gamesToDelete = allGamesId.filter(data => messagesId.includes(data.id)) || []

        if (!gamesToDelete || !gamesToDelete.length) return

        for (let gameData of gamesToDelete)
            client.emit('jokempoRefund', gameData)
        return
    }

    async function refundGlobalJokempo() {
        const allGamesId = await Database.Cache.Jokempo.get('Global') || {}
        const keys = Object.entries(allGamesId)
        const gamesToDelete = keys.filter(key => messagesId.includes(key[0])).filter(i => i)
        if (!gamesToDelete || !gamesToDelete.length) return

        for (let i in gamesToDelete) {
            const gameData = gamesToDelete[i][1]
            const messageId = gamesToDelete[i][0]
            if (!gameData || !messageId) continue
            new Database.Jokempo({
                creatorId: gameData.creatorId,
                creatorOption: gameData.creatorOption,
                id: gameData.id,
                value: gameData.value,
                webhookUrl: gameData.webhookUrl
            }).save()
            Database.add(gameData.userId, gameData.value, `${e.gain} Recebeu ${gameData.value || 0} Safiras atráves do *Bet Delete System (Jokempo)*`)
            await Database.Cache.Jokempo.delete(`Global.${messageId}`)
        }
        return
    }

    async function refundBlackjack() {

        const allCachedGames = await Database.Cache.Blackjack.all() || []
        const gamesToDelete = allCachedGames.filter(game => messagesId.includes(game.id)) || []
        const multiplayer = []

        if (!gamesToDelete || !gamesToDelete.length) return

        for (let game of gamesToDelete) {

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
        return
    }

    async function deleteSingleData() {

        for await (const messageId of messagesId) {
            await Database.Cache.Connect.delete(messageId)
            await Database.Cache.WordleGame.delete(messageId)
        }

        const topGGData = await Database.Cache.General.get('TopGG')

        if (topGGData)
            for await (const data of Object.values(topGGData))
                if (messagesId.includes(data.messageId))
                    await Database.Cache.General.delete(`TopGG.${data.userId}`)
        return
    }

    async function analiseGiveaway() {
        const toDeleteGiveaways = []

        for (const messageId of messagesId)
            if (GiveawayManager.getGiveaway(messageId)) // Verifica se o sorteio existe
                toDeleteGiveaways.push(messageId)

        if (!toDeleteGiveaways.length) return

        const guildId = messages.first().guildId // Pega o ID da Guild direto da collection
        for (const messageId of toDeleteGiveaways)
            Database.deleteGiveaway(messageId, guildId) // Delete o sorteio

        return
    }

})