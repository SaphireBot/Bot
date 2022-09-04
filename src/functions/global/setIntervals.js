import {
    Database,
    SaphireClient as client
} from '../../classes/index.js'
import PollManager from '../update/polls/poll.manager.js'

const giveawayInterval = () => setInterval(async () => {

    const giveaway = await Database.Cache.Giveaways.get(`${client.shardId}.Giveaways.NextThrow`)
    if (!giveaway) return

    if (!Date.Timeout(giveaway?.TimeMs - 1000, giveaway?.DateNow))
        return client.emit('giveaway', giveaway)

    return
}, 3000)

const pollInterval = () => setInterval(async () => {

    const polls = PollManager.Polls || []
    if (!polls || !polls.length) return

    for await (let poll of polls)
        if (!Date.Timeout(poll?.TimeMs, poll?.DateNow))
            return await PollManager.newCancel(poll)

}, 5000)

export {
    giveawayInterval,
    pollInterval
}