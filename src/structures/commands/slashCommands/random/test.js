export default {
    name: 'teste',
    description: 'test',
    dm_permission: false,
    type: 1,
    admin: true,
    options: [
        {
            name: 'users_banned',
            type: 3,
            description: 'aa',
            autocomplete: true
        }
    ],
    async execute({ interaction, client, Database, emojis: e }) {
        console.log(client.allUsers.filter(user => user.discriminator === interaction.options.getString('test')))
    }
}