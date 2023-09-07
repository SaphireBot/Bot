import * as fs from 'fs'
import Mongoose from 'mongoose'
import Cache from './CacheManager.js'
import 'dotenv/config'
import { GiveawayManager, Models, SaphireClient as client } from '../index.js'
import { socket } from '../../websocket/websocket.js'
const { connect } = Mongoose

/**
 * Classe central da Database
 */
export default new class Database extends Models {
    constructor() {
        super()
        this.Cache = Cache
        this.Prefixes = new Map()
        this.Names = {
            Rody: "451619591320371213",
            Gowther: "315297741406339083",
            Makol: "351903530161799178",
            Moana: "737238491842347098",
            Dspofu: "781137239194468403",
            Pepy: "830226550116057149",
            Lereo: "978659462602711101",
            San: "327496267007787008",
            Khetlyn: "428088706533031938",
            Yafyr: "435444989695229952",
            Andre: "648389538703736833",
            Pandinho: "1090693149778772088",
            Gorniaky: "395669252121821227",
            Mari: "704023863314350081"
        }
    }

    get BgLevel() {
        return JSON.parse(fs.readFileSync('./JSON/levelwallpapers.json'))
    }

    get Frases() {
        return JSON.parse(fs.readFileSync('./JSON/frases.json'))
    }

    get Characters() {
        return JSON.parse(fs.readFileSync('./JSON/characters.json'))
    }

    get Flags() {
        return JSON.parse(fs.readFileSync('./JSON/flags.json'))
    }

    get Logomarca() {
        return JSON.parse(fs.readFileSync('./JSON/logomarca.json'))
    }

    get Wallpapers() {
        return JSON.parse(fs.readFileSync('./JSON/wallpaperanime.json'))
    }

    async animeIndications() {
        return await this.Indications.find({})
    }

    async MongoConnect() {

        Mongoose.set("strictQuery", true)
        return await connect(process.env.DATABASE_LINK_CONNECTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
            .catch(err => {
                console.log('Mongoose Database | FAIL!\n--> ' + err)
                return process.exit(12)
            })
    }

    async add(userId, amount, message = undefined) {

        if (!userId || !amount || isNaN(amount)) return

        const data = {
            $inc: { Balance: amount }
        }

        if (message) {
            const transaction = {
                time: `${Date.format(0, true)}`,
                data: message
            }

            data.$push = {
                Transactions: {
                    $each: [transaction],
                    $position: 0
                }
            }

            socket?.send({
                type: "transactions",
                transactionsData: { value: amount, userId, transaction }
            })
        }

        return await this.User.findOneAndUpdate(
            { id: userId },
            data,
            { upsert: true, new: true }
        )
            .then(doc => this.saveUserCache(doc?.id, doc))
    }

    subtract = async (userId, amount, message = undefined) => {

        if (!userId || !amount || isNaN(amount)) return

        const data = {
            $inc: { Balance: -amount }
        }

        if (message) {

            const transaction = {
                time: `${Date.format(0, true)}`,
                data: message
            }

            socket?.send({
                type: "transactions",
                transactionsData: { value: amount, userId, transaction }
            })

            data.$push = {
                Transactions: {
                    $each: [transaction],
                    $position: 0
                }
            }
        }

        return await this.User.findOneAndUpdate(
            { id: userId },
            data,
            { upsert: true, new: true }
        )
            .then(doc => this.saveUserCache(doc?.id, doc))
    }

    SetTimeout = async (userId, TimeoutRoute) => {
        return await this.User.findOneAndUpdate(
            { id: userId },
            { [TimeoutRoute]: Date.now() },
            { upsert: true, new: true }
        )
            .then(doc => this.saveUserCache(doc?.id, doc))
    }

    pushUsersLotery = async (usersArray, clientId) => {
        return await this.Lotery.updateOne(
            { id: clientId },
            { $push: { Users: { $each: [...usersArray] } } }
        )
    }

    getPrefix(guildId) {
        return Array.from(this.Prefixes.get(guildId) || ["s!", "-"])
    }

    addItem = async (userId, ItemDB, amount) => {

        if (!userId || !ItemDB || isNaN(amount)) return

        return await this.User.findOneAndUpdate(
            { id: userId },
            { $inc: { [ItemDB]: amount } },
            { upsert: true, new: true }
        )
            .then(doc => this.saveUserCache(doc?.id, doc))
    }

    addGamingPoint = async (userId, type, value = 1) => {

        if (!userId || !type || isNaN(value)) return

        return await this.User.findOneAndUpdate(
            { id: userId },
            { $inc: { [`GamingCount.${type}`]: value } },
            { upsert: true, new: true }
        )
            .then(doc => this.saveUserCache(doc?.id, doc))
    }

    subtractItem = async (userId, ItemDB, amount) => {

        if (!userId || !ItemDB || isNaN(amount)) return

        return await this.User.findOneAndUpdate(
            { id: userId },
            { $inc: { [ItemDB]: -amount } },
            { upsert: true, new: true }
        )
            .then(doc => this.saveUserCache(doc?.id, doc))
    }

    updateUserData = async (userId, keyData, valueData) => {

        if (!userId || !keyData || !valueData) return

        return await this.User.findOneAndUpdate(
            { id: userId },
            { [keyData]: valueData },
            { upsert: true, new: true }
        )
            .then(doc => this.saveUserCache(doc?.id, doc))
    }

    pushUserData = async (userId, keyData, dataToPush) => {

        if (!userId || !keyData || !dataToPush) return

        return await this.User.findOneAndUpdate(
            { id: userId },
            { $push: { [keyData]: { $each: [dataToPush] } } },
            { upsert: true, new: true }
        )
            .then(doc => this.saveUserCache(doc?.id, doc))

    }

    pullUserData = async (userId, keyData, dataToPush) => {

        if (!userId || !keyData || !dataToPush) return

        return await this.User.findOneAndUpdate(
            { id: userId },
            { $pull: { [keyData]: dataToPush } },
            { upsert: true, new: true }
        )
            .then(doc => this.saveUserCache(doc?.id, doc))
    }

    saveGuildCache(guildId, data) {
        if (!guildId || !data) return
        return socket?.send({ type: "updateCache", to: "guild", data: [data] })
    }

    saveUserCache(userId, data) {
        if (!userId || !data) return
        return socket?.send({ type: "updateCache", to: "user", data: [data] })
    }

    deleteGiveaway = async (MessageID, GuildId, All = false, byChannelId) => {
        if (!GuildId) return
        if (byChannelId) return this.deleteAllGiveawaysIntoThisChannel(GuildId, byChannelId)
        if (All) this.deleteAllGiveawayFromThisGuild(GuildId)

        if (!MessageID) return

        delete GiveawayManager.giveaways[MessageID]
        delete GiveawayManager.awaiting[MessageID]
        delete GiveawayManager.toDelete[MessageID]

        return await this.Guild.findOneAndUpdate(
            { id: GuildId },
            { $pull: { Giveaways: { MessageID } } },
            { new: true }
        )
            .then(data => this.saveGuildCache(data.id, data))

    }

    async deleteAllGiveawayFromThisGuild(GuildId) {

        for (const giveaway of Object.values(GiveawayManager.giveaways))
            if (giveaway.GuildId == GuildId) delete GiveawayManager.giveaways[giveaway.MessageID]

        for (const giveaway of Object.values(GiveawayManager.awaiting))
            if (giveaway.GuildId == GuildId) delete GiveawayManager.awaiting[giveaway.MessageID]

        for (const giveaway of Object.values(GiveawayManager.toDelete))
            if (giveaway.GuildId == GuildId) delete GiveawayManager.toDelete[giveaway.MessageID]

        return await this.Guild.findOneAndUpdate({ id: GuildId }, { $unset: { Giveaways: 1 } }, { new: true, upsert: true })
            .then(data => this.saveGuildCache(data.id, data))
    }

    async deleteAllGiveawaysIntoThisChannel(GuildId, byChannelId) {

        for (const giveaway of Object.values(GiveawayManager.giveaways))
            if (giveaway.ChannelId == byChannelId) delete GiveawayManager.giveaways[giveaway.MessageID]

        for (const giveaway of Object.values(GiveawayManager.awaiting))
            if (giveaway.ChannelId == byChannelId) delete GiveawayManager.awaiting[giveaway.MessageID]

        for (const giveaway of Object.values(GiveawayManager.toDelete))
            if (giveaway.ChannelId == byChannelId) delete GiveawayManager.toDelete[giveaway.MessageID]

        return await this.Guild.findOneAndUpdate({ id: GuildId }, { $pull: { Giveaways: { ChannelId: byChannelId } } }, { new: true, upsert: true })
            .then(data => this.saveGuildCache(data.id, data))
    }

    /**
     * @param { DiscordUserID } userId
     */
    async getUser(userId) {

        if (!userId) return null

        let data = await socket?.timeout(1000).emitWithAck("getCache", { id: userId, type: "user" }).catch(() => null)

        if (!data) {
            data = await this.User.findOne({ id: userId })

            if (!data) {
                const user = await client.users.fetch(userId).catch(() => null)
                if (!user || user?.bot) return null
                data = await this.registerUser(user)
                if (!data) return null
            }

            socket?.send({ type: "updateCache", to: "user", data: [data] })
        }

        return data
    }

    async getUsers(usersIdInArray) {

        if (!usersIdInArray?.length) return []

        let data = await socket?.timeout(1500).emitWithAck("getMultipleCache", { ids: usersIdInArray, type: "user" }).catch(() => [])

        if (!data?.length !== usersIdInArray.length) {
            data = await this.User.find({ id: { $in: usersIdInArray } })
            if (!data?.length) return []
            socket?.send({ type: "updateCache", to: "user", data: [data] })
        }

        return data
    }

    async getGuild(guildId) {

        if (!guildId) return null

        let data = await socket?.timeout(1000).emitWithAck("getCache", { id: guildId, type: "guild" }).catch(() => null)

        if (!data) {
            data = await this.Guild.findOne({ id: guildId })
            if (!data) return null
            socket?.send({ type: "updateCache", to: "guild", data: [data] })
        }

        return data
    }

    async getGuilds(guildsId) {

        if (!guildsId?.length) return []

        let data = await socket
            ?.timeout(1500)
            .emitWithAck("getMultipleCache", { ids: guildsId, type: "guild" })
            .catch(() => [])

        if (data?.length !== guildsId.length) {
            data = await this.Guild.find({ id: { $in: guildsId } })
            if (!data) return []

            socket?.send({ type: "updateCache", to: "guild", data: [data] })
        }

        return data
    }

    async deleteUser(userId) {
        socket?.send({ type: "deleteCache", id: userId, to: "user" })
        return await this.User.deleteMany({ id: userId })
    }

    async deleteGuild(guildId) {
        socket?.send({ type: "deleteCache", id: guildId, to: "guild" })
        return await this.Guild.deleteMany({ id: guildId })
    }

    addLotery = async (value, clientId) => {

        if (!value || isNaN(value)) return

        return await this.Lotery.updateOne(
            { id: clientId },
            { $inc: { Prize: value } },
            { upsert: true }
        )

    }

    delete = async (userId, key) => {

        if (!userId || !key) return

        return await this.User.findOneAndUpdate(
            { id: userId },
            { $unset: { [key]: 1 } },
            { upsert: true, new: true }
        )
            .then(doc => this.saveUserCache(doc?.id, doc))
    }

    guildDelete = async (guildId, key) => {

        if (!guildId || !key) return

        return await this.Guild.findOneAndUpdate(
            { id: guildId },
            { $unset: { [key]: 1 } },
            { new: true }
        )
            .then(data => this.saveGuildCache(data.id, data))
    }

    PushTransaction = async (userId, prhase, value) => {

        if (!userId || !prhase || !value) return

        const transaction = {
            time: `${Date.format(0, true)}`,
            data: `${prhase}`
        }

        socket?.send({
            type: "transactions",
            transactionsData: { value, userId, transaction }
        })

        return await this.User.findOneAndUpdate(
            { id: userId },
            {
                $push: {
                    Transactions: {
                        $each: [transaction],
                        $position: 0
                    }
                }
            },
            { upsert: true, new: true }
        )
            .then(doc => this.saveUserCache(doc?.id, doc))
    }

    async refreshUsersData(usersId) {
        if (!usersId || !usersId.length) return
        const data = await this.User.find({ id: { $in: usersId } })
        socket?.send({ type: "updateCache", to: "user", data: [data] })
        return
    }

    async registerUser(user) {

        if (!user || !user?.id || user?.bot) return

        const u = await this.User.exists({ id: user.id })
        if (u || u?.id === user.id) return

        new this.User({ id: user.id }).save()

        return await this.User.findOneAndUpdate(
            { id: user.id },
            {
                $unset: {
                    Walls: 1,
                    Perfil: 1,
                    Transactions: 1
                }
            },
            { upsert: true, new: true }
        )
            .then(doc => {
                this.saveUserCache(user.id, doc)
                return doc
            })
    }

    registerServer = async guild => {

        if (!guild || !guild?.id) return

        const g = await this.Guild.exists({ id: guild.id })

        if (g || g?.id === guild.id) return

        await this.Guild.findOneAndUpdate(
            { id: guild.id },
            {
                $unset: {
                    Blockchannels: 1,
                    ReactionRole: 1,
                    LockdownChannels: 1,
                    CommandBlocks: 1,
                    AfkSystem: 1,
                    Autorole: 1,
                    Giveaways: 1,
                    Polls: 1
                }
            },
            { upsert: true, new: true }
        )
            .then(data => this.saveGuildCache(data.id, data))

        return;
    }

    registerClient = async (clientId) => {
        const exists = await this.Client.exists({ id: clientId })
        if (exists) return
        return new this.Client({ id: clientId }).save()
    }
}
