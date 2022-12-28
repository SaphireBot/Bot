import PollManager from '../update/polls/poll.manager.js'

const pollInterval = () => setInterval(async () => {

    const polls = PollManager.Polls || []
    if (!polls || !polls.length) return

    for await (let poll of polls)
        if (!Date.Timeout(poll?.TimeMs, poll?.DateNow))
            return await PollManager.newCancel(poll)

}, 5000)

export {
    pollInterval
}