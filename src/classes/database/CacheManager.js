import { QuickDB as Cache } from 'quick.db'

export default new class CacheManager extends Cache {
    constructor() {
        super({ filePath: 'cache.sqlite' })
        this.General = this.table('General')
        this.GameChannels = this.table('GameChannels')
        this.Polls = this.table('Polls')
        this.WordleGame = this.table('WordleGame')
        this.Client = this.table('Client')
        this.Bet = this.table('Bet')
        this.Pay = this.table('Payment')
        this.Ranking = this.table('Ranking')
        this.Blackjack = this.table('Blackjack')
        this.Logomarca = this.table('Logomarca')
        this.EmojiBetRescue = this.table('EmojiBetRescue')
        this.Running = this.table('Running')
        this.AfkSystem = this.table('Afk')
        this.AmongUs = this.table('Amongus')
        this.Commands = this.table('Commands')
        this.Chat = this.table('Chat')
        this.Connect = this.table('Connect')
        this.Jokempo = this.table('Jokempo')
        this.TempCall = this.table('TempCall')
    }

    async clearTables(shardId) {
        await this.General.delete(shardId)
        await this.Polls.delete(shardId)
        await this.Logomarca.delete(shardId)
        await this.Running.delete(shardId)
        await this.General.delete('Looped')
        await this.General.set(`${shardId}.AudityLogsId`, [])
        await this.General.set(`${shardId}.lastClick`, [])
        return true
    }

}