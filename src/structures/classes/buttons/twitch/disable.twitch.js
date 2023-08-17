import { Database } from "../../../../classes/index.js"
import { PermissionsBitField } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import ButtonInteraction from "../../ButtonInteraction.js"
import { socket } from "../../../../websocket/websocket.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: 'twitch', cName: TwitchChannelName, cId: GuildTextChannelNotificationId } } commandData
 */
export default async (interaction, commandData) => {

    const { cName: streamer, cId: channelId } = commandData
    const { user, message, member, guild } = interaction
    const guildData = await Database.getGuild(guild.id)

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

    await interaction.update({ content: `${e.Loading} | Deletando...`, components: [] }).catch(() => { })

    if (streamer == 'disableAll') {

        await disableAll()

        for await (let { streamer, channelId } of guildData.TwitchNotifications)
            socket?.send({ type: "removeChannel", channelData: { streamer, channelId } })
        return interaction.editReply({ content: `${e.Check} | Ok, tudo foi desativado.`, components: [] }).catch(() => { })
    }

    socket?.send({ type: "removeChannel", channelData: { streamer, channelId } })
    return await Database.Guild.findOneAndUpdate(
        { id: guild.id },
        { $pull: { TwitchNotifications: { streamer: streamer } } },
        { new: true }
    )
        .then(data => {
            Database.saveGuildCache(data.id, data)
            interaction.editReply({
                content: `${e.Check} | Prontinho! Não vou mais notificar nada sobre o/a streamer **${streamer}**.`,
                components: []
            }).catch(() => { })
            return
        })
        .catch(err => interaction.editReply({
            content: `${e.Animated.SaphireCry} | Não foi possível desativar esta configuração.\n${e.bug} | \`${err}\``,
            components: [],
            ephemeral: true
        }).catch(() => { }))

    async function disableAll() {
        return await Database.Guild.findOneAndUpdate(
            { id: guild.id },
            { $set: { TwitchNotifications: [] } },
            { new: true, upsert: true }
        )
            .then(data => Database.saveGuildCache(data.id, data))
    }

}