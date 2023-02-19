import { REST, Routes, WebhookClient } from "discord.js"
import { Config } from "../../util/Constants.js"
import fs from 'fs'
const avatar = fs.readFileSync('./src/images/webhooks/anime_reporter.png', { encoding: 'base64' })
const res = new REST().setToken(process.env.BOT_TOKEN_REQUEST)

export default async () => {

    const webhook = await res.get(Routes.channelWebhooks(Config.quizAnimeAttachmentChannel))
        .catch(error => console.log(error.response.data))

    if (webhook && Array.isArray(webhook) && webhook.length) {
        const getter = webhook.find(w => w.name == '[Quiz Manager] Anime Question Save')
        if (getter)
            return Config.webhookAnimeReporter = new WebhookClient({ url: `https://discord.com/api/webhooks/${webhook[0].id}/${webhook[0].token}` })
    }

    const newWebhook = await res.post(Routes.channelWebhooks(Config.quizAnimeAttachmentChannel), {
        body: {
            name: '[Quiz Manager] Anime Question Save',
            avatar: `data:image/png;base64,${avatar}`,
        },
        headers: {
            'Content-Type': 'image/png'
        }
    })
        .catch(error => console.log(error))

    if (!newWebhook) return

    return Config.webhookAnimeReporter = new WebhookClient({ url: `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}` })
}