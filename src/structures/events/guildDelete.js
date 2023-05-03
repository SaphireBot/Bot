import { SaphireClient as client, Database } from '../../classes/index.js'
import { Config } from '../../util/Constants.js'
import { Emojis as e } from '../../util/util.js'

client.on('guildDelete', async guild => {

    if (!guild.id) return

    await Database.Guild.deleteMany({ id: guild.id })
    Database.guildData.delete(guild.id)

    if (!guild.ownerId) return
    const owner = await client.users.fetch(guild.ownerId).catch(() => null)

    return client.pushMessage({
        channelId: Config.LogChannelId,
        method: 'post',
        body: {
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
    })
})