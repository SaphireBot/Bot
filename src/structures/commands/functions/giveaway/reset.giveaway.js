import { Database, GiveawayManager } from "../../../../classes/index.js"
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

    const message = await channel.messages.fetch(gwId).catch(() => null)

    giveaway.Requires = message?.embeds[0]?.data?.fields?.find(f => f?.name == `${e.Commands} Requisitos`)?.value
    giveaway.imageUrl = message?.embeds[0]?.data?.image?.url
    giveaway.color = message?.embeds[0]?.data?.color

    await message.delete().catch(() => { })
    GiveawayManager.giveaways.splice(GiveawayManager.giveaways.findIndex(gw => gw.MessageID == gwId), 1)

    await Database.deleteGiveaway(gwId, guild.id)

    return createGiveaway(interaction, giveaway, giveawayId ? true : false)
}