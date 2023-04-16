import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Guild", new Schema({
    id: { type: String, unique: true },
    Giveaways: Array,
    Polls: Array,
    Moeda: String,
    FirstSystem: Boolean,
    Autorole: Array,
    CommandBlocks: Array,
    TwitchNotifications: Array, // { channelId: channelId, streamer: streamerName }
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