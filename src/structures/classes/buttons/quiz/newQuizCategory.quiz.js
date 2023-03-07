import Quiz from "../../../../classes/games/Quiz.js"
import { SaphireClient as client, Database } from "../../../../classes/index.js"
import { DiscordPermissons, PermissionsTranslate } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"

export default async interaction => {

    const { fields, user, guild, channel } = interaction
    const category = fields.getTextInputValue('category')
    const reason = fields.getTextInputValue('reason')
    const categories = Quiz.categories || []

    if (categories.find(cat => cat?.toLowerCase() == category?.toLowerCase()))
        return await interaction.reply({
            content: `${e.DenyX} | Esta categoria já existe no banco de dados.`,
            ephemeral: true
        })

    if (Quiz.CategoriesIndications.find(ind => ind?.category?.toLowerCase() == category.toLowerCase()))
        return await interaction.reply({
            content: `${e.DenyX} | Esta categoria já foi indicada por outra pessoa e está esperando pela análise.`,
            ephemeral: true
        })

    const embed = {
        color: client.green,
        title: `${e.QuizLogo} New Suggestion Quiz Category`,
        fields: [
            {
                name: "📨 Register Data",
                value: `Usuário: **${user.tag} - \`${user.id}\`**\nServidor: **${guild.name} - \`${guild.id}\`**.`
            },
            {
                name: "🏷️ Categoria",
                value: category
            },
            {
                name: "📝 Motivo da Criação",
                value: reason
            }
        ]
    }

    const weebhookUrl = await Quiz.getWebhookUrl(channel)

    embed.fields.push(
        weebhookUrl
            ? {
                name: `🛰️ Global System Notification`,
                value: "Fique de boas, você será avisado aqui neste canal quando sua indicação for aceita/recusada."
            }
            : {
                name: `${e.Info} Dica Importante`,
                value: `Este comando é interligado com o GSN \`Global System Notification\`.\nEu preciso da permissão **${PermissionsTranslate[DiscordPermissons.ManageWebhooks]}** para te avisar se a sua indicação for aceita ou não aqui neste chat.`
            }
    )

    const dataSave = {
        userId: user.id,
        guildId: guild.id,
        channelId: channel.id,
        category, reason, weebhookUrl
    }

    return await Database.Client.updateOne(
        { id: client.user.id },
        { $push: { QuizCategoryIndications: { $each: [dataSave] } } }
    )
        .then(async () => {

            Quiz.CategoriesIndications.push(dataSave)
            embed.color = client.green
            embed.description = 'Sua indicação foi indicada com sucesso.'

            return await interaction.reply({ embeds: [embed] })
        })
        .catch(async err => {

            embed.color = client.red
            embed.description = `Sua indicação não foi indicada com sucesso.\n \n${e.bug} \`${err}\``

            return await interaction.reply({ mbeds: [embed] })
        })

}