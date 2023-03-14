import { REST, Routes, WebhookClient } from "discord.js"
import { Config } from "../../util/Constants.js"
import fs from 'fs'
const avatar = fs.readFileSync('./src/images/webhooks/anime_reporter.png', { encoding: 'base64' })
const res = new REST().setToken(process.env.BOT_TOKEN_REQUEST)

export default async channelId => {

    const webhook = await res.get(Routes.channelWebhooks(channelId))
        .catch(error => console.log(error.response.data))

    if (webhook && Array.isArray(webhook) && webhook.length) {
        const getter = webhook.find(w => w?.user?.id == Config.saphireApiId)
        if (getter) return new WebhookClient({ url: `https://discord.com/api/webhooks/${getter.id}/${getter.token}` })
    }

    const newWebhook = await res.post(Routes.channelWebhooks(channelId), {
        body: { name: '[Quiz Manager] Questions Saver', avatar: `data:image/png;base64,${avatar}`, },
        headers: { 'Content-Type': 'image/png' }
    }).catch(error => console.log(error.response.data))

    if (!newWebhook) return
    return new WebhookClient({ url: `https://discord.com/api/webhooks/${newWebhook.id}/${newWebhook.token}` })
}