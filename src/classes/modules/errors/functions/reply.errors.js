export default async (interaction, messageResponse) => {

    if (interaction.deferred)
        return await interaction.reply({
            content: `${messageResponse}`.limit('MessageContent'),
            embeds: [],
            components: []
        })

    return await interaction.editReply({
        content: `${messageResponse}`.limit('MessageContent'),
        ephemeral: true
    })
        .catch(async () => await interaction.followUp({
            content: `${messageResponse}`.limit('MessageContent'),
            ephemeral: true
        }))
}