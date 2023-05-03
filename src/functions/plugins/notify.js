import { Database, SaphireClient as client } from '../../classes/index.js'

export default async (logChannelId, type, msg) => {

    if (!logChannelId) return

    const canal = await client.channels.fetch(logChannelId).catch(() => null)
    if (!canal)
        return await Database.Guild.findOneAndUpdate(
            { id: ServerId },
            { $unset: { "LogSystem.channel": 1 } },
            { new: true }
        )
            .then(data => Database.saveCacheData(data.id, data))

    return canal?.send(`🛰️ | **Global System Notification** | ${type}\n \n${msg}`).catch(() => { })
}