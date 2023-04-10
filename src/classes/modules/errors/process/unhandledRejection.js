import { Emojis as e } from '../../../../util/util.js'
import { Config as config } from '../../../../util/Constants.js'
import { SaphireClient as client } from '../../../index.js'

export default async (reason) => {

    /**
     * 500 Internal Server Error
     * 10004 Unknown Guild
     * 10008 Unknown Message
     * 50035 Invalid Form Body (Error Handling Filter)
     * 50013 Missing Permissions
     * 11000 Duplicated Creating Document Mongoose - Ignore Error
     * 50001 DiscordAPIError: Missing Access
     * 10062 Unknow Interaction
     */

    if ([500, 10004, 10008, 10062].includes(reason.code)) return
    console.log(reason)

    await client.users.cache.get(config.ownerId)?.send({
        embeds: [{
            color: client.red,
            title: `${e.Loud} Report de Erro | Unhandled Rejection`,
            description: `\`\`\`js\n${reason.stack?.slice(0, 2000)}\`\`\``,
            footer: { text: `Error Code: ${reason.code || 0}` }
        }]
    }).catch(() => { })

    return client.sendWebhook(
        process.env.WEBHOOK_ERROR_REPORTER,
        {
            username: "[Saphire] Unhandled Rejection Reporter",
            avatarURL: config.ErrorWebhookProfileIcon,
            embeds: [{
                color: client.red,
                title: `${e.Loud} Report de Erro | Unhandled Rejection`,
                description: `\`\`\`js\n${reason.stack?.slice(0, 2000)}\`\`\``,
                footer: { text: `Error Code: ${reason.code || 0}` }
            }]
        }
    )

}