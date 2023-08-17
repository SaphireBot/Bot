import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Fanart", new Schema({
    id: { type: Number, unique: true },
    userId: String,
    name: String,
    url: String,
    socialUrl: { type: String, default: "" },
    like: [String],
    unlike: [String]
}))