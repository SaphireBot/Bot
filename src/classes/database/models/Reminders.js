import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Reminders", new Schema({
    id: { type: String, unique: true },
    userId: String,
    guildId: String,
    RemindMessage: String,
    Time: Number,
    isAutomatic: { type: Boolean, default: false },
    DateNow: Number,
    ChannelId: String,
    Alerted: { type: Boolean, default: false }
}))