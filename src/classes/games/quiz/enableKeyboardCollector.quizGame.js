import { Message } from "discord.js"
import QuizGameClass from "../Quiz.js"
import { Database, SaphireClient as client } from "../../index.js"
import { Emojis as e } from "../../../util/util.js"

/**
 * @param { QuizGameClass } Quiz
 * @param { Message } message
 */
export default async (message, correctAnswer, Quiz, questionId) => {

    if (Quiz.stop || !message || !correctAnswer) return

    let messagesIgnoreCounter = 0;
    let questionMisses = 0
    const collection = message.channel.createMessageCollector({
        filter: msg => !msg.author.bot && msg.content?.toLocaleLowerCase() == correctAnswer.trim().toLocaleLowerCase(),
        max: 1,
        time: Quiz.options.responseTime + Quiz.data.timeBonus,
        dispose: true
    })
        .on('collect', message => collect(message)).on('end', async (_, reason) => end(reason)).on('ignore', () => refreshMessage())

    Quiz.data.timeBonus = 0
    return
    async function collect(message) {
        console.log(message.content)
    }

    async function end(reason) {
        if (['user', 'limit'].includes(reason)) return Quiz.addHitsAndMisses(questionId, 1, questionMisses)
        Quiz.unregister()
        if (reason == 'channelDelete') return
        if (reason == 'time') return Quiz.finalize()
        return console.log(`#168415464 - ${reason}`)
    }

    async function refreshMessage() {
        messagesIgnoreCounter++
        questionMisses++
        Quiz.data.misses++
        if (messagesIgnoreCounter > 14) {
            await Quiz.updateMessage({
                content: Quiz.message.content || null,
                embeds: Quiz.message.embeds[0]?.data ? [Quiz.message.embeds[0]?.data] : [],
                components: [],
                fetchReply: true
            })
            await Quiz.deleteMessage()
        }
    }

}