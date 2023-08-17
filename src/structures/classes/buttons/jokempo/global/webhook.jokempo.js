import { Routes } from "discord.js"
import { SaphireClient as client } from '../../../../../classes/index.js'
import { Config } from "../../../../../util/Constants.js"

export default async channelId => {

    const webhook = await client.rest.get(Routes.channelWebhooks(channelId)).catch(() => null)

    if (webhook && Array.isArray(webhook) && webhook.length) {
        const getter = webhook.find(w => w?.user?.id == client.user.id)
        if (getter) return `https://discord.com/api/webhooks/${getter.id}/${getter.token}`
    }

    const newWebhook = await client.rest.post(Routes.channelWebhooks(channelId), {
        body: {
            name: 'Saphire Jokempo Global System',
            avatar: `${Config.WebhookJokempoIcon}`,
        }
    }).catch(() => null)

    if (!newWebhook) return null
    return `https://discord.com/api/webhooks/${newWebhook.id}/${newWebhook.token}`
}