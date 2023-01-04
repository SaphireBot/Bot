import { SaphireClient as client, } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import viewCantadas from "../../../commands/functions/cantadas/view.cantadas.js"
import cantadaAdmin from "../../../commands/slashCommands/admin/admin/cantada.admin.js"
import accept from "./accept.cantada.js"
import deleteCantada from "./delete.cantada.js"
import deny from "./deny.cantada.js"
import likeCantada from "./like.cantada.js"

export default async ({ interaction, user, message }, commandData) => {

    const method = commandData.src

    if (method === 'delete')
        return deleteCantada(interaction, user, commandData, message)

    if (['like', 'unlike'].includes(method))
        return likeCantada({ interaction, message, method, commandData })

    if (method === 'random') {
        if (interaction?.message?.interaction?.user?.id !== user.id) return
        return viewCantadas({ interaction, buttonInteraction: true, commandData })
    }

    if (!client.staff.includes(user.id))
        return await interaction.reply({
            content: `${e.Deny} | Apenas os membros da Staff tem permissão para aceitar/recusar cantandas.`,
            ephemeral: true
        })

    const cantadaId = commandData.cId
    const { embeds } = message
    const embed = embeds[0]?.data

    if (method === 'next') {
        await cantadaAdmin(interaction, cantadaId)
        return await interaction.update({ components: [] })
            .catch(async () => await interaction.editReply({ components: [] }).catch(() => { }))
    }

    if (!embed)
        return await interaction.update({
            content: `${e.Deny} | Embed não encontrada`,
            embeds: [],
            components: []
        }).catch(() => { })

    const cantada = embed.fields[0].value
    if (!cantada)
        return await interaction.update({
            content: `${e.Deny} | Conteúdo da cantada não identificado`,
            embeds: [],
            components: []
        }).catch(() => { })

    return method === 'accept'
        ? accept(cantadaId, cantada.cantada, commandData, user, interaction, embed)
        : deny(embed, false, interaction, cantadaId)

}