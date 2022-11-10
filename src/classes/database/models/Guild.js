import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Guild", new Schema({
    id: { type: String, unique: true },
    LogSystem: {
        channel: String,
        ban: {
            active: Boolean,
            gif: String
        },
        kick:  {
            active: Boolean,
            gif: String
        },
        mute:  {
            active: Boolean,
            gif: String
        },
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