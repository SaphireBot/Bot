import { Emojis as e } from '../../../../util/util.js'
import { Config as config } from '../../../../util/Constants.js'
import { SaphireClient as client } from '../../../index.js'
import createWebhook from '../functions/createWebhook.errors.js'

export default async function (reason) {

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

    if ([500, 10004, 10008, 11000, 50001, 10062].includes(reason.code)) return

    const guild = await client.guilds.fetch(config.guildId).catch(() => null)
    if (!guild) return

    const errorChannel = guild.channels.cache.get(config.clientErrorChannelId)
    if (!errorChannel) return

    const webhooks = await errorChannel.fetchWebhooks()
    const webhook = webhooks.find(wh => wh?.name === client.user.id)
        || await createWebhook(errorChannel, client.user.id, config.ErrorWebhookProfileIcon)
            .catch(() => null)

    await client.users.cache.get(config.ownerId)?.send({
        embeds: [{
            color: client.red,
            title: `${e.Loud} Report de Erro | unhandledRejection`,
            description: `\`\`\`js\n${reason.stack?.slice(0, 2000)}\`\`\``,
            footer: { text: `Error Code: ${reason.code || 0}` }
        }]
    }).catch(() => console.log(reason))

    if (webhook)
        webhook.send({
            embeds: [{
                color: client.red,
                title: `${e.Loud} Report de Erro | unhandledRejection`,
                description: `\`\`\`js\n${reason.stack?.slice(0, 2000)}\`\`\``,
                footer: { text: `Error Code: ${reason.code || 0}` }
            }],
            avatarURL: 'https://media.discordapp.net/attachments/893361065084198954/1005310889588703332/top.gg_logo.png?width=484&height=484',
            username: 'Unhandled Rejection Reporter'
        })

    return

}