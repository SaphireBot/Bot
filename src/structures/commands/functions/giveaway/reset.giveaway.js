import { SaphireClient as client } from "../../../../classes/index.js"
import { PermissionsTranslate } from "../../../../util/Constants.js"
import { PermissionFlagsBits } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import createGiveaway from "./create.giveaway.js"

export default async (interaction, guildData, giveawayId) => {

    const { options, guild } = interaction
    const gwId = giveawayId || options.getString('select_giveaway')

    const allGiveaways = guildData.Giveaways || []
    if (!allGiveaways.length)
        return await interaction.reply({
            content: `${e.Deny} | Este servidor não possui sorteios ativos.`,
            ephemeral: true
        })

    const giveaway = allGiveaways.find(gw => gw?.MessageID == gwId)
    if (!giveaway)
        return await interaction.reply({
            content: `${e.Deny} | Sorteio não encontrado.`,
            ephemeral: true
        })

    const channel = await guild.channels.fetch(giveaway.ChannelId).catch(() => null)
    if (!channel)
        return await interaction.reply({
            content: `${e.Deny} | O canal do sorteio não foi encontrado.`,
            ephemeral: true
        })

    const channelPermissions = await channel.permissionsFor(client.user)
    const greenCard = Array.from(
        new Set([
            guild.members.me.permissions.missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AddReactions]),
            channelPermissions?.missing([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AddReactions])
        ].flat())
    )
    if (greenCard.length)
        return interaction.reply({
            content: `${e.DenyX} | Eu não tenho permissão o suficiente para interagir no canal ${channel}.\n${e.Info} | Me falta ${greenCard.length} permiss${greenCard.length > 1 ? 'ões' : 'ão'}: ${greenCard.map(perm => `\`${PermissionsTranslate[perm] || perm}\``).join(', ')}`,
            ephemeral: true
        }).catch(() => { })

    const message = await channel.messages.fetch(gwId).catch(() => null)

    giveaway.Requires = message?.embeds[0]?.data?.fields?.find(f => f?.name == `${e.Commands} Requisitos`)?.value
    giveaway.imageUrl = message?.embeds[0]?.data?.image?.url
    giveaway.color = message?.embeds[0]?.data?.color

    client.pushMessage({ method: 'delete', channelId: channel.id, messageId: message.id })
    return createGiveaway(interaction, giveaway, giveawayId ? true : false)
}