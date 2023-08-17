import { ChannelType } from "discord.js"
import { Permissions } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, channel) => {

    if (!channel)
        return await interaction.reply({
            content: `${e.Deny} | Canal não encontrado.`,
            ephemeral: true
        })

    if (channel.type === ChannelType.GuildCategory)
        return await interaction.reply({
            content: `${e.Deny} | Trancar e Destrancar categorias não surgem efeitos no canais dentro delas.`,
            ephemeral: true
        })

    const { guild, user, channel: channelInteraction } = interaction

    const channelResponse = await channel.permissionOverwrites.edit(
        guild.roles.everyone.id,
        {
            [Permissions.SendMessages]: false,
            [Permissions.AddReactions]: false
        },
        {
            reason: `${user.username} trancou este canal.`
        }
    ).catch(err => err.code)

    if (channelResponse.constructor === Number) {

        return await interaction.reply({
            content: `${e.Deny} | Não foi possível editar as permissões para trancar o canal. \`(${channelResponse})\``,
            ephemeral: true
        })

    }

    const channelResponseString = channelResponse.id === channelInteraction.id
        ? 'esse canal'
        : {
            [ChannelType.GuildVoice]: `o canal de voz ${channelResponse}`,
            [ChannelType.GuildText]: `o canal de texto ${channelResponse}`,
            [ChannelType.GuildAnnouncement]: `o canal de anúncios ${channelResponse}`,
        }[channelResponse.type]

    return await interaction.reply({
        content: `🔒 | ${user} trancou ${channelResponseString}`
    })
}