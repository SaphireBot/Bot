import { SaphireClient as client } from "../../classes/index.js";
import { initSocket, socket } from "../../websocket/websocket.js";
import { Emojis as e } from "../../util/util.js";
import { Config } from "../../util/Constants.js";
import saphire from "../../classes/saphire/start.saphire.js";
import { ActivityType } from "discord.js";

client
    .on('shardDisconnect', async (_, shardId) => {
        socket?.send({
            type: "shardStatus",
            shardData: {
                shardId,
                ready: client.isReady(),
                ms: client.ws.ping || 0,
                clusterName: client.clusterName,
                guilds: client.guilds.cache.map(g => ({ name: g.name, id: g.id })),
                guildsCount: client.guilds.cache.size || 0,
                emojisCount: client.emojis.cache.size || 0,
                channelsCount: client.channels.cache.size || 0,
                usersCount: client.users.cache.size || 0
            }
        })
        return
    })
    .on('shardError', (error, shardId) => {
        return client.pushMessage({
            method: 'post',
            channelId: Config.statusChannelNotification,
            body: {
                method: 'post',
                channelId: Config.statusChannelNotification,
                content: `${e.Notification} | Ocorreu um erro na Shard ${shardId}.\n${e.bug} | \`${error}\``
            }
        })
    })
    .on('shardReady', async (shardId, _) => {

        client.shardId = shardId

        client.user.setPresence({
            activities: [
                { name: `Interestelar - Cluster ${client.clusterName} [${client.shardId}]`, shardId: client.shardId, type: ActivityType.Watching },
                { name: `Próxima a Gargantua - Cluster ${client.clusterName} [${client.shardId}]`, shardId: client.shardId, type: ActivityType.Playing },
            ],
            since: Date.now(),
            shardId: client.shardId,
            status: "idle"
        })

        if (socket?.connected)
            socket?.send({
                type: "shardStatus",
                shardData: {
                    shardId,
                    ready: client.isReady(),
                    ms: client.ws.ping || 0,
                    clusterName: client.clusterName,
                    guilds: client.guilds.cache.map(g => ({ name: g.name, id: g.id })),
                    guildsCount: client.guilds.cache.size || 0,
                    emojisCount: client.emojis.cache.size || 0,
                    channelsCount: client.channels.cache.size || 0,
                    usersCount: client.users.cache.size || 0
                }
            })
        if (client.isReady()) return

        await initSocket()
        await saphire()

        return client.pushMessage({
            method: 'post',
            type: 'initing',
            channelId: Config.statusChannelNotification,
            body: {
                method: 'post',
                type: 'initing',
                channelId: Config.statusChannelNotification,
                content: `${e.CheckV} | **Shard ${shardId} in Cluster ${client.clusterName} is ready.**\n📅 | ${new Date().toLocaleString("pt-BR").replace(" ", " ás ")}`
            }
        })

    })
    .on('shardResume', (shardId, _) => {
        socket?.send({
            type: "shardStatus",
            shardData: {
                shardId,
                ready: client.isReady(),
                ms: client.ws.ping || 0,
                clusterName: client.clusterName,
                guilds: client.guilds.cache.map(g => ({ name: g.name, id: g.id })),
                guildsCount: client.guilds.cache.size || 0,
                emojisCount: client.emojis.cache.size || 0,
                channelsCount: client.channels.cache.size || 0,
                usersCount: client.users.cache.size || 0
            }
        })
        return
    })