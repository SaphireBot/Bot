export default {
    name: 'test',
    description: 'test',
    dm_permission: false,
    type: 1,
    options: [],
    async execute({ interaction, client, Database }) {
        return await interaction.reply({ content: 'ok' })
    }
}