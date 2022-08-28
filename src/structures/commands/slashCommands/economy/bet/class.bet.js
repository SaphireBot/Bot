export default class Bet {
    constructor(collector) {
        this.collector = collector
    }

    events = {
        collect: async (reaction, user) => await import('./functions/collect.bet.js').default(reaction, user, this),
        remove: async (reaction, user) => await import('./functions/remove.bet.js').default(reaction, user, this),
        end: async (_, reason) => await import('./functions/end.bet.js').default(reason, this)
    }
}