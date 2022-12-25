import {
    SaphireClient as client,
    Database,
    GiveawayManager
} from '../../classes/index.js'
import StartGiveaway from '../../functions/update/giveaway/start.giveaway.js'

client.on('giveaway', async giveaway => {

    await Database.Cache.Giveaways.delete(`${client.shardId}.Giveaways.NextThrow`)

    const guildGiveaways = await Database.Cache.Giveaways.get(`${client.shardId}.Giveaways.${giveaway.GuildId}`)
    await Database.Cache.Giveaways.set(`${client.shardId}.Giveaways.${giveaway.GuildId}`, [
        ...guildGiveaways.filter(data => data.MessageID !== giveaway.MessageID),
        giveaway.Actived = false
    ])

    await GiveawayManager.filterAndManager()

    const guild = client.guilds.cache.get(giveaway.GuildId)
    const channel = guild?.channels?.cache?.get(giveaway.ChannelId)

    giveaway.Actived = true
    return StartGiveaway(giveaway, guild, channel)
})