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
    async execute({ interaction, client, Database, emojis: e }) {

        return
    },
    helpData: [{
        color: Colors.Red,
        title: 'Comando teste',
        description: 'Este é um comando privado para testes restrito apenas ao meu criador.'
    }]
}