import { SaphireClient as client } from '../../classes/index.js'

export default (logChannelId, type, msg) => {

    if (!logChannelId) return

    client.pushMessage({
        method: "post",
        channelId: logChannelId,
        body: {
            method: "post",
            channelId: logChannelId,
            content: `🛰️ | **Global System Notification** | ${type}\n \n${msg}`
        }
    })

    return
}