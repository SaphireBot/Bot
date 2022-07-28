import * as fs from 'fs'
import Mongoose from 'mongoose'
import Cache from './CacheManager.js'
import 'dotenv/config'
import { Config as config } from '../../util/Constants.js'
import { Models, SaphireClient as client } from '../index.js'

const { connect } = Mongoose

/**
 * Classe central da Database
 */
class Database extends Models {
    constructor() {
        super()
        this.BgLevel = JSON.parse(fs.readFileSync('./src/JSON/levelwallpapers.json'))
        this.Frases = JSON.parse(fs.readFileSync('./src/JSON/frases.json'))
        this.Characters = JSON.parse(fs.readFileSync('./src/JSON/characters.json'))
        this.Flags = JSON.parse(fs.readFileSync('./src/JSON/flags.json'))
        this.Logomarca = JSON.parse(fs.readFileSync('./src/JSON/logomarca.json'))
        this.Quiz = JSON.parse(fs.readFileSync('./src/JSON/quiz.json'))
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

    MongoConnect = async (client) => {

        try {
            await connect(process.env.MONGODB_LINK_CONNECTION, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })

            return 'Database Connection'
        } catch (err) {
            console.log('Mongoose Database | FAIL!\n--> ' + err)
            client.destroy()
            return 'Database ERROR'
        }
    }

    add = async (userId, amount) => {

        if (!userId || isNaN(amount)) return

        return await this.User.updateOne(
            { id: userId },
            { $inc: { Balance: amount } },
            { upsert: true }
        )
    }

    subtract = async (userId, amount) => {

        if (!userId || isNaN(amount)) return

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

    deleteGiveaway = async (DataId, All = false) => {

        if (!DataId) return

        return All
            ? await this.Giveaway.deleteMany({ GuildId: DataId })
            : await this.Giveaway.deleteOne({ MessageID: DataId })

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

    deleteUser = async (userId) => await this.User.deleteOne({ id: userId })

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
            { $push: { Transactions: { $each: [{ time: `${Date.format(0, true)} - ${balance}`, data: `${Frase}` }], $position: 0 } } },
            { upsert: true }
        )
    }

    getUsers = async (usersIdInArray, filter) => {
        const data = await this.User.find({ id: { $in: usersIdInArray } }, filter)
        return data
    }

    registerUser = async (user) => {

        if (!user || user?.bot) return

        const u = await this.User.findOne({ id: user.id })
        if (u || u?.id === user.id) return

        new this.User({ id: user.id }).save()

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

        const g = await this.Guild.findOne({ id: guild.id })

        if (g || g?.id === guild.id) return

        const emojis = JSON.parse(fs.readFileSync('./src/JSON/emojis.json'))

        await this.Guild.updateOne(
            { id: guild.id },
            {
                $unset: {
                    Blockchannels: 1,
                    ReactionRole: 1,
                    LockdownChannels: 1,
                    CommandBlocks: 1,
                    AfkSystem: 1,
                    Autorole: 1
                }
            },
            { upsert: true }
        )

        const channel = await client.channels.fetch(config.LogChannelId)
        const fetchWebhook = await channel.fetchWebhooks()
        const webhook = fetchWebhook.find(web => web.name === 'Saphire Database Logs')

        if (!webhook) return

        const owner = await guild.fetchOwner()

        return await webhook.send({
            embeds: [{
                color: client.green,
                title: `${emojis.Loud} Servidor Adicionado`,
                fields: [
                    {
                        name: 'Status',
                        value: `**Dono:** ${owner.user.tag} *\`(${owner.user.id})\`*\n**Membros:** ${guild.memberCount}`
                    },
                    {
                        name: 'Register',
                        value: `O servidor ${guild.name} foi registrado com sucesso!`
                    }
                ]
            }]
        }).catch(console.log)

    }

    registerClient = async (clientId) => {

        const data = await this.Client.findOne({ id: clientId })
        if (data) return
        return new this.Client({ id: clientId }).save()
    }

    async clearCache() {
        return await this.Client.updateOne(
            { id: client.user.id },
            { $unset: { Cache: 1 } }
        )
    }
}

export default new Database()