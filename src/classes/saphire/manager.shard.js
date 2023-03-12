import { ShardingManager } from 'discord.js'

/**
 * @type {ShardingManager.ShardingManagerOptions}
 */

export default class ShardManager extends ShardingManager {
    constructor(filePath) {
        super(filePath, { respawn: false, execArgv: process.execArgv })
    }

    /**
     * Get all guilds from Shard
     */
    get guilds() {
        return this.broadcastEval(client => client.guilds.cache)
    }
}