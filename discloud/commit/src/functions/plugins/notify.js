import { Database, SaphireClient as client } from '../../classes/index.js'

export default async (logChannelId, type, msg) => {

    if (!logChannelId) return

    const canal = await client.channels.fetch(logChannelId).catch(() => null)
    if (!canal)
        return await Database.Guild.updateOne(
            { id: ServerId },
            { $unset: { "LogSystem.channel": 1 } }
        )

    return canal?.send(`🛰️ | **Global System Notification** | ${type}\n \n${msg}`).catch(() => { })
}