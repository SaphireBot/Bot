import Quiz from "../../../../classes/games/QuizManager.js";
import { Emojis as e } from "../../../../util/util.js";

export default async interaction => {

    const { fields, message } = interaction
    const embed = message?.embeds[0]?.data

    if (!embed)
        return await interaction.reply({
            content: `${e.Deny} | Embed não localizada na mensagem de origem.`,
            ephemeral: true
        })

    const customIdData = JSON.parse(interaction.customId)
    const category = customIdData?.category

    if (!category)
        return await interaction.reply({
            content: `${e.Deny} | Não foi possível obter a categoria selecionada. Por favor, tente novamente.`,
            ephemeral: true
        })

    const question = fields.getTextInputValue('question')
    const correctAnwers = fields.getTextInputValue('correctQuestion')
    const wrong1 = fields.getTextInputValue('wrong1')
    const wrong2 = fields.getTextInputValue('wrong2')
    const wrong3 = fields.getTextInputValue('wrong3')

    if (Quiz.questions.find(doc => doc.question?.toLowerCase() == question.toLowerCase()))
        return await interaction.reply({
            content: `${e.DenyX} | Esta pergunta já existe no banco de dados.`,
            ephemeral: true
        })

    const answers = [
        {
            answer: correctAnwers,
            correct: true
        },
        {
            answer: wrong1,
            correct: false
        },
        {
            answer: wrong2,
            correct: false
        },
        {
            answer: wrong3,
            correct: false
        }
    ]

    for (let q of answers)
        if (answers.filter(ques => ques.answer == q.answer).length > 1)
            return await interaction.reply({ content: `${e.DenyX} | Não não não, nada de respostas repetidas por aqui.` })

    const customId = embed.footer.text.replace('Question ID: ', '')
    const questionIndex = Quiz.QuestionsIndications.findIndex(q => q.questionId == customId)
    const questionData = Quiz.questions.find(q => q.questionId || customId) || Quiz.QuestionsIndications[questionIndex]

    questionData.question = question
    questionData.answers = answers

    embed.description = `${e.Check} Alteração efetuada com sucesso.`
    embed.fields[0].value = question
    embed.fields[2].value = answers.map((wrong) => `${wrong.correct ? e.CheckV : e.DenyX} ${wrong.answer}`).join('\n')

    return await interaction.update({ embeds: [embed] })
}