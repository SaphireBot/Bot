import { SaphireClient as client, Database } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'
import { PermissionFlagsBits as Permissions } from 'discord.js'

client.on('channelCreate', async channel => {

    if (!channel || !channel.guild || !channel.guild.available || !channel.permissionsFor(channel.guild.members.me)?.has(Permissions.SendMessages)) return

    const data = await Database.Guild.findOne({ id: channel.guild.id }, 'FirstSystem')
    const firstOn = data?.FirstSystem

    if (!firstOn || !channel.isTextBased() || !channel.viewable) return

    return channel.send(`First! ${e.SaphireOk}`).catch(() => { })
})