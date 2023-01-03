import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Cantada", new Schema({
    id: String,
    phrase: String,
    userId: String,
    acceptedFor: String,
    likes: {
        up: Array,
        down: Array
    }
}))