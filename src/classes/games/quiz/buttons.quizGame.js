import { Emojis as e } from "../../../util/util.js"
import { SaphireClient as client } from "../../index.js"
import QuizGameClass from "../Quiz.js"
import enableComponentCollector from "./enableComponentCollector.quizGame.js"
import generateButtonsQuizGame from "./generateButtons.quizGame.js"

/**
 * @param { QuizGameClass } Quiz
 */
export default async (question, Quiz) => {

    if (Quiz.stop) return Quiz.unregister()
    Quiz.data.rounds++
    const correctAnswer = question.answers.find(aw => aw.correct)

    if (!correctAnswer) {
        Quiz.stop = true
        await Quiz.deleteMessage()
        return Quiz.channelSend({ content: `${e.Deny} | Por algum motivo muito desconhecido, a resposta correta para a pergunta não foi encontrada.\n${e.Info} | Pergunta: **\`${question.question}\`**` })
    }
    Quiz.calculateTime(correctAnswer.answer)

    const buttons = generateButtonsQuizGame(question)

    await Quiz.deleteMessage()
    await Quiz.channelSend({
        embeds: [
            {
                color: client.blue,
                title: `${e.QuizLogo} Categoria: ${question.category || 'Not Found'}`,
                description: `⏱️ ${Date.Timestamp(Quiz.options.responseTime + Quiz.data.timeBonus, 'R')}\n \n${e.QuestionMark} **${question.question}**`,
                footer: {
                    text: Quiz.data.timeBonus > 0 ? `Bônus de tempo adicionado: ${Date.stringDate(Quiz.data.timeBonus, true)}` : null
                }
            }
        ],
        components: buttons,
        redefineMessage: true
    })

    if (!Quiz.message || Quiz.stop) return Quiz.unregister()
    return await enableComponentCollector(Quiz.message, correctAnswer.answer, Quiz, question)
}