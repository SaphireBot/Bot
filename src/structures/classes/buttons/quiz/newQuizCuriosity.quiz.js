import Quiz from "../../../../classes/games/QuizManager.js"
import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

// Modal Interaction
export default async interaction => {

    const { fields, message } = interaction
    const embed = message.embeds[0]?.data

    if (!embed)
        return await interaction.update({
            content: `${e.Deny} | Algum ser muito gente boa, apagou a embed. Como vou pegar os dados agora?`,
            components: []
        }).catch(() => { })

    const questionId = embed.footer.text.replace('Question ID: ', '')
    const questionIndex = Quiz.QuestionsIndications.findIndex(q => q.questionId == questionId)
    const question = Quiz.QuestionsIndications[questionIndex]

    if (!question)
        return await interaction.update({
            content: `${e.DenyX} | A pergunta selecionada não foi encontrada. Tenta de novo?`,
            components: [], embeds: []
        }).catch(() => { })

    const curiosity0 = fields.getTextInputValue('curiosity-0')
    const curiosity1 = fields.getTextInputValue('curiosity-1')
    const curiosity2 = fields.getTextInputValue('curiosity-2')
    const curiosities = [curiosity0, curiosity1, curiosity2].filter(i => i)

    if (curiosities.some(x => curiosities.indexOf(x) !== curiosities.lastIndexOf(x)))
        return await interaction.reply({ content: `${e.Deny} | Curiosidades não podem ser iguais.`, ephemeral: true })

    Quiz.QuestionsIndications[questionIndex].curiosity = curiosities
    embed.fields[3].value = curiosities.join('\n ') || "Alguém confirmou sem enviar nada, que ousadia..."
    const components = interaction.message.components[0].toJSON()
    components.components[0].label = `Adicionar Curiosidade (${3 - curiosities.length})`

    return await interaction.update({ embeds: [embed], components: [components], content: null }).catch(() => { })
}