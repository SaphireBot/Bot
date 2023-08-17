import { SaphireClient as client } from "../../../../classes/index.js";
import { ButtonInteraction } from "discord.js";
import { Emojis as e } from "../../../../util/util.js";
import removeGuild from "./functions/removeGuild.admin.js";
import leave from "./functions/leave.admin.js";

/**
 * @param { ButtonInteraction } interaction
 */
export default interaction => {

    const { customId, user } = interaction

    if (!client.admins.includes(user.id))
        return interaction.reply({
            content: `${e.DenyX} | Apenas os administradores do meu sistema pode usar este recurso.`,
            ephemeral: true
        })

    const data = JSON.parse(customId || {})

    if (!data?.src)
        return interaction.reply({
            content: `${e.DenyX} | Nenhum recurso de sub-função encontrado. #6486341210`,
            ephemeral: true
        })

    const execute = { removeGuild, leave }[data.src]
    if (execute) return execute(interaction)

    return interaction.reply({
        content: `${e.DenyX} | Nenhum função foi encontrada para este botão.`,
        ephemeral: true
    })
}