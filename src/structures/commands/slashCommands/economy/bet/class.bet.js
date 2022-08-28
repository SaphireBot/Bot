import { Base } from '../../../../../classes/index.js'

export default class Bet extends Base {
    constructor(collector, message) {
        super()
        this.collector = collector
        this.msg = message
    }

    events = {
        end: async (...args) => (await import('./functions/end.bet.js')).default(...args)
    }

    async save(messageId, data) {
        return await this.Database.Cache.Bet.set(`Bet.${messageId}`, data)
    }
}