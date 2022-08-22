import { QuickDB as Cache } from 'quick.db'

export default new class CacheManager extends Cache {
    constructor() {
        super({ filePath: 'cache.sqlite' })
        this.General = this.table('General')
        this.GameChannels = this.table('GameChannels')
        this.Giveaways = this.table('Giveaways')
        this.WordleGame = this.table('WordleGame')
        this.Client = this.table('Client')
    }

    async clearTables(shardId) {
        await this.General.delete(shardId)
        await this.Giveaways.delete(shardId)
        return true
    }

}