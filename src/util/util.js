import DiscordJS, { GatewayIntentBits, Partials } from 'discord.js'
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
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
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
const Flags = JSON.parse(fs.readFileSync('./src/JSON/flags.json'))

export {
    Emojis,
    ClientOptions,
    Flags
}