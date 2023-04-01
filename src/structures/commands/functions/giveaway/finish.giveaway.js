import { GiveawayManager, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import { ButtonStyle } from "discord.js"

export default async (interaction, giveawayId) => {

    const { options } = interaction
    const giveaway = GiveawayManager.getGiveaway(giveawayId || options.getString('select_giveaway'))

    if (!giveaway)
        return await interaction.reply({
            content: `${e.DenyX} | Sorteio não encontrado no processo de ativação.`,
            ephemeral: true
        })

    if (!giveaway.Actived)
        return await interaction.reply({
            content: `${e.Deny} | Este sorteio não está ativo. Portando, não é possível finalizar uma coisa já finalizada, sacou?`,
            ephemeral: true
        })

    client.emit('giveaway', giveaway)
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
                    url: giveaway.MessageLink,
                    style: ButtonStyle.Link
                }
            ]
        }]
    })
}