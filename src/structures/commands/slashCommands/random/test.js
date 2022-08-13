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
        interaction.member.ban({})
        let b = undefined
        const a = b.test
        console.log(a)
    }
}