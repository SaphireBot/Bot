import QuizManager from "../../../../classes/games/QuizManager.js";
import { SaphireClient as client, Database } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";
import { setTimeout as sleep } from 'node:timers/promises'

export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.DenyX} | Que peninha... Só os meus moderadores podem editar o nome de uma categoria, beleza?`,
            ephemeral: true
        })

    const message = interaction.message
    if (!message)
        return await interaction.reply({ content: `${e.Deny} | Ok ok, isso é bem estranho, mas a mensagem SUMIU!` })

    const embed = message.embeds[0]?.data
    if (!embed)
        return await interaction.update({
            content: `${e.Deny} | Embed principal de edição não encontrada.`,
            embeds: [], components: []
        }).catch(() => { })

    const originalCategoryName = embed.footer.text
    if (!originalCategoryName)
        return await interaction.update({
            content: `${e.DenyX} | O nome original da categoria se perdeu ao vento.`,
            embeds: [], components: []
        }).catch(() => { })

    const category = interaction.fields.getTextInputValue('categoryName')

    if (!embed.fields || !Array.isArray(embed.fields)) embed.fields = []

    embed.fields[0] = {
        name: '📝 Solicitação de Alteração',
        value: `Nome Anterior: ${originalCategoryName}\nNome Atual: ${category}\n${e.Loading} Alterando o nome da categoria no banco de dados...`
    }

    if (QuizManager.categories.find(cat => cat.toLowerCase() == category.toLowerCase())) {

        const response = {
            'true': `${e.DenyX} A nome dado é o mesmo da categoria atual.`,
            'false': `${e.DenyX} A categoria **${category}** já existe no banco de dados.`
        }[`${category.toLowerCase() == originalCategoryName.toLowerCase()}`]

        embed.fields[0].value = response
        return await interaction.update({ embeds: [embed] })
    }

    const components = interaction.message.components[0].toJSON()
    await interaction.update({ embeds: [embed], components: [] }).catch(() => { })

    let response = ''

    QuizManager.categories.splice(
        QuizManager.categories.findIndex(cat => cat.toLowerCase() == originalCategoryName.toLowerCase()),
        1, category
    )

    let pullAndPush = 0

    await sleep(1000)
    await Database.Quiz.updateOne(
        { category: 'SaveCategories' },
        { $pull: { enableCategories: originalCategoryName } }
    ).then(() => pullAndPush++).catch(console.log)

    await sleep(1000)
    await Database.Quiz.updateOne(
        { category: 'SaveCategories' },
        { $push: { enableCategories: category } }
    )
        .then(() => {
            return pullAndPush == 1
                ? response += `${e.CheckV} **${originalCategoryName}** -> **${category}**.`
                : response += `${e.DenyX} O nome da categoria principal não foi editada no banco de dados.`
        })
        .catch(err => response += `${e.DenyX} Não foi possível alterar o nome da categoria **${originalCategoryName}**.\n${e.bug} \`${err}\``)

    for (const i in QuizManager.questions)
        if (QuizManager.questions[i]?.category == originalCategoryName)
            QuizManager.questions[i].category = category
        else continue

    await sleep(1000)
    await Database.Quiz.updateMany(
        { category: originalCategoryName },
        { $set: { category } }
    )
        .then(value => response += `\n${e.CheckV} **${value.modifiedCount} perguntas** tiveram o nome da categoria alteradas.`)
        .catch(err => response += `\n${e.DenyX} Não foi possível alterar a categoria das perguntas.\n${e.bug} \`${err}\``)

    embed.footer.text = category
    embed.fields[0].value = response
    embed.description = embed.description.replace(`${originalCategoryName}`, `${category}`)

    return await interaction.message.edit({ embeds: [embed], components: [components] }).catch(console.log)
}