import { Emojis as e } from "../../../../../util/util.js"
import ButtonInteraction from "../../../ButtonInteraction.js"
import SelectMenuInteraction from "../../../SelectMenuInteraction.js"
import cancel from './cancel.multiplier.js'
import init from "./init.multiplier.js"
import multi from './multi.multiplier.js'
import game from './game.multiplier.js'

/**
 * @param { ButtonInteraction | SelectMenuInteraction } data
 * @param { {
 *      c: 'bet',
 *      src: 'multi',
 *      id: String | null,
 *      type: String
 * } } commandData
 */
export default async (data, commandData) => {

    const { interaction, user, message } = data

    if (user.id !== message.interaction?.user.id)
        return interaction.reply({
            content: `${e.DenyX} | No no no, você não pode clicar aqui. Cai fora!`,
            ephemeral: true
        })

    const execute = {
        cancel,
        multi,
        init,
        game
    }[commandData?.type]

    if (execute) return execute(interaction, commandData)

    return interaction.update({
        content: `${e.Animated.SaphireCry} | Nada foi encontrado pra esse botão... #168348354000`,
        embeds: [], components: [], ephemeral: true
    }).catch(() => { })
}