import QuizManager from "./QuizManager.js";

export default class Quiz {
    constructor() {
        this.users = []
        this.points = {}
        this.question = QuizManager.questions
        this.method = undefined
    }
}