import { Client, Collection } from 'discord.js'
import { ClientOptions } from '../../util/util.js'
import { Config as config } from '../../util/Constants.js'
import 'dotenv/config'
import slashCommand from '../../structures/handler/slashCommands.js'
import { Database } from '../index.js'
import automaticSystems from '../../functions/update/index.js'
import TopGGAutoposter from 'topgg-autoposter'
import GiveawayManager from '../../functions/update/giveaway/GiveawayManager.js'
import mercadopago from 'mercadopago'

const { AutoPost } = TopGGAutoposter

/**
 * Extensão do Discord.Client para melhor performance e facilidade
 */

class SaphireClient extends Client {
    constructor() {
        super(ClientOptions)

        /**
         * @returns BLUE - Hexadecimal
         */
        this.blue = 0x246FE0

        /**
         * @returns RED - Hexadecimal
         */
        this.red = 0xED4245

        /**
         * @returns GREEN - Hexadecimal
         */
        this.green = 0x57F287

        /**
         * @returns Prefixo padrão "-"
         */
        this.prefix = config.prefix

        /**
         * @returns Nova coleção extendida do Map
         */
        this.slashCommands = new Collection()

        /**
         * @returns Shard Client ID
         */
        this.shardId = 0

        /**
         * @returns Saphire Moon ID
         */
        this.moonId = '912509487984812043'


        /**
         * @returns Saphire Canary ID
         */
        this.canaryId = '930985650549841940'
    }

    /**
     * @param Nothing
     * Leitura dos prototypes e eventos
     * 
     * Login do Client e Database
     * 
     * Registro dos SlashCommands
     * 
     * Shard 0 - Exclusão do Cache
     * 
     * Console Log da Shard
     */
    async start() {
        await super.login()
        import('../../functions/global/prototypes.js')
        import('../../structures/events/index.js')
        import('../../api/app.js')

        this.shardId = this.shard.ids.at(-1) || 0

        mercadopago.configure({ access_token: process.env.MERCADO_PAGO_TOKEN })
        const databaseResponse = await Database.MongoConnect(this)
        const slashCommandsResponse = await slashCommand(this)
        automaticSystems()

        await Database.Cache.clearTables(`${this.shardId}`)
        GiveawayManager.setGiveaways()
        return console.log(`[Shard ${this.shardId}] | ${databaseResponse} | ${slashCommandsResponse} | Event Ready | OK!`)
    }

    /**
     * @param Nothing
     * @returns Um array com todos os servidores de todas as Shards em cada array
     * @example [[guild1, guild2, guild3], [guild4, guild5, guild6]]
     */
    async allGuildsData() {
        return await this.shard.broadcastEval(client => client.guilds.cache)
    }

    /**
     * @param Nothing
     * @returns Um array com todos os usuários de todas as Shards em cada array
     * @example [[user1, user2, user3], [user4, user5, user6]]
     */
    async allUsersData() {
        return await this.shard.broadcastEval(client => client.users.cache)
    }

    topGGAutoPoster() {
        if (this.user.id !== this.moonId) return
        return AutoPost(process.env.TOP_GG_TOKEN, this)
    }
}

export default new SaphireClient