import axios from "axios";
import Quiz from "../../../../classes/games/Quiz.js";
import { ButtonStyle } from "discord.js";
import { SaphireClient as client, Database } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

// Modal Function
export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.DenyX} | Apenas os meus moderadores podem recusar as perguntas indicadas.`,
            ephemeral: true
        })

    if (!interaction.message || !interaction.message.embeds?.length)
        return await interaction.update({
            content: `${e.DenyX} | Não foi possível verificar está solicitação. Por favor, tente novamente`,
            embeds: [], components: []
        }).catch(() => { })

    const { message } = interaction
    const embeds = message.embeds || []
    const embed = embeds[0]?.data

    if (!embed)
        return await interaction.update({
            content: `${e.DenyX} | Embed de validação não encontrada.`,
            embeds: [], components: []
        }).catch(() => { })

    const fields = embed.fields || []
    const question = Quiz.QuestionsIndications.find(q => q.question == fields[0]?.value)

    if (!question)
        return await interaction.update({
            content: `${e.DenyX} | Solicitação não encontrada.`,
            embeds: [], components: []
        }).catch(() => { })

    Quiz.questions.push(question.questionId)
    Quiz.QuestionsIndications.splice(
        Quiz.QuestionsIndications.findIndex(q => q.questionId == question.questionId), 1
    )

    await Database.Client.updateOne({ id: client.user.id },
        { $pull: { QuizQuestionsIndications: { questionId: question.questionId } } }
    )

    embed.color = client.red

    if (question.webhookUrl) executeWebhook(question.webhookUrl, question.questionId)

    return await interaction.update({
        embeds: [embed],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Solicitação Recusada",
                        custom_id: 'removed',
                        style: ButtonStyle.Danger,
                        disabled: true
                    },
                    {
                        type: 2,
                        label: "Próxima Sugestão",
                        custom_id: JSON.stringify({ c: 'quiz', src: 'reviewQuestion' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: "Fechar Verificação",
                        custom_id: JSON.stringify({ c: 'delete' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    })

    async function executeWebhook(webhookUrl, documentId) {
        const reason = interaction.fields.getTextInputValue('reason')
        return await axios.post(webhookUrl, {
            content: `${e.Notification} | <@${question.suggestedBy}>, a sua pergunta para o *Quiz de Perguntas* foi **recusada**.\n${e.Info} | Pergunta: \`${question.question}\`\n📝 | ${reason}`.limit('MessageContent'),            
        })
            .catch(() => { })
    }

}