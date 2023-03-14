import QuizManager from "./QuizManager.js";
import { EventEmitter } from "events"
import { Database } from "../index.js";

export default class Quiz extends EventEmitter {
    constructor(interaction) {
        this.user = interaction.user
        this.channel = interaction.channel
        this.users = []
        this.points = {}
        this.question = QuizManager.questions
        this.method = undefined
        this.options = {
            responseTime: 15000,
            gameType: 'Text',
            gameRepeat: false,
            losePointAtError: false, // At button type
            shortRanking: true,
            categories: QuizManager.categories,
        }
    }

    async getCustomOptions() {
        const SaveCategories = await Database.Quiz.findOne({ category: 'SaveCategories' }, 'customGameOptions')
        const allCustomOptions = SaveCategories?.customGameOptions || []
        const userOptions = allCustomOptions.find(op => op.userId == this.user.id)

        if (!userOptions) return

        if (userOptions.responseTime) this.options.responseTime = userOptions.responseTime
        if (userOptions.gameType) this.options.gameType = userOptions.gameType
        if (userOptions.gameRepeat) this.options.gameRepeat = userOptions.gameRepeat
        if (userOptions.losePointAtError) this.options.losePointAtError = userOptions.losePointAtError
        if (userOptions.shortRanking) this.options.shortRanking = userOptions.shortRanking
        if (userOptions.categories) this.options.categories = userOptions.categories
    }
}