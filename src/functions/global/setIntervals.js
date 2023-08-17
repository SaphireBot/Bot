import { Database } from '../../classes/index.js'
import PollManager from '../update/polls/poll.manager.js'

const pollInterval = () => setInterval(async () => {

    const polls = PollManager.Polls || []
    if (!polls || !polls.length) return

    for await (let poll of polls)
        if (!poll.permanent && !Date.Timeout(poll?.TimeMs, poll?.DateNow))
            return await PollManager.cancel(poll)

}, 1000 * 10)

export { pollInterval }