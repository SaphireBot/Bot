import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Memes", new Schema({
    id: String,
    messageUrl: String,
    userId: String,
    acceptedFor: String,
    approved: Boolean,
    attachmentUrl: String,
    likes: {
        up: Array,
        down: Array
    }
}))