import Mongoose from 'mongoose'
const { Schema, model } = Mongoose

export default model("Quiz", new Schema({
    questionId: { type: String, unique: true },
    enableCategories: { type: Array, default: null },
    question: String,
    curiosity: Array,
    category: String,
    answers: Array,
    suggestedBy: String,
    hits: { type: Number, default: 0 },
    misses: { type: Number, default: 0 }
}))