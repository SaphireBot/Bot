import Mongoose from 'mongoose'

const { Schema, model } = Mongoose

export default model("Jokempo", new Schema({
    id: { type: String, unique: true },
    value: { type: Number },
    webhookUrl: { type: String },
    creatorId: { type: String },
    creatorOption: { type: String },
    channelOrigin: { type: String }
}))