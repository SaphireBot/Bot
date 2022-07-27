import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Guild", new Schema({
    id: { type: String, unique: true },
    Prefix: String,
    LogChannel: String,
    IdeiaChannel: String,
    Moeda: String,
    ReportChannel: String,
    FirstSystem: Boolean,
    Autorole: Array,
    ConfessChannel: String,
    AntLink: Boolean,
    banGif: String,
    AfkSystem: Array,
    CommandBlocks: Array,
    Antifake: Boolean,
    LockdownChannels: Array,
    Warns: {
        Users: Object,
        Config: Object
    },
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
    },
    Blockchannels: {
        Bots: Array,
        Channels: Array
    }
}))