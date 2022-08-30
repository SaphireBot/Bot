import { Base } from '../../../../../classes/index.js'
import end from './functions/end.bet.js'

export default class Bet extends Base {
    constructor(message) {
        super()
        this.msg = message
    }

    async finish(message) {
        return end(message)
    }

    async save(messageId, data) {
        return await this.Database.Cache.Bet.set(`Bet.${messageId}`, data)
    }
}