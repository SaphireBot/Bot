import { PermissionsBitField, StringSelectMenuInteraction, ButtonInteraction, ChannelSelectMenuInteraction } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import capslock from "./capslock.spam.js"
import messages from "./messages.spam.js"
import repeat from "./repeat.spam.js"
import percent from "./percent.spam.js"
import spamServer from "../../../commands/slashCommands/moderation/functions/server/spam.server.js"
import disablePercent from "./disablePercent.spam.js"
import enablePercent from "./enablePercent.spam.js"
import enable from "./enable.spam.js"
import disable from "./disable.spam.js"
import setPercent from "./setPercent.spam.js"
import channels from "./channels.spam.js"
import removeChannels from "./removeChannels.spam.js"
import disableRepeat from "./disableRepeat.spam.js"
import enableRepeat from "./enableRepeat.spam.js"
import roles from "./roles.spam.js"
import removeRoles from "./removeRoles.spam.js"
import messageEnable from "./messageEnable.spam.js"
import messageDisable from "./messageDisable.spam.js"

/**
 * @param { StringSelectMenuInteraction | ButtonInteraction | ChannelSelectMenuInteraction } interaction
 * @param { 'capslock' | 'messages' | 'repeat' | 'percent' | 'back' } value
 */
export default (interaction, value) => {

    const { member } = interaction

    if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({
            content: `${e.Deny} | Apenas **administradores** podem acessar esta função.`,
            ephemeral: true
        })

    if (value == 'back') return spamServer(interaction, null, true)

    const execute = {
        capslock, messages, repeat,
        percent, disablePercent, enablePercent,
        enable, disable, channels, removeChannels,
        disableRepeat, enableRepeat, roles, removeRoles,
        messageEnable, messageDisable
    }[value]

    if (execute) return execute(interaction)

    if (!isNaN(value) && Number(value) <= 100)
        return setPercent(interaction, Number(value))

    return interaction.reply({
        content: `${e.Animated.SaphireCry} | Não foi possível achar nenhum sub-função. #687441384000`,
        ephemeral: true
    })

}