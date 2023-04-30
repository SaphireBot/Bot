import { Database, SelectMenuInteraction, ButtonInteraction } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/* Local/Guild Jokempo  */
import clientPlay from "./local/clientPlay.jokempo.js"
import userPlay from "./local/userPlay.jokempo.js"
import deny from "./local/refuse.jokempo.js"
import start from "./local/start.jokempo.js"

/* Global Jokempo  */
import send from "./global/send.jokempo.js"
import bet from "./global/bet.jokempo.js"
import save from "./global/save.jokempo.js"
import exec from "./global/execute.jokempo.js"
import select from "./global/select.jokempo.js"
import disabled from "./global/disabled.jokempo.js"
import play from "./global/play.jokempo.js"

/**
 * @param { ButtonInteraction | SelectMenuInteraction } Interaction
 * @param { { 
 *        c: 'jkp',
 *        msgId: messageId,
 *        type: "bot" | "user" | "deny" | "start" | "send" | "bet" | "save",
 *        play: "stone" | "paper" | "scissors",
 *        value: Number
 *        } } commandData
 */
export default async (Interaction, commandData) => {

    const { interaction, message, user } = Interaction
    const gameData = await Database.Cache.Jokempo.get(message.id)

    const firstClassExecute = { send, bet, save, exec, select, disabled, play }[commandData.type]
    if (firstClassExecute) return firstClassExecute(interaction, commandData)

    if (!gameData)
        return interaction.update({
            content: `${e.Animated.SaphireCry} | Jokempo não foi encontrado no cache.`,
            components: [], embeds: []
        }).catch(() => { })

    if (commandData.type == 'start')
        return start(interaction, commandData.play)

    if (!gameData.players.includes(user.id))
        return interaction.reply({
            content: `${e.DenyX} | Hey, você não está participando desta partida, ok?`,
            ephemeral: true
        })

    const execute = { bot: clientPlay, user: userPlay, deny, send, bet }[commandData.type]

    if (!execute)
        return await interaction.update({
            content: `${e.Deny} | {SubFunctionNonExist} #168768354`,
            embeds: [], components: []
        }).catch(() => { })

    return execute(interaction, commandData.play)
}