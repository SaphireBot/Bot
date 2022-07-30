import {
    SaphireClient as client,
    Database
} from '../../../classes/index.js'

export default new class GiveawayManage {
    constructor() {

    }

    async setGiveaways() {

        const giveawaysFromGuilds = await Database.Guild.find({
            id: { $in: [...client.guilds.cache.keys()] }
        }, 'id Giveaways')

        if (!giveawaysFromGuilds || !giveawaysFromGuilds.length) return

        const guildsWithGiveaways = giveawaysFromGuilds
            .filter(guildData => guildData.Giveaways.length === 0)
            .map(data => ({ id: data.id, Giveaways: data.Giveaways }))
            .filter(data => data.Giveaways.length > 0)

        if (!guildsWithGiveaways || guildsWithGiveaways.length === 0) return;

        return await Database.Cache.Giveaways.set(`${client.shardId}`, guildsWithGiveaways)
    }
}