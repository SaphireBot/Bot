import { SaphireClient as client } from "../../classes/index.js";
import { Config } from "../../util/Constants.js"
import { Emojis as e } from "../../util/util.js";
import { Routes } from "discord.js";

client.on('shardDisconnect', async (CloseEvent, shardId) => {

    client.rest.post(Routes.channelMessages(Config.statusChannelNotification), {
        body: {
            content: `<@${Config.ownerId}>, a Shard ${shardId} desconectou.\n${e.bug} | \`${CloseEvent.reason}\``
        }
    }).catch(() => { })

})
    .on('shardError', (error, shardId) => {
        client.rest.post(Routes.channelMessages(Config.statusChannelNotification), {
            body: {
                content: `${e.Notification} | <@${Config.ownerId}>, ocorreu um erro na Shard ${shardId}.\n${e.bug} | \`${error}\``
            }
        }).catch(() => { })
    })
    .on('shardReady', (shardId) => {
        console.log(`Shard ${shardId} was spawned.`)

        client.postMessage({
            content: `${e.Check} | **Shard ${shardId} in Cluster ${client.clusterName} was been spawned.**\n📅 | ${new Date().toLocaleString("pt-BR").replace(" ", " ás ")}`,
            channelId: Config.statusChannelNotification
        })

        client.shardId = shardId

        client.postMessage({
            channelId: Config.statusChannelNotification,
            content: `${e.Notification} | <@${Config.ownerId}>, a Shard ${shardId} conectou com sucesso.`
        })

        return
    })