import { ApplicationCommandOptionType, ButtonStyle } from 'discord.js'

export default {
    name: 'donate',
    name_localizations: { "en-US": "donate", 'pt-BR': 'doar' },
    description: '[bot] Doe para a Saphire',
    category: "bot",
    dm_permission: false,
    database: false,
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
        {
            name: 'method',
            description: 'Escolha um método de doação',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Stripe (Not Working)',
                    value: 'linkTest'
                },
                {
                    name: 'Pix Direto',
                    value: 'nubank'
                }
            ]
        }
    ],
    async execute({ interaction, client, e }) {

        const { options, guild } = interaction
        const method = options.getString('method')

        if (method === 'linkTest')
            return await interaction.reply({
                embeds: [{
                    color: client.blue,
                    title: `💸 Doações`,
                    description: 'Este link é apenas um teste em produção. As doações por este método não está ativo.',
                    image: {
                        url: 'https://media.discordapp.net/attachments/893361065084198954/1049519509163212910/qr_test_00gaIGb16dwL5RmeUU.png?width=394&height=473'
                    },
                    footer: {
                        text: '❤ Powered By Stripe'
                    }
                }],
                components: [{
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Doar',
                            url: 'https://donate.stripe.com/test_00gaIGb16dwL5RmeUU',
                            style: ButtonStyle.Link
                        }
                    ]
                }]
            })

        if (method === 'nubank')
            return await interaction.reply({
                embeds: [{
                    color: client.blue,
                    title: 'Doação livre',
                    description: `> ${e.Info} Este QrCode não irá te trazer nenhum benefício. Usando a opção de \`quantia\`, você irá ganhar **15000 ${await guild.getCoin()}** por real doado.\n \nO PIX será enviado ao banco NUBANK do criador da Saphire's Project, Rodrigo Couto Santos cujo CPF é \`\*\*\*.554.818-\*\*\*\``,
                    fields: [{
                        name: `${e.Deny} Serviço Indisponível`,
                        value: 'Conexão com o Mercado Pago não foi realizada por indisponibilidade dos servidores.'
                    }],
                    image: { url: 'https://media.discordapp.net/attachments/893361065084198954/1048979389666312313/index.png?width=473&height=473' },
                    footer: {
                        text: '❤ Powered By Nubank'
                    }
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

        return await interaction.reply({
            content: `${e.Deny} | Método não disponível na lista de opções.`,
            ephemeral: true
        })
    }
}