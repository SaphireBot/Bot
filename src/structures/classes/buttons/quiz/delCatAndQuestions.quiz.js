import QuizManager from "../../../../classes/games/QuizManager.js";
import { ButtonStyle } from "discord.js";
import { SaphireClient as client, Database } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.Deny} | Ueepa! Apenas meus moderadores podem clicar nesse botão, ok?`,
            ephemeral: true
        })

    const category = interaction.message?.embeds[0]?.data?.footer?.text
    await interaction.update({
        content: `${e.Loading} | Deletando a categoria **${category}** e todas as suas perguntas...`,
        embeds: [], components: []
    })

    await delay(2500)

    let content = ''

    QuizManager.categories.splice(
        QuizManager.categories.findIndex(cat => cat == category), 1
    )
    await Database.Quiz.updateOne(
        { category: "SaveCategories" },
        { $pull: { enableCategories: category } }
    )
        .then(() => content += `${e.CheckV} | A categoria **${category}** foi deletada.`)
        .catch(err => content += `${e.DenyX} | Não foi possível deletar a categoria ${category}.\n${e.bug} | \`${err}\``)

    QuizManager.questions = QuizManager.questions.filter(q => q.category !== category)
    await Database.Quiz.deleteMany({ category })
        .then(data => content += `\n${e.CheckV} | ${data?.deletedCount || 0} Perguntas foram deletadas desta categoria.`)
        .catch(err => content += `\n${e.DenyX} | Não foi possível deletar as perguntas desta categoria.\n${e.bug} | \`${err}\``)

    await interaction.message.edit({
        content,
        components: [
            {
                type: 1,
                components: [{
                    type: 2,
                    label: 'Voltar ao início',
                    emoji: '⬅️',
                    custom_id: JSON.stringify({ c: 'quiz', src: 'back', userId: interaction.user.id }),
                    style: ButtonStyle.Primary
                }]
            }
        ]
    })

}