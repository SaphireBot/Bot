import { Database, SaphireClient as client } from '../../classes/index.js'
import PollManager from '../update/polls/poll.manager.js'

const pollInterval = () => setInterval(async () => {

    const polls = PollManager.Polls || []
    if (!polls || !polls.length) return

    for await (let poll of polls)
        if (!poll.permanent && !Date.Timeout(poll?.TimeMs, poll?.DateNow))
            return await PollManager.cancel(poll)

}, 1000 * 10)

setInterval(() => Database.Cache.Chat.delete("Global"), 1000 * 60 * 60)

setInterval(async () => {
    const status = await Database.Cache.General.get('DISABLE')
    if (status) return

    const allData = await Database.Cache.TempCall.all()
    if (!allData?.length) return

    for await (const { id: guildId, value } of allData) {
        if (!value
            || !Object.values(value || {})?.length
            || isNaN(Number(guildId))
        ) continue

        // const inCall = await Database.Cache.TempCall.get(`${guildId}.inCall`) || {}
        const inCall = value?.inCall || {}
        const channelsId = Object.keys(inCall)
        // const membersToRemove = []
        const toResetDate = []

        const data = Object.entries(value)
            .filter(v => v[0] != "inCall")
            .filter(([memberId]) => {
                for (const channelId of channelsId)
                    if (inCall[channelId].includes(memberId)) {
                        checkIfmemberIsInCall(guildId, channelId, memberId)
                        return true
                    }
                return true
            })
            .map(([id, time]) => {
                toResetDate.push(id)
                return [`TempCall.members.${id}`, Date.now() - time]
            })

        await Database.Guild.updateOne(
            { id: guildId },
            { $inc: Object.fromEntries(data) },
            { upsert: true }
        )

        // for await (const memberId of membersToRemove)
        //     await Database.Cache.TempCall.delete(`${guildId}.${memberId}`)

        for await (const memberId of toResetDate)
            await Database.Cache.TempCall.set(`${guildId}.${memberId}`, Date.now())
    }
}, 1000 * 60 * 3)

async function checkIfmemberIsInCall(guildId, channelId, memberId) {

    const channel = await client.channels.fetch(channelId).catch(() => null)
    if (!channel)
        return await Database.Cache.TempCall.delete(`${guildId}.inCall.${channelId}`)

    if (!channel.members.get(memberId))
        Database.Cache.TempCall.pull(`${guildId}.inCall.${channelId}`, id => id == memberId)
    return
}

export { pollInterval }