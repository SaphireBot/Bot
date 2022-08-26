import { Database, SaphireClient as client } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.once('ready', async () => {

    // EXTERNAL SERVICES
    client.topGGAutoPoster()

    const shardId = client.shard.ids.at(-1)

    Database.registerClient(client.user.id)
    await Database.Cache.GameChannels.deleteAll()

    const restartInfo = await Database.Cache.Client.get(`${client.shardId}.RESTART`)
    // channelId: channel.id,
    // messageId: msg.id

    if (restartInfo) {

        if (!restartInfo.channnelId || !restartInfo.messageId) return deleteRestartData()

        const channel = await client.channels.fetch(restartInfo.channnelId)
        if (!channel) return deleteRestartData()

        const message = await channel.messages.fetch(restartInfo.messageId)
        if (!message) return deleteRestartData()

        return message.edit({
            content: `${e.Check} | Reboot concluído.`
        })
        .then(deleteRestartData)
        .catch(() => { })

        async function deleteRestartData() {
            return await Database.Cache.Client.delete(`${client.shardId}.RESTART`)
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