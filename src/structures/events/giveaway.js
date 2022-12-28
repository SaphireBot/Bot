import {
    SaphireClient as client,
    Database
} from '../../classes/index.js'
import StartGiveaway from '../../functions/update/giveaway/start.giveaway.js'

client.on('giveaway', async (giveaway, timeout) => {
    
    clearTimeout(timeout)

    const guildGiveaways = await Database.Cache.Giveaways.get(`${client.shardId}.Giveaways.${giveaway.GuildId}`)
    await Database.Cache.Giveaways.set(`${client.shardId}.Giveaways.${giveaway.GuildId}`, [
        ...guildGiveaways.filter(data => data.MessageID !== giveaway.MessageID),
        giveaway.Actived = false
    ])

    const guild = await client.guilds.fetch(giveaway.GuildId).catch(() => null)
    if (!guild) return
    
    const channel = await guild?.channels?.fetch(giveaway.ChannelId).catch(() => null)
    if (!channel) return

    giveaway.Actived = true
    return StartGiveaway(giveaway, guild, channel)
})