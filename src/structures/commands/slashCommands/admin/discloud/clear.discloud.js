import { Emojis as e } from "../../../../../util/util.js"

export default async interaction => {

    console.clear()

    return await interaction.reply({
        content: `${e.Check} | O terminal foi limpo com sucesso.`,
        ephemeral: true
    })
}