import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Guild", new Schema({
    id: { type: String, unique: true },
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
        }
    },
    Giveaways: Array,
    Polls: Array,
    // IdeiaChannel: String,
    Moeda: String,
    // ReportChannel: String,
    FirstSystem: Boolean,
    Autorole: Array,
    // AntLink: Boolean,
    CommandBlocks: Array,
    // LockdownChannels: Array,
    XpSystem: {
        Canal: String,
        Mensagem: String
    },
    LeaveChannel: {
        Canal: String,
        Mensagem: String,
    },
    WelcomeChannel: {
        Canal: String,
        Mensagem: String,
    }
}))