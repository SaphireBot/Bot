import { Modals } from "../../../../../../classes/index.js"
import { Emojis as e } from "../../../../../../util/util.js"

export default async interaction => {

    const { options } = interaction
    const user = options.getUser("add")

    if (!user)
        return await interaction.reply({
            content: `${e.Deny} | Usuário não encontrado.`,
            ephemeral: true
        })

    return await interaction.showModal(Modals.addFanart(user))

}