import { ButtonInteraction } from "discord.js";
import { SaphireClient as client, Database } from "../../../../../classes/index.js";
import { Emojis as e } from "../../../../../util/util.js";
import checkJokempo from "../local/check.jokempo.js";
import draw from './draw.jokempo.js'
import win from './win.jokempo.js'
import lose from './lose.jokempo.js'

/**
 * @param { ButtonInteraction } interaction
 * @param { { play: 'stone', id: messageId } } commandData
 */
export default async (interaction, commandData) => {

    // {
    //     id: jokempo.id, -- string
    //     value: jokempo.value, -- number
    //     webhookUrl: jokempo.webhookUrl, -- string
    //     creatorId: jokempo.creatorId, -- string
    //     creatorOption: jokempo.creatorOption, -- string
    //     userId: user.id, -- string
    //     channelId: message.channel.id -- string
    // }
    const gameData = await Database.Cache.Jokempo.get(`Global.${commandData.id}`)

    if (!gameData)
        return interaction.reply({
            content: `${e.DenyX} | Jogo já apostado ou não encontrado no cache.`
        }).catch(() => { })

    const { user } = interaction

    if (user.id !== gameData.userId)
        return interaction.reply({
            content: `${e.Deny} | Hey, você não pode jogar nesta aposta, sabia?`,
            ephemeral: true
        })

    const { play } = commandData
    const userData = await client.getUser(gameData.creatorId)
    const emojis = { stone: '👊', paper: '🤚', scissors: '✌️' }
    gameData.userPlay = play
    gameData.creatorData = userData

    const winner = checkJokempo({ [user.id]: emojis[play], [gameData.creatorId]: emojis[gameData.creatorOption] })

    await Database.Cache.Jokempo.delete(`Global.${commandData.id}`)
    if (winner == 'draw') return draw(interaction, gameData)
    if (winner[0] == user.id) return win(interaction, gameData)
    return lose(interaction, gameData)

}