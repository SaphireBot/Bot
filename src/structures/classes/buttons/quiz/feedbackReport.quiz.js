import axios from "axios";
import { ButtonStyle } from "discord.js";
import Quiz from "../../../../classes/games/QuizManager.js";
import { SaphireClient as client } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

// Modal Interaction
export default async interaction => {

    const customIdData = JSON.parse(interaction.customId)
    const reportId = customIdData.id
    const report = Quiz.reports.find(r => r?.reportId == reportId)

    if (!report)
        return await interaction.update({
            content: `${e.Deny} | Reporte não encontrado.`,
            embeds: [],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Concluir Reporte',
                        custom_id: 'disabled',
                        style: ButtonStyle.Success,
                        disabled: true
                    },
                    {
                        type: 2,
                        label: 'Voltar para as opções',
                        custom_id: JSON.stringify({ c: 'quiz', src: 'options' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Fechar Analise',
                        custom_id: JSON.stringify({ c: 'delete' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }]
        })

    const feedback = interaction.fields.getTextInputValue('feedback')

    if (report.webhookUrl) executeWebhook(report.webhookUrl, report.userId)

    Quiz.removeReport(report.reportId)

    const components = interaction.message.components[0].toJSON()
    components.components.splice(0, 1, {
        type: 2,
        style: ButtonStyle.Success,
        label: 'Analisar Próximo Reporte',
        custom_id: JSON.stringify({ c: 'quiz', src: 'reviewReports' })
    })

    const embed = interaction.message.embeds[0]?.data
    if (embed) embed.color = client.green

    return await interaction.update({ embeds: embed ? [embed] : [], components: [components] }).catch(() => { })

    async function executeWebhook(webhookUrl, userId) {
        return await axios.post(webhookUrl, {
            content: `${e.Notification} | <@${userId}>, o seu report no *Quiz de Perguntas* foi analisado por um dos meus moderadores.\n📝 | *${feedback}*`
        }).catch(() => { })
    }
}