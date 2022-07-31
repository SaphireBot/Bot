import {
    Database,
    SaphireClient as client
} from '../../classes/index.js'

const giveawayInterval = () => setInterval(async () => {

    const giveaway = await Database.Cache.Giveaways.get(`${client.shardId}.Giveaways.NextThrow`)

    if (!giveaway) return

    if (!Date.Timeout(giveaway?.TimeMs - 1000, giveaway?.DateNow))
        return client.emit('giveaway', giveaway)

    return
}, 3000)

export {
    giveawayInterval
}