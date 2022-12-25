import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Fanart", new Schema({
    id: { type: Number, unique: true },
    userId: String,
    name: String,
    url: String,
    like: [String],
    unlike: [String]
}))