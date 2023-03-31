import { PermissionFlagsBits } from 'discord.js'
import { SaphireClient as client, Database, GiveawayManager } from '../../classes/index.js'
import StartGiveaway from '../../functions/update/giveaway/start.giveaway.js'

client.on('giveaway', async giveaway => {

    const guild = await client.guilds.fetch(giveaway.GuildId || '0').catch(() => null)
    if (!guild) return

    const channel = await guild?.channels?.fetch(giveaway.ChannelId || '0')?.catch(() => null)
    if (!channel) return Database.deleteGiveaway(giveaway.MessageID, guild.id)

    const channelPermissions = await channel.permissionsFor(client.user)
    const greenCard = Array.from(
        new Set([
            guild.members.me.permissions.missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]),
            channelPermissions?.missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])
        ].flat())
    )

    if (greenCard.length) return GiveawayManager.retry(giveaway)
    const message = await channel.messages.fetch(giveaway.MessageID || '0').catch(() => null)
    await guild.fetch()
    if (giveaway.timeout) clearTimeout(giveaway.timeout)
    return StartGiveaway(giveaway, guild, channel, message)
})