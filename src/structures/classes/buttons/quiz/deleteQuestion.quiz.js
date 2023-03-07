import Quiz from "../../../../classes/games/Quiz.js";
import { ButtonStyle } from "discord.js";
import { SaphireClient as client } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

// Button Interaction
export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.DenyX} | Apenas os meus moderadores podem executar essa função, beleza?.`,
            ephemeral: true
        })

    const customIdData = JSON.parse(interaction.customId)
    const questionId = customIdData.id

    const question = Quiz.questions.find(q => q.questionId == questionId)

    if (!question)
        return await interaction.update({
            content: `${e.DenyX} | Pergunta não encontrada.`,
            embeds: [], components: []
        }).catch(() => { })

    if (customIdData.type == 'preview')
        return await interaction.update({
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: "Reportar",
                            emoji: e.Report,
                            custom_id: JSON.stringify({ c: 'quiz', src: 'report' }),
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
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Deletar',
                            emoji: e.Admin,
                            custom_id: JSON.stringify({ c: 'quiz', src: 'deleteQuestionRequest', id: questionId }),
                            style: ButtonStyle.Secondary
                        },
                        {
                            type: 2,
                            label: 'Editar',
                            emoji: e.Admin,
                            custom_id: JSON.stringify({ c: 'quiz', src: 'editQuestion' }),
                            style: ButtonStyle.Secondary
                        }
                    ]
                }
            ]
        }).catch(() => { })

    const deleted = await Quiz.deleteQuestion(questionId)

    if (!deleted)
        return await interaction.update({
            content: `${e.DenyX} | Não foi possível deletar o esta pergunta.`,
            embeds: [], components: []
        }).catch(() => { })

    const message = interaction.message
    const embed = message.embeds[0]?.data

    if (embed) {
        embed.color = client.red
        embed.footer.text += ' | DELETED'
    }

    return await interaction.update({
        embeds: embed ? [embed] : [],
        components: [{
            type: 1,
            components: [{
                type: 2,
                label: "Pergunta Deletada",
                custom_id: 'deleted',
                style: ButtonStyle.Danger,
                disabled: true,
            }]
        }]
    }).catch(() => { })
}