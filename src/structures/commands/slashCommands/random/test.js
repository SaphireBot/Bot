export default {
    name: 'teste',
    description: 'test',
    dm_permission: false,
    type: 1,
    admin: true,
    options: [],
    async execute({ interaction, client, Database, emojis: e }) {
        return await interaction.reply({
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Desistir do jogo aberto',
                            emoji: e.Trash,
                            custom_id: JSON.stringify({ c: 'test', userId: interaction.user.id }),
                            style: 4
                        }
                    ]
                }
            ]
        })
    }
}