import { ButtonStyle } from "discord.js";
import Quiz from "../../../../classes/games/QuizManager.js";
import { SaphireClient as client, Database } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

// Button Interaction
export default async interaction => {

    const { customId, user } = interaction

    if (!client.staff.includes(user.id))
        return await interaction.reply({
            content: `${e.Deny} | Hey hey hey, apenas os meus moderadores podem editar a categoria de uma pergunta, ok?`,
            ephemeral: true
        })

    const customData = JSON.parse(customId)
    const questionId = customData?.id
    const question = Quiz.questions.find(q => q.questionId == questionId)

    if (!question)
        return await interaction.update({
            content: `${e.Deny} | Nenhum pergunta foi encontrada. Que pena...`,
            embeds: [], components: []
        }).catch(() => { })

    const categories = Quiz.categories
    const category = question.category
    const allCategoriesWithoutQuestionCategory = categories.filter(str => str != category)

    const selectMenuObject = {
        type: 1,
        components: [{
            type: 3,
            custom_id: 'quizOptions',
            placeholder: 'Selecione uma nova categoria',
            options: [
                ...allCategoriesWithoutQuestionCategory.map(categoryName => ({
                    label: categoryName,
                    emoji: '🏷️',
                    description: `${Quiz.questions.filter(q => q.category == categoryName).length || 0} perguntas disponíveis`,
                    value: JSON.stringify({ c: 'editCategory', src: categoryName })
                }))
            ]
        }]
    }

    const buttons = {
        type: 1,
        components: [
            {
                type: 2,
                label: 'Cancelar Alteração',
                emoji: e.Admin,
                custom_id: JSON.stringify({ c: 'delete' }),
                style: ButtonStyle.Danger
            },
            {
                type: 2,
                label: 'Painel de Opções',
                emoji: e.Admin,
                custom_id: JSON.stringify({ c: 'quiz', src: 'options' }),
                style: ButtonStyle.Primary
            }
        ]
    }

    return await interaction.update({
        content: null,
        components: [selectMenuObject, buttons]
    }).catch(() => { })
}