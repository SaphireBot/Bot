import {
    SaphireClient as client,
    Database,
} from '../../../classes/index.js'

export default new class GiveawayManager {
    constructor() {
        this.giveaways = []
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

        if (giveawaysAvailables.length)
            this.selectGiveaways(giveawaysAvailables)

        if (giveawaysUnavailables)
            this.managerUnavailablesGiveaways(giveawaysUnavailables)

        return
    }

    async selectGiveaways(giveaways = []) {
        if (!giveaways.length) return

        for await (const gw of giveaways) {

            const timeMs = (gw.DateNow + gw.TimeMs) - Date.now()

            if (timeMs <= 1000)
                client.emit('giveaway', gw)
            else setTimeout(() => client.emit('giveaway', gw), timeMs)

            continue
        }

        return
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