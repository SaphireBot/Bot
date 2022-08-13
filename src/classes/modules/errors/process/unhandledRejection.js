import { Emojis as e } from '../../../../util/util.js'
import { Config as config } from '../../../../util/Constants.js'
import { SaphireClient as client } from '../../../index.js'
import { WebhookClient } from 'discord.js'

export default async function (reason) {

    return

    /**
     * 500 Internal Server Error
     * 10004 Unknown Guild
     * 10008 Unknown Message
     * 50035 Invalid Form Body (Error Handling Filter)
     * 50013 Missing Permissions
     * 11000 Duplicated Creating Document Mongoose - Ignore Error
     * 50001 DiscordAPIError: Missing Access (send message)
     * 10062 Unknow Interaction
     */

    if ([500, 10004, 10008, 11000, 50001, 10062, 50013].includes(reason.code)) return

    const guild = client.allGuilds.find(data => data.id === config.guildId)
    if (!guild) return

    const errorChannel = guild.channels.cache.get(config.clientErrorChannelId)
    if (!errorChannel) return

    const webhook = new WebhookClient({ url: 'https://discord.com/api/webhooks/1007820325230219364/hBXVTY8MOW-3HdZlyUKebpSrtjBkUpGbCMmhZHb03k1JD4sWJxVJJYv2TrvoemknpWRB' })

    webhook.send({
        content: `+1 voto para Saphire Moon#5706 de ${user.tag} \`${userId || 0}\` (${votes.length})`,
        avatarURL: 'https://media.discordapp.net/attachments/893361065084198954/1005310889588703332/top.gg_logo.png?width=484&height=484',
        username: 'Top GG Vote Notification'
    })

    return await client.users.cache.get(`${config.ownerId}`)?.send({
        embeds: [
            {
                color: 'RED',
                title: `${e.Loud} Report de Erro | unhandledRejection`,
                description: `\`\`\`js\n${reason.stack?.slice(0, 2000)}\`\`\``,
                footer: { text: `Error Code: ${reason.code || 0}` }
            }
        ]
    }).catch(() => console.log(reason))

}