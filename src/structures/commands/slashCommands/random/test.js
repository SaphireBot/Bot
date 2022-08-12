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
        console.log(client.allGuilds.find(guild => guild.id === interaction.options.getString('search_guild')))
    }
}