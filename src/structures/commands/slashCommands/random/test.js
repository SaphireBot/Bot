export default {
    name: 'test',
    description: 'test',
    dm_permission: false,
    type: 1,
    options: [],
    async execute({ interaction, client, Database }) {

        const data = await Database.Cache.Giveaways.all()
        console.log(data)

        return await interaction.reply({ content: 'ok' })
    }
}