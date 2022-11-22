import { Emojis as e } from "../../../../util/util.js"

export default async ({ interaction, guildData, Database }) => {

    return await interaction.reply({
        content: `${e.Loading} | Em construção`,
        ephemeral: true
    })

}