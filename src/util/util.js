import DiscordJS, { GatewayIntentBits, Partials } from 'discord.js'
import { Database } from '../classes/index.js'
import * as fs from 'fs'

/**
 * @type {DiscordJS.ClientOptions} 
 */

const ClientOptions = {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildScheduledEvents
    ],
    allowedMentions: { parse: ['users'] },
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.User
    ]
}

const Emojis = JSON.parse(fs.readFileSync('./src/JSON/emojis.json'))
const Gifs = JSON.parse(fs.readFileSync('./src/JSON/gifs.json'))
const Flags = JSON.parse(fs.readFileSync('./src/JSON/flags.json'))

const economy = {
    async add(userId, amount, message) {

        if (!userId || !amount || isNaN(amount)) return

        const saveData = [
            { id: userId },
            {
                $inc: {
                    Balance: parseInt(amount)
                }
            },
            {
                upsert: true,
                new: true,
                fields: 'Balance'
            }
        ]

        if (message)
            saveData[1].$push = {
                Transactions: {
                    $each: [{
                        time: `${Date.format(0, true)} - Error Prize`,
                        data: message
                    }],
                    $position: 0
                }
            }

        const data = await Database.User.findOneAndUpdate(...saveData)

        return data
    },
    async sub(userId, amount) {

        if (!userId || !amount || isNaN(amount)) return

        const data = await Database.User.findOneAndUpdate(
            { id: userId },
            {
                $inc: {
                    Balance: -parseInt(amount)
                }
            },
            {
                upsert: true,
                new: true,
                fields: 'Balance'
            }
        )

        return data
    }
}

export {
    Emojis,
    ClientOptions,
    Flags,
    Gifs,
    economy
}