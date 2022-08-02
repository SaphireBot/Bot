export default {
    name: 'test',
    description: 'test',
    dm_permission: false,
    type: 1,
    admin: true,
    options: [],
    async execute({ interaction, client, Database }) {
        return await interaction.reply({ content: 'ok' })
    }
}