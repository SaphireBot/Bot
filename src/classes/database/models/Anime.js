import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Anime", new Schema({
    id: String,
    name: String,
    anime: String,
    acceptedFor: String,
    sendedFor: String,
    type: String,
    imageUrl: String
}))