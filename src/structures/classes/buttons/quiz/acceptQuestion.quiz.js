import axios from "axios";
import Quiz from "../../../../classes/games/QuizManager.js";
import { ButtonStyle } from "discord.js";
import { SaphireClient as client, Database } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";
import QuizManager from "../../../../classes/games/QuizManager.js";

// Button Interaction
export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.DenyX} | Apenas os meus moderadores podem aceitar as perguntas indicadas.`,
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
    const question = Quiz.QuestionsIndications.find(q => [q.question, q.questionId].includes(fields[0]?.value))

    if (!question)
        return await interaction.update({
            content: `${e.DenyX} | Solicitação não encontrada.`,
            embeds: [], components: []
        }).catch(() => { })

    const isAdminEdit = JSON.parse(interaction.customId)

    if (!QuizManager.categories.includes(question.category)) {
        embed.color = client.red
        await interaction.update({
            embeds: [embed, {
                color: client.red,
                title: `${e.DenyX} Categoria Inexistente`,
                description: 'A categoria selecionada pelo usuário foi editada ou não existe.',
                footer: { text: 'Location Code ID: #9153575887' }
            }],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: "Erro na Validação de Dados",
                            custom_id: 'removed',
                            style: ButtonStyle.Danger,
                            disabled: true
                        }
                    ]
                }
            ]
        }).catch(() => { })
        return executeWebhook(question.webhookUrl, null, 'unknownCategory')
    }

    return isAdminEdit?.type == 'admin'
        ? await Database.Quiz.findOneAndUpdate({ questionId: question.questionId }, {
            $set: {
                answers: question.answers,
                category: question.category,
                hits: question.hits || 0, misses: question.misses || 0,
                question: question.question,
                questionId: question.questionId,
                suggestedBy: question.suggestedBy,
                curiosity: question.curiosity?.length ? [...question.curiosity] : []
            }
        }, { new: true, upsert: true })
            .then(async doc => {

                if (Quiz.questions.findIndex(q => q.questionId == doc.questionId) !== -1)
                    Quiz.questions.splice(
                        Quiz.questions.findIndex(q => q.questionId == doc.questionId), 1, doc
                    )
                embed.color = client.green

                const components = [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: "Edição Efetuada com Sucesso",
                        custom_id: 'success',
                        style: ButtonStyle.Success,
                        disabled: true,
                    }]
                }]

                const customData = JSON.parse(interaction.customId)
                if (customData?.byReport)
                    components[0].components.push({
                        type: 2,
                        style: ButtonStyle.Primary,
                        label: 'Analisar Próximo Reporte',
                        custom_id: JSON.stringify({ c: 'quiz', src: 'reviewReports' })
                    })

                addSafiras(doc.suggestedBy)
                return await interaction.update({ embeds: [embed], components }).catch(() => { })
            })
            .catch(async reason => {

                const errorData = {
                    11000: 'Esta pergunta já existe no banco de dados'
                }[reason.code] || null

                embed.color = client.red
                return await interaction.update({
                    embeds: [embed, {
                        color: client.red,
                        title: `${e.bug} Erro na Verificação`,
                        description: errorData,
                        fields: [{ name: '📝 Error Log', value: `${reason}` }
                        ],
                        footer: { text: 'Location Code ID: #9153575427' }
                    }],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    label: "Erro na Validação de Dados",
                                    custom_id: 'removed',
                                    style: ButtonStyle.Danger,
                                    disabled: true
                                }
                            ]
                        }
                    ]
                }).catch(() => { })
            })
        : new Database.Quiz({
            answers: question.answers,
            category: question.category,
            hits: question.hits || 0, misses: question.misses || 0,
            question: question.question,
            questionId: question.questionId,
            suggestedBy: question.suggestedBy,
            curiosity: question.category?.length ? [...question.curiosity] : []
        })
            .save()
            .then(async document => {
                Quiz.questions.push(document)
                Quiz.QuestionsIndications.splice(
                    Quiz.QuestionsIndications.findIndex(q => q.questionId == document.questionId), 1
                )

                await Database.Client.updateOne({ id: client.user.id },
                    { $pull: { QuizQuestionsIndications: { questionId: question.questionId } } }
                )

                embed.color = client.green
                embed.description = `Document ID: ${document._id}`
                await interaction.update({
                    embeds: [embed],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    label: "Solicitação Aceita",
                                    custom_id: 'accepted',
                                    style: ButtonStyle.Success,
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
                }).catch(() => { })

                addSafiras(document.suggestedBy)
                if (question.webhookUrl) return executeWebhook(question.webhookUrl, document._id, 'success')
                return
            })
            .catch(async reason => {

                await Database.Client.updateOne({ id: client.user.id },
                    { $pull: { QuizQuestionsIndications: { questionId: question.questionId } } }
                )

                const errorData = {
                    11000: 'Esta pergunta já existe no banco de dados'
                }[reason.code] || null

                if (reason.code == 11000) {
                    Quiz.QuestionsIndications.splice(
                        Quiz.QuestionsIndications.findIndex(q => q.question == question.questionId), 1
                    )
                    executeWebhook(question.webhookUrl, null, 'equal')
                } else executeWebhook(question.webhookUrl, null, 'error')

                embed.color = client.red
                return await interaction.update({
                    embeds: [embed, {
                        color: client.red,
                        title: `${e.bug} Erro na Verificação`,
                        description: errorData,
                        fields: [{ name: '📝 Error Log', value: `${reason}` }
                        ],
                        footer: { text: 'Location Code ID: #9153575428' }
                    }],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    label: "Solicitação Removida",
                                    custom_id: 'removed',
                                    style: ButtonStyle.Secondary,
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
                }).catch(() => { })
            })

    async function executeWebhook(webhookUrl, documentId, type) {

        if (!webhookUrl) return

        const content = {
            error: `${e.Notification} | <@${question.suggestedBy}>, a sua pergunta para o *Quiz de Perguntas* foi **perdida**.\n${e.Info} | Pergunta: \`${question.question}\`\n📝 | *Houve um erro no validador, por favor, mande sua indicação novamente.*`,
            equal: `${e.Notification} | <@${question.suggestedBy}>, a sua pergunta para o *Quiz de Perguntas* foi **recusada**.\n${e.Info} | Pergunta: \`${question.question}\`\n📝 | *A sua pergunta já existe no banco de dados.*`,
            unknownCategory: `${e.Notification} | <@${question.suggestedBy}>, a sua pergunta para o *Quiz de Perguntas* foi **perdida**.\n${e.Info} | Pergunta: \`${question.question}\`\n📝 | *A categoria selecionada foi editada ou não existe, por favor, manda sua indicação novamente.*`,
            success: `${e.Notification} | <@${question.suggestedBy}>, a sua pergunta para o *Quiz de Perguntas* foi **aceita**.\n${e.Info} | Pergunta: \`${question.question}\`\n🆔 | *${documentId}*`
        }[type]

        if (!content) return

        return await axios.post(webhookUrl, { content })
            .catch(() => { })
    }

    async function addSafiras(userId) {
        await Database.User.findOneAndUpdate(
            { id: userId },
            {
                $inc: {
                    Balance: 2000
                },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)}`,
                            data: `${e.gain} Ganhou 2000 Safiras via **Quiz Question Accepted**`
                        }],
                        $position: 0
                    }
                }
            },
            { upsert: true, new: true }
        )
            .then(doc => Database.saveUserCache(doc?.id, doc))
    }

}