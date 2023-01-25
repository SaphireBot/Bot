import { Emojis as e } from "../../../../../util/util.js"
import options from "./animeQuiz/options.anime.js"
import start from "./animeQuiz/start.anime.js"
import suggest from './animeQuiz/suggest.anime.js'

export default async interaction => {

    const subCommand = interaction.options.getSubcommand()

    const execute = { suggest, options, start }[subCommand]

    if (!execute)
        return await interaction.reply({
            content: `${e.Deny} | Sub-Função não encontrada. #94463`,
            ephemeral: true
        })

    return execute(interaction)
}