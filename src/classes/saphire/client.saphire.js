import 'dotenv/config'
import { Client, Collection, Guild, Routes, messageLink } from 'discord.js'
import { ClientOptions, Emojis as e } from '../../util/util.js'
import { Config as config } from '../../util/Constants.js'
import { Database, Discloud } from '../index.js'
import * as TopGG from 'topgg-autoposter'
import axios from 'axios'

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
         * @returns Nova coleção extendida do Map
         */
        this.slashCommands = new Collection()

        /**
         * @returns Command name and your id [array]
         */
        this.slashCommandsData = []

        /**
         * @returns Uma string com dados da atualização
         */
        this.restart = null

        /**
         * @param Nothing
         * @returns Um array com todos os usuários de todas as Shards
         * @example [user1, user2, user3, user4, user5, user6]
         */
        this.allUsers = []

        /**
         * @param Nothing
         * @returns Um array com todos os servidores de todas as Shards
         * @example [guild1, guild2, guild3, guild4, guild5, guild6]
         */
        this.allGuilds = []

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
         * @returns [adminId1, adminId2]
         */
        this.admins = [config.ownerId]

        /**
         * @returns [modId1, modId2]
         */
        this.mods = [config.ownerId]

        /**
         * @returns [staff1, staff2]
         */
        this.staff = [config.ownerId]

        /**
         * @retuns [FanartsObject]
         */
        this.fanarts = []

        /**
         * @returns Número de interações criadas após inicialização do client
         */
        this.interactions = 0
        this.messages = 0

        /**
         * @returns Heartbeat
         */
        this.Heartbeat = 0

        /**
         * @returns Array com todas as cantadas do banco de dados
         */
        this.cantadas = []

        /**
         * @returns Conteúdo do client no banco de dados
         */
        this.clientData = {}

        /**
         * @returns Array com todos os memes aprovados do banco de dados
         */
        this.MemesApproved = []

        /**
         * @returns Array com todos os memes não aprovados do banco de dados
         */
        this.MemesNotApproved = []

        /**
         * @returns Nome do client's cluster
         */
        this.clusterName = "Bellatrix" // 30% Pronto

        /**
         * @returns Array com todos os canais em jogo
         */
        this.chatsInGame = []

        /**
         * @returns Todos os animes registrados no banco de dados
         */
        this.animes = []

        /**
         * @returns Tempo restante em millisegundos para reinicio da aplicação
         */
        this.timeRemaingToRestart = 0

        /**
         * @returns Next 02:00am [new Date().valueOf()]
         */
        this.twoAm = 0

        /**
         * @retuns Tempo primário do uptime
         */
        this.uptimeAllTime = {
            primary: 0,
            accumulate: 0
        }

    }

    /**
     * @param Nothing
     * @returns Um array com todos os servidores de todas as Shards em cada array
     * @example [[guild1, guild2, guild3], [guild4, guild5, guild6]]
     */
    async allGuildsData() {
        return await this.shard.broadcastEval(client => client.guilds.cache)
    }

    async setCantadas() {
        const allCantadas = await Database.Cantadas.find({})
        if (!allCantadas || !allCantadas.length) return

        this.cantadas = allCantadas
        return
    }

    async setMemes() {
        const allMemes = await Database.Memes.find({})
        if (!allMemes || !allMemes.length) return

        this.MemesApproved = allMemes.filter(meme => meme.approved)
        this.MemesNotApproved = allMemes.filter(meme => !meme.approved)
        return
    }

    topGGAutoPoster() {
        if (this.user.id !== this.moonId) return
        return AutoPoster(process.env.TOP_GG_TOKEN, this, { interval: 1000 * 60 * 15 })
    }

    async refreshStaff() {
        this.clientData = await Database.Client.findOne({ id: this.user.id })
        if (!this.clientData) return

        if (this.clientData.Administradores) this.admins = [...this.clientData.Administradores]
        if (this.clientData.Moderadores) this.mods = [...this.clientData.Moderadores]
        this.staff = [...this.admins, ...this.mods]

        if (!this.clientData?.uptime?.primary) {
            await Database.Client.updateOne(
                { id: this.user.id },
                { $set: { 'uptime.primary': new Date() }, $inc: { 'uptime.accumulate': 10000 } },
                { upsert: true }
            )
        }

        this.uptimeAllTime.accumulate = this.clientData?.uptime?.accumulate || 0
        this.uptimeAllTime.primary = this.clientData?.uptime?.primary || new Date()

        return
    }

    async sendWebhook(webhookUrl, data) {

        return await axios.post(
            process.env.ROUTE_WEBHOOK_SENDER,
            {
                webhookUrl,
                ...data
            },
            {
                headers: {
                    authorization: process.env.WEBHOOK_SENDER_AUTHORIZATION
                }
            }
        )
            .then(() => true)
            .catch(err => err)
    }

    async getGuild(guildId, newGuild) {

        const guildData = await axios.get(
            `https://discord.com/api/v10/guilds/${guildId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bot ${process.env.DISCORD_TOKEN}`
                }
            }
        )
            .then(g => g.data)
            .catch(() => null)

        if (!guildData) return null

        if (newGuild)
            return new Guild(this, guildData)
    }

    calculateReload() {
        const date = new Date()
        if (date.getHours() >= 2) date.setDate(date.getDate() + 1)
        date.setHours(2, 0, 0, 0)
        const twoAm = date.valueOf()
        const timeRemaing = twoAm - Date.now()
        this.timeRemaingToRestart = timeRemaing
        this.twoAm = twoAm
        if (this.user.id == this.canaryId) return
        return setTimeout(() => this.reload(), timeRemaing)
    }

    async reload() {
        this.restart = `${e.Loading} | Reinicialização Automática Programada.`
        await Discloud.apps.restart('saphire').catch(() => { })
        return
    }

    async getUser(userId) {
        return await this.rest.get(Routes.user(userId))
            .then(value => {
                if (!value) return null
                if (value.id == this.user.id) return null
                return {
                    id: value?.id,
                    username: value?.username,
                    discriminator: value?.discriminator,
                    tag: `${value?.username}#${value?.discriminator}`,
                    avatar: value?.avatar
                }
            })
            .catch(() => null)
    }

    async getMessageUrl(channelId, messageId) {
        return await this.rest.get(Routes.channelMessage(channelId, messageId))
            .then(() => messageLink(channelId, messageId))
            .catch(() => null)
    }
}