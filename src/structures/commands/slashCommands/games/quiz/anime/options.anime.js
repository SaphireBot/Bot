import { Emojis as e } from "../../../../../../util/util.js"
import analise from './analise.anime.js'
import viewer from "./viewer.anime.js"

export default async (interaction, suggestId) => {

    const { options } = interaction
    const value = suggestId || options.getString('method')

    const execute = { analise }[value]
    if (execute) return execute(interaction)

    const isSearchValue = options.getString('search') || options.getString('my_content')
    if (isSearchValue) return viewer(interaction, isSearchValue)

    return await interaction.reply({
        content: `${e.Deny} | Sub-Função não encontrada. #1659577784`,
        ephemeral: true
    })
}