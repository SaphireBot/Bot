import { Database, SaphireClient as client } from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.once('ready', async () => {

    if (client.shardId === 0) {
        restarting(await Database.Cache.Client.get('Restart'))
        Database.registerClient(client.user.id)
    }

    return console.log(`Shard ${client.shardId} | Ready.`)
})

async function restarting(restart) {

    if (!restart) return
    await Database.Cache.Client.delete('Restart')

    if (!restart.channelId || !restart.messageId) return

    return client.pushMessage({
        method: 'patch',
        channelId: restart.channelId,
        messageId: restart.messageId,
        body: {
            method: 'patch',
            channelId: restart.channelId,
            messageId: restart.messageId,
            content: `${e.CheckV} | Reboot concluído.`
        }
    })

}