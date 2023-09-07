import { SaphireClient as client, Database } from '../../../../classes/index.js';
import { ButtonStyle, Message } from 'discord.js';
import { Emojis as e } from '../../../../util/util.js';

export default {
    name: 'transactions',
    description: 'Confira as transações monetárias',
    aliases: ['transações', 'tr', 'transacoes', 'transaction'],
    category: "economy",
    /**
     * @param { Message } message
     * @param { string[] } args
     */
    async execute(message, args) {
        const { author } = message
        const user = await message.getUser(args[0])

        if (!user || user.bot)
            return message.reply({ content: `${e.Deny} | Usuário não encontrado.` })

        const userData = await Database.getUser(user.id)

        if (!userData)
            return message.reply({ content: `${e.Database} | DATABASE | Não foi possível obter os dados de **${user?.username || 'indefinido'}** *\`${user?.id || 0}\`*` }).catch(() => { })

        const transactions = userData?.Transactions || []

        if (transactions.length === 0)
            return message.reply({ content: `${e.Deny} | Nenhuma transação foi encontrada.` })

        return message.reply({
            embeds: [{
                color: client.blue,
                title: `${e.MoneyWings} ${user.id === author.id ? 'Suas transações' : `Transações de ${user.username}`}`,
                description: transactions.slice(0, 5).map(t => `> \`${t.time}\` ${t.data}`).join("\n")
            }],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: "🔎",
                            label: `Ver todas as ${transactions.length} transações`.slice(0, 80),
                            url: client.url + `/transactions/${user.id}`,
                            style: ButtonStyle.Link
                        }
                    ]
                }
            ]
        })

    }
}