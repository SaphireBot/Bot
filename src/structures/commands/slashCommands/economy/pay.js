import { ButtonStyle } from "discord.js"
import { CodeGenerator } from "../../../../functions/plugins/plugins.js"

export default {
    name: 'pay',
    description: '[economy] Pague ou envie dinheiro para outras pessoas',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'member',
            description: 'Membro a receber o dinheiro',
            type: 6,
            required: true
        },
        {
            name: 'quantity',
            description: 'Valor a ser enviado',
            type: 4,
            min_value: 1,
            required: true
        }
    ],
    async execute({ interaction, client, Database, emojis: e }) {

        const { options, guild, user: author } = interaction

        const moeda = await guild.getCoin()
        const user = options.getUser('member')

        if (user.id === client.user.id)
            return await interaction.reply({
                content: `${e.HiNagatoro} | Preciso não coisa fofa, eu já sou rica.`,
                ephemeral: true
            })

        if (user.id === author.id)
            return await interaction.reply({
                content: `${e.Deny} | Nada de pagar você mesmo.`,
                ephemeral: true
            })

        if (user.bot)
            return await interaction.reply({
                content: `${e.Deny} | Nada de bots.`,
                ephemeral: true
            })

        const authorData = await Database.User.findOne({ id: author.id }, 'id Balance')
        const money = authorData?.Balance || 0

        if (money <= 0)
            return await interaction.reply({
                content: `${e.Deny} | Você não possui dinheiro para efetuar pagamentos.`,
                ephemeral: true
            })

        const quantia = options.getInteger('quantity')

        if (quantia <= 0)
            return await interaction.reply({
                content: `${e.Deny} | Você não pode pagar alguém com menos de 1 ${moeda}, baaaaka.`,
                ephemeral: true
            })

        if (quantia > money)
            return await interaction.reply({
                content: `${e.Deny} | Você não possui todo esse dinheiro.`,
                ephemeral: true
            })

        Database.subtract(author.id, quantia)
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

        if (!msg.id)
            return await interaction.editReply({
                content: `${e.Deny} | Erro ao gravar os dados do pagamento.`,
                components: []
            }).catch(() => { })

        await Database.Cache.Pay.set(`${author.id}.${msg.id}`, {
            confirmated: [],
            value: quantia > 1000
                ? parseInt(quantia - parseInt((quantia * 0.05).toFixed(0)))
                : quantia
        })
    }
}