import { PermissionsBitField } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { Database, TwitchManager } from "../../../../classes/index.js"
import ButtonInteraction from "../../ButtonInteraction.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: 'twitch', cName: TwitchChannelName, cId: GuildTextChannelNotificationId } } commandData
 */
export default async (interaction, commandData) => {

    const { cName: streamer, cId: channelId } = commandData
    const { user, message, member, guild } = interaction

    if (user.id !== message.interaction.user.id)
        return interaction.reply({
            content: `${e.DenyX} | EPA EPA! Você não pode desativar isso aqui.`,
            ephemeral: true
        })

    if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({
            content: `${e.DenyX} | Você precisa ser um **Administrador** do servidor para desativar as notificações da Twitch, ok?`,
            ephemeral: true
        })

    TwitchManager.removeChannel(streamer, channelId)
    return Database.Guild.updateOne(
        { id: guild.id },
        {
            $pull: {
                TwitchNotifications: { streamer: streamer }
            }
        }
    )
        .then(() => interaction.update({
            content: `${e.Check} | Prontinho! Não vou mais notificar nada sobre o/a streamer **${streamer}**.`,
            components: []
        }).catch(() => { }))
        .catch(err => interaction.update({
            content: `${e.cry} | Não foi possível desativar esta configuração.\n${e.bug} | \`${err}\``,
            components: [],
            ephemeral: true
        }).catch(() => { }))

}