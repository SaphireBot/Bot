import { SaphireClient as client, Database } from '../../classes/index.js'
import StartGiveaway from '../../functions/update/giveaway/start.giveaway.js'

client.on('giveaway', async giveaway => {

    const guild = await client.guilds.fetch(giveaway.GuildId).catch(() => null)
    if (!guild) return

    const channel = await guild?.channels?.fetch(giveaway.ChannelId).catch(() => null)
    if (!channel) return Database.deleteGiveaway(giveaway.MessageID, guild.id)

    return StartGiveaway(giveaway, guild, channel)
})