import { ButtonStyle, GatewayIntentBits, Partials } from 'discord.js'
import { SaphireClient as client } from '../classes/index.js'
import { createRequire } from 'node:module'
import Byte from './Bytes.js'
const require = createRequire(import.meta.url)

const SaphireClientOptions = {
    // shards: [],
    closeTimeout: 2000,
    // shardCount: 1,
    // makeCache: (),
    allowedMentions: { parse: ['users', 'roles'] },
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.User
    ],
    failIfNotExists: false,
    // presence: {
    //     status: "idle",
    //     afk: false,
    //     // activities: [{ type: ActivityType.Watching, name: "Acordando..." }],
    //     // shardId: [0, 1, 2, 3, 4, 5, 6, 7]
    // },
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageTyping
        // GatewayIntentBits.GuildPresences
    ],
    waitGuildTimeout: 20000,
    sweepers: {
        autoModerationRules: {
            interval: 1000 * 60 * 5,
            filter: () => true
        },
        // applicationCommands: {
        //     interval: 0,
        //     filter: () => {}
        // },
        bans: {
            interval: 1000 * 60 * 5,
            filter: () => true
        },
        // emojis: {
        //     interval: 0,
        //     filter: () => {}
        // },
        invites: {
            interval: 1000 * 60 * 5,
            lifetime: 1000 * 60 * 60,
            filter: () => true
        },
        guildMembers: {
            interval: 1000 * 60 * 5,
            filter: () => true
        },
        messages: {
            interval: 1000 * 60 * 5,
            // lifetime: 1000 * 60 * 60,
            filter: () => true
        },
        // presences: {
        //     interval: 0,
        //     filter: () => {}
        // },
        reactions: {
            interval: 1000 * 60 * 5,
            filter: () => true
        },
        stageInstances: {
            interval: 1000 * 60 * 5,
            filter: () => true
        },
        stickers: {
            interval: 1000 * 60 * 5,
            filter: () => true
        },
        threadMembers: {
            interval: 1000 * 60 * 5,
            filter: () => true
        },
        threads: {
            interval: 1000 * 60 * 5,
            // lifetime: 0,
            filter: () => true
        },
        // users: {
        //     interval: 1000 * 60 * 5,
        //     filter: () => true
        // },
        voiceStates: {
            interval: 1000 * 60 * 5,
            filter: () => true
        },
    },
    // ws: {
        // large_threshold: 50,
        // version: 10,
        // buildStrategy: () => { },
        // buildIdentifyThrottler : (manager) => { }
    // },
    // rest: { },
    // jsonTransformer: () => { }
}

const Emojis = require('../../JSON/emojis.json')
const Gifs = require('../../JSON/gifs.json')
const Flags = require('../../JSON/flags.json')
const Words = require('../../JSON/frases.json')

const Buttons = {
    QuizQuestionsFirstPage: (userId) => {
        const buttons = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Jogar",
                        emoji: Emojis.amongusdance,
                        custom_id: JSON.stringify({ c: 'quiz', src: 'play' }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Personalizar',
                        emoji: '🖌️',
                        custom_id: JSON.stringify({ c: 'quiz', src: 'custom' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Créditos',
                        emoji: Emojis.jumpStar,
                        custom_id: JSON.stringify({ c: 'quiz', src: 'credits', userId }),
                        style: ButtonStyle.Primary
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Sugerir uma nova categoria',
                        emoji: '📨',
                        custom_id: JSON.stringify({ c: 'quiz', src: 'newCategory' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Sugerir uma nova pergunta',
                        emoji: '📨',
                        custom_id: JSON.stringify({ c: 'quiz', src: 'newQuestion' }),
                        style: ButtonStyle.Primary
                    }
                ]
            }
        ]

        if (client.staff.includes(userId))
            buttons[0].components.push({
                type: 2,
                label: "Staff Options",
                emoji: Emojis.ModShield,
                custom_id: JSON.stringify({ c: 'quiz', src: 'options' }),
                style: ButtonStyle.Secondary
            })

        return buttons
    }
}

export {
    Emojis,
    SaphireClientOptions as ClientOptions,
    Flags,
    Gifs,
    Buttons,
    Byte,
    Words
}