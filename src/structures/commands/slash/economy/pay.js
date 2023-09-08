import { ApplicationCommandOptionType, ButtonStyle } from "discord.js"
import { Database, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default {
    name: 'pay',
    name_localizations: { 'pt-BR': 'pagar' },
    description: '[economy] Pague ou envie dinheiro para outras pessoas',
    category: "economy",
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'member',
            name_localizations: { 'pt-BR': 'membro' },
            description: 'Membro a receber o dinheiro',
            type: 6,
            required: true
        },
        {
            name: 'quantity',
            name_localizations: { 'pt-BR': 'quantia' },
            description: 'Valor a ser enviado',
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
            required: true
        }
    ],
    apiData: {
        name: "pay",
        description: "Você pode pagar/doar Safiras para outras pessoas.",
        category: "Economia",
        synonyms: ["pagar"],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction }) {

        const { options, guild, user: author } = interaction

        if ((Date.now() - author.createdAt.getTime()) < 1000 * 60 * 60 * 24 * 30)
            return interaction.reply({
                content: `${e.Deny} | A sua conta no Discord precisa ter pelo menos **30 dias** para efetuar pagamentos.`,
                ephemeral: true
            })

        const user = options.getUser('member')

        if ((Date.now() - user.createdAt.getTime()) < 1000 * 60 * 60 * 24 * 30)
            return interaction.reply({
                content: `${e.Deny} | ${user.username} não pode receber pagamentos pois a conta dele foi criada a menos de 30 dias.`,
                ephemeral: true
            })

        if (user.id === client.user.id)
            return interaction.reply({ content: `${e.Deny} | Preciso não coisa fofa, eu já sou rica.`, ephemeral: true })

        if (user.id === author.id)
            return interaction.reply({ content: `${e.Deny} | Nada de pagar você mesmo.`, ephemeral: true })

        if (user.bot)
            return interaction.reply({ content: `${e.Deny} | Nada de bots.`, ephemeral: true })

        const authorData = await Database.getUser(author.id)
        const money = authorData?.Balance || 0

        if (money <= 0)
            return interaction.reply({ content: `${e.Deny} | Você não possui dinheiro para efetuar pagamentos.`, ephemeral: true })

        const quantia = options.getInteger('quantity')
        const moeda = await guild.getCoin()

        if (quantia > money)
            return await interaction.reply({
                content: `${e.Deny} | Você não possui todo esse dinheiro.`,
                ephemeral: true
            })

        Database.subtract(author.id, quantia, `${e.loss} Efetuou um pagamento de ${quantia} Safiras para ${user.username} (${user.id})`)
        const msg = await interaction.reply({
            content: `${e.QuestionMark} | Deseja transferir **${quantia.currency()} ${moeda}** para ${user}?${quantia >= 1000 ? `\n${e.Taxa} | *Pagamentos acima de 1000 ${moeda} sofrem uma taxa de 5%. (-${parseInt((quantia * 0.05).toFixed(0))})*` : ''}\n \n> **ATENÇÃO**\n> A Saphire e sua equipe não irá se responsabilizar por *${moeda}* perdidas.\n> Pense bem para quem você manda seu dinheiro. Dinheiro perdido não será devolvido.`,
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Confirmar 0/2',
                        emoji: e.Loading,
                        custom_id: JSON.stringify({ c: 'pay', src: 'accept', v: quantia }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Recusar',
                        emoji: e.Deny,
                        custom_id: JSON.stringify({ c: 'pay', src: 'deny', v: quantia }),
                        style: ButtonStyle.Danger
                    }
                ]
            }],
            fetchReply: true
        })

        if (!msg.id) {
            Database.add(author.id, quantia, `${e.Admin} Reembolso de ${quantia} Safiras por *Bad Payment Data Save*`)
            return await interaction.editReply({ content: `${e.Deny} | Erro ao gravar os dados do pagamento.`, components: [] }).catch(() => { })
        }

        return await Database.Cache.Pay.set(`${author.id}.${msg.id}`, {
            confirmated: [],
            total: quantia,
            value: quantia > 1000
                ? parseInt(quantia - parseInt((quantia * 0.05).toFixed(0)))
                : quantia
        })
    }
}