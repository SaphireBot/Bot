import { Emojis as e } from "../../../../util/util.js"
import ButtonInteraction from "../../ButtonInteraction.js"
import disable from './disable.twitch.js'

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: 'twitch', cName: TwitchChannelName, cgId: GuildTextChannelNotificationId } } commandData
 */
export default async ({ interaction }, commandData) => {

    if (!['a', 'd'].includes(commandData.t))
        return interaction.reply({ content: `${e.SaphireDesespero} | Sub-Função não encontrada. #468415343` })

    return disable(interaction, commandData)
}