import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Rather", new Schema({
    id: { type: String, unique: true },
    authorId: String,
    optionOne: {
        question: String,
        users: Array
    },
    optionTwo: {
        question: String,
        users: Array
    },
    edited: Boolean
}))