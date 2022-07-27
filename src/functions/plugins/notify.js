import { Database, SaphireClient as client } from '../../classes/index.js'

export default async (ServerId, type, msg) => {

    const guild = await Database.Guild.findOne({ id: ServerId }, 'LogChannel')
    const canal = await client.channels.fetch(guild?.LogChannel)

    if (!canal && guild?.LogChannel)
        return await Database.Guild.updateOne(
            { id: ServerId },
            { $unset: { LogChannel: 1 } }
        )

    return canal?.send(`🛰️ | **Global System Notification** | ${type}\n \n${msg}`).catch(() => { })
}