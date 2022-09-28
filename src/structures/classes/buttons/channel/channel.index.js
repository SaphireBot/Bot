import { Emojis as e } from "../../../../util/util.js"
import deleteChannel from "./delete.channel.js"

export default async (interaction, { src, id }) => {

    const execute = {
        delete: deleteChannel
    }[src]

    if (!execute)
        return await interaction.update({
            content: `${e.Deny} | Nenhuma SubButtonFunction.exec() encontrada.`
        }).catch(() => { })

    return execute(interaction, { src, id })
}