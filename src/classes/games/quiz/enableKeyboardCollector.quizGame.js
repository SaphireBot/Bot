import { Message } from "discord.js"
import QuizGameClass from "../Quiz.js"
import { SaphireClient as client } from "../../index.js"
import { Emojis as e } from "../../../util/util.js"

/**
 * @param { QuizGameClass } Quiz
 * @param { Message } message
 */
export default async (message, correctAnswer, Quiz, question) => {

    if (Quiz.stop || !message || !correctAnswer) return Quiz.unregister()

    let messagesIgnoreCounter = 0;
    let questionMisses = 0
    message.channel.createMessageCollector({
        filter: msg => !msg.author.bot && msg.content?.toLocaleLowerCase() == correctAnswer.trim().toLocaleLowerCase(),
        max: 1,
        time: Quiz.options.responseTime + Quiz.data.timeBonus,
        dispose: true
    })
        .on('collect', msg => collect(msg)).on('end', async (_, reason) => end(reason)).on('ignore', () => refreshMessage())

    Quiz.data.timeBonus = 0
    return

    async function collect(msg) {
        if (Quiz.stop) return Quiz.unregister()

        const { author } = msg
        msg.react('✅').catch(() => { })
        Quiz.addUsersPoint(author.id)
        Quiz.addHitsAndMisses(question.questionId, 1, questionMisses)
        Quiz.data.points[author.id]
            ? Quiz.data.points[author.id]++
            : Quiz.data.points[author.id] = 1

        const embed = message.embeds[0]?.data

        if (!embed) {
            Quiz.stop = true
            return await message.channel.send({
                content: `${e.Deny} | A embed do Quiz foi deletada. Ela contém dados essenciais para o funcionamento do jogo.`
            })
        }

        const fieldNames = ['🌟 Boooa!', '🏆 Lenda!', '😎 Hehehe', '👊 GG']

        if (!embed.fields) embed.fields = []

        embed.color = client.green
        embed.description = `Pergunta: ${question.question}\nResposta: ${question.answers.find(an => an.correct).answer}`
        embed.fields.push({
            name: fieldNames.random(),
            value: `${author} acertou essa pergunta.`
        })

        if (Quiz.options.gameRepeat == 'endQuestion' && !Quiz.questions.length)
            await shuffleQuestions()

        if (Quiz.options.gameRepeat == 'noRepeat' && !Quiz.questions.length)
            return Quiz.finalize()

        if (Quiz.options.shortRanking) {
            const ranking = Object
                .entries(Quiz.data.points) // [{ '1234567988': 1, '154979865': 2 }]
                .slice(0, 3) // Apenas 3 membros
                .sort((a, b) => b[1] - a[1]) // [['1234567988', 1], ['154979865', 2]]
                .map(([userId, point]) => `${message.guild.members.cache.get(userId) || '??'}: ${point} Pontos`) // ['@member: 1 Pontos', '@member: 2 Pontos']
                .join('\n') // Formato por linhas

            embed.fields.push({
                name: '🏆 Top 3 Players',
                value: ranking || 'O ranking sumiu 😯'
            })
        }

        if (question.categories?.length > 0) {
            embed.fields.push({
                name: '🔎 Curiosidades',
                value: question.categories.join('\n \n')
            })
        }

        Quiz.updateMessage({ content: null, embeds: [embed] })
        Quiz.channelSend({ content: `🌟 | ${author} acertou a pergunta!\n${e.Loading} | Carregando próxima pergunta...`, redefineMessage: true })
        return Quiz.next()
    }

    async function end(reason) {
        if (['user', 'limit'].includes(reason)) return Quiz.addHitsAndMisses(question.questionId, 1, questionMisses)
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