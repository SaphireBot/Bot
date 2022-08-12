import {
    SaphireClient as client,
    Database
} from '../../classes/index.js'
import { Config as config } from '../../util/Constants.js'
import { Emojis as e } from '../../util/util.js'

client.on('guildDelete', async guild => {

    if (!guild) return

    await Database.Guild.deleteMany({ id: guild.id })

    await Database.Client.updateOne(
        { id: client.user.id },
        { $pull: { PremiumServers: guild.id } }
    )

    const owner = await guild.members.cache.get(guild.ownerId)
    const channel = await client.channels.fetch(config.LogChannelId)
    const fetchWebhook = await channel.fetchWebhooks()
    const webhook = fetchWebhook.find(web => web.name === 'Saphire Database Logs')

    if (!webhook) return

    return await webhook.send({
        embeds: [{
            color: client.red,
            title: `${e.Loud} Servidor Removido`,
            fields: [
                {
                    name: 'Servidor',
                    value: `${guild.name} *\`(${guild.id})\`*`
                },
                {
                    name: 'Status',
                    value: `**Dono:** ${owner.user.tag} *\`(${owner.user.id})\`*\n**Membros:** ${guild.memberCount}`
                }
            ]
        }]
    }).catch(() => { })
})