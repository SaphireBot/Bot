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
    announce: {
        channel: String,
        allowedRole: String,
        notificationRole: String
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
    Canal: String,
    Mensagem: String,
},
    WelcomeChannel: {
    Canal: String,
    Mensagem: String,
}
}))