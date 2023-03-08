import { ButtonStyle } from "discord.js";
import Quiz from "../../../../classes/games/QuizManager.js";
import { Modals, SaphireClient as client } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

// Button interaction
export default async interaction => {

    const { customId, user, message } = interaction

    if (!client.staff.includes(user.id))
        return await interaction.reply({
            content: `${e.Deny} | Para para aí! Esta área aqui é só para os meus moderadores.`,
            ephemeral: true
        })

    const customData = JSON.parse(customId)
    const questionId = customData?.id
    const question = Quiz.questions.find(q => q.questionId == questionId)
    const embed = message.embeds[0]?.data
    if (embed) embed.color = client.red

    if (!question)
        return await interaction.update({
            embeds: embed ? [embed] : [],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Concluir Reporte',
                        emoji: '😔',
                        custom_id: 'disabled',
                        style: ButtonStyle.Success,
                        disabled: true
                    },
                    {
                        type: 2,
                        label: 'Página de Opções',
                        emoji: e.Admin,
                        custom_id: JSON.stringify({ c: 'quiz', src: 'options' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Painel de Edição',
                        emoji: '😔',
                        custom_id: 'offline',
                        style: ButtonStyle.Secondary,
                        disabled: true
                    },
                    {
                        type: 2,
                        label: 'Fechar Analise',
                        emoji: e.Admin,
                        custom_id: JSON.stringify({ c: 'delete' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }]
        })

    return await interaction.showModal(Modals.editQuestionData(question, true, true))

}