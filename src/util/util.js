import { ButtonStyle, GatewayIntentBits, Partials } from 'discord.js'
import { SaphireClient as client } from '../classes/index.js'
import Byte from './Bytes.js'
import * as fs from 'fs'

const SaphireClientOptions = {
    shards: 'auto',
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
        GatewayIntentBits.MessageContent
    ],
    // sweepers: {
    //     users: {
    //         filter: () => user => !user.bot || user.id !== config.ownerId,
    //         interval: 14400
    //     },
    //     bans: {
    //         filter: () => () => true,
    //         interval: 3600 // 1H
    //     },
    //     invites: {
    //         lifetime: 0,
    //         interval: 14400
    //     },
    //     guildMembers: {
    //         filter: () => () => true,
    //         interval: 14400
    //     },
    //     presences: {
    //         filter: () => () => true,
    //         interval: 14400
    //     },
    //     messages: {
    //         lifetime: 3600,
    //         interval: 3600
    //     },
    //     reactions: {
    //         filter: () => () => true,
    //         interval: 14400
    //     },
    //     stageInstances: {
    //         filter: () => () => true,
    //         interval: 14400
    //     },
    //     stickers: {
    //         filter: () => () => true,
    //         interval: 14400
    //     },
    //     threadMembers: {
    //         filter: () => () => true,
    //         interval: 14400
    //     },
    //     threads: {
    //         lifetime: 3600,
    //         interval: 14400
    //     },
    //     voiceStates: {
    //         filter: () => () => true,
    //         interval: 14400
    //     }
    // },
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.User
    ],
    allowedMentions: { parse: ['users', 'roles'] },
    closeTimeout: 6000,
    failIfNotExists: false,
    waitGuildTimeout: 20000
}

const Emojis = JSON.parse(fs.readFileSync('./JSON/emojis.json'))
const Gifs = JSON.parse(fs.readFileSync('./JSON/gifs.json'))
const Flags = JSON.parse(fs.readFileSync('./JSON/flags.json'))

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
                        custom_id: JSON.stringify({ c: 'quiz', src: 'credits' }),
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
    Byte
}