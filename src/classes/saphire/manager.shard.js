import { ShardingManager } from 'discord.js'

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
}