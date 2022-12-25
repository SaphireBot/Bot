import {
    SaphireClient as client,
    Database,
} from '../../../classes/index.js'
import { giveawayInterval } from '../../global/setIntervals.js'

export default new class GiveawayManager {
    constructor() { }

    async setGiveaways() {

        const giveawaysFromGuilds = await Database.Guild.find({
            id: { $in: [...client.guilds.cache.keys()] }
        }, 'id Giveaways')

        if (!giveawaysFromGuilds || !giveawaysFromGuilds.length) return

        const guildsWithGiveaways = giveawaysFromGuilds
            .filter(data => data.Giveaways?.length > 0)
            .map(data => ({ id: data.id, Giveaways: data.Giveaways }))

        if (!guildsWithGiveaways || guildsWithGiveaways.length === 0) return

        for await (let data of guildsWithGiveaways)
            await Database.Cache.Giveaways.set(`${client.shardId}.Giveaways.${data.id}`, data.Giveaways)

        giveawayInterval()
        return this.filterAndManager()
    }

    async filterAndManager() {

        const allData = await Database.Cache.Giveaways.get(`${client.shardId}.Giveaways`) || {}
        const allGiveaways = Object.values(allData || {}).flat()

        if (!allGiveaways.length) return

        const giveawaysAvailables = allGiveaways.filter(data => data.Actived)
        // const giveawaysUnavailables = allGiveaways.filter(data => !data.Actived)

        this.selectGiveaways(giveawaysAvailables)
        // this.managerUnavailablesGiveaways(giveawaysUnavailables)
        return
    }

    async selectGiveaways(giveaways = []) {
        if (!giveaways.length) return
        const giveawaySorted = giveaways.sort((a, b) => (a.DateNow + a.TimeMs) - (b.DateNow + b.TimeMs))
        await Database.Cache.Giveaways.set(`${client.shardId}.Giveaways.NextThrow`, giveawaySorted[0])
        return
    }
}