import { ShardingManager, Shard } from 'discord.js'
import { SaphireClient as client } from '../index.js'
import { Config } from '../../util/Constants.js'
import { Emojis as e } from '../../util/util.js'

export default class ShardManager extends ShardingManager {
    constructor(filePath, options) {
        super(filePath, options)
    }

    /**
     * @param { Shard } shard 
     */
    enableListeners(shard) {
        shard
            // .on('message', message => {
            //     if (message?.type !== 'message') return
            //     console.log(`${client.shardId} | ${shard.id}`)
            //     console.log(message);
            // })
            .on('spawn', () => console.log(`Shard ${shard.id} has been spawnned`))
            .on('death', () => ShardManager.postMessage(shard.id, 'death'))
            .on('disconnect', () => ShardManager.postMessage(shard.id, 'disconnect'))
            // .on('reconnecting', () => ShardManager.postMessage(shard.id, 'reconnecting'))
            // .on('ready', () => ShardManager.postMessage(shard.id, 'ready'))
            .on('error', error => console.log(`Shard[${shard.id}] Error`, error))
        return
    }

    /**
     * @param { String } content 
     */
    static postMessage(shardId, eventType) {

        const content = {
            death: `${e.DenyX} | **Shard ${shardId} in Cluster ${client.clusterName} died.**`,
            disconnect: `${e.DenyX} | **Shard ${shardId} in Cluster ${client.clusterName} has been disconnected.**`,
            ready: `${e.CheckV} | **Shard ${shardId} in Cluster ${client.clusterName} is ready.**`,
            reconnecting: `${e.Loading} | **Shard ${shardId} in Cluster ${client.clusterName} is reconnecting.**`
        }[eventType]

        if (!content) return console.log(`Shard Event Type Not Defined - ${eventType}`)

        return client.pushMessage({
            method: 'post',
            channelId: Config.statusChannelNotification,
            body: {
                content: `${content}\n📅 | ${new Date().toLocaleString("pt-BR").replace(" ", " ás ")}`,
                method: 'post',
                channelId: Config.statusChannelNotification
            }
        })
    }
}