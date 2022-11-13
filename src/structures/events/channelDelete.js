import { SaphireClient as client, Database } from '../../classes/index.js'

client.on('channelDelete', async channel => {

    if (!channel || !channel.guild) return

    const inLogomarcaGameChannel = await Database.Cache.Logomarca.get(`${client.shardId}.Channels`, channel.id) || []
    if (inLogomarcaGameChannel.includes(channel.id))
        await Database.Cache.Logomarca.pull(`${client.shardId}.Channels`, channel.id)

    const { guild } = channel
    const guildData = await Database.Guild.findOne({ id: guild.id }, "LogSystem")
    if (!guildData) return

    if (channel.id === guildData?.LogSystem?.channel)
        return await Database.Guild.updateOne({ id: guild.id }, { $unset: { LogChannel: 1 } })

    const logChannel = await guild.channels.fetch(`${guildData?.LogSystem?.channel}`).catch(() => null)
    if (!logChannel) return

    return logChannel.send({
        content: `🛰️ | **Global System Notification** | Channel Delete\n \nO canal **${channel.name}** - *\`${channel.id}\`* foi deletado.`
    }).catch(() => { })

    // async function DeletedChannel(ChannelDB, CanalFunction) {

    //     const data = await Database.Guild.findOneAndUpdate(
    //         { id: channel.guild.id },
    //         { $unset: { [ChannelDB]: 1 } },
    //         { returnDocument: true }
    //     )

    //     return Notify(data?.LogSystem?.channel, 'Recurso Desabilitado', `O canal **${channel.name}** configurado como **${CanalFunction}** foi deletado.`)
    // }
})