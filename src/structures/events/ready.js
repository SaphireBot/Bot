import { Database, SaphireClient as client } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.once('ready', async () => {

    // EXTERNAL SERVICES
    client.topGGAutoPoster()

    const shardId = client.shard.ids.at(-1)

    Database.registerClient(client.user.id)
    await Database.Cache.GameChannels.deleteAll()

    const guildsLength = await client.allGuildsData() || []

    return client.user.setPresence({
        activities: [
            { name: `${client.slashCommands.size} comandos em ${guildsLength?.flat().length} servidores [Shard ${shardId}]` }
        ],
        status: 'idle'
    })

})