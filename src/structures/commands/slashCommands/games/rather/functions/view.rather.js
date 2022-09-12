import {
    SaphireClient as client,
    Database
} from "../../../../../../classes/index.js"
import { Emojis as e } from "../../../../../../util/util.js"

export default async (interaction, value) => {

    const question = await Database.Rather.findOne({ id: value })

    if (!question)
        return await interaction.reply({
            content: `${e.Deny} | Questão não encontrada.`,
            ephemeral: true
        })

    const optionOneLength = question.optionOne.users.length || 0
    const optionTwoLength = question.optionTwo.users.length || 0
    const total = optionOneLength + optionTwoLength
    const optionOnePercent = total > 0 ? parseInt((optionOneLength / total) * 100)?.toFixed(1) || 0 : 0
    const optionTwoPercent = total > 0 ? parseInt((optionTwoLength / total) * 100)?.toFixed(1) || 0 : 0

    return await interaction.reply({
        embeds: [{
            color: client.blue,
            title: '🔍 Dados da Questão - Rather Game',
            description: `Question ID: \`${question.id}\`\n\`${optionOneLength + optionTwoLength}\` usuários responderam esta questão`,
            fields: [
                {
                    name: `🔵 Opção 1 - ${optionOnePercent}%`,
                    value: question.optionOne.question
                },
                {
                    name: `🟢 Opção 2 - ${optionTwoPercent}%`,
                    value: question.optionTwo.question
                },
                {
                    name: '👤 Autor',
                    value: `${client.users.resolve(question.authorId)?.tag || 'Not Found'} - \`${question.authorId}\``
                }
            ],
            footer: { text: question.edited ? 'Resposta original editada' : null }
        }],
        ephemeral: true
    })

}