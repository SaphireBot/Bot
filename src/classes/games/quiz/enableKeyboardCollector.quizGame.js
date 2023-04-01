import { Message } from "discord.js"
import { SaphireClient as client } from "../../index.js"
import { Emojis as e } from "../../../util/util.js"
import QuizGameClass from "../Quiz.js"

/**
 * @param { QuizGameClass } Quiz
 * @param { Message } message
 */
export default async (message, correctAnswer, Quiz, question) => {

    if (Quiz.stop || !message || !correctAnswer) return Quiz.unregister()

    let messagesIgnoreCounter = 0;
    let questionMisses = 0
    const collector = message.channel.createMessageCollector({
        filter: msg => !msg.author.bot && msg.content?.toLocaleLowerCase() == correctAnswer.trim().toLocaleLowerCase(),
        max: 1,
        time: Quiz.options.responseTime + Quiz.data.timeBonus,
        dispose: true
    })
        .on('collect', msg => collect(msg))
        .on('end', (_, reason) => end(reason))
        .on('ignore', () => refreshMessage())

    Quiz.data.timeBonus = 0
    return

    async function collect(msg) {
        Quiz.data.anwersCounter++
        Quiz.data.hits++
        if (Quiz.stop) return Quiz.unregister()

        const { author } = msg
        msg.react('⭐').catch(() => { })
        Quiz.addUsersPoint(author.id)
        Quiz.addHitsAndMisses(question.questionId, 1, questionMisses)
        Quiz.data.points[author.id] ? Quiz.data.points[author.id]++ : Quiz.data.points[author.id] = 1

        const embed = message.embeds[0]?.data

        if (!embed) {
            Quiz.stop = true
            return Quiz.channelSend({
                content: `${e.Deny} | A embed do Quiz foi deletada. Ela contém dados essenciais para o funcionamento do jogo.`
            })
        }

        if (!embed.fields || !Array.isArray(embed.fields)) embed.fields = []

        const customMessage = [
            "<:saphire_psicopata:1029154944802111528> Ora ora, alguém fez o dever de casa.",
            "<:saphire_ok:989673542876545084> Muito bem!",
            "<:saphire_waku_waku:1087461407806722068> Fantástico.",
            "<:saphire_sapeca:1007826048018288660> Quanta inteligência, fiquei envergonhada.",
            "<:saphire_confirmando:1087461476593311834> Bom trabalho",
            "<:saphire_wow:1002690106932604978> Impressionante.",
            "<:saphire_psicopata:1029154944802111528> A lenda tem nome!",
            "<:saphire_cafe:1005519436083646525> Apenas observando quanta genialidade.",
            "<:saphire_waku_waku:1087461407806722068> Que satisfação ver você jogar.",
            "<:saphire_carinho:1007362848231530497> Jogando muito, continue assim.",
            "<a:saphire_afoita:989673639802716180> GG"
        ].random()

        embed.color = client.green
        embed.description = `${e.QuestionMark} ${question.question}\n***R:** ${question.answers.find(an => an.correct).answer}*`
        embed.fields.push({ name: customMessage, value: `${author} acertou essa pergunta.` })

        const userTag = await client.users.fetch(question.suggestedBy).then(user => `${user.tag} \`${user.id}\``).catch(() => "")
        if (userTag) embed.fields.push({ name: '👤 Sugerido Por', value: `${userTag}` })

        if (Quiz.options.shortRanking) {
            const ranking = Object
                .entries(Quiz.data.points) // [{ '1234567988': 1, '154979865': 2 }]
                .slice(0, 3) // Apenas 3 membros
                .sort((a, b) => b[1] - a[1]) // [['1234567988', 1], ['154979865', 2]]
                .map(([userId, point]) => `${message.guild.members.cache.get(userId) || '??'} ${point} Pontos`) // ['@member: 1 Pontos', '@member: 2 Pontos']
                .join('\n') || 'O ranking sumiu 😯' // Formato por linhas

            embed.fields.push({ name: '🏆 Top 3 Players', value: ranking })
        }

        const embeds = [embed]

        if (question.curiosity?.length > 0) {
            embeds.push({
                color: 0xeaec04, // Yellow
                title: '🔎 Curiosidade',
                description: question.curiosity.random().limit('MessageEmbedFieldValue')
            })
        }

        await Quiz.channelSend({ content: null, embeds })
        collector.stop()
        message.delete().catch(() => { })

        // Se tiver pra repetir no fim das perguntas, embaralha as perguntas tudo novamente
        if (Quiz.options.gameRepeat == 'endQuestion' && !Quiz.questions.length)
            Quiz.shuffleQuestions()

        // Se não for para repetir, o jogo finaliza
        if (Quiz.options.gameRepeat == 'noRepeat' && !Quiz.questions.length)
            return Quiz.finalize()

        await Quiz.channelSend({ content: `🌟 | ${author} acertou a pergunta!\n${e.Loading} | Carregando próxima pergunta...`, redefineMessage: true })
        return Quiz.next()
    }

    async function end(reason) {

        if (['user', 'limit'].includes(reason)) return Quiz.addHitsAndMisses(question.questionId, 1, questionMisses)

        if (reason == 'time') {
            const embed = message.embeds[0]?.data
            if (embed) {
                const replyAnswer = [
                    "<:saphire_recusando:1087461426660134964> Ninguém acertou esta pergunta.",
                    "<:saphire_chorando:1087461493827711056> Game over, nãooo!",
                    "<:saphire_assustada:1087461551985922058> Pensei que alguém acertaria essa.",
                    "<:saphire_chorando:1087461493827711056> Fomos tão longe, que coisa.",
                    "<:saphire_recusando:1087461426660134964> Não era esta resposta que eu esperava.",
                    "<:saphire_birra:1005127888296759347> Que triste, perdemos.",
                    "<:Saphire_Gatinha:989673640482177054> Foi quase lá.",
                    "<:Saphire_Tedio:991064153408028742> Chatice, estava indo tudo bem.",
                    "<:saphire_morrida:989673546672402462> Não esperava por essa derrota.",
                    "<:saphire_milkshake:989673543161741333> Errou! Jogue novamente.",
                    "<:saphire_olhadinha:999409931583246417> Você perdeu, mas não vai desistir, vai?"
                ].random()
                const userTag = await client.users.fetch(question.suggestedBy).then(user => `${user.tag} \`${user.id}\``).catch(() => "")
                embed.color = client.red
                embed.description = `${replyAnswer}\n${e.QuestionMark} **${question.question}**\n***R:** ${correctAnswer}*`
                embed.footer = { text: `Essa pergunta tem ${question.hits || 0} acertos e ${question.misses + questionMisses} erros` }
                if (!embed.fields || !Array.isArray(embed.fields)) embed.fields = []
                if (question.curiosity?.length) {
                    embed.fields.push({
                        name: '🔎 Curiosidades',
                        value: question.curiosity?.random().limit('MessageEmbedFieldValue')
                    })
                }
                if (userTag) embed.fields.push({ name: '👤 Sugerido Por', value: userTag })
                await Quiz.channelSend({ embeds: [embed] })
                message.delete()
            }
            Quiz.unregister()
            return Quiz.finalize()
        }

        Quiz.unregister()
        if (reason == 'channelDelete') return
        return console.log(`#168415464 - ${reason}`)
    }

    async function refreshMessage() {
        messagesIgnoreCounter++
        questionMisses++
        Quiz.data.anwersCounter++
        Quiz.data.misses++

        if (messagesIgnoreCounter > 10) {
            messagesIgnoreCounter = 0
            await Quiz.channelSend({
                content: Quiz.message.content || null,
                embeds: Quiz.message.embeds[0]?.data ? [Quiz.message.embeds[0]?.data] : [],
                components: [],
                redefineMessage: true
            })
            return message.delete().catch(() => { })
        }
        return;
    }

}