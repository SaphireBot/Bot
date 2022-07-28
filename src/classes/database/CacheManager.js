import { QuickDB as Cache } from 'quick.db'

export default new class CacheManager extends Cache {
    constructor() {
        super({ filePath: 'cache.sqlite' })
        this.GameChannels = this.table('GameChannels')
    }

}