import Quiz from "../../../../classes/games/Quiz.js";
import { Emojis as e } from "../../../../util/util.js";
import { Modals, SaphireClient as client } from "../../../../classes/index.js";

export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.DenyX} | Apenas os meus moderadores podem editar o conteúdo das indicações.`,
            ephemeral: true
        })

    if (!interaction.message || !interaction.message.embeds?.length)
        return await interaction.reply({
            content: `${e.DenyX} | Não foi possível obter a mensagem de origem.`,
            ephemeral: true
        })

    const { message } = interaction
    const embed = message.embeds[0]?.data

    if (!embed)
        return await interaction.reply({
            content: `${e.DenyX} | Não foi possível obter a embed da mensagem de origem.`
        })

    const questionId = embed.footer?.text?.replace('Question ID: ', '')
    if (!questionId)
        return await interaction.reply({ content: `${e.DenyX} | Não foi possível obter o ID da indicação.` })

    const question = [...Quiz.questions, ...Quiz.QuestionsIndications].find(q => q.questionId == questionId)
    if (!question)
        return await interaction.reply({ content: `${e.DenyX} | Não foi possível obter a indicação.` })

    const modal = Modals.editQuestionData(question, embed.title == `🔎 ${client.user.username}'s Question Viewer`)
    return await interaction.showModal(modal)
}