import { Database, SaphireClient as client } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.once('ready', async client => {

    // EXTERNAL SERVICES
    client.topGGAutoPoster()

    Database.registerClient(client.user.id)
    await Database.Cache.GameChannels.deleteAll()

    const restart = await Database.Cache.Client.get('Restart')

    if (restart) {

        if (!restart.channelId || !restart.messageId)
            return deleteRestartData()

        const channel = await client.channels.fetch(restart.channelId || '0').catch(() => null)
        if (!channel) return deleteRestartData()

        const message = await channel.messages.fetch(restart.messageId || '0').catch(() => null)
        if (!message) return deleteRestartData()

        return message.edit({ content: `${e.CheckV} | Reboot concluído.` })
            .then(deleteRestartData)
            .catch(() => { })

        async function deleteRestartData() {
            return await Database.Cache.Client.delete('Restart')
        }

    }

    return

})