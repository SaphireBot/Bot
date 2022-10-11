import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Economy", new Schema({
    id: String,
    Lotery: {
        Close: Boolean,
        Prize: Number,
        Users: Array,
        LastWinner: String
    },
    Rifa: {
        // [ { number: Number, userId: String } ]
        Numbers: Array,
        TempPrize: Number,
        LastWinner: String,
        LastNumber: Number,
        LastPrize: Number
    },
    Emojis: [{
        Emoji: {
            type: String,
            unique: true
        },
        Users: [{
            type: Object,
            id: {
                type: String,
                unique: true
            },
            value: Number
        }]
    }]
}))