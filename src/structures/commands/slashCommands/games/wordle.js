export default {
    name: 'wordle',
    description: '[games] O famoso jogo Wordle, só que no Discord.',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'letras',
            description: 'Quantidade de letras do wordle',
            type: 4,
            choices: [
                {
                    name: '4',
                    value: 4
                },
                {
                    name: '5',
                    value: 5
                },
                {
                    name: '6',
                    value: 6
                },
                {
                    name: '7',
                    value: 7
                }
            ]
        },
        {
            name: 'add_players',
            description: 'Adicione jogadores para jogar esta partida com você.',
            type: 3
        }
    ],
    async execute({ interaction, Database, emojis: e }) {

        const playersInGame = await Database.Cache.WordleGame.get('inGame')

        const { options } = interaction

        const addPlayers = options.getString('add_players')?.match(/\d{17,}/g) || null
        if (addPlayers) return import('../../functions/wordle/addPlayers.wordle.js').then(add => add.default(addPlayers, interaction))

        if (playersInGame?.some(data => data.userId === interaction.user.id))
            return await interaction.reply({
                content: `${e.Deny} | Você já tem um jogo aberto. Desista dele antes de começar outro.`,
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: 'Desistir do jogo aberto',
                                custom_id: 'giveup-ephemeral',
                                style: 4
                            }
                        ]
                    }
                ]
            })

        return import('../../functions/wordle/create.wordle.js').then(create => create.default(interaction))
    }
}