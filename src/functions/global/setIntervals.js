import { Routes } from 'discord.js'
import { Database, SaphireClient as client } from '../../classes/index.js'
import PollManager from '../update/polls/poll.manager.js'

const pollInterval = () => setInterval(async () => {

    const polls = PollManager.Polls || []
    if (!polls || !polls.length) return

    for await (let poll of polls)
        if (!poll.permanent && !Date.Timeout(poll?.TimeMs, poll?.DateNow))
            return await PollManager.cancel(poll)

}, 1000 * 10)

setInterval(() => {
    const toSendData = client.messagesToSend.slice(0, 40)

    if (toSendData.length) {
        for (const { content, embeds, components, channelId } of toSendData) {
            client.rest.post(Routes.channelMessages(channelId), {
                body: { content, embeds, components }
            }).catch(() => { })
            continue;
        }

        client.messagesToSend.splice(0, toSendData.length)
    }

    return
}, 2000)

setInterval(async () => await Database.Cache.Chat.delete("Global"), 1000 * 60 * 60)

export {
    pollInterval
}