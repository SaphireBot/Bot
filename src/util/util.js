import { GatewayIntentBits, Partials } from 'discord.js'
import { Database } from '../classes/index.js'
import * as fs from 'fs'
import { Config as config } from './Constants.js'

const SaphireClientOptions = {
    shards: 'auto',
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
    sweepers: {
        users: {
            filter: () => user => user.id !== config.ownerId,
            interval: 14400
        },
        bans: {
            filter: () => () => true,
            interval: 3600 // 1H
        },
        invites: {
            lifetime: 0,
            interval: 14400
        },
        guildMembers: {
            filter: () => () => true,
            interval: 14400
        },
        presences: {
            filter: () => () => true,
            interval: 14400
        },
        messages: {
            lifetime: 3600,
            interval: 3600
        },
        reactions: {
            filter: () => () => true,
            interval: 14400
        },
        stageInstances: {
            filter: () => () => true,
            interval: 14400
        },
        stickers: {
            filter: () => () => true,
            interval: 14400
        },
        threadMembers: {
            filter: () => () => true,
            interval: 14400
        },
        threads: {
            lifetime: 3600,
            interval: 14400
        },
        voiceStates: {
            filter: () => () => true,
            interval: 14400
        }
    },
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.User
    ],
    allowedMentions: { parse: ['users'] },
    closeTimeout: 6000,
    shardCount: 1,
    failIfNotExists: false,
    waitGuildTimeout: 20000
}

const Emojis = JSON.parse(fs.readFileSync('./JSON/emojis.json'))
const Gifs = JSON.parse(fs.readFileSync('./JSON/gifs.json'))
const Flags = JSON.parse(fs.readFileSync('./JSON/flags.json'))

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
                        time: `${Date.format(0, true)}`,
                        data: message || '`Not Found`'
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
    SaphireClientOptions as ClientOptions,
    Flags,
    Gifs,
    economy
}