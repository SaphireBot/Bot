import * as fs from 'fs'

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
        }
    ],
    async execute({ interaction, Database, client, emojis: e }) {

        const allWords = JSON.parse(fs.readFileSync('./src/JSON/frases.json')).Mix
        const { options, user } = interaction
        const optionGiven = options.getInteger('letras') || 4
        const length = optionGiven >= 1 || optionGiven <= 7 ? optionGiven : 4
        const wordsInLength = allWords.filter(word =>
            word.length === length
            &&
            /^[a-z]+$/i.test(word.toLowerCase())
        )

        const msg = await interaction.reply({
            content: `${e.Loading} | Construindo novo Wordle Game...`,
            fetchReply: true
        })

        const Try = {
            One: [],
            Two: [],
            Three: [],
            Four: [],
            Five: [],
            Six: []
        }

        for (let i = 0; i < length; i++) {
            Try.One.push('')
            Try.Two.push('')
            Try.Three.push('')
            Try.Four.push('')
            Try.Five.push('')
            Try.Six.push('')
        }

        const allArray = Object.values(Try)

        const gameData = {
            Word: wordsInLength.random(),
            UserId: user.id,
            MessageId: msg.id,
            Length: length,
            Try
        }

        await Database.Cache.WordleGame.set(msg.id, gameData)

        const button = {
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Tentar Palavra',
                    custom_id: msg.id,
                    style: 2
                }
            ]
        }

        let description = ''

        for (let array of allArray) {
            description += array.map(value => e.WordleGameRaw).join('')
            description += '\n'
        }

        const embed = {
            color: client.blue,
            title: `${client.user.username}'s Wordle Game`,
            description
        }

        setTimeout(async () => {
            return await interaction.editReply({
                content: null,
                embeds: [embed],
                components: [button]
            })
        }, 2000)
    }
}