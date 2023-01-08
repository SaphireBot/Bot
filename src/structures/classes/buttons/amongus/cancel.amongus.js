import deleteParty from "./delete.amongus.js"

export default async ({ partyData, interaction, e, partyId, user, gameData }) => {

    if (!partyData) {
        deleteParty(partyId)
        return await interaction.update({ content: `${e.Deny} | Jogo não encontrado.`, embeds: [], components: [] }).catch(() => { })
    }

    if (partyData.host !== user.id)
        return await interaction.reply({
            content: `${e.Deny} | Apenas o Host <@${partyData.host}> pode cancelar este jogo.`,
            ephemeral: true
        })

    deleteParty(partyId)
    await interaction.update({
        content: `${e.Check} | O jogo \`${partyId}\` foi deletado com sucesso.`,
        embeds: [],
        components: []
    }).catch(() => { })

    if (gameData.inMute.length)
        return await interaction.channel.send({
            content: `${e.SaphireDesespero} | A NÃÃÃO, ${gameData.inMute.map(id => `<@${id}>`).join(', ')} saiu da call e continua mutado. Alguém desmuta ele aí por favor.`
        })
}