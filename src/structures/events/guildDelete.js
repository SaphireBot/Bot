import {
    SaphireClient as client,
    Database
} from '../../classes/index.js'
import { Emojis as e } from '../../util/util.js'

client.on('guildDelete', async guild => {

    if (!guild) return

    await Database.Guild.deleteMany({ id: guild.id })

    const owner = await client.users.fetch(guild.ownerId).catch(() => null)

    return client.sendWebhook(
        process.env.WEBHOOK_DATABASE_LOGS,
        {
            username: "[Saphire] Saphire Database Logs",
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
                        value: `**Dono:** ${owner?.tag || '\`Not Found\`'} *\`(${guild.ownerId})\`*\n**Membros:** ${guild.memberCount}`
                    }
                ]
            }]
        }
    )
})