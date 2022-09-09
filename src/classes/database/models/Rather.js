import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Rather", new Schema({
    id: { type: String, unique: true },
    authorId: String,
    optionOne: {
        question: String,
        chooses: { type: Number, default: 0 }
    },
    optionTwo: {
        question: String,
        chooses: { type: Number, default: 0 }
    },
    edited: Boolean
}))