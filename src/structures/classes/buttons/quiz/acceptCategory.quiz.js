import axios from "axios";
import Quiz from "../../../../classes/games/QuizManager.js";
import { ButtonStyle } from "discord.js";
import { SaphireClient as client, Database } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.DenyX} | Apenas os meus moderadores podem aceitar as categorias indicadas.`,
            ephemeral: true
        })

    const { message } = interaction

    if (!message)
        return await interaction.update({ content: `${e.DenyX} | Messagem de validação não encontrada.`, embeds: [], components: [] }).catch(() => { })

    const embeds = message.embeds || []
    const embed = embeds[0]?.data
    if (!embeds.length || !embed)
        return await interaction.update({
            content: `${e.DenyX} | Embed de validação não encontrada.`,
            embeds: [], components: []
        }).catch(() => { })

    const category = embed.fields[1]?.value

    const indicationData = Quiz.CategoriesIndications.find(ind => ind.category?.toLowerCase() == category?.toLowerCase())

    if (!indicationData)
        return await interaction.update({
            content: `${e.DenyX} | Indicação não encontrada no banco de dados.`,
            embeds: [], components: []
        }).catch(() => { })

    if (indicationData.webhookUrl) GSNSendMessage()

    return await Database.Quiz.updateOne(
        { category: "SaveCategories" },
        {
            $push: {
                enableCategories: { $each: [category] }
            }
        },
        { upsert: true }
    )
        .then(async () => {
            Quiz.CategoriesIndications.shift()
            Quiz.categories.push(category)
            await Database.Client.updateOne({ id: client.user.id }, { $pull: { QuizCategoryIndications: { category: category } } })

            embed.color = client.green
            embed.fields.push({ name: `${e.Check} Ok Ok!`, value: "Uma nova categoria acaba de ser criada!" })

            return await interaction.update({
                embeds: [embed],
                components: [{
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Próximo',
                            custom_id: JSON.stringify({ c: 'quiz', src: 'reviewCategory' }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Apagar mensagem',
                            custom_id: JSON.stringify({ c: 'delete' }),
                            style: ButtonStyle.Danger
                        }
                    ]
                }]
            }).catch(() => { })
        })

    async function GSNSendMessage() {

        return await axios.post(indicationData.webhookUrl, {
            username: "Saphire Global System Notification",
            avatarURL: "./src/images/webhooks/anime_reporter.png",
            content: `${e.Notification} | <@${indicationData.userId}>, sua indicação para uma nova categoria no comando \`/quiz perguntas\` foi **aceita**.\n${e.Info} | Categoria indicada: \`${indicationData.category}\``,
            "content-type": "application/json"
        })
            .catch(() => { })
    }
}