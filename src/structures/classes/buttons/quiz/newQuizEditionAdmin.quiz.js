import Quiz from "../../../../classes/games/QuizManager.js";
import { ButtonStyle } from "discord.js";
import { Emojis as e } from "../../../../util/util.js";
import { SaphireClient as client } from "../../../../classes/index.js";

export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.DenyX} | Apenas os meus moderadores podem redefinir valores de perguntas do Quiz.\n${e.Info} | Caso você tenha visto algo errado, por favor, solicite uma correção.`,
            ephemeral: true
        })

    const { fields } = interaction
    const customIdData = JSON.parse(interaction.customId)
    const category = customIdData?.category

    if (!category)
        return await interaction.reply({
            content: `${e.Deny} | Não foi possível obter a categoria selecionada. Por favor, tente novamente.`,
            ephemeral: true
        })

    const questionEdited = fields.getTextInputValue('question')
    const correctAnwers = fields.getTextInputValue('correctQuestion')
    const wrong1 = fields.getTextInputValue('wrong1')
    const wrong2 = fields.getTextInputValue('wrong2')
    const wrong3 = fields.getTextInputValue('wrong3')

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

    const embedData = interaction.message.embeds[0]?.data
    const customId = embedData.footer.text.replace('Question ID: ', '')
    const question = Quiz.questions[Quiz.questions.findIndex(q => q.questionId == customId)]
    const userWhoSuggest = await client.users.fetch(question?.suggestedBy || "0").catch(() => null)

    question.question = questionEdited
    question.answers = answers

    if (!Quiz.questions.find(q => q.questionId == question.questionId))
        Quiz.QuestionsIndications.push(question)

    const embed = {
        color: client.blue,
        title: `🔎 ${client.user.username}'s Question Viewer`,
        fields: [
            {
                name: '🆔 Indentification',
                value: question.questionId
            },
            {
                name: '📝 Pergunta Indicada',
                value: questionEdited
            },
            {
                name: '🏷️ Categoria Selecionada',
                value: category
            },
            {
                name: '✏️ Respostas Relacionadas',
                value: answers.map(answer => `${answer.correct ? e.CheckV : e.DenyX} \`${answer.answer}\``).join('\n')
            },
            {
                name: '🚩 Localização de Envio',
                value: `👤 ${userWhoSuggest?.tag || 'Not Found'} \`${question.suggestedBy}\``
            }
        ],
        footer: {
            text: `Question ID: ${question.questionId}`
        }
    }

    return await interaction.update({
        embeds: [embed],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Redefinir Valores',
                    custom_id: JSON.stringify({ c: 'quiz', src: 'acceptQuestion', type: 'admin', byReport: customIdData.byReport }),
                    style: ButtonStyle.Success
                },
                {
                    type: 2,
                    label: 'Editar',
                    custom_id: JSON.stringify({ c: 'quiz', src: 'editQuestion' }),
                    style: ButtonStyle.Secondary
                },
                {
                    type: 2,
                    label: 'Cancelar Edição',
                    custom_id: JSON.stringify({ c: 'delete' }),
                    style: ButtonStyle.Danger
                }
            ]
        }]
    }).catch(() => { })
}