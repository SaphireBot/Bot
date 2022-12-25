import buttonGenerator from './generateButton.tictactoe.js'
import { Emojis as e } from '../../../../util/util.js'

export default async (interaction, opponent) => {

    const buttons = buttonGenerator(opponent.id)

    const playerRandom = [interaction.user, opponent].random()

    return await interaction.reply({
        content: `${e.Loading} | ${playerRandom}, é sua vez.`,
        components: buttons
    })
}