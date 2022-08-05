import mercadopago from 'mercadopago'

export default {
    name: 'donate',
    description: '[bot] Doe para a Saphire',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'quantia',
            description: 'Valor em reais a ser doado',
            type: 4,
            min_value: 1,
            required: true
        }
    ],
    async execute({ interaction: interaction, client: client, emojis: e }) {

        const { options } = interaction
        const amount = options.getInteger('quantia')

        const paymentData = await mercadopago.preferences.create({
            items: [{
                title: 'Saphire Moon Donate',
                quantity: 1,
                description: 'Obrigado por doar. Você está me ajudando a ficar online e os animais de rua.',
                currency_id: 'BRL',
                unit_price: amount
            }]
        })

        return await interaction.reply({
            embeds: [
                {
                    color: client.green,
                    title: `${e.Check} Donate gerado com sucesso.`,
                    description: `Efetue sua doação [clicando aqui](${paymentData.body.init_point})`
                }
            ]
        })

    }
}