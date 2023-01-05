import { ShardingManager } from 'discord.js'

/**
 * @type {ShardingManager.ShardingManagerOptions}
 */

export default class ShardManager extends ShardingManager {
    constructor(data) {
        super(data, { respawn: false })
    }

    /**
     * Get all guilds from Shard
     */
    get guilds() {
        return this.broadcastEval(client => client.guilds.cache)
    }
}