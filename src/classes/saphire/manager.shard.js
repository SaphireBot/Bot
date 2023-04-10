import { ShardingManager, Shard } from 'discord.js'
import { TwitchManager } from '../../classes/index.js'
const messageType = {
    action: String,
    actionType: String,
    data: Object,
    from: 'shardId',
    to: 'shardId'
}

export default class ShardManager extends ShardingManager {
    constructor(filePath, options) {
        super(filePath, options)
    }

    /**
     * Get all guilds from Shard
     */
    get guilds() {
        return this.broadcastEval(client => client.guilds.cache)
    }

    /**
     * @param { Shard } shard 
     */
    shardCreate(shard) {
        shard.on('message', this.messageReceived.bind(this))
        shard.on('direct', this.redirect.bind(this))
        console.log(`Shard ${shard.id} was spawned.`)
    }

    /**
     * @param { messageType } message 
     */
    redirect(message) {
        const actions = {
            twitch: {
                updateStreamer: TwitchManager.updateStreamer
            }[message.actionType]
        }[message.action]

        if (!actions) return

        return actions(message)
    }

    /**
     * @param { messageType } message 
     */
    messageReceived(message) {
        if (!message || !message.action) return
        const shardOrigin = this.shards.get(message.to)
        if (!shardOrigin) return
        shardOrigin.emit('direct', message)
        return
    }
}