import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Clans", new Schema({
    id: { type: String, unique: true },
    Name: String,
    Owner: String,
    Admins: Array,
    Members: Array,
    Donation: Number,
    CreatAt: { type: Date, default: Date.now() },
    LogRegister: Array
}))