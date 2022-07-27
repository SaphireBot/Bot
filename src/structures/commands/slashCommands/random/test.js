export default {
    name: 'test',
    description: 'sasasa',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 't',
            description: 'bla bla',
            type: 3,
        }
    ],
    async execute({ interaction, client, Database }) {
        const msg = await interaction.reply({ content: `ok`, fetchReply: true })
    }
}