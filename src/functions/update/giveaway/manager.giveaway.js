import {
    SaphireClient as client,
    Database,
} from '../../../classes/index.js'

export default new class GiveawayManager {
    constructor() {
        this.giveaways = []
        this.awaiting = []
        this.onCheck = []
    }

    async setGiveaways() {

        const giveawaysFromGuilds = await Database.Guild.find({
            id: { $in: [...client.guilds.cache.keys()] }
        }, 'id Giveaways')

        if (!giveawaysFromGuilds || !giveawaysFromGuilds.length) return

        this.giveaways = giveawaysFromGuilds
            .filter(data => data.Giveaways?.length > 0)
            .map(data => data.Giveaways)
            .flat()

        return this.filterAndManager()
    }

    async filterAndManager() {

        if (!this.giveaways.length) return

        const giveawaysAvailables = this.giveaways.filter(data => data.Actived)
        const giveawaysUnavailables = this.giveaways.filter(data => !data.Actived)
        if (giveawaysAvailables.length) this.selectGiveaways(giveawaysAvailables)
        if (giveawaysUnavailables.length) this.managerUnavailablesGiveaways(giveawaysUnavailables)

        return
    }

    async selectGiveaways(giveaways = []) {
        if (!giveaways.length) return

        for await (const gw of giveaways) {

            const timeMs = (gw.DateNow + gw.TimeMs) - Date.now()

            if (timeMs > 2147483647) {
                this.awaiting.push(gw)
                continue
            }

            if (timeMs <= 1000)
                client.emit('giveaway', gw)
            else {
                const timeout = setTimeout(() => client.emit('giveaway', gw), timeMs)
                gw.timeout = timeout
                this.giveaways.push(gw)
            }
            continue
        }

        if (this.onCheck) this.checkBits()
        return
    }

    checkBits() {
        this.onCheck = true

        if (!this.awaiting.length)
            return this.onCheck = false

        for (let gw of this.awaiting) {
            const time = (gw.DateNow + gw.TimeMs) - Date.now()
            if (time < 2147483647) {
                this.giveaways.push(gw)
                this.selectGiveaways([gw])
                this.awaiting.splice(this.awaiting.findIndex(g => g.MessageID === gw.MessageID), 1)
                continue
            } else continue
        }

        return setTimeout(() => this.checkBits(), 600000)
    }

    async managerUnavailablesGiveaways(giveaways) {
        if (!giveaways.length) return

        for await (const gw of giveaways) {

            const timeMs = (gw.DateNow + gw.TimeMs) - Date.now()

            if (timeMs <= -172800000) // 48hrs | 2 Days
                Database.deleteGiveaway(gw.MessageID, gw.GuildId)
            else setTimeout(() => Database.deleteGiveaway(gw.MessageID, gw.GuildId), 172800000 - (timeMs - timeMs - timeMs))

            continue
        }

        return

    }
}