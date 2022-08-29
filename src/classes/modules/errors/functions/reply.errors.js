export default async (interaction, messageResponse) => {

    return await interaction.reply({
        content: `${messageResponse}`.limit('MessageContent'),
        embeds: [],
        components: []
    })
        .catch(async () => await interaction.editReply({
            content: `${messageResponse}`.limit('MessageContent'),
            embeds: [],
            components: []
        }))
        .catch(async () => await interaction.followUp({
            content: `${messageResponse}`.limit('MessageContent'),
            embeds: [],
            components: [],
            ephemeral: true
        }))
}