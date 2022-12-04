import { ButtonStyle } from 'discord.js'
import mercadopago from 'mercadopago'
// import { Config } from '../../../../util/Constants.js'

export default {
    name: 'donate',
    description: '[bot] Doe para a Saphire',
    category: "bot",
    dm_permission: false,
    type: 1,
    helpData: {
        description: 'Comando exclusivo para fazer doações.',
        fields: [
            {
                name: 'Prêmio',
                value: 'A cada real doado, você ganha 15000 Safiras'
            },
            {
                name: 'Quantia',
                value: 'O valor dado deve ser em real e centavos separado por virgula'
            },
            {
                name: 'Email',
                value: 'O email não é obrigatório. Mas você pode receber um comprovante se passar o seu email.'
            }
        ]
    },
    options: [
        // {
        //     name: 'quantia',
        //     description: 'Valor em reais a ser doado',
        //     type: 10,
        //     min_value: 0.01,
        //     max_value: 9999999
        // },
        // {
        //     name: 'email',
        //     description: 'Email para que eu possa te enviar o comprovante',
        //     type: 3
        // }
    ],
    async execute({ interaction, client, e }) {

        const { options, user, channel, guild } = interaction

        // const email = options.getString('email') || 'nothing@nothing.com'
        // const price = options.getNumber('quantia') || 0

        // if (!price)
        return await interaction.reply({
            embeds: [{
                color: client.blue,
                title: 'Doação livre',
                description: `> ${e.Info} Este QrCode não irá te trazer nenhum benefício. Usando a opção de \`quantia\`, você irá ganhar **15000 ${await guild.getCoin()}** por real doado.\n \nO PIX será enviado ao banco NUBANK do criador da Saphire's Project, Rodrigo Couto Santos cujo CPF é \`\*\*\*.554.818-\*\*\*\``,
                fields: [{
                    name: `${e.Deny} Serviço Indisponível`,
                    value: 'Conexão com o Mercado Pago não foi realizada por indisponibilidade dos servidores.'
                }],
                image: { url: 'https://media.discordapp.net/attachments/893361065084198954/1048979389666312313/index.png?width=473&height=473' }
            }],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Abrir URL',
                            url: 'https://nubank.com.br/pagar/sj32w/r3JDxYcxNx',
                            emoji: '📎',
                            style: ButtonStyle.Link
                        },
                        {
                            type: 2,
                            label: 'Copia e Cola',
                            emoji: e.Commands,
                            style: ButtonStyle.Primary,
                            custom_id: JSON.stringify({ c: 'donate', src: 'nubank' })
                        }
                    ]
                }
            ]
        })

        const msg = await interaction.reply({
            embeds: [{
                color: client.blue,
                title: `${e.Loading} Gerando novo donate`,
            }],
            fetchReply: true
        })
        const value = options.getNumber('quantia')
        const taxResult = ((value * 0.99) / 100).toFixed(2)
        const finalValue = value + Number(taxResult)

        return mercadopago.payment.create({
            installments: 1,
            token: client.user.id,
            external_reference: `Olá ${user.tag}. Eu sou o Rody#1000, criador da ${client.user.username}, venho aqui pessoalmente te agradecer ❤`,
            issuer_id: user.id,
            transaction_amount: finalValue,
            binary_mode: true,
            date_of_expiration: new Date(Date.now() + 1200000), // 20 Minutos
            description: 'Obrigado por doar. Você está me ajudando a ficar online e os animais de rua.',
            metadata: {
                user_id: user.id,
                channel_id: channel.id,
                message_id: msg.id,
                value: Number(value.toFixed(2))
            },
            notification_url: `${process.env.ROUTE_MARCADO_PAGO}`,
            payment_method_id: 'pix',
            payer: { email }
        })
            .catch(async err => {
                console.log(err)
                await interaction.editReply({
                    embeds: [{
                        color: client.red,
                        title: `${e.Deny} | Erro ao gerar um novo Donate`,
                        description: 'Verifique se você passou um valor correto em "R$" real e se o email tem um formato válido e existe.'
                    }]
                }).catch(() => { })
            })
    }
}