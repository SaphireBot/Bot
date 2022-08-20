import { indexButton } from '../../../commands/functions/memorygame/util.js'
import { ButtonStyle } from 'discord.js'
import check from './check.tictactoe.js'
import win from './finish.tictactoe.js'

export default async (interaction, customIdData) => {

    const { user, message, guild } = interaction
    const { id, opponent: opponentId } = customIdData
    const commandAuthor = message.interaction.user
    const opponentUser = guild.members.cache.get(opponentId)?.user
    const availablePlayers = [commandAuthor.id, opponentId]

    if (!opponentUser || !availablePlayers.includes(user.id)) return

    const playNow = message.mentions.users.first()

    if (!playNow || playNow.id !== user.id) return

    const emojis = { [commandAuthor.id]: '❌', [opponentId]: '⭕' }
    const components = message.components.map(components => components.toJSON())
    const allButtons = components.map(row => row.components).flat()
    const row = components[indexButton[id]]
    const button = row.components.find(button => JSON.parse(button.custom_id).src.id === id)

    button.emoji = emojis[user.id]
    button.style = user.id === commandAuthor.id ? ButtonStyle.Success : ButtonStyle.Primary
    button.disabled = true

    const winResponse = check(components, allButtons)

    if (winResponse)
        return win({
            winResponse,
            author: availablePlayers[0], opponent: availablePlayers[1],
            components,
            interaction
        })

    return await interaction.update({
        content: `${user.id === commandAuthor.id ? opponentUser : commandAuthor}, é sua vez.`,
        components
    })

}