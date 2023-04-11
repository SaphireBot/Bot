import { Routes } from 'discord.js'
import { Database, TwitchManager, SaphireClient as client } from '../../classes/index.js'
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
        for (const data of toSendData) {
            client.rest.post(Routes.channelMessages(data.channelId), {
                body: { content: data.content || null, embeds: data.embeds || [], components: data.components || [] }
            }).catch(err => {
                if (data.isTwitchNotification) {
                    // Missing Access or Unknown Channel
                    if ([50001, 10003].includes(err.code))
                        return TwitchManager.deleteChannelFromTwitchNotification(data.channelId)
                }

                return
            })
            continue;
        }

        client.messagesToSend.splice(0, toSendData.length)
    }

    return
}, 1000 * 2)

setInterval(() => Database.Cache.Chat.delete("Global"), 1000 * 60 * 60)

export {
    pollInterval
}