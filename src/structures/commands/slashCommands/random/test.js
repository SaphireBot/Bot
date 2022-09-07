import ranking from '../../../../functions/update/ranking/index.ranking.js'

export default {
    name: 'test',
    description: 'test',
    dm_permission: false,
    type: 1,
    admin: true,
    options: [],
    helpData: {
        description: 'Apenas um comando de teste exclusivo para o meu'
    },
    async execute({ interaction, client, e }) {

        return await interaction.reply({ content: 'ok', ephemeral: true })

    }
}