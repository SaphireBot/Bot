import mercadopago from 'mercadopago'
import Routes from '../../../../api/Routes.js'

export default {
    name: 'donate',
    description: '[bot] Doe para a Saphire',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'quantia',
            description: 'Valor em reais a ser doado',
            type: 10,
            min_value: 0.01,
            max_value: 9999999,
            required: true
        },
        {
            name: 'email',
            description: 'Email para que eu possa te enviar o comprovante',
            type: 3,
            required: true
        }
    ],
    async execute({ interaction: interaction, client: client, emojis: e, Database: Database }) {

        const { options, user, channel } = interaction

        const email = options.getString('email')

        const msg = await interaction.reply({
            embeds: [{
                color: client.blue,
                title: `${e.Loading} Gerando novo donate`,
            }],
            fetchReply: true
        })

        return mercadopago.payment.create({
            installments: 1,
            token: client.user.id,
            external_reference: `Olá ${user.tag}. Eu sou o Rody#1000, venho aqui pessoalmente te agradecer ❤`,
            issuer_id: user.id,
            transaction_amount: options.getNumber('quantia'),
            binary_mode: true,
            date_of_expiration: new Date(Date.now() + 1200000), // 20 Minutos
            description: 'Obrigado por doar. Você está me ajudando a ficar online e os animais de rua.',
            metadata: {
                user_id: user.id,
                channel_id: channel.id,
                message_id: msg.id
            },
            notification_url: Routes.BaseDomain + Routes.MercadoPagoWebhook,
            payment_method_id: 'pix',
            payer: { email }
        })
            .catch(async () => await interaction.editReply({
                embeds: [{
                    color: client.red,
                    title: `${e.Deny} | Erro ao gerar um novo Donate`,
                    description: 'Verifique se você passou um valor correto em "R$" real e se o email tem um formato válido e existe.'
                }]
            }).catch(() => { }))
    }
}