import { Colors } from '../../../../util/Constants.js'

export default {
    name: 'teste',
    description: 'test',
    dm_permission: false,
    type: 1,
    admin: true,
    options: [
        {
            name: 'database_users',
            type: 3,
            description: 'aa',
            autocomplete: true
        }
    ],
    async execute({ interaction, client, Database, e }) {

        return console.log(interaction)
    }
}