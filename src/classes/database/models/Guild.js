import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Guild", new Schema({
    id: { type: String, unique: true },
    Giveaways: Array,
    TempCall: {
        enable: Boolean,
        muteTime: Boolean,
        members: Object,
        membersMuted: Object
    },
    Spam: {
        enabled: { type: Boolean, default: false },
        ignoreChannels: { type: Array, default: [] },
        ignoreRoles: { type: Array, default: [] },
        filters: {
            capsLock: {
                enabled: { type: Boolean, default: false },
                percent: { type: Number, default: 0, max: 100, min: 0 }
            },
            messagesTimer: {
                enabled: { type: Boolean, default: false },
                amount: { type: Number, default: 3 },
                seconds: { type: Number, default: 2 }
            },
            repeat: {
                enabled: { type: Boolean, default: false }
            }
        }
    },
    Chest: { type: Boolean, default: true },
    Polls: Array,
    Moeda: String,
    FirstSystem: Boolean,
    Autorole: Array,
    CommandBlocks: Array,
    TwitchNotifications: Array, // { channelId: channelId, streamer: streamerName }
    MinDay: {
        days: Number,
        punishment: String // Kick | Ban | Warn
    },
    announce: {
        channel: String,
        allowedRole: String,
        notificationRole: String,
        crosspost: Boolean
    },
    LogSystem: {
        channel: String,
        webhookUrl: String,
        ban: {
            active: Boolean
        },
        unban: {
            active: Boolean
        },
        kick: {
            active: Boolean
        },
        mute: {
            active: Boolean
        },
        channels: {
            active: Boolean
        },
        messages: {
            active: Boolean
        },
        botAdd: {
            active: Boolean
        },
        roles: {
            active: Boolean
        }
    },
    XpSystem: {
        Canal: String,
        Mensagem: String
    },
    LeaveChannel: {
        channelId: String,
        body: Object
    },
    WelcomeChannel: {
        channelId: String,
        body: Object
    },
    Stars: {
        limit: Number,
        channel: String,
        sended: Array
    }
}))