import { Database, SaphireClient as client } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.once('ready', async () => {

    // EXTERNAL SERVICES
    client.topGGAutoPoster()

    const shardId = client.shard.ids.at(-1)

    Database.registerClient(client.user.id)
    await Database.Cache.GameChannels.deleteAll()

    const data = await Database.Client.findOne({ id: client.user.id }, 'Rebooting')

    if (data?.Rebooting?.ON) {

        await Database.Client.updateOne({ id: client.user.id }, { $unset: { Rebooting: 1 } })

        const channel = await client.channels.fetch(data.Rebooting?.ChannelId)

        if (channel) {
            const msg = await channel?.messages?.fetch(data.Rebooting?.MessageId)
            if (msg) msg?.edit(`${e.Check} | Reboot concluído com sucesso!`).catch(() => { })
        }
    }

    const guildsLength = await client.allGuildsData() || []

    return client.user.setPresence({
        activities: [
            { name: `${client.slashCommands.size} comandos em ${guildsLength?.flat().length} servidores [Shard ${shardId}]` }
        ],
        status: 'idle'
    })

})