export default {
    name: 'test',
    description: 'test',
    dm_permission: false,
    type: 1,
    options: [],
    async execute({ interaction, client, Database }) {

        const isVip = await interaction.user.isVip()

        console.log(isVip)

        return isVip
            ? await interaction.reply({ content: 'tem vip' })
            : await interaction.reply({ content: 'não' })
    }
}