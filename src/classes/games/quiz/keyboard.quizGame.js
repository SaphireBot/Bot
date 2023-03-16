import { Emojis as e } from "../../../util/util.js"
import { SaphireClient as client } from "../../index.js"
import QuizGameClass from "../Quiz.js"
import enableKeyboardCollectorQuizGame from "./enableKeyboardCollector.quizGame.js"

/**
 * @param { QuizGameClass } Quiz
 */
export default async (question, Quiz) => {

    if (Quiz.stop) return
    Quiz.data.rounds++
    const correctAnswer = question.answers.find(aw => aw.correct)

    if (!correctAnswer) {
        Quiz.stop = true
        await Quiz.deleteMessage()
        return Quiz.channelSend({ content: `${e.Deny} | Por algum motivo muito desconhecido, a resposta correta para a pergunta não foi encontrada.\n${e.Info} | Pergunta: **\`${question.question}\`**` })
    }
    Quiz.calculateTime(correctAnswer.answer)

    const embed = {
        color: client.blue,
        title: `${e.QuizLogo} Categoria: ${question.category || 'Not Found'}`,
        description: `⏱️ ${Date.Timestamp(Quiz.options.responseTime + Quiz.data.timeBonus, 'R')}\n \n${e.QuestionMark} **${question.question}**`,
        footer: {
            text: Quiz.data.timeBonus > 0 ? `Bônus de tempo adicionado: ${Date.stringDate(Quiz.data.timeBonus, true)}` : null
        }
    }

    await Quiz.updateMessage({ embeds: [embed], fetchReply: true })
    if (!Quiz.message || Quiz.stop) return
    return await enableKeyboardCollectorQuizGame(Quiz.message, correctAnswer.answer, Quiz, question.questionId)
}