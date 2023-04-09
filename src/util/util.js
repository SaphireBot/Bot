import { ButtonStyle, GatewayIntentBits, Partials } from 'discord.js'
import { SaphireClient as client } from '../classes/index.js'
import { createRequire } from 'node:module'
import Byte from './Bytes.js'
const require = createRequire(import.meta.url)

const SaphireClientOptions = {
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

const Emojis = require('../../JSON/emojis.json')
const Gifs = require('../../JSON/gifs.json')
const Flags = require('../../JSON/flags.json')

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
    Byte
}