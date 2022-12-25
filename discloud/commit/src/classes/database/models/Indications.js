import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Indications", new Schema({
    name: { type: String, unique: true },
    category: Array,
    gender: Array,
    targetPublic: Array,
    authorId: String,
    up: Array,
    down: Array
}))