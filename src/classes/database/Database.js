import * as fs from 'fs'
import Mongoose from 'mongoose'
import Cache from './CacheManager.js'
import 'dotenv/config'
import { GiveawayManager, Models, SaphireClient as client } from '../index.js'
import { Collection } from 'discord.js'
const { connect } = Mongoose

/**
 * Classe central da Database
 */
export default new class Database extends Models {
    constructor() {
        super()
        this.Cache = Cache
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
            Pandinho: "369810325022834688",
            Gorniaky: "395669252121821227",
            Mari: "704023863314350081"
        }
        this.guildData = new Collection()
        this.userData = new Collection()
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

    async loadGuilds() {

        const guildsData = await this.Guild.find()

        for (const guild of guildsData)
            this.guildData.set(guild.id, guild)

        return
    }

    async add(userId, amount, message = undefined) {

        if (!userId || !amount || isNaN(amount)) return

        const data = {
            $inc: { Balance: amount }
        }

        if (message)
            data.$push = {
                Transactions: {
                    $each: [{
                        time: `${Date.format(0, true)}`,
                        data: message
                    }],
                    $position: 0
                }
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

        if (message)
            data.$push = {
                Transactions: {
                    $each: [{
                        time: `${Date.format(0, true)}`,
                        data: message
                    }],
                    $position: 0
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
        this.guildData.set(guildId, data)
        return
    }

    saveUserCache(userId, data) {
        if (!userId || !data) return
        this.userData.set(userId, data)
        return
    }

    deleteGiveaway = async (MessageID, GuildId, All = false, byChannelId) => {
        if (!GuildId) return
        if (byChannelId) return deleteAllGiveawaysIntoThisChannel(this.Guild)
        if (All) deleteAll(this.Guild)

        if (!MessageID) return

        const index = {
            giveaways: GiveawayManager.giveaways.findIndex(gw => gw?.MessageID == MessageID),
            awaiting: GiveawayManager.awaiting.findIndex(gw => gw?.MessageID == MessageID),
            toDelete: GiveawayManager.toDelete.findIndex(gw => gw?.MessageID == MessageID),
        }

        if (index.giveaways >= 0) GiveawayManager.giveaways.splice(index.giveaways, 1)
        if (index.awaiting >= 0) GiveawayManager.awaiting.splice(index.awaiting, 1)
        if (index.toDelete >= 0) GiveawayManager.toDelete.splice(index.toDelete, 1)

        return await this.Guild.findOneAndUpdate(
            { id: GuildId },
            { $pull: { Giveaways: { MessageID } } },
            { new: true }
        )
            .then(data => this.saveGuildCache(data.id, data))

        async function deleteAll(GuildModel) {
            GiveawayManager.giveaways = GiveawayManager.giveaways.filter(gw => gw?.GuildId != GuildId)
            GiveawayManager.awaiting = GiveawayManager.awaiting.filter(gw => gw?.GuildId != GuildId)
            GiveawayManager.toDelete = GiveawayManager.toDelete.filter(gw => gw?.GuildId != GuildId)
            return await GuildModel.findOneAndUpdate({ id: GuildId }, { $unset: { Giveaways: 1 } }, { new: true })
                .then(data => this.saveGuildCache(data.id, data))
        }

        async function deleteAllGiveawaysIntoThisChannel(GuildModel) {
            GiveawayManager.giveaways = GiveawayManager.giveaways.filter(gw => gw?.channelId != byChannelId)
            GiveawayManager.awaiting = GiveawayManager.awaiting.filter(gw => gw?.channelId != byChannelId)
            GiveawayManager.toDelete = GiveawayManager.toDelete.filter(gw => gw?.channelId != byChannelId)
            return await GuildModel.findOneAndUpdate({ id: GuildId }, { $pull: { Giveaways: { ChannelId: byChannelId } } }, { new: true })
                .then(data => this.saveGuildCache(data.id, data))
        }
    }

    /**
     * @param { DiscordUserID } userId
     */
    async getUser(userId) {

        if (!userId) return null

        let data = this.userData.get(userId)

        if (!data) {
            data = await this.User.findOne({ id: userId })

            if (!data) {
                const user = await client.users.fetch(userId).catch(() => null)
                if (!user || user?.bot) return null
                data = await this.registerUser(user)
                if (!data) return null
                this.userData.set(userId, data)
            }
        }

        return data
    }

    async getGuild(guildId) {

        if (!guildId) return null

        let data = this.guildData.get(guildId)

        if (!data) {
            data = await this.Guild.findOne({ id: guildId })
            if (!data) return null
            this.guildData.set(data.id, data)
        }

        return data
    }

    registerChannelControl = (pullOrPush = '', where = '', channelId = '') => {

        if (!pullOrPush || !where || !channelId) return

        // const data = this.Cache
        const data = client.cache.get('gamesChannels')

        pullOrPush === 'push'
            ? data?.GameChannels[where].push(channelId)
            : data?.GameChannels[where].splice(data?.GameChannels[where]?.indexOf(channelId), 1)

        return fs.writeFile("cache.json", JSON.stringify(data))
    }

    async deleteUser(userId) {
        delete this.userData.delete(userId)
        return await this.User.deleteOne({ id: userId })
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

    PushTransaction = async (userId, Frase) => {

        if (!userId || !Frase) return

        return await this.User.findOneAndUpdate(
            { id: userId },
            {
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)}`,
                            data: `${Frase}`
                        }],
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
        const usersData = await this.User.find({ id: { $in: usersId } })
        for (const data of usersData) this.saveUserCache(data?.id, data)
        return
    }

    async getUsers(usersIdInArray) {

        if (!usersIdInArray || !usersIdInArray.length) return []

        let data = []

        for (const userId of usersIdInArray) {
            const cached = this.userData.get(userId)
            if (cached) data.push(data)
        }

        if (data.length == usersIdInArray.length)
            return data

        data = await this.User.find({ id: { $in: usersIdInArray } })

        for (const d of data)
            this.userData.set(d?.id, d)

        return data
    }

    async registerUser(user) {

        if (!user || !user?.id || user?.bot) return

        const u = this.userData.has(user.id) || await this.User.exists({ id: user.id })
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
        return
    }

    registerServer = async guild => {

        if (!guild || !guild?.id) return

        const g = this.guildData.has(guild.id) || await this.Guild.exists({ id: guild.id })

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
        const data = await this.Client.findOne({ id: clientId })
        if (data) return
        return new this.Client({ id: clientId }).save()
    }
}
