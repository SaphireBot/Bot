import { Database } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import ButtonInteractionClass from "../../ButtonInteraction.js"
import clientPlay from "./clientPlay.jokempo.js"
import userPlay from "./userPlay.jokempo.js"
import deny from "./refuse.jokempo.js"
import start from "./start.jokempo.js"

/**
 * @param { ButtonInteractionClass } ButtonInteraction
 * @param { { 
 *        c: 'jkp',
 *        msgId: messageId,
 *        type: "bot" | "user" | "deny" | "start",
 *        play: "stone" | "paper" | "scissors"
 *        } } commandData
 */
export default async (ButtonInteraction, commandData) => {

    const { interaction, message, user } = ButtonInteraction
    const gameData = await Database.Cache.Jokempo.get(message.id)

    if (!gameData)
        return interaction.update({
            content: `${e.cry} | Jokempo não foi encontrado no cache.`,
            components: []
        }).catch(() => { })

    if (commandData.type == 'start')
        return start(interaction, commandData.play)

    if (!gameData.players.includes(user.id))
        return interaction.reply({
            content: `${e.DenyX} | Hey, você não está participando desta partida, ok?`,
            ephemeral: true
        })

    const execute = { bot: clientPlay, user: userPlay, deny }[commandData.type]

    if (!execute)
        return await interaction.update({
            content: `${e.Deny} | {SubFunctionNonExist} #168768354`,
            embeds: [], components: []
        }).catch(() => { })

    return execute(interaction, commandData.play)
}