import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Economy", new Schema({
    Lotery: {
        id: { type: String, unique: true },
        Close: Boolean,
        Prize: Number,
        Users: Array,
        LastWinner: String
    },
    Rifa: {
        // [ { number: Number, userId: String } ]
        Numbers: Array,
        Prize: Number,
        LastWinner: String,
        LastPrize: Number,
        AlreadyRaffle: Boolean
    }
}))