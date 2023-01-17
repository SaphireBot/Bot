import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Reminders", new Schema({
    id: { type: String, unique: true },
    userId: { type: String, default: "" },
    guildId: { type: String, default: "" },
    RemindMessage: { type: String, default: "" },
    Time: { type: Number, default: 0 },
    snoozed: { type: Boolean, default: false },
    timeout: { type: Schema.Types.Mixed, default: false },
    isAutomatic: { type: Boolean, default: false },
    DateNow: { type: Number, default: 0 },
    ChannelId: { type: String, default: "" },
    Alerted: { type: Boolean, default: false }
}))