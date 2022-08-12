export default {
    name: 'teste',
    description: 'test',
    dm_permission: false,
    type: 1,
    admin: true,
    options: [],
    async execute({ interaction, client, Database, emojis: e }) {

        const guild = await client.guilds.fetchGuild(data)

        console.log(await client.users.all())
    }
}