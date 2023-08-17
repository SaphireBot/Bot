import { ButtonStyle } from "discord.js";
import Quiz from "../../../../classes/games/QuizManager.js";
import { SaphireClient as client, Database } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

// Select Menu Interaction
export default async interaction => {

    const { values, user } = interaction

    if (!client.staff.includes(user.id))
        return await interaction.reply({
            content: `${e.Deny} | Calma lá, jovem ser! Só os maiores seres do mundo, os meus moderadores, podem editar a categoria das perguntas do Quiz, ok?`,
            ephemeral: true
        })

    const customData = JSON.parse(values[0])
    const category = customData.src
    const embed = interaction.message.embeds[0]?.data

    if (!embed)
        return await interaction.update({
            content: `${e.Deny} | Por favor animalzinho, não apague a embed, ok?`,
            components: []
        }).catch(() => { })

    const questionId = embed.footer.text.replace('Question ID: ', '')
    const question = Quiz.questions.find(q => q.questionId == questionId)

    if (!question)
        return await interaction.update({
            content: `${e.DenyX} | Pergunta não encontrada.`,
            embeds: [], components: []
        }).catch(() => { })

    const oldCategory = question.category

    return await Database.Quiz.updateOne(
        { questionId },
        { $set: { category } },
        { new: true }
    )
        .then(async () => {

            Quiz.questions[Quiz.questions.findIndex(q => q.questionId == questionId)].category = category
            embed.color = client.green
            embed.fields[3].value = category
            const components = [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Reportar",
                        emoji: e.Report,
                        custom_id: JSON.stringify({ c: 'quiz', src: 'report', id: questionId }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: "Fechar",
                        emoji: '💫',
                        custom_id: JSON.stringify({ c: 'delete' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }]

            if (client.staff.includes(user.id))
                components.push({
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Deletar',
                            emoji: e.Admin,
                            custom_id: JSON.stringify({ c: 'quiz', src: 'deleteQuestionRequest', id: question.questionId }),
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            label: 'Editar Categoria',
                            emoji: e.Admin,
                            custom_id: JSON.stringify({ c: 'quiz', src: 'editCategory', id: question.questionId }),
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            label: 'Editar Pergunta/Resposta',
                            emoji: e.Admin,
                            custom_id: JSON.stringify({ c: 'quiz', src: 'editQuestion' }),
                            style: ButtonStyle.Secondary
                        }
                    ]
                })

            return await interaction.update({
                content: `${e.CheckV} | A categoria da pergunta **\`${questionId}\`** foi editada de **\`${oldCategory}\`** para **\`${category}\`**`,
                embeds: [embed], components
            }).catch(() => { })

        })
}