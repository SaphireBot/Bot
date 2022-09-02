import { Client, Collection } from 'discord.js'
import { ClientOptions } from '../../util/util.js'
import { Config as config } from '../../util/Constants.js'
import 'dotenv/config'
import slashCommand from '../../structures/handler/slashCommands.js'
import { Database, Discloud } from '../index.js'
import automaticSystems from '../../functions/update/index.js'
import * as TopGG from 'topgg-autoposter'
import GiveawayManager from '../../functions/update/giveaway/GiveawayManager.js'
import mercadopago from 'mercadopago'
import unhandledRejection from '../modules/errors/process/unhandledRejection.js'
import uncaughtException from '../modules/errors/process/uncaughtException.js'

const { AutoPoster } = TopGG

/**
 * Extensão do Discord.Client para melhor performance e praticidade
 */
export default new class SaphireClient extends Client {
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
         * @param Nothing
         * @returns Um array com todos os usuários de todas as Shards
         * @example [user1, user2, user3, user4, user5, user6]
         */
        this.allUsers = []

        /**
         * @param Nothing
         * @returns Um array com todos os serviddores de todas as Shards
         * @example [guild1, guild2, guild3, guild4, guild5, guild6]
         */
        this.allGuilds = []

        /**
         * @param Nothing
         * @returns Um array com todos os Ids de todos os usuários presentes no banco de dados
         * @example [id, id, id, id, id, id]
         */
        this.databaseUsers = []

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

        /**
         * @returns subdominio
         */
        this.subdomain = 'saphire'

        /**
         * @returns [command1, command2]
         */
        this.allCommands = []

        /**
         * @returns [adminId1, adminId2]
         */
        this.admins = []

        /**
         * @returns [modId1, modId2]
         */
        this.mods = []

        /**
         * @returns [staff1, staff2]
         */
        this.staff = []
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

        process.on('unhandledRejection', error => unhandledRejection(error))
        process.on('uncaughtException', (error, origin) => uncaughtException(error, origin))

        await super.login()
        const discloudResult = await Discloud.login()

        import('../../functions/global/prototypes.js')
        import('../../structures/events/index.js')
        import('../../api/app.js')

        this.shardId = this.shard.ids.at(-1) || 0

        mercadopago.configure({ access_token: process.env.MERCADO_PAGO_TOKEN })
        const databaseResponse = await Database.MongoConnect(this)
        const slashCommandsResponse = await slashCommand(this)

        await Database.Cache.clearTables(`${this.shardId}`)
        GiveawayManager.setGiveaways()
        await automaticSystems()
        return console.log(`[Shard ${this.shardId}] | ${databaseResponse} | ${discloudResult} | ${slashCommandsResponse} `)
    }

    /**
     * @param Nothing
     * @returns Um array com todos os servidores de todas as Shards em cada array
     * @example [[guild1, guild2, guild3], [guild4, guild5, guild6]]
     */
    async allGuildsData() {
        return await this.shard.broadcastEval(client => client.guilds.cache)
    }

    topGGAutoPoster() {
        if (this.user.id !== this.moonId) return
        return AutoPoster(process.env.TOP_GG_TOKEN, this)
    }

    async refreshStaff() {
        const clientData = await Database.Client.findOne({ id: this.user.id }, 'Administradores Moderadores')
        if (!clientData) return

        if (clientData.Administradores) this.admins = [...clientData.Administradores]
        if (clientData.Moderadores) this.mods = [...clientData.Moderadores]
        this.staff = [...this.admins, ...this.mods]
    }
}