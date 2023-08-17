import { Emojis as e } from "../../../../../util/util.js"
import adminEmoji from "./admin.emoji.js"
import handlerviewEmoji from "./handlerview.emoji.js"

export default async interaction => {

    const method = interaction.options.getString('method')

    if (method === 'view')
        return handlerviewEmoji(interaction)

    if (['add', 'remove'].includes(method))
        return adminEmoji(interaction, method)

    return await interaction.reply({
        content: `${e.Deny} | Não foi possível obter a sub-função.`,
        ephemeral: true
    })
}