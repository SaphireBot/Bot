import Quiz from "../../../../classes/games/QuizManager.js";
import { ButtonStyle } from "discord.js";
import { SaphireClient as client } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.DenyX} | Apenas os meus moderadores podem analisar as perguntas indicadas.`,
            ephemeral: true
        })

    const questions = Quiz.QuestionsIndications || []

    if (!questions.length)
        return await interaction.reply({
            content: `${e.Deny} | Não tem nenhuma sugestão ativa no momento.`,
            ephemeral: true
        })

    const question = questions[0]

    if (!question)
        return await interaction.reply({
            content: `${e.Deny} | Não tem nenhuma questão foi encontrada.`,
            ephemeral: true
        })

    const userWhoSuggest = await client.users.fetch(question.suggestedBy).catch(() => null)
    const guild = await client.guilds.fetch(question.guildId).catch(() => null)

    const embed = {
        color: client.blue,
        title: `${e.QuizLogo} Question Suggest Analise`,
        fields: [
            {
                name: '📝 Pergunta Indicada',
                value: question.question
            },
            {
                name: '🏷️ Categoria Selecionada',
                value: question.category
            },
            {
                name: '✏️ Respostas Relacionadas',
                value: question.answers.map(answer => `${answer.correct ? e.CheckV : e.DenyX} \`${answer.answer}\``).join('\n')
            },
            {
                name: '🚩 Localização de Envio',
                value: `👤 ${userWhoSuggest?.tag || 'Not Found'} \`${question.suggestedBy}\`\n🏠 ${guild?.name || 'Not Found'} \`${question.guildId}\``
            },
            {
                name: '🛰️ Global System Notification',
                value: question.webhookUrl ? 'Ativado' : 'Desativado'
            }
        ],
        footer: {
            text: `Question ID: ${question.questionId}`
        }
    }

    if (question.curiosity?.length)
        embed.fields.splice(3, 0, { name: `${e.Info} Curiosidades`, value: question.curiosity.join('\n') })

    return await interaction.update({
        embeds: [embed],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Aceitar',
                    custom_id: JSON.stringify({ c: 'quiz', src: 'acceptQuestion' }),
                    style: ButtonStyle.Success
                },
                {
                    type: 2,
                    label: 'Recusar',
                    custom_id: JSON.stringify({ c: 'quiz', src: 'refuseModel', id: question.questionId }),
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    label: 'Editar',
                    custom_id: JSON.stringify({ c: 'quiz', src: 'editQuestion' }),
                    style: ButtonStyle.Secondary
                },
                {
                    type: 2,
                    label: 'Fechar Verificação',
                    custom_id: JSON.stringify({ c: 'delete' }),
                    style: ButtonStyle.Danger
                }
            ]
        }]
    }).catch(() => { })
}