import { Database, SaphireClient as client } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.once('ready', async () => {

    client.application?.fetch()
    client.application?.commands.fetch()

    // EXTERNAL SERVICES
    client.topGGAutoPoster()

    Database.registerClient(client.user.id)
    await Database.Cache.GameChannels.deleteAll()

    const restart = await Database.Cache.Client.get('Restart')
    if (restart) restarting(restart)

    return

})

async function restarting(restart) {

    if (!restart.channelId || !restart.messageId)
        return Database.Cache.Client.delete('Restart')

    Database.Cache.Client.delete('Restart')
    return client.pushMessage({
        method: 'patch',
        channelId: restart.channelId,
        messageId: restart.messageId,
        body: {
            content: `${e.CheckV} | Reboot concluído.`
        }
    })

}