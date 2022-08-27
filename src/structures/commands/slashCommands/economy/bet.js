import { ApplicationCommandOptionType } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
import { Colors } from '../../../../util/Constants.js'

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
                    require: true
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
    async execute({ interaction, client, Database }) {

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
            case 'simple': simpleBet(amount)
        }

    }
}