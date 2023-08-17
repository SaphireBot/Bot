import { SaphireClient as client, Modals } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async interaction => {

    if (!client.staff.includes(interaction.user.id))
        return await interaction.reply({
            content: `${e.DenyX} | Sinto-lhe em dizer isto, Majestade. Mas apenas os meus moderadores tem acesso a este recurso.`,
            ephemeral: true
        })

    const embed = interaction.message.embeds[0]?.data
    if (!embed)
        return await interaction.update({
            content: `${e.DenyX} | Embed principal não encontrada`,
            embeds: [], components: []
        }).catch(() => { })

    const category = embed.footer.text
    if (!category)
        return await interaction.update({
            content: `${e.DenyX} | A categoria não foi encontrada.`,
            embeds: [], components: []
        }).catch(() => { })

    if (!embed.fields?.length) embed.fields = []

    embed.fields[0]
        ? embed.fields[0] = {
            name: '📨 Solicitação Confirmada',
            value: `${e.Loading} Aguardando novo nome da categoria.`
        }
        : embed.fields.push({
            name: '📨 Solicitação Confirmada',
            value: `${e.Loading} Aguardando novo nome da categoria.`
        })

    await interaction.message.edit({ embeds: [embed] }).catch(() => { })
    return await interaction.showModal(Modals.newCategoryName(category))
}