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

        console.log(Date.stringDate(((60000 * 60) * 24) * 7 + 2512))

    }
}