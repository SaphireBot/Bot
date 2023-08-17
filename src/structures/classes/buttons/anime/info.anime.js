import { Emojis as e } from "../../../../util/util.js"
import searchAnime from "../../../commands/functions/anime/search.anime.js"

export default async interaction => {

    const { message } = interaction
    const { embeds } = message
    const embed = embeds[0]?.data

    if (!embed)
        return await interaction.update({
            content: `${e.Deny} | Embed não encontrada.`,
            components: []
        })

    const animeName = embed.fields[0]?.value

    if (!animeName)
        return await interaction.update({
            content: `${e.Deny} | Nome do anime não encontrado.`,
            components: []
        })

    return searchAnime(interaction, animeName)


}