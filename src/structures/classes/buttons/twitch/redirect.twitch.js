import { Emojis as e } from "../../../../util/util.js"
import { Message, User } from "discord.js"
import ButtonInteraction from "../../ButtonInteraction.js"
import disable from './disable.twitch.js'
import active from './active.twitch.js'

/**
 * @param { ButtonInteraction } interaction
 * @param { Message } message
 * @param { User } user
 * @param { { c: 'twitch', cName: TwitchChannelName, cgId: GuildTextChannelNotificationId } } commandData
 */
export default async ({ interaction, message, user }, commandData) => {

    if (commandData.src == 'active')
        return active(interaction, commandData)

    if (!['a', 'd'].includes(commandData.t))
        return interaction.reply({ content: `${e.SaphireDesespero} | Sub-Função não encontrada. #468415343` })

    return disable(interaction, commandData)
}