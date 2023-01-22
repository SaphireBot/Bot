import { ApplicationCommandOptionType } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
import FlagGame from './bandeiras/manager.bandeiras.js'

export default {
    name: 'bandeiras',
    description: '[games] Um super jogo de quiz no modo bandeiras',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'options',
            description: 'Opções disponíveis do jogo bandeiras',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Nova Partida',
                    value: 'play'
                },
                {
                    name: 'Minha Pontuação',
                    value: 'points'
                }
            ]
        }
    ],
    helpData: {
        description: '',
        permissions: [],
        fields: []
    },
    async execute({ interaction, Database }) {

        const { options, user } = interaction
        const option = options.getString('options')

        if (option === 'play')
            return new FlagGame(interaction).register()

        if (option === 'points') {

            const userData = await Database.User.findOne({ id: user.id }, 'GamingCount.FlagCount')
            const points = userData?.GamingCount?.FlagCount || 0
            return await interaction.reply({
                content: `${e.Check} | Você tem exatamente **${points} acertos** no Bandeira Quiz.`
            })
        }

        return await interaction.reply({
            content: `${e.Deny} | Nenhuma função foi encontrada. #165651`,
            ephemeral: true
        })

    }
}