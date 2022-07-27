import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Giveaway", new Schema({
    MessageID: String,
    GuildId: String,
    Prize: String,
    Winners: Number,
    TimeMs: Number,
    DateNow: Number,
    ChannelId: String,
    Emoji: String,
    Participants: Array,
    Actived: Boolean,
    MessageLink: String,
    Sponsor: String,
    TimeEnding: String,
    TimeToDelete : Number,
    WinnersGiveaway: Array
}))