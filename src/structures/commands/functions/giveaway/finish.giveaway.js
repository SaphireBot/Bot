import { GiveawayManager } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import startGiveaway from "../../../../functions/update/giveaway/start.giveaway.js"
import { ButtonStyle } from "discord.js"

export default async (interaction, guildData, giveawayId) => {

    const { options, guild } = interaction
    const gwId = giveawayId || options.getString('select_giveaway')
    const giveaway = guildData?.Giveaways?.find(gw => gw?.MessageID === gwId)

    if (!giveaway)
        return await interaction.reply({
            content: `${e.Deny} | Nenhum sorteio foi encontrado.`,
            ephemeral: true
        })

    if (!giveaway.Actived)
        return await interaction.reply({
            content: `${e.Deny} | Este sorteio não está ativo. Portando, não é possível finalizar uma coisa já finalizada, sacou?`,
            ephemeral: true
        })

    const cachedGiveaway = [...GiveawayManager.giveaways, ...GiveawayManager.awaiting].find(gw => gw?.MessageID == gwId)

    if (!cachedGiveaway)
        return await interaction.reply({
            content: `${e.Deny} | Sorteio não encontrado no processo de ativação.`,
            ephemeral: true
        })

    const channel = await guild.channels.fetch(cachedGiveaway.ChannelId).catch(() => null)

    if (!channel)
        return await interaction.reply({
            content: `${e.Deny} | O canal deste sorteio não foi encontrado.`,
            ephemeral: true
        })

    clearTimeout(cachedGiveaway.timeout)
    startGiveaway(cachedGiveaway, guild, channel, true)

    return await interaction.reply({
        content: `${e.Check} | Sorteio finalizado com sucesso!`,
        ephemeral: true,
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Sorteio Original',
                    emoji: '🔗',
                    url: cachedGiveaway.MessageLink,
                    style: ButtonStyle.Link
                }
            ]
        }]
    })
}