import { ApplicationCommandOptionType } from 'discord.js'
import { Colors } from '../../../../util/Constants.js'
import simpleBet from './bet/new.bet.js'

export default {
    name: 'bet',
    description: '[economy] Sistema de aposta',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'simple',
            description: '[economy] Uma aposta simples',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'amount',
                    description: 'Quantia a ser apostada',
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                },
                {
                    name: 'players',
                    description: 'Quantidade máxima de jogadores',
                    type: ApplicationCommandOptionType.Integer,
                    max_value: 30,
                    min_value: 2
                },
                {
                    name: 'finish',
                    description: 'Tempo para a aposta se encerrar (Padrão: 1 Minuto)',
                    type: ApplicationCommandOptionType.Integer,
                    choices: [
                        {
                            name: '30 Segundos',
                            value: 30000
                        },
                        {
                            name: '1 Minuto',
                            value: 60000
                        },
                        {
                            name: '1 Minuto e 30 Segundos',
                            value: 190000
                        },
                        {
                            name: '2 Minutos',
                            value: 120000
                        }
                    ]
                }
            ]
        }
    ],
    helpData: {
        color: Colors.Blue,
        description: 'Aqui você pode apostar dinheiro, ganhar e perder.',
        permissions: [],
        fields: []
    },
    async execute({ interaction, e, economy, client }) {

        const { options, user } = interaction
        const amount = options.getInteger('amount')
        const subCommand = options.getSubcommand()
        const userMoney = await user.balance()

        if (userMoney <= 0)
            return await interaction.reply({
                content: `${e.Deny} | Você não tem dinheiro suficiente.`,
                ephemeral: true
            })

        switch (subCommand) {
            case 'simple': simpleBet({ interaction, economy, e, amount, client })
        }
    }
}