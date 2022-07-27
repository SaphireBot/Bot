import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Raffle", new Schema({
    id: { type: Number, unique: true },
    MemberId: String,
    Prize: Number,
    ClientId: String,
    LastWinner: String,
    LastPrize: Number,
    AlreadyRaffle: Boolean
}))