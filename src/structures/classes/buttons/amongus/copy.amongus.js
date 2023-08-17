export default async ({ interaction, partyData, channel, user }) => {
    return await interaction.reply({
        content: channel.members.has(user.id)
            ? `${partyData.invite || "Código não encontrado"}`
            : `${e.Deny} | Você tem que estar no canal ${channel} para poder jogar.`,
        ephemeral: true
    })
}