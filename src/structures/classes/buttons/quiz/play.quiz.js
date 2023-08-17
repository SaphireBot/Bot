import QuizManager from "../../../../classes/games/QuizManager.js"
import Quiz from "../../../../classes/games/Quiz.js"
import { Emojis as e } from "../../../../util/util.js"

export default async interaction => {

    const { channel } = interaction

    if (QuizManager.channelsInGames.includes(channel.id))
        return await interaction.reply({
            content: `${e.Deny} | Ooops, já tem um Quiz rolando nesse canal, espere ele acabar para começar outro, ok?`,
            ephemeral: true
        })

    QuizManager.channelsInGames.push(channel.id)
    return new Quiz(interaction).askPreference()
}