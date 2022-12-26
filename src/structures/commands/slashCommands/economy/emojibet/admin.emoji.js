import { Modals, SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

export default async (interaction, method) => {

    const { user } = interaction

    if (!client.admins.includes(user.id))
        return await interaction.reply({
            content: `${e.Deny} | Apenas administradores do meu sistema tem acesso a este comando.`,
            ephemeral: true
        })

    if (method === 'add')
        return await interaction.showModal(Modals.addEmoji)

    return await interaction.reply({
        content: `${e.Loading} | Comando em construção.`,
        ephemeral: true
    })
}