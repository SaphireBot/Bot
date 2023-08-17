import { ButtonInteraction } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { Database } from "../../../../classes/index.js"
import disable from "./disable.server.js"
import build from "./build.server.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: String, src: String } } commandData
 */
export default async (interaction, commandData) => {

    const { user, message, guildId } = interaction

    if (user.id != message.interaction.user.id)
        return interaction.reply({
            content: `${e.Deny} | Hey hey! Você não pode clicar aqui não, ok?`,
            ephemeral: true
        })

    // const guildData = await Database.Guild.findOne({ id: guildId })
    const guildData = await Database.getGuild(guildId)

    const execute = {
        welcome: {
            welcome: build,
            body: guildData.WelcomeChannel,
            type: 'welcome'
        },
        leave: {
            leave: build,
            body: guildData.LeaveChannel,
            type: 'leave'
        },
        disable: {
            disable,
            body: commandData
        }
    }[commandData.src]

    if (execute) return execute[commandData.src](interaction, execute.body, execute.type)

    return interaction.update({
        content: `${e.Animated.SaphireCry} | Sub-função não encontrada #16845345400`,
        embeds: [], components: []
    }).catch(() => { })
}