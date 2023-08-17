import { ButtonStyle } from "discord.js";
import Quiz from "../../../../classes/games/QuizManager.js";
import { SaphireClient as client } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.DenyX} | Apenas os meus moderadores podem analisar os reportes.`,
            ephemeral: true
        })

    const reports = Quiz.reports

    if (!reports.length)
        return await interaction.reply({
            content: `${e.Deny} | Não tem nenhum reporte a ser analisado agora.`,
            ephemeral: true
        })

    const report = reports[0]

    const user = await client.users.fetch(report.userId)
        .then(u => `${u.username} - \`${u.id}\``)
        .catch(() => `User Not Found - \`${report.userId}\``)

    const guild = await client.guilds.fetch(report.guildId)
        .then(g => `${g.name} - \`${g.id}\``)
        .catch(() => `Server Not Found - \`${report.guildId}\``)

    const question = Quiz.questions.find(q => q.questionId == report?.questionId)

    if (!question) {
        Quiz.removeReport(report.reportId)
        return await interaction.update({
            content: `${e.Deny} | Pergunta do reporte não encontrada.`,
            embeds: [],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Reporte Removido',
                        custom_id: 'disabled',
                        style: ButtonStyle.Secondary,
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
    }

    return await interaction.update({
        content: null,
        embeds: [{
            color: client.blue,
            title: `🔎 ${client.user.username}'s Report Analise`,
            description: `\`\`\`txt\n${report.content}\n\`\`\``,
            fields: [
                {
                    name: '🚩 Localização',
                    value: `👤 ${user}\n🏠 ${guild}`
                },
                {
                    name: '🛰️ Global System Notification',
                    value: report.webhookUrl ? 'Ativado' : 'Desativado'
                },
                {
                    name: '🏷️ Categoria',
                    value: question?.category || 'Categoria não localizada'
                },
                {
                    name: '📝 Pergunta',
                    value: question?.question || 'Pergunta não localizada'
                },
                {
                    name: '✏️ Respostas',
                    value: question?.answers
                        .map(answer => `${answer?.correct ? e.CheckV : e.DenyX} ${answer?.answer}`)
                        .join('\n')
                        || 'Respostas não localizadas'
                }
            ],
            footer: {
                text: `Question ID: ${question.questionId}`
            }
        }],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Concluir Reporte',
                    emoji: e.Admin,
                    custom_id: JSON.stringify({ c: 'quiz', src: 'modalFeedback', id: report.reportId }),
                    style: ButtonStyle.Success
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
                    emoji: e.Admin,
                    custom_id: JSON.stringify({ c: 'quiz', src: 'editPainel', id: question.questionId }),
                    style: ButtonStyle.Secondary
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
    }).catch(() => { })
}