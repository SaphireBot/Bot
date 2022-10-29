import * as fs from 'fs'
import Mongoose from 'mongoose'
import Cache from './CacheManager.js'
import 'dotenv/config'
import { Models, SaphireClient as client } from '../index.js'
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
            Khetlyn: "428088706533031938"
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

    get Quiz() {
        return JSON.parse(fs.readFileSync('./JSON/quiz.json'))
    }

    get Wallpapers() {
        return JSON.parse(fs.readFileSync('./JSON/wallpaperanime.json'))
    }

    async animeIndications() {
        return await this.Indications.find({})
    }

    MongoConnect = async (client) => {

        return connect(process.env.DATABASE_LINK_CONNECTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
            .then(() => 'Database Connected')
            .catch(err => {
                console.log('Mongoose Database | FAIL!\n--> ' + err)
                client.destroy()
                return 'Database ERROR'
            })
    }

    add = async (userId, amount, message) => {

        if (!userId || isNaN(amount)) return

        if (message)
            return await this.User.updateOne(
                { id: userId },
                {
                    $inc: {
                        Balance: amount
                    },
                    $push: {
                        Transactions: {
                            $each: [{
                                time: `${Date.format(0, true)}`,
                                data: message
                            }],
                            $position: 0
                        }
                    }
                },
                { upsert: true }
            )

        return await this.User.updateOne(
            { id: userId },
            { $inc: { Balance: amount } },
            { upsert: true }
        )
    }

    subtract = async (userId, amount, message = undefined) => {

        if (!userId || isNaN(amount)) return

        if (message)
            await this.User.updateOne(
                { id: userId },
                {
                    $inc: { Balance: -amount },
                    $push: {
                        Transactions: {
                            $each: [{
                                time: `${Date.format(0, true)}`,
                                data: message
                            }],
                            $position: 0
                        }
                    }
                },
                { upsert: true }
            )

        return await this.User.updateOne(
            { id: userId },
            { $inc: { Balance: -amount } },
            { upsert: true }
        )
    }

    SetTimeout = async (userId, TimeoutRoute) => {
        return await this.User.updateOne(
            { id: userId },
            { [TimeoutRoute]: Date.now() },
            { upsert: true }
        )
    }

    pushUsersLotery = async (usersArray, clientId) => {
        return await this.Lotery.updateOne(
            { id: clientId },
            { $push: { Users: { $each: [...usersArray] } } }
        )
    }

    addItem = async (userId, ItemDB, amount) => {

        if (!userId || !ItemDB || isNaN(amount)) return

        return await this.User.updateOne(
            { id: userId },
            { $inc: { [ItemDB]: amount } },
            { upsert: true }
        )
    }

    addGamingPoint = async (userId, type, value = 1) => {

        if (!userId || !type || isNaN(value)) return

        return await this.User.updateOne(
            { id: userId },
            { $inc: { [`GamingCount.${type}`]: value } },
            { upsert: true }
        )
    }

    deleteReminders = async (idData, all = false) => {

        if (!idData) return null

        return all
            ? await this.Reminder.deleteMany({ userId: idData })
            : await this.Reminder.deleteOne({ id: idData })
    }

    subtractItem = async (userId, ItemDB, amount) => {

        if (!userId || !ItemDB || isNaN(amount)) return

        return await this.User.updateOne(
            { id: userId },
            { $inc: { [ItemDB]: -amount } },
            { upsert: true }
        )
    }

    updateUserData = async (userId, keyData, valueData) => {

        if (!userId || !keyData || !valueData) return

        return await this.User.updateOne(
            { id: userId },
            { [keyData]: valueData },
            { upsert: true }
        )
    }

    pushUserData = async (userId, keyData, dataToPush) => {

        if (!userId || !keyData || !dataToPush) return

        return await this.User.updateOne(
            { id: userId },
            { $push: { [keyData]: { $each: [dataToPush] } } },
            { upsert: true }
        )

    }

    pullUserData = async (userId, keyData, dataToPush) => {

        if (!userId || !keyData || !dataToPush) return

        return await this.User.updateOne(
            { id: userId },
            { $pull: { [keyData]: dataToPush } },
            { upsert: true }
        )
    }

    deleteGiveaway = async (DataId, GuildId, All = false) => {

        return All
            ? (async () => {
                await this.Guild.updateOne(
                    { id: GuildId },
                    { $unset: { Giveaways: 1 } }
                )
                await this.Cache.Giveaways.delete(`${client.shardId}.Giveaways.${GuildId}`)
            })()
            : (async () => {
                await this.Guild.updateOne(
                    { id: GuildId },
                    { $pull: { Giveaways: { MessageID: DataId } } },
                    { MessageID: DataId }
                )
                await this.Cache.Giveaways.pull(
                    `${client.shardId}.Giveaways.${GuildId}`,
                    data => data.MessageID === DataId
                )
            })()

    }

    /**
     * @user Discord User
     * @filter Mongoose Filter findOne Query
     * @returns Database's User Data or null if not found
     * @example await Database.getUser(interaction.user, 'Balance Transactions')
     */
    getUser = async ({ user, filter = '' }) => {

        if (!user || user.bot) return null

        const userData = await this.User.findOne({ id: user.id }, filter)

        if (!userData) {
            this.registerUser(user)
            return null
        }

        return userData
    }

    getGuild = async ({ guildId, filter = '' }) => {

        if (!guildId) return null

        const guildData = await this.Guild.findOne({ id: guildId }, filter)

        if (!guildData) {
            const allGuilds = await client.allGuildsData()
            const guild = allGuilds?.flat()?.find(g => g.id === guildId)
            this.registerServer(guild)
            return null
        }

        return guildData
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

    deleteUser = async (userId) => {
        client.databaseUsers = client.databaseUsers.filter(id => id !== userId)
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

        return await this.User.updateOne(
            { id: userId },
            { $unset: { [key]: 1 } }
        )
    }

    guildDelete = async (guildId, key) => {

        if (!guildId || !key) return

        return await this.Guild.updateOne(
            { id: guildId },
            { $unset: { [key]: 1 } }
        )
    }

    PushTransaction = async (userId, Frase) => {

        if (!userId || !Frase) return

        const userData = await this.User.findOne({ id: userId }, 'Balance')
        const balance = userData?.Balance || 0

        return await this.User.updateOne(
            { id: userId },
            {
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)} - ${balance}`,
                            data: `${Frase}`
                        }],
                        $position: 0
                    }
                }
            },
            { upsert: true }
        )
    }

    getUsers = async (usersIdInArray, filter) => {
        const data = await this.User.find({ id: { $in: usersIdInArray } }, filter)
        return data
    }

    registerUser = async (user) => {

        if (!user || user?.bot) return

        const u = await this.User.exists({ id: user.id })
        if (u || u?.id === user.id) return

        new this.User({ id: user.id }).save()
        client.databaseUsers.push(user.id)

        await this.User.updateOne(
            { id: user.id },
            {
                $unset: {
                    PrivateChannel: 1,
                    Walls: 1,
                    Perfil: 1,
                    Letters: 1,
                    Transactions: 1
                }
            },
            { upsert: true }
        )

        return
    }

    registerServer = async guild => {

        if (!guild || !guild?.id) return

        const g = await this.Guild.exists({ id: guild.id })

        if (g || g?.id === guild.id) return

        const emojis = JSON.parse(fs.readFileSync('./JSON/emojis.json'))

        await this.Guild.updateOne(
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
            { upsert: true }
        )

        const owner = await guild.fetchOwner().catch(() => null)

        return client.sendWebhook(
            process.env.WEBHOOK_DATABASE_LOGS,
            {
                username: "[Saphire] Saphire Database Logs",
                embeds: [{
                    color: client.green,
                    title: `${emojis.Loud} Servidor Adicionado`,
                    fields: [
                        {
                            name: 'Status',
                            value: `**Dono:** ${owner.user.tag || '`Not Found`'} *\`(${owner.user.id || '0'})\`*\n**Membros:** ${guild.memberCount}`
                        },
                        {
                            name: 'Register',
                            value: `O servidor ${guild.name} foi registrado com sucesso!`
                        }
                    ]
                }]
            }
        )

    }

    registerClient = async (clientId) => {

        const data = await this.Client.findOne({ id: clientId })
        if (data) return
        return new this.Client({ id: clientId }).save()
    }
}