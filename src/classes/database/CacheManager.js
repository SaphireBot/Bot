import { QuickDB as Cache } from 'quick.db'

export default new class CacheManager extends Cache {
    constructor() {
        super()
        this.General = new Cache({ filePath: "./cache/General.sqlite" })
        this.Polls = new Cache({ filePath: "./cache/Polls.sqlite" })
        this.WordleGame = new Cache({ filePath: "./cache/WordleGame.sqlite" })
        this.Client = new Cache({ filePath: "./cache/Client.sqlite" })
        this.Bet = new Cache({ filePath: "./cache/Bet.sqlite" })
        this.Pay = new Cache({ filePath: "./cache/Payment.sqlite" })
        this.Ranking = new Cache({ filePath: "./cache/Ranking.sqlite" })
        this.Blackjack = new Cache({ filePath: "./cache/Blackjack.sqlite" })
        this.Logomarca = new Cache({ filePath: "./cache/Logomarca.sqlite" })
        this.EmojiBetRescue = new Cache({ filePath: "./cache/EmojiBetRescue.sqlite" })
        this.Running = new Cache({ filePath: "./cache/Running.sqlite" })
        this.AfkSystem = new Cache({ filePath: "./cache/Afk.sqlite" })
        this.AmongUs = new Cache({ filePath: "./cache/Amongus.sqlite" })
        this.Commands = new Cache({ filePath: "./cache/Commands.sqlite" })
        this.Chat = new Cache({ filePath: "./cache/Chat.sqlite" })
        this.Connect = new Cache({ filePath: "./cache/Connect.sqlite" })
        this.Jokempo = new Cache({ filePath: "./cache/Jokempo.sqlite" })
        this.Multiplier = new Cache({ filePath: "./cache/Multiplier.sqlite" })
        this.Hangman = new Cache({ filePath: "./cache/Hangman.sqlite" })
    }

    async clearTables(shardId, count = 0) {
        try {
            await this.General.delete(shardId)
            await this.Polls.delete(shardId)
            await this.Logomarca.delete(shardId)
            await this.Running.delete(shardId)
            await this.General.delete('Looped')
            await this.General.set(`${shardId}.AudityLogsId`, [])
            await this.General.set(`${shardId}.lastClick`, [])
        } catch (err) {
            ++count
            if (count > 10) return
            setTimeout(() => this.clearTables(shardId, count), 1000)
        }

        return true
    }

}