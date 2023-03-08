import { ButtonStyle } from "discord.js";
import Quiz from "../../../../classes/games/QuizManager.js";
import { SaphireClient as client } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

export default async interaction => {

    const questionId = interaction.options.getString('selecionar')
    const question = Quiz.questions.find(q => q.questionId == questionId)

    if (!question)
        return await interaction.reply({
            content: `${e.Deny} | Nenhuma pergunta foi encontrada com o ID selecionado.`,
            ephemeral: true
        })

    const userSuggested = await client.users.fetch(question.suggestedBy).catch(() => null)

    const embed = {
        color: client.blue,
        title: `🔎 ${client.user.username}'s Question Viewer`,
        fields: [
            {
                name: '👤 Sugerida por',
                value: userSuggested
                    ? `${userSuggested.tag} - \`${question.suggestedBy}\``
                    : `Criador não encontrado - \`${question.suggestedBy}\``
            },
            {
                name: '📝 Pergunta',
                value: question.question || 'Pergunta não encontrada? Wow wow wow \`Error Code Location #215841\`'
            },
            {
                name: '✏️ Respostas',
                value: question.answers
                    ?.map(answer => `${answer.correct ? e.CheckV : e.DenyX} ${answer.answer}`)
                    ?.join('\n')
                    || 'Sem resposta?? Que isso? \`Error Code Location #215842\`'
            },
            {
                name: '🏷️ Categoria de Origem',
                value: question.category || 'Ok, essa categoria não existe? Como assim? \`Error Code Location #215843\`'
            },
            {
                name: '📊 Contagem',
                value: `↑ ${question.hits || 0} Acertos\n↓ ${question.misses || 0} Erros`
            },
            {
                name: '🆔 ID Location Database',
                value: `\`${question._id || 0}\``
            }
        ],
        footer: {
            text: `Question ID: ${question.questionId}`
        }
    }

    if (question.curiosity?.length)
        embed.fields.splice(3, 0, { name: `${e.Info} Curiosidades`, value: question.curiosity.join('\n') })

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

    if (client.staff.includes(interaction.user.id))
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

    return await interaction.reply({ embeds: [embed], components })

}