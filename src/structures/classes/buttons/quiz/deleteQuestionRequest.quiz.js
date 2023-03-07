import Quiz from "../../../../classes/games/Quiz.js";
import { ButtonStyle } from "discord.js";
import { SaphireClient as client } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

// Button Interaction
export default async interaction => {

    if (!interaction.message) return

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.DenyX} | Apenas os meus moderadores podem deletar perguntas do Quiz.\n${e.Info} | Caso você tenha visto algo errado, por favor, efetue uma denúncia ou solicite uma correção.`,
            ephemeral: true
        })

    const customIdData = JSON.parse(interaction.customId)
    const questionId = customIdData?.id

    if (!questionId)
        return await interaction.update({
            content: `${e.DenyX} | O ID da pergunta não foi encontrado.`,
            embeds: [], components: []
        })

    const question = Quiz.questions.find(q => q.questionId == questionId)
    if (!question)
        return await interaction.update({
            content: `${e.DenyX} | A pergunta não foi encontrada.`,
            embeds: [], components: []
        })

    return await interaction.update({
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Deletar Pergunta do Quiz',
                        custom_id: JSON.stringify({ c: 'quiz', src: 'deleteQuestion', id: questionId, type: 'delete' }),
                        style: ButtonStyle.Danger
                    },
                    {
                        type: 2,
                        label: 'Melhor não, voltar ao viewer',
                        custom_id: JSON.stringify({ c: 'quiz', src: 'deleteQuestion', id: questionId, type: 'preview' }),
                        style: ButtonStyle.Success
                    }
                ]
            }
        ]
    }).catch(() => { })

}