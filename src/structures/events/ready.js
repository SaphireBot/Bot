import { Database, SaphireClient as client } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.on('ready', async (client) => {

    // EXTERNAL SERVICES
    client.topGGAutoPoster()

    Database.registerClient(client.user.id)
    await Database.Cache.GameChannels.deleteAll()

    const restartInfo = await Database.Cache.Client.get(`${client.shardId}.RESTART`)

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

})