import { Database } from '../../classes/index.js'
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
    const allData = await Database.Cache.TempCall.all()
    if (!allData?.length) return

    for await (const { id: guildId, value } of allData) {
        if (!value || !Object.values(value || {})?.length) return
        const data = Object.entries(value).map(([id, time]) => ({ id, time }))
        for await (const member of data) {
            await Database.Guild.updateOne(
                { id: guildId },
                {
                    $inc: { [`TempCall.members.${member.id}`]: Date.now() - member.time }
                },
                { new: true }
            )
            await Database.Cache.TempCall.set(`${guildId}.${member.id}`, Date.now())
        }
    }
}, 1000 * 60 * 5)

export { pollInterval }