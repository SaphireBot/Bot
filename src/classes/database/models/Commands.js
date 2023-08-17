import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Commands", new Schema({
    id: String,
    count: Number,
    usage: Array
}))