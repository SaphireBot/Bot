import { SaphireClient as client, Database } from '../../classes/index.js';
import { Emojis as e } from '../../util/util.js';
import { Config } from '../../util/Constants.js';
import { socket } from '../../websocket/websocket.js';
import { ServerinfoCachedData } from '../commands/functions/serverinfo/pages.serverinfo.js';

client.on('guildDelete', async guild => {
    if (!guild.id) return
    
    ServerinfoCachedData.delete(guild.id)
    if (socket?.connected)
        socket?.send({ type: "guildDelete", id: guild.id })

    Database.deleteGuild(guild.id)
    await Database.deleteAllGiveawayFromThisGuild(guild.id)

    if (!guild.ownerId) return
    const owner = await client.users.fetch(guild.ownerId).catch(() => null)

    return client.pushMessage({
        channelId: Config.LogChannelId,
        method: 'post',
        body: {
            channelId: Config.LogChannelId,
            method: 'post',
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
                        value: `**Dono:** ${owner?.username || '\`Not Found\`'} *\`(${guild.ownerId})\`*\n**Membros:** ${guild.memberCount}`
                    }
                ]
            }]
        }
    })
})