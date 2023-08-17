import { ButtonInteraction, ModalSubmitInteraction } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { SaphireClient as client, Database, Modals } from "../../../../classes/index.js"
import QuizManager from "../../../../classes/games/QuizManager.js"

/**
 * @param { ButtonInteraction | ModalSubmitInteraction } interaction
 */
export default interaction => {

    if (interaction.fields) return analiseChanges()
    const customId = JSON.parse(interaction.customId)
    const question = QuizManager.questions.find(qt => qt.questionId == customId.id)

    if (!question)
        return interaction.update({
            content: `${e.DenyX} | Nenhuma pergunta foi encontrada.`,
            embeds: [], components: []
        }).catch(() => { })

    return interaction.showModal(Modals.addOrEditCuriosity(question))

    function analiseChanges() {

        const { fields, message } = interaction
        const embed = message.embeds[0]?.data

        if (!embed)
            return interaction.update({
                content: `${e.Deny} | Algum ser muito gente boa, apagou a embed. Como vou pegar os dados agora?`,
                components: []
            }).catch(() => { })

        const questionId = embed.footer.text.replace('Question ID: ', '')
        const questionIndex = QuizManager.questions.findIndex(q => q.questionId == questionId)

        if (!QuizManager.questions[questionIndex])
            return interaction.update({
                content: `${e.DenyX} | A pergunta selecionada não foi encontrada. Tenta de novo?`,
                components: [], embeds: []
            }).catch(() => { })

        const curiosity0 = fields.getTextInputValue('curiosity-0')
        const curiosity1 = fields.getTextInputValue('curiosity-1')
        const curiosity2 = fields.getTextInputValue('curiosity-2')
        const curiosities = [curiosity0, curiosity1, curiosity2].filter(i => i)

        if (curiosities.some(x => curiosities.indexOf(x) !== curiosities.lastIndexOf(x)))
            return interaction.reply({ content: `${e.Deny} | As curiosidades não podem ser iguais.`, ephemeral: true })

        return Database.Quiz.findOneAndUpdate(
            { questionId },
            { $set: { curiosity: curiosities } },
            { new: true }
        )
            .then(document => {
                QuizManager.questions[questionIndex].curiosity = document.curiosity
                embed.color = client.green
                embed.fields[4].value = document.curiosity.join('\n \n') || "Confirmou sem enviar nada, que ousadia..."
                return interaction.update({ embeds: [embed], content: null }).catch(() => { })
            })
            .catch(error => {
                embed.color = client.red
                return interaction.update({
                    embeds: [embed, { color: client.red, title: `${e.bug} Erro ao Alterar Curiosidades`, description: `${error}`.limit('MessageEmbedDescription') }],
                    components: []
                })
            })

    }
}