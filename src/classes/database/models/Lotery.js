import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Lotery", new Schema({
    id: { type: String, unique: true },
    Close: Boolean,
    Prize: Number,
    Users: Array,
    LastWinner: String
}))