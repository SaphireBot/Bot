import { SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"
import deleteRather from "./functions/delete.rather.js"
import editRather from "./functions/edit.rather.js"

export default async interaction => {

    const { options, user } = interaction

    if (!client.staff.includes(user.id))
        return await interaction.reply({
            content: `${e.Deny} | Você não faz parte da equipe administrativa.`,
            ephemeral: true
        })

    const optionName = options.data[0].options[0].name
    const optionValue = options.data[0].options[0].value // TO OFF

    switch (optionName) {
        case 'delete': deleteRather(interaction, optionValue); break;
        case 'edit': editRather(interaction, optionValue); break;
        default:
            await interaction.reply({
                content: `${e.Deny} | Nenhum sub-função definida.`,
                ephemeral: true
            })
            break;
    }

    return
}